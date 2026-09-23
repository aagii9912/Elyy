/** Same payload keeps its ID on retry; edited details start a new submission. */
export type LeadAttempt = { payload: string; requestId: string };

export function leadRequestBody(
  payload: Record<string, string>,
  attempt: { current: LeadAttempt | null }
): string {
  const serialized = JSON.stringify(payload);
  if (attempt.current?.payload !== serialized) {
    attempt.current = {
      payload: serialized,
      requestId: globalThis.crypto?.randomUUID?.() ?? "",
    };
  }
  return JSON.stringify({ ...payload, requestId: attempt.current.requestId });
}
