import "server-only";
import type { Agent } from "./teams";

export type ScriptResponse = {
  result?: string;
  mocked?: boolean;
  error?: string;
  [key: string]: unknown;
};

function scriptUrl(): string | null {
  const url = process.env.CG_FUN_AppScript;
  return !url || url.includes("PASTE_YOUR") || !url.startsWith("https://") ? null : url;
}

// Stand-in for the sheet during local dev, so the team maker works without CG_FUN_AppScript.
const mockRows: Agent[] = [
  { row: 2, nama: "Jason [Crest]", status: "Ikut", statusCg: "CG People", team: "" },
  { row: 3, nama: "Dino [Syalalala]", status: "Ikut", statusCg: "CG People", team: "" },
  { row: 4, nama: "Gratia [Lohe]", status: "Ikut", statusCg: "CG People", team: "" },
  { row: 5, nama: "Leonardo [Elang Botak]", status: "Ikut", statusCg: "VIP / Teman Baru", team: "" },
  { row: 6, nama: "Nsne [Ddeee]", status: "Masih Ragu", statusCg: "CG People", team: "" },
];

function mock(payload: Record<string, unknown>): ScriptResponse {
  console.warn(`[apps-script] CG_FUN_AppScript is not set — mocking ${String(payload.type)}.`);
  if (payload.type === "LIST") return { result: "success", mocked: true, rows: mockRows };
  if (payload.type === "SAVE_TEAMS") {
    for (const a of payload.assignments as { row: number; team: string }[]) {
      const row = mockRows.find((r) => r.row === a.row);
      if (row) row.team = a.team;
    }
  }
  return { result: "success", mocked: true };
}

/**
 * POSTs to the Google Apps Script web app (source: apps-script/Code.gs).
 * `status` is what our own API route should answer with.
 */
export async function callAppsScript(payload: Record<string, unknown>): Promise<{ status: number; data: ScriptResponse }> {
  const url = scriptUrl();
  if (!url) return { status: 200, data: mock(payload) };

  try {
    // Apps Script needs text/plain (avoids a CORS preflight) and follows a 302 to the result URL.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();
    let data: ScriptResponse;
    try {
      data = JSON.parse(text) as ScriptResponse;
    } catch {
      data = { result: res.ok ? "success" : "error", raw: text.slice(0, 500) };
    }
    return { status: res.ok && data.result !== "error" ? 200 : 502, data };
  } catch (err) {
    return {
      status: 502,
      data: { result: "error", error: err instanceof Error ? err.message : "Upstream request failed" },
    };
  }
}

/** All RSVP rows from the sheet. Throws if the sheet can't be read. */
export async function listAgents(): Promise<Agent[]> {
  const { status, data } = await callAppsScript({ type: "LIST" });
  if (status !== 200 || !Array.isArray(data.rows)) {
    throw new Error(data.error ?? "Apps Script did not return rows — is Code.gs up to date?");
  }
  return data.rows as Agent[];
}
