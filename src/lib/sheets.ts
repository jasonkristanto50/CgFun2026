export type RsvpStatus = "Ikut" | "Masih Ragu";
export type CgStatus = "CG People" | "VIP / Teman Baru";

export type RsvpPayload = {
  type: "RSVP";
  nama: string;
  nomorTelepon: string;
  alamat: string;
  status: RsvpStatus;
  statusCg: CgStatus;
};

export type MissionLabel = `Mission ${1 | 2 | 3 | 4 | 5 | 6}` | "FINISHED";

export type GamePayload = {
  type: "GAME";
  teamName: string;
  currentMission: MissionLabel;
  wrongAttempts: number;
  score: number;
  status: "In Progress" | "FINISHED";
};

export type SheetsResponse = {
  result?: string;
  mocked?: boolean;
  error?: string;
  [key: string]: unknown;
};

/** POSTs to our /api/sheets proxy. Throws if the proxy or Apps Script reports an error. */
export async function postToSheets(
  payload: RsvpPayload | GamePayload,
  options: { keepalive?: boolean } = {},
): Promise<SheetsResponse> {
  const res = await fetch("/api/sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: options.keepalive,
  });
  const data = (await res.json().catch(() => ({}))) as SheetsResponse;
  if (!res.ok || data.result === "error") {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}
