export const invariants = [
  {
    id: "fake-token",
    attack: "A lookalike token contract notifies transfer with a WAX-looking asset.",
    expect: "get_first_receiver() is not eosio.token, so the action throws.",
  },
  {
    id: "self-notify",
    attack: "The payout transfer notifies this contract again.",
    expect: "from == get_self() returns before a new bet is opened.",
  },
  {
    id: "bad-memo",
    attack: "Memo flip:2 or an empty memo.",
    expect: "throws. No bet row, no requestrand.",
  },
  {
    id: "foreign-randnotify",
    attack: "orng.wax delivers a job whose dapp is a different account.",
    expect: "on_random returns without touching bets.",
  },
  {
    id: "spoofed-receiverand",
    attack: "The player calls receiverand with a checksum they chose.",
    expect: "require_auth(orng.wax) fails.",
  },
  {
    id: "double-delivery",
    attack: "randnotify and receiverand both arrive for the same assoc_id.",
    expect: "The second call finds no row and returns. One payout at most.",
  },
  {
    id: "modulo-bias",
    attack: "Take the low bit with value % 2 when a sibling game uses a range that is not a power of two.",
    expect: "unbiased_uniform rejects candidates below 2^64 % range. For a coin this threshold is 0, so every candidate is kept. Dice and roulette must call the same helper.",
  },
  {
    id: "house-edge-overflow",
    attack: "gross * bps computed in int64.",
    expect: "The fee uses int128. Payout amount still has to fit int64, which it does for a 2x of a legal asset.",
  },
];
