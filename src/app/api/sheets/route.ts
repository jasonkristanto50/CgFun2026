import { NextResponse } from "next/server";

type RsvpPayload = {
  type: "RSVP";
  nama: string;
  nomorTelepon: string;
  alamat: string;
  status: string;
  statusCg: string;
};

type GamePayload = {
  type: "GAME";
  teamName: string;
  currentMission: string | number;
  wrongAttempts: number;
  score: number;
  status: string;
};

type SheetsPayload = RsvpPayload | GamePayload;

function isPlaceholder(url: string | undefined): boolean {
  return !url || url.includes("PASTE_YOUR") || !url.startsWith("https://");
}

function validate(body: unknown): SheetsPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.type === "RSVP") {
    if (typeof b.nama !== "string" || !b.nama.trim()) return null;
    return {
      type: "RSVP",
      nama: String(b.nama),
      nomorTelepon: String(b.nomorTelepon ?? ""),
      alamat: String(b.alamat ?? ""),
      status: String(b.status ?? ""),
      statusCg: String(b.statusCg ?? ""),
    };
  }
  if (b.type === "GAME") {
    if (typeof b.teamName !== "string" || !b.teamName.trim()) return null;
    return {
      type: "GAME",
      teamName: String(b.teamName),
      currentMission: (b.currentMission as string | number) ?? "",
      wrongAttempts: Number(b.wrongAttempts ?? 0),
      score: Number(b.score ?? 0),
      status: String(b.status ?? "In Progress"),
    };
  }
  return null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ result: "error", error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = validate(body);
  if (!payload) {
    return NextResponse.json(
      { result: "error", error: 'Body must be a valid "RSVP" or "GAME" payload' },
      { status: 400 },
    );
  }

  const scriptUrl = process.env.CG_FUN_AppScript;
  if (isPlaceholder(scriptUrl)) {
    console.warn(`[api/sheets] CG_FUN_AppScript is not set — mocking ${payload.type} submission.`);
    return NextResponse.json({ result: "success", mocked: true });
  }

  try {
    // Apps Script needs text/plain (avoids a CORS preflight) and follows a 302 to the result URL.
    const res = await fetch(scriptUrl!, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { result: res.ok ? "success" : "error", raw: text.slice(0, 500) };
    }
    return NextResponse.json(data, { status: res.ok ? 200 : 502 });
  } catch (err) {
    return NextResponse.json(
      { result: "error", error: err instanceof Error ? err.message : "Upstream request failed" },
      { status: 502 },
    );
  }
}
