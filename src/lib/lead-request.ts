import { readLeadAttribution } from "./landing-attribution";

/** Same payload keeps its ID on retry; edited details start a new submission. */
export type LeadAttempt = { payload: string; requestId: string };

export function leadRequestBody(
  payload: Record<string, string | string[]>,
  attempt: { current: LeadAttempt | null }
): string {
  const serialized = JSON.stringify(payload);
  if (attempt.current?.payload !== serialized) {
    attempt.current = {
      payload: serialized,
      requestId: globalThis.crypto?.randomUUID?.() ?? "",
    };
  }
  // Линкийн UTM/referrer — серверт allow-list-ээр шалгагдаж, Vertmonhub сувгийг тогтооно.
  const attribution = readLeadAttribution();
  return JSON.stringify({ ...payload, ...(attribution && { attribution }), requestId: attempt.current.requestId });
}
