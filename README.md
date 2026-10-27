# px-orng-coinflip-escrow

Quest 004. Tier B. Wager escrow for a two-outcome flip on `orng.wax` v3.

Catalog: [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault).

## What is on-chain

- Native WAX only (`eosio.token`, 8 decimals). Memo `flip:0` or `flip:1`. Minimum 1.00000000 WAX.
- Memo `fund_house` accepts WAX and does not open a bet. The house bankroll is the contract balance.
- `requestrand(assoc_id, signing_value, caller)` uses the transaction id mixed with the assoc id. The bet row is written before the request.
- `on_notify(orng.wax::randnotify)` ignores deliveries whose `dapp` is not this contract.
- Legacy `receiverand` requires `orng.wax`. Both paths call one resolver and erase the row, so a second delivery is a no-op.
- Uniform bit from rejection sampling, depth capped at 8. House edge is basis points on the gross 2x, computed in `int128`.

## What is not done

- No solvency check. A win larger than the bankroll fails inside `eosio.token` and reverts the resolution. The bet row stays, and ORNG will not deliver twice. Size the house, or add a solvency lock before `requestrand` (see the dice quest).
- The contract account needs `eosio.code` on active to call `requestrand` and to pay winners.
- Deploy account is not the repo name.

## Vectors

PX-VEC-05 (synchronous RNG and modulo bias), PX-VEC-01 (fake `eosio.token` notify).

Private while the vector suite is open.
