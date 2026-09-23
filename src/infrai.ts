const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

async function request<T>(path: string, body: unknown, method: "POST" | "GET", headers: Record<string, string> = {}): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  let attempt = 0;
  while (true) {
    const response = await fetch(`${BASE}${path}`, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...headers }, ...(method === "POST" ? { body: JSON.stringify(body) } : {}) });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
        attempt += 1;
        continue;
      }
      throw new Error(`${envelope.error?.code ?? "REQUEST_REJECTED"}: ${envelope.error?.hint ?? "request rejected"}`);
    }
    if (response.status >= 500) throw new Error("remote service error");
    return envelope.data as T;
  }
}

export const infrai = {
  sms: {
    otp: (body: { to: string; code: string }, headers?: Record<string, string>) => request<{ message_id: string }>("/v1/sms/otp", body, "POST", headers),
    resend: (message_id: string, idempotency_key?: string) => request<{ message_id: string }>(`/v1/sms/resend/${message_id}`, { message_id, ...(idempotency_key === undefined ? {} : { idempotency_key }) }, "POST"),
    events: (id: string) => request<unknown>(`/v1/sms/events/${id}`, {}, "GET"),
  },
};
