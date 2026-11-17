# Tips — coinflip + ORNG

## Fairness

- Bytes **254/255** are **rerequest**, not house wins.  
- Accept window is 0..253 split evenly (127 heads / 127 tails).  
- Do not use `byte % 2` over the full 0..255 range if you care about documenting the reject class.

## Solvency

- Reserve `payout - stake` at **place**, not at deliver.  
- One bank extra cannot back two concurrent max bets.  
- Win sets `bet.payout`; it does not automatically grow a player token balance in this lab.

## Callbacks

- Unify `randnotify` / `receiverand` via [dual-callback](https://github.com/pixel-journey/px-orng-dual-callback-idempotent).  
- This lab is **stricter** on a second different entropy (`random mismatch`) than dual-callback's ignore path.  
- Signing values are one-shot after rerequest.

## Related

[dice](https://github.com/pixel-journey/px-orng-dice-multi-tier-payout) · [roulette](https://github.com/pixel-journey/px-orng-roulette-wheel-escrow) · [ORNG-LEARNING-PATH](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/docs/ORNG-LEARNING-PATH.md)
