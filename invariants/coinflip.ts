export const EDGE_BPS = 200;
export const PAYOUT_NUMERATOR = 19600n;
export const PAYOUT_DENOMINATOR = 10000n;
export const ACCEPT_BELOW = 254;
export const HEADS_BELOW = 127;

const NAME = /^[a-z1-5.]{1,12}$/;
const U64 = /^(0|[1-9][0-9]{0,19})$/;
const HEX = /^[0-9a-f]{64}$/;

export type Source = "receiverand" | "randnotify";
export type Outcome = "heads" | "tails";

export type Bet = {
  id: string;
  player: string;
  stake: string;
  signingValue: string;
  status: "open" | "resolved" | "rerequest";
  random: string | null;
  outcome: Outcome | null;
  payout: string | null;
  sources: Source[];
};

export type Books = {
  bank: string;
  escrow: string;
  reserved: string;
  bets: Bet[];
  usedSigningValues: string[];
};

export function emptyBooks(bank: bigint): Books {
  if (bank < 0n) throw new Error("bad bank");
  return { bank: bank.toString(), escrow: "0", reserved: "0", bets: [], usedSigningValues: [] };
}

export function winPayout(stake: bigint): bigint {
  if (stake < 1n) throw new Error("bad stake");
  return (stake * PAYOUT_NUMERATOR) / PAYOUT_DENOMINATOR;
}

export function byte0(randomHex: string): number {
  if (!HEX.test(randomHex)) throw new Error("bad random");
  return parseInt(randomHex.slice(0, 2), 16);
}

export function classify(byte: number): "reject" | Outcome {
  if (byte >= ACCEPT_BELOW) return "reject";
  if (byte < HEADS_BELOW) return "heads";
  return "tails";
}

function assertName(name: string): void {
  if (!NAME.test(name) || name.startsWith(".") || name.endsWith(".")) throw new Error("bad name");
}

function u64(value: string, label: string): bigint {
  if (!U64.test(value)) throw new Error("bad " + label);
  const n = BigInt(value);
  if (n > 0xffffffffffffffffn) throw new Error("bad " + label);
  return n;
}

function clone(books: Books): Books {
  return {
    bank: books.bank,
    escrow: books.escrow,
    reserved: books.reserved,
    usedSigningValues: [...books.usedSigningValues],
    bets: books.bets.map((bet) => ({ ...bet, sources: [...bet.sources] })),
  };
}

export function place(
  books: Books,
  input: { id: string; player: string; stake: string; signingValue: string },
): Books {
  assertName(input.player);
  const id = u64(input.id, "id");
  const stake = u64(input.stake, "stake");
  if (stake < 1n) throw new Error("bad stake");
  const signingValue = u64(input.signingValue, "signing value");
  if (books.bets.some((bet) => bet.id === id.toString())) throw new Error("duplicate id");
  if (books.usedSigningValues.includes(signingValue.toString())) throw new Error("duplicate signing value");
  const payout = winPayout(stake);
  const extra = payout - stake;
  const bank = BigInt(books.bank);
  if (bank < extra) throw new Error("bank");
  const next = clone(books);
  next.bank = (bank - extra).toString();
  next.escrow = (BigInt(books.escrow) + stake).toString();
  next.reserved = (BigInt(books.reserved) + extra).toString();
  next.usedSigningValues.push(signingValue.toString());
  next.bets.push({
    id: id.toString(),
    player: input.player,
    stake: stake.toString(),
    signingValue: signingValue.toString(),
    status: "open",
    random: null,
    outcome: null,
    payout: null,
    sources: [],
  });
  return next;
}

export function deliver(books: Books, id: string, randomHex: string, source: Source): Books {
  const betId = u64(id, "id").toString();
  if (!HEX.test(randomHex)) throw new Error("bad random");
  if (source !== "receiverand" && source !== "randnotify") throw new Error("bad source");
  const next = clone(books);
  const bet = next.bets.find((row) => row.id === betId);
  if (!bet) throw new Error("missing bet");
  if (bet.status === "resolved" || bet.status === "rerequest") {
    if (bet.random !== randomHex) throw new Error("random mismatch");
    if (!bet.sources.includes(source)) bet.sources.push(source);
    return next;
  }
  bet.random = randomHex;
  if (!bet.sources.includes(source)) bet.sources.push(source);
  const face = classify(byte0(randomHex));
  if (face === "reject") {
    bet.status = "rerequest";
    return next;
  }
  const stake = BigInt(bet.stake);
  const payout = winPayout(stake);
  const extra = payout - stake;
  bet.status = "resolved";
  bet.outcome = face;
  if (face === "heads") {
    bet.payout = payout.toString();
    next.escrow = (BigInt(next.escrow) - stake).toString();
    next.reserved = (BigInt(next.reserved) - extra).toString();
    return next;
  }
  bet.payout = "0";
  next.escrow = (BigInt(next.escrow) - stake).toString();
  next.reserved = (BigInt(next.reserved) - extra).toString();
  next.bank = (BigInt(next.bank) + stake + extra).toString();
  return next;
}

export function rerequest(books: Books, id: string, signingValue: string): Books {
  const betId = u64(id, "id").toString();
  const seed = u64(signingValue, "signing value");
  if (books.usedSigningValues.includes(seed.toString())) throw new Error("duplicate signing value");
  const next = clone(books);
  const bet = next.bets.find((row) => row.id === betId);
  if (!bet) throw new Error("missing bet");
  if (bet.status !== "rerequest") throw new Error("not rerequest");
  bet.status = "open";
  bet.random = null;
  bet.sources = [];
  bet.signingValue = seed.toString();
  next.usedSigningValues.push(seed.toString());
  return next;
}
