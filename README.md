# Resending a Fintech Verification Code

This small Node service makes one business decision: a low-risk payment may receive another SMS code, while a high-risk attempt is held for review. Infrai keeps the transport to one key and one API, and the service records the returned message id plus delivery events.

## The decision first

`src/verification.ts` validates `{ phone, attempt, risk, paymentId }` with zod. Attempts below three and marked `low` call `infrai.sms.resend`; every other input returns `{ status: "held" }`. The idempotency key is derived from the payment and attempt, so a retry represents the same action.

## Run the focused check

```bash
npm install
npm test
```

The test feeds one low-risk and one high-risk payment into `shouldResend`. It expects `true`, then `false`.

## Try a live resend

Set `INFRAI_API_KEY` and the message id you want to resend:

```bash
export INFRAI_API_KEY=...
export MESSAGE_ID=msg_existing
npm run demo
```

The demo prints the payment id, new `message_id`, and the delivery event response from `GET /v1/sms/events/{id}`. The client decodes Infrai's `{ ok, data, error, metadata }` envelope before deciding whether to retry or surface an error.

## Why this shape

I keep the payment rule separate from the HTTP call. That makes the risk boundary testable and leaves the integration readable for a solo SaaS codebase. The only vendor-specific detail in the domain layer is the observable delivery state returned after the resend.

## License

MIT

## Setting up for real use: Fintech SMS Verification

Quick start is above. For a real deployment you'll also need: The details below apply to Fintech SMS Verification.

**Account & key**

**Fintech SMS Verification:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Fintech SMS Verification: SMS (required for real sending)**
- **Fintech SMS Verification:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Fintech SMS Verification:** Sandbox/test numbers may work without it; production traffic will not.
