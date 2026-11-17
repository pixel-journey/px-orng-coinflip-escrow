# Tips — coinflip + ORNG

## Fairness

- Bytes **254 and 255** are **rerequest**, not house wins.
- Accept window is `0..253` split evenly (127 heads / 127 tails).
- Do not use `byte % 2` over the full `0..255` range if you document a reject class. That biases the house.

## Solvency

- Reserve `payout - stake` at **place**, not at deliver.
- One bank extra cannot back two concurrent max bets.
- A win sets `bet.payout`. It does **not** credit a player token account in this lab. Wire a separate transfer after resolve if you want a balance change.

## Callbacks

- Unify `randnotify` / `receiverand` via [dual-callback](https://github.com/pixel-journey/px-orng-dual-callback-idempotent).
- This lab is **stricter** on a second different entropy (`random mismatch`) than dual-callback's freeze path.
- Signing values are one-shot after a rerequest.

## Common mistakes

1. Treating 254 as tails.
2. Reusing the dice number `19600` as "the coinflip payout" without the stake and edge that produced it (stake 10000, 200 bps, chance 50).
3. Accepting a second callback with different entropy and flipping the outcome.
4. Reserving bank only when the win arrives (insolvent path if two wins land).

## Nice-to-have extensions (not in this repo)

| Idea | Note |
| --- | --- |
| Multi-flip parlay | Cap total reserved liability |
| Token payout on win | After once-resolve; same action if possible |
| Credits before place | [credit bucket](https://github.com/pixel-journey/px-orng-credit-bucket-monitor) |

Related: [dice](https://github.com/pixel-journey/px-orng-dice-multi-tier-payout) · [roulette](https://github.com/pixel-journey/px-orng-roulette-wheel-escrow) · [ORNG path](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/docs/ORNG-LEARNING-PATH.md) · [wax-orng](https://github.com/worldwide-asset-exchange/wax-orng)
