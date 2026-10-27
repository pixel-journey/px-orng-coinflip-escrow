#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>
#include <eosio/singleton.hpp>

using namespace eosio;

// Quest: px-orng-coinflip-escrow
// On-chain account is chosen at deploy. The class name stays a valid identifier.
CONTRACT px_coinflip : public contract {
public:
    using contract::contract;

    struct [[eosio::table]] config_row {
        uint64_t next_assoc_id = 1;
        uint16_t house_edge_bps = 200;
        bool paused = false;
    };
    typedef singleton<"config"_n, config_row> config_table;

    struct [[eosio::table]] bet_row {
        uint64_t assoc_id;
        name player;
        asset wager;
        uint8_t prediction;
        uint64_t primary_key() const { return assoc_id; }
    };
    typedef multi_index<"bets"_n, bet_row> bets_table;

    [[eosio::on_notify("eosio.token::transfer")]]
    void on_wager(name from, name to, asset quantity, std::string memo) {
        if (from == get_self() || to != get_self()) return;
        if (memo == "fund_house") return;

        check(get_first_receiver() == "eosio.token"_n, "only native WAX");
        check(quantity.symbol == symbol("WAX", 8), "invalid symbol");
        check(quantity.amount >= 100000000, "minimum bet is 1.00000000 WAX");
        check(memo == "flip:0" || memo == "flip:1", "memo must be flip:0 or flip:1");

        config_table cfg_singleton(get_self(), get_self().value);
        auto cfg = cfg_singleton.get_or_default();
        check(!cfg.paused, "paused");

        uint64_t assoc_id = cfg.next_assoc_id++;
        cfg_singleton.set(cfg, get_self());

        bets_table bets(get_self(), get_self().value);
        bets.emplace(get_self(), [&](auto& row) {
            row.assoc_id = assoc_id;
            row.player = from;
            row.wager = quantity;
            row.prediction = (memo == "flip:1") ? 1 : 0;
        });

        action(
            permission_level{get_self(), "active"_n},
            "orng.wax"_n,
            "requestrand"_n,
            std::make_tuple(assoc_id, derive_signing_seed(assoc_id), get_self())
        ).send();
    }

    [[eosio::on_notify("orng.wax::randnotify")]]
    void on_random(uint64_t /*request_id*/, name dapp, uint64_t assoc_id, const checksum256& random_value) {
        if (dapp != get_self()) return;
        resolve_bet(assoc_id, random_value);
    }

    [[eosio::action]]
    void receiverand(uint64_t assoc_id, const checksum256& random_value) {
        require_auth("orng.wax"_n);
        resolve_bet(assoc_id, random_value);
    }

    [[eosio::action]]
    void setpaused(bool paused) {
        require_auth(get_self());
        config_table cfg_singleton(get_self(), get_self().value);
        auto cfg = cfg_singleton.get_or_default();
        cfg.paused = paused;
        cfg_singleton.set(cfg, get_self());
    }

private:
    uint64_t derive_signing_seed(uint64_t assoc_id) {
        size_t size = transaction_size();
        std::vector<char> buf(size);
        read_transaction(buf.data(), size);
        checksum256 tx_hash = sha256(buf.data(), size);
        auto byte_arr = tx_hash.extract_as_byte_array();
        uint64_t raw_seed = 0;
        for (int i = 0; i < 8; ++i) raw_seed = (raw_seed << 8) | byte_arr[i];
        return raw_seed ^ assoc_id;
    }

    // Unbiased [0, range). Threshold is 2^64 % range. Depth cap avoids unbounded rehash.
    uint64_t unbiased_uniform(const checksum256& rand_val, uint64_t range, int depth) {
        check(range > 1, "range");
        check(depth < 8, "entropy exhausted");
        auto bytes = rand_val.extract_as_byte_array();
        uint64_t threshold = static_cast<uint64_t>(-range) % range;
        for (int chunk = 0; chunk < 4; ++chunk) {
            uint64_t candidate = 0;
            for (int i = 0; i < 8; ++i) candidate = (candidate << 8) | bytes[chunk * 8 + i];
            if (candidate >= threshold) return candidate % range;
        }
        checksum256 again = sha256(reinterpret_cast<const char*>(bytes.data()), 32);
        return unbiased_uniform(again, range, depth + 1);
    }

    void resolve_bet(uint64_t assoc_id, const checksum256& random_value) {
        bets_table bets(get_self(), get_self().value);
        auto itr = bets.find(assoc_id);
        if (itr == bets.end()) return;

        config_table cfg_singleton(get_self(), get_self().value);
        auto cfg = cfg_singleton.get_or_default();
        uint8_t outcome = static_cast<uint8_t>(unbiased_uniform(random_value, 2, 0));

        if (outcome == itr->prediction) {
            int128_t gross = static_cast<int128_t>(itr->wager.amount) * 2;
            int128_t fee = (gross * cfg.house_edge_bps) / 10000;
            asset payout(static_cast<int64_t>(gross - fee), itr->wager.symbol);
            action(
                permission_level{get_self(), "active"_n},
                "eosio.token"_n,
                "transfer"_n,
                std::make_tuple(get_self(), itr->player, payout, std::string("PxCoinFlip win"))
            ).send();
        }
        bets.erase(itr);
    }
};
