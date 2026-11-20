# Coinflip escrow: 19600/10000 edge and dual-path delivery

> **Domain:** WAX ORNG — coinflip  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Path:** `px-contract-examples-vault` (private index; not this public course)

**Goal:** Heads/tails with **200 bps edge** (`19600/10000`), bank reserve of the extra, rejection of bytes 254–255, and once-only settle across `randnotify` / `receiverand`.

**Code under test:** `npm test` (+ client action tests). No live `orng.wax`.

**Official:** [wax-orng](https://github.com/worldwide-asset-exchange/wax-orng).

## Learning materials

| Doc | Role |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Full course |
| [WORKED-EXAMPLES.md](WORKED-EXAMPLES.md) | Bytes, edge, dual deliver, rerequest |
| [TIPS.md](TIPS.md) | Reserve and dual-path |
| [SECURITY.md](SECURITY.md) | Solvency and mismatch |
| [SOURCES.md](SOURCES.md) | Official links |

## What is true (executed)

- `10000` stake → `19600` heads payout; tails returns stake+extra to bank.
- Bytes 254–255 → rerequest, not a face.
- Second delivery with same random is idempotent; different random refused.
- Place without bank extra refused.

```bash
npm test
```

MIT — Pixel Journey
