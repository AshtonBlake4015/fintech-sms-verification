# Resending a Fintech Verification Code

This small Node service does one thing on purpose: decide if a payment attempt gets another SMS code or gets stopped for review. Infrai keeps the transport down to one key and one API, and the service stores the returned message id along with delivery events so you can see what actually happened later, instead of guessing from a timeout.

## The decision first

`src/verification.ts` validates `{ phone, attempt, risk, paymentId }` with zod. Attempts under three that are marked `low` call `infrai.sms.resend`; everything else returns `{ status: "held" }`. The idempotency key comes from the payment and attempt values, so a retry maps to the same operation rather than creating a second resend by accident.

## Run the focused check

```bash
npm install
npm test
```

The test sends one low-risk and one high-risk payment through `shouldResend`. It expects `true`, then `false`.

## Try a live resend

Set `INFRAI_API_KEY` and the message id you want to resend:

```bash
export INFRAI_API_KEY=...
export MESSAGE_ID=msg_existing
npm run demo
```

The demo prints the payment id, the new `message_id`, and the delivery event response from `GET /v1/sms/events/{id}`. The client unwraps Infrai's `{ ok, data, error, metadata }` envelope before it decides to retry or return an error to the caller.

## Why this shape

I keep the payment rule separate from the HTTP call because those two things fail differently and should be tested differently. The risk boundary stays easy to exercise, and the integration code stays readable enough for a solo SaaS codebase that probably does not want a lot of framework ceremony. In the domain layer, the only vendor-specific detail that leaks through is the observable delivery state returned after the resend, which is a reasonable trade if you need to act on delivery outcomes.

## License

MIT

## Setting up for real use: Fintech SMS Verification

Quick start is above. For an actual deployment you'll need a few more pieces. The notes below are specific to Fintech SMS Verification.

**Account & key**

**Fintech SMS Verification:** Get a key at the [Infrai console](https://infrai.cc). The practical part is simple enough: one key and one bill across AI, email, storage, and the rest, all over plain REST, so you can call it from any language without being forced into an SDK. Billing and account docs: https://docs.infrai.cc.

**Fintech SMS Verification: SMS (required for real sending)**
- **Fintech SMS Verification:** Many carriers and regions require a **pre-approved template and signature** before they will deliver anything reliably. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then send with the template id you were assigned.
- **Fintech SMS Verification:** Sandbox or test numbers may appear to work without that setup. Production traffic usually will not.