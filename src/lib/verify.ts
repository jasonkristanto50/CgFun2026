import type { OptionKey } from "@/config/game";

/** "error" = no signal / server unreachable — never counted as a wrong answer. */
export type VerifyOutcome =
  | { status: "correct"; digit?: string }
  | { status: "wrong" }
  | { status: "error" };

async function verify(body: object): Promise<VerifyOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return { status: "error" };
    const data = (await res.json()) as { correct?: boolean; digit?: string };
    return data.correct ? { status: "correct", digit: data.digit } : { status: "wrong" };
  } catch {
    return { status: "error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function verifyAnswer(mission: number, choice: OptionKey) {
  return verify({ type: "answer", mission, choice });
}

export function verifyVault(code: string) {
  return verify({ type: "vault", code });
}
