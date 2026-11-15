# Worked examples — coinflip escrow

`winPayout(10000n)` is `19600n` (200 bps edge on even money). `winPayout(1n)` is `1n`. `winPayout(3n)` is `5n`.

| Byte | Class |
| --- | --- |
| 0 and 126 | heads |
| 127 and 253 | tails |
| 254 and 255 | reject |

Test hex: heads `00`+`11`×31, tails `7f`+`22`×31, reject `fe`+`33`×31.

## Win

Bank starts at `9600` (the extra). Alice stakes `10000`, signing value `7`.

After place: bank `0`, escrow `10000`, reserved `9600`.

`deliver(..., heads, "randnotify")` → outcome heads, payout `19600`, all pots `0`.

## Loss

Same place, deliver tails via `receiverand` → payout `0`, bank `19600` (stake + reserve).

## Dual callback, same bytes

First `receiverand` with heads, second `randnotify` with the **same** hex: sources list both paths, payout still `19600`, no double pay.

Second path with **different** hex throws `random mismatch`.

## Rerequest on 254

Stake `1`, bank `0`. Deliver reject → status `rerequest`, escrow stays `1`.

`rerequest` with the same signing value `9` throws `duplicate signing value`.
New signing value `10` reopens. Deliver heads → payout `1`.

## Other refusals

| Case | Error |
| --- | --- |
| Second bet when bank only covers one reserve | bank |
| Stake `0` | bad stake |
| Deliver missing id | missing bet |
| Entropy `zz` | bad random |

No live `orng.wax`. Callback names are labels on the books.
