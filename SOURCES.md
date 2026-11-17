# Sources

| Source | Use |
| --- | --- |
| [wax-orng](https://github.com/worldwide-asset-exchange/wax-orng) | requestrand + callbacks |
| [RNG tutorial](https://docs.wax.io/build/tutorials/create-wax-rng-smart-contract/rng_sample) | Sample path |
| [docs.wax.io](https://docs.wax.io/) | WAX development |

**Product facts locked by tests:** stake 10000 → win pays **19600** (200 bps edge at chance 50). Reject / rerequest bytes **254–255**. Bank reserve is taken **at place**, not at deliver.

Do not reuse the dice reject window (200–255) or the roulette window (222–255).

## Related labs

| Lab | Topic |
| --- | --- |
| [dual-callback](https://github.com/pixel-journey/px-orng-dual-callback-idempotent) | Once-resolve (coinflip is stricter on entropy mismatch) |
| [dice](https://github.com/pixel-journey/px-orng-dice-multi-tier-payout) | Chance 49 under-50; reject 200–255 |
| [roulette](https://github.com/pixel-journey/px-orng-roulette-wheel-escrow) | 0–36; reject 222–255 |
| [credit bucket](https://github.com/pixel-journey/px-orng-credit-bucket-monitor) | Credits before open |
| [ORNG path](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/docs/ORNG-LEARNING-PATH.md) | Reject windows cheatsheet |
