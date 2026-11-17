# Security — ORNG coinflip escrow

## Closed in tests

| Issue | Behavior |
| --- | --- |
| Zero / bad stake | refused |
| Bank cannot cover `payout - stake` | refused at **place** |
| Second concurrent max bet on one extra | bank refusal |
| Bytes 254 / 255 | **rerequest**, not house win |
| Second deliver same entropy | no double pay |
| Second deliver **different** entropy | `random mismatch` |
| Duplicate signing value after rerequest | refused |
| Missing bet id / bad entropy shape | refused |

Win sets `bet.payout` only. It does not mint tokens into a player balance in this lab.

## Authorization (production still needs)

| Concern | Guidance |
| --- | --- |
| Oracle path | `require_auth(orng.wax)` on `randnotify` / `receiverand` |
| Player path | `require_auth(player)` on place |
| Dual names | One resolver — [dual-callback](https://github.com/pixel-journey/px-orng-dual-callback-idempotent) |
| Credits | Gate before place — [credit bucket](https://github.com/pixel-journey/px-orng-credit-bucket-monitor) |
| Token move | Transfer stake in and payout out in the same atomic path as the book when possible |

## Attack angles the tests encode

1. **Modulo bias** — using the full 0..255 range for a fair coin.
2. **Insolvent accept** — place without reserved extra.
3. **Double pay** — two callback names without a shared resolved flag.
4. **Entropy swap** — second delivery tries to flip the outcome.

## Honesty limits

No call to `orng.wax`. Callback names are labels on the books. C++ sketches are uncompiled. Prefer [wax-orng](https://github.com/worldwide-asset-exchange/wax-orng) on WAX mainnet.
