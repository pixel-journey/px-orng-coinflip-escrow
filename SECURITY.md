# Security notes — ORNG coinflip escrow

## Authorization

- Only the player may create the escrow for their own account.
- Resolution (via `randnotify` or `receiverand`) must authenticate that the random result originates from `orng.wax`.
- A second delivery of the same association id must be a no-op or a hard refusal after the escrow has been erased.

## Inputs

- Wager amount must be positive.
- Choice must be 0 or 1.
- Association id must exist and must not already be settled.
- Values that would introduce modulo bias are rejected and cause a rerequest.

## Once-only and replay

The escrow is erased on resolution. Replaying the same random bytes or the same association id must not pay twice. Missing this check is a direct loss of funds.

## Current status

A tested TypeScript rule exists for the payout amount, the once-only property, and the bias rejection. No call to `orng.wax` is made. The C++ sketch is uncompiled. The TypeScript rule is the source of truth until a deterministic build matches it.
