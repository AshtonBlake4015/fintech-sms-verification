import { z } from "zod";
import { infrai } from "./infrai.js";

export const verificationBody = z.object({ phone: z.string().min(8), attempt: z.number().int().nonnegative(), risk: z.enum(["low", "high"]), paymentId: z.string().min(1) });
export type VerificationBody = z.infer<typeof verificationBody>;

export function shouldResend(input: VerificationBody): boolean {
  return input.risk === "low" && input.attempt < 3;
}

export async function resendVerification(input: unknown, messageId: string) {
  const body = verificationBody.parse(input);
  if (!shouldResend(body)) return { status: "held", paymentId: body.paymentId, reason: "risk_review" as const };
  const data = await infrai.sms.resend(messageId, `verification-${body.paymentId}-${body.attempt}`);
  const delivery = await infrai.sms.events(data.message_id);
  return { status: "resent", paymentId: body.paymentId, messageId: data.message_id, delivery };
}
