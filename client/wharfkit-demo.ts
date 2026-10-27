/**
 * One action. orng.wax delivers the result later. Do not expect the bet
 * to resolve inside this transaction.
 */
import { Session } from "@wharfkit/session";

const CONTRACT = "replaceaccount"; // 12-char account chosen at deploy

export async function flip(session: Session, heads: boolean, quantity = "1.00000000 WAX") {
  return session.transact({
    actions: [
      {
        account: "eosio.token",
        name: "transfer",
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: CONTRACT,
          quantity,
          memo: heads ? "flip:1" : "flip:0",
        },
      },
    ],
  });
}

export async function fundHouse(session: Session, quantity: string) {
  return session.transact({
    actions: [
      {
        account: "eosio.token",
        name: "transfer",
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: CONTRACT,
          quantity,
          memo: "fund_house",
        },
      },
    ],
  });
}
