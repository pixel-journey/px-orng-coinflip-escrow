# Education — coinflip escrow

> **Rung:** `npm test` passes. A C++ file exists under `contracts/src/` and is an **uncompiled sketch**. This course follows the TypeScript tests. No `requestrand` is sent. No RNG credit is spent.  
> **The test is the rule.**

Read the starter courses first if the words job, `randnotify`, and `receiverand` are new: `px-orng-v3-randnotify-starter`, then `px-orng-dual-callback-idempotent`. This repo is the one that actually moves bank, escrow, and reserve numbers.

## What you should be able to do

| Level | After this file |
| --- | --- |
| Beginner | Show that 10000 reserved-and-escrowed becomes a 19600 win or a 0 loss |
| Intermediate | Use byte 0 only, reject 254 and 255, and keep the second callback from paying again |
| Masterclass | Say what is still missing before this is an oracle game: auth, the real entropy, and a player balance |

---

## Beginner — one scene

Alice stakes `"10000"`. The bank must already hold the extra the house might owe.

```text
payout = floor(stake * 19600 / 10000)
extra  = payout - stake
```

For 10000, payout is 19600 and extra is 9600. `place` on a bank of 9600 leaves:

| Field | After place |
| --- | --- |
| bank | `"0"` |
| escrow | `"10000"` (her stake) |
| reserved | `"9600"` (the extra) |

Heads (`randnotify`, first byte `00`): outcome `heads`, payout `"19600"`, escrow `"0"`, reserved `"0"`, bank stays `"0"`.

Tails (`receiverand`, first byte `7f`): outcome `tails`, payout `"0"`, bank becomes `"19600"` (stake plus extra come home), escrow and reserved `"0"`.

A second bet of 10000 against that emptied bank throws `bank`.

### Words

| Word | Meaning here |
| --- | --- |
| `19600 / 10000` | Win multiplier. 200 bps of "2.0" is the house edge (1.96x, not 2x) |
| Escrow | The player's stake, held until resolve |
| Reserved | The extra pulled from the bank so a win can be paid |
| Byte 0 | `parseInt(hex.slice(0, 2), 16)`. The other 62 hex chars do not decide the face |
| Reject | First byte 254 or 255. Status becomes `rerequest`. Money stays put |

### Predict, then run

```bash
npm test
```

1. `winPayout(1n)` is 1, not 0. `winPayout(3n)` is 5.
2. Classify: 0 and 126 heads, 127 and 253 tails, 254 and 255 reject.
3. Same random on the second callback keeps payout `"19600"` and records both source names. A different second random throws `random mismatch`.

---

## Intermediate — the accept window is why the coin is fair

`classify`:

```text
byte >= 254        → reject
byte < 127         → heads     (0..126, 127 values)
otherwise          → tails     (127..253, 127 values)
```

254 accepted values, split in half. The two leftover bytes are not a quiet bias toward tails. They are a rerequest. Using `byte % 2` on all 256 values would also be even, but this lab does not do that. It refuses 254 and 255 so a later formula can stay "below 127" without a remainder class.

### What a win does not do

The books do not grow a player balance by 19600. A win zeroes escrow and reserved and sets `bet.payout` to `"19600"`. A loss moves stake + extra back to `bank` and sets payout to `"0"`. If you teach "the player receives 19600," say that the field says so. The test does not credit an account named `alice`.

### Second path

If status is already `resolved` or `rerequest`:

- Same hex: append the source name if it is new, and return. No second payout.
- Different hex: `random mismatch`.

That is stricter than `px-orng-dual-callback-idempotent`, which ignores the second entropy. Here a disagreeing second oracle payload is an error.

### Rerequest

Stake `"1"` needs extra 0, so a bank of 0 can open it. Random starting `fe` (254) sets status `rerequest`, escrow stays `"1"`, bank stays `"0"`. `rerequest` with signing value `"9"` throws `duplicate signing value`. Value `"10"` sets status back to `open`, clears `random` and `sources`, and then a heads delivery sets payout `"1"`.

The stake is not refunded on reject. It waits for a new signing value and another delivery.

### Attack → test

| Attack | Naive code | This lab | Test |
| --- | --- | --- | --- |
| Pay 2x and ignore the edge | 20000 | `floor(stake * 19600 / 10000)` | `10000 pays 19600` |
| `byte % 2` including 254 and 255 | Uneven or a biased tail | reject those two | `bytes 0 and 126 are heads…` |
| Both callbacks pay | 19600 twice | second source recorded, books stay paid once | `the second callback…` |
| Second payload swaps the face | Heads becomes tails | `random mismatch` | `a different second random is refused` |
| Two bets share one extra | Second win cannot be reserved | `bank` | `two bets cannot share a bank…` |
| Reuse the signing value after a reject | Oracle can be rebound to an old commitment | `duplicate signing value` | `254 stays escrowed…` |

---

## Masterclass — books are not a transfer

`place` and `deliver` take the structs you pass. They do not `require_auth` the player or `orng.wax`. They do not check `dapp == get_self()`. The starter course is that gate. This course is the money.

Still not in the executed rule:

- A broadcast `requestrand` bound to `signingValue` before the bet can resolve.
- Oracle credits.
- A token `transfer` of the payout to `player` in the same action that zeroes escrow and reserved. Today a crash between "status resolved" and "token sent" cannot happen, because no token is sent. The sketch must not introduce that gap.
- Refund on rerequest if you want the player unstuck without a second oracle round. This lab does not refund.
- Dust: `winPayout(1n) === 1n`, so the edge is zero at one unit. Document that next to "1.96x."

`contracts/src/px_coinflip.cpp` is not the rule until the pinned CDT workflow has produced wasm and abi. If the sketch and `invariants/coinflip.ts` disagree, the test wins.

### Exercise

1. Bank 9600, stake 10000, tails. What is `bank`? (`"19600"`. Tested.)
2. Why is byte 253 tails and byte 254 reject? (253 is still `< 254` and not `< 127`. 254 is the first reject. Tested.)
3. Does a heads result increase `bank`? (No. Bank stays `"0"` in the win test. The payout is a field on the bet.)

---

## What this course will not teach

- That Alice's token balance became 19600
- A live oracle call
- That the C++ sketch has been compiled
