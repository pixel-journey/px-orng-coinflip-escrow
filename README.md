# px-orng-coinflip-escrow

> **Domain:** ORNG coinflip escrow  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

House-edge coin flip escrow for an `orng.wax` result. Private. Not deployed. `orng.wax` was not called.

Official randomness service: [wax-orng](https://github.com/worldwide-asset-exchange/wax-orng). Delivery hygiene: [dual-callback](https://github.com/pixel-journey/px-orng-dual-callback-idempotent), [v3 starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter).

## What is true

The player calls heads. The first byte of the 32-byte random value is the draw (not `uint64 % 2`).

| Byte | Result |
| --- | --- |
| 0–126 | heads |
| 127–253 | tails |
| 254–255 | rejected / rerequest |

Payout on heads is `stake * 19600 / 10000` (200 bps edge). Extra is reserved from `bank` at bet time. `receiverand` and `randnotify` share one delivery function; first accepted pays once.

`requestrand` client body is unsigned and does not stake RNG credits. Uncompiled C++ sketch is **not** the tested rule.

## Run

```bash
npm test
```

See [SOURCES.md](SOURCES.md).
