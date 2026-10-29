import { NextResponse } from "next/server";
import { GAME_ENABLED } from "@/config/game";
import { callAppsScript } from "@/lib/apps-script";

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

  if (payload.type === "GAME" && !GAME_ENABLED) {
    return NextResponse.json({ result: "error", error: "Game is disabled" }, { status: 404 });
  }

  const { status, data } = await callAppsScript(payload);
  return NextResponse.json(data, { status });
}
