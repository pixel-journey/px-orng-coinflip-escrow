# px-orng-coinflip-escrow

House-edge coin flip escrow for an `orng.wax` result. Private. Not deployed. `orng.wax` was not called.

Quest 004 in [QUEST-INDEX.md](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/QUEST-INDEX.md). The tested rule is below. The C++ file is not that rule.

## What is true

The player calls heads. The first byte of the 32-byte random value is the draw. That is byte 0 of the checksum, not `uint64 % 2`.

| Byte | Result |
| --- | --- |
| 0–126 | heads |
| 127–253 | tails |
| 254–255 | rejected |

127 heads and 127 tails. Two values are rejected so the split is even. A rejected draw does not pay and does not take the stake. Status becomes `rerequest`. The next request needs a new signing value. The old one stays used.

Payout on heads is `stake * 19600 / 10000` (integer division). That is `2 * (10000 - 200) / 10000`. 10000 pays 19600. 1 pays 1. 3 pays 5. The remainder is not rounded up.

The extra above the stake is reserved from `bank` when the bet is placed. A second bet that needs the same extra is refused. On heads the reserve pays the extra. On tails the stake and the reserve return to the bank.

`receiverand` and `randnotify` use the same function. The first accepted delivery pays once. The other callback with the same 32 bytes is recorded and does not pay again. A different 32 bytes is refused. One path is enough to resolve. Waiting for both would stall a legacy `receiverand`-only contract.

`requestrand` in `client/requestrand-action.ts` is an unsigned action body: `assoc_id`, `signing_value`, `caller`, account `orng.wax`. It does not stake RNG credits. v3 may require credits or a per-request fee. That payment is not in this repo.

A `check` that fails inside a notify fails the sender transaction. The mismatch rule is the pure function throwing. It was not executed inside a notify.

## Run

```bash
npm test
```

No host is called.

## Uncompiled sketch

`contracts/src/px_coinflip.cpp` is not the rule above, and `npm test` does not read it. It was not compiled. There is no wasm.

- The tested draw is byte 0: 0–126 heads, 127–253 tails, 254–255 rerequest. The sketch rejection-samples a uint64 range of 2, which does not reject.
- The tested payout is `stake * 19600 / 10000`, and the extra is reserved from the bank when the bet is placed. The sketch pays from the contract balance at resolution and does not reserve.
- `client/wharfkit-demo.ts` is a broadcast sketch. It is not the unsigned action in `client/requestrand-action.ts`, and it was not run.
