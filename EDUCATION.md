# Education

Quest 004. The tested rule is the escrow and the bias-free coinflip resolution.

## The rule that was executed

- A 10000 unit wager resolves to 19600 on a win (house edge applied).
- The same random bytes pay only once.
- A value that would introduce modulo bias (254 in the tested range) causes a rerequest.

`npm test` runs that rule. It does not call `orng.wax` and it does not spend RNG credits.

## Dual callback

ORNG v3 can deliver via `randnotify` (preferred) or the legacy `receiverand`. Both paths must resolve the same association id exactly once. The tested rule enforces the once-only property.

## Sketch

`contracts/src/px_coinflip.cpp` is uncompiled. It is not the integration. The TypeScript rule is the source of truth until a deterministic build exists.

## Client

The requestrand action builder returns an unsigned body. It does not broadcast.
