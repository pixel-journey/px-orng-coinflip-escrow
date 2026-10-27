const NAME = /^[a-z1-5.]{1,12}$/;
const U64 = /^(0|[1-9][0-9]{0,19})$/;

export type Action = {
  account: "orng.wax";
  name: "requestrand";
  authorization: { actor: string; permission: "active" }[];
  data: { assoc_id: string; signing_value: string; caller: string };
};

function assertName(name: string): void {
  if (!NAME.test(name) || name.startsWith(".") || name.endsWith(".")) throw new Error("bad name");
}

/**
 * Unsigned orng.wax::requestrand body.
 * assoc_id, signing_value, caller. This does not broadcast and it does not stake RNG credits.
 */
export function requestrandAction(args: {
  caller: string;
  assocId: string;
  signingValue: string;
}): Action {
  assertName(args.caller);
  if (!U64.test(args.assocId) || BigInt(args.assocId) > 0xffffffffffffffffn) throw new Error("bad id");
  if (!U64.test(args.signingValue) || BigInt(args.signingValue) > 0xffffffffffffffffn) {
    throw new Error("bad signing value");
  }
  return {
    account: "orng.wax",
    name: "requestrand",
    authorization: [{ actor: args.caller, permission: "active" }],
    data: {
      assoc_id: args.assocId,
      signing_value: args.signingValue,
      caller: args.caller,
    },
  };
}
