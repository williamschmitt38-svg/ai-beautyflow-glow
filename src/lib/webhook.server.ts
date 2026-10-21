// Server-only: posts salon events to the Enterprise webhook URL. Failures never break the caller.
export async function dispatchSalonWebhook(url: string | null | undefined, event: string, payload: Record<string, unknown>) {
  if (!url || !/^https:\/\//i.test(url)) return { ok: false, status: 0 };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "GlowVitta-Webhook/1.0" },
      body: JSON.stringify({ event, sent_at: new Date().toISOString(), data: payload }),
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    console.error("webhook failed", event, (e as Error).message);
    return { ok: false, status: 0 };
  }
}
