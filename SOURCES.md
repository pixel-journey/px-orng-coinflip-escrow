# Official sources

| Source | Use |
| --- | --- |
| [wax-orng](https://github.com/worldwide-asset-exchange/wax-orng) | Request/delivery of 256-bit random values |
| [WAX RNG sample](https://docs.wax.io/build/tutorials/create-wax-rng-smart-contract/rng_sample) | docs.wax.io sample integration |
| [docs.wax.io](https://docs.wax.io/) | WAX development |

House edge and byte bands in this lab are **project rules**, not orng.wax policy. The oracle only supplies entropy; escrow accounting is the dapp's job.

## Domain map

| Repo | Role |
| --- | --- |
| [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter) | Job + once-resolve |
| [px-orng-dual-callback-idempotent](https://github.com/pixel-journey/px-orng-dual-callback-idempotent) | Dual path, first payout wins |
| **This repo** | Stake, bank reserve, byte-0 draw, rerequest band |
