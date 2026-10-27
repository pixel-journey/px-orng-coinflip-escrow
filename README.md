# px-orng-coinflip-escrow

House-edge coin flip escrow for an `orng.wax` result. Private. Not deployed. `orng.wax` was not called.

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

`requestrand` in `client/` is an unsigned action body: `assoc_id`, `signing_value`, `caller`, account `orng.wax`. It does not stake RNG credits. v3 may require credits or a per-request fee. That payment is not in this repo.

A `check` that fails inside a notify fails the sender transaction. The mismatch rule is the pure function throwing. It was not executed inside a notify.

## Run

```bash
npm test
```

No host is called.
