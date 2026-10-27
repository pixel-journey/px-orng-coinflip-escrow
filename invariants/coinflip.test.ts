import assert from "node:assert/strict";
import test from "node:test";
import { byte0, classify, deliver, emptyBooks, place, rerequest, winPayout } from "./coinflip.ts";

const heads = "00" + "11".repeat(31);
const tails = "7f" + "22".repeat(31);
const reject = "fe" + "33".repeat(31);
const other = "01" + "44".repeat(31);

test("10000 pays 19600 and 1 pays 1", () => {
  assert.equal(winPayout(10000n), 19600n);
  assert.equal(winPayout(1n), 1n);
  assert.equal(winPayout(3n), 5n);
});

test("bytes 0 and 126 are heads, 127 and 253 are tails, 254 is rejected", () => {
  assert.equal(classify(0), "heads");
  assert.equal(classify(126), "heads");
  assert.equal(classify(127), "tails");
  assert.equal(classify(253), "tails");
  assert.equal(classify(254), "reject");
  assert.equal(classify(255), "reject");
  assert.equal(byte0(heads), 0);
  assert.equal(byte0(tails), 0x7f);
});

test("a win keeps the nickname of the books and pays from the reserve", () => {
  const open = place(emptyBooks(9600n), {
    id: "1",
    player: "alice",
    stake: "10000",
    signingValue: "7",
  });
  assert.equal(open.bank, "0");
  assert.equal(open.escrow, "10000");
  assert.equal(open.reserved, "9600");
  const paid = deliver(open, "1", heads, "randnotify");
  assert.equal(paid.bets[0].outcome, "heads");
  assert.equal(paid.bets[0].payout, "19600");
  assert.equal(paid.bank, "0");
  assert.equal(paid.escrow, "0");
  assert.equal(paid.reserved, "0");
});

test("a loss returns the reserve and keeps the stake", () => {
  const open = place(emptyBooks(9600n), {
    id: "1",
    player: "alice",
    stake: "10000",
    signingValue: "7",
  });
  const lost = deliver(open, "1", tails, "receiverand");
  assert.equal(lost.bets[0].outcome, "tails");
  assert.equal(lost.bets[0].payout, "0");
  assert.equal(lost.bank, "19600");
  assert.equal(lost.escrow, "0");
  assert.equal(lost.reserved, "0");
});

test("the second callback with the same bytes does not pay twice", () => {
  const open = place(emptyBooks(9600n), {
    id: "1",
    player: "alice",
    stake: "10000",
    signingValue: "7",
  });
  const once = deliver(open, "1", heads, "receiverand");
  const twice = deliver(once, "1", heads, "randnotify");
  assert.deepEqual(twice.bets[0].sources, ["receiverand", "randnotify"]);
  assert.equal(twice.bets[0].payout, "19600");
  assert.equal(twice.escrow, "0");
  assert.equal(twice.bank, "0");
});

test("a different second random is refused", () => {
  const open = place(emptyBooks(9600n), {
    id: "1",
    player: "alice",
    stake: "10000",
    signingValue: "7",
  });
  const once = deliver(open, "1", heads, "receiverand");
  assert.throws(() => deliver(once, "1", other, "randnotify"), /random mismatch/);
});

test("254 stays escrowed until a new signing value", () => {
  const open = place(emptyBooks(0n), {
    id: "4",
    player: "bob",
    stake: "1",
    signingValue: "9",
  });
  const held = deliver(open, "4", reject, "randnotify");
  assert.equal(held.bets[0].status, "rerequest");
  assert.equal(held.escrow, "1");
  assert.equal(held.bank, "0");
  assert.throws(() => rerequest(held, "4", "9"), /duplicate signing value/);
  const again = rerequest(held, "4", "10");
  assert.equal(again.bets[0].status, "open");
  assert.equal(again.bets[0].random, null);
  const paid = deliver(again, "4", heads, "receiverand");
  assert.equal(paid.bets[0].payout, "1");
  assert.equal(paid.escrow, "0");
});

test("two bets cannot share a bank that only covers one", () => {
  const first = place(emptyBooks(9600n), {
    id: "1",
    player: "alice",
    stake: "10000",
    signingValue: "1",
  });
  assert.throws(
    () =>
      place(first, {
        id: "2",
        player: "bob",
        stake: "10000",
        signingValue: "2",
      }),
    /bank/,
  );
});
