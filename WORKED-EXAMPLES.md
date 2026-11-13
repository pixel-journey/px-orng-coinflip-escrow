# Worked examples — coinflip

Constants: `PAYOUT = stake * 19600 / 10000`, `ACCEPT_BELOW = 254`, `HEADS_BELOW = 127`.

## Example A — fair mapping

| byte0 | Result |
| --- | --- |
| 0..126 | heads |
| 127..253 | tails |
| 254, 255 | reject → rerequest |

## Example B — edge payout

`winPayout(10000n) === 19600n`. Heads pays that amount; tails pays 0 and bank recovers stake + extra. Heads does **not** increase bank.

## Example C — reserve at place

Bank must hold `payout - stake` before the bet is accepted. Insolvent place refused.

## Example D — dual delivery

First `deliver` with `randnotify` settles. Second with `receiverand` and **same** random is a no-op that may record the source; different random → `random mismatch`.

## Example E — rerequest

Reject → status `rerequest`. `rerequest` needs a **new** signing value not in `usedSigningValues`.

## Example F — unsigned client

`client/requestrand-action.ts` builds an unsigned request body (`sent: false`). Not broadcast.
