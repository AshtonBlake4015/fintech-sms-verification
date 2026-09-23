import { resendVerification } from "../src/verification.js";

const result = await resendVerification({ phone: process.env.DEMO_PHONE ?? "+15551234567", attempt: 1, risk: "low", paymentId: process.env.PAYMENT_ID ?? "pay_demo" }, process.env.MESSAGE_ID ?? "message_demo");
console.log(JSON.stringify(result, null, 2));
