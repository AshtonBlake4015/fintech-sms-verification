import { shouldResend, verificationBody } from "../src/verification.js";

const low = verificationBody.parse({ phone: "+15551234567", attempt: 1, risk: "low", paymentId: "pay_42" });
if (!shouldResend(low)) throw new Error("low-risk attempt should resend");
const high = verificationBody.parse({ phone: "+15551234567", attempt: 1, risk: "high", paymentId: "pay_42" });
if (shouldResend(high)) throw new Error("high-risk attempt should be held");
console.log("verification decision test passed");
