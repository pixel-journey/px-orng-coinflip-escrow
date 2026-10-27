import assert from "node:assert/strict";
import test from "node:test";
import { requestrandAction } from "./requestrand-action.ts";

test("requestrand names orng.wax and carries no signature", () => {
  assert.deepEqual(
    requestrandAction({ caller: "pxflip", assocId: "1", signingValue: "7" }),
    {
      account: "orng.wax",
      name: "requestrand",
      authorization: [{ actor: "pxflip", permission: "active" }],
      data: { assoc_id: "1", signing_value: "7", caller: "pxflip" },
    },
  );
});
