# Education

Example of a bias-free coinflip that locks an escrow until a random result arrives and pays exactly once.

## Why rejection sampling

A 256-bit random value reduced with a simple modulo can be biased when the range does not divide the full space evenly. The tested rule rejects values that would fall into the biased remainder and requests a fresh random instead. This keeps heads and tails equally likely.

## Authorization and once-only payout

Only the player who placed the bet may create the escrow. The resolution path (whether `randnotify` or `receiverand`) must:

- Authenticate that the random result comes from `orng.wax`.
- Look up the escrow by association id.
- Pay or refund exactly once, then erase the escrow.
- Refuse a second delivery of the same id.

A missing once-only check lets an attacker replay a favorable result.

## Negative and out-of-range inputs

The tested rule refuses:

- A non-positive wager.
- A choice outside {0, 1}.
- An association id that does not exist.
- A second resolution of an already-settled id.

These checks stop zero-value bets, invalid choices, and double-spends.

## Timeout refund

A production escrow must also allow the player to reclaim funds if the random result never arrives. That path is not yet tested. Without it, a delayed or missing callback permanently locks the stake.

## What is not yet done

No call to `orng.wax` is made. No RNG credits are spent. The C++ sketch is uncompiled. The TypeScript rule is the source of truth until a deterministic build matches it.

## Attack surface to keep closed

- Modulo bias.
- Replay of a winning random result.
- Resolution by anyone other than the authorized callback path.
- Escrow that can be withdrawn before resolution or after a double callback.
- Missing timeout refund path (not yet tested).
