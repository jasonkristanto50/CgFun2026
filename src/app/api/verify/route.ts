import { NextResponse } from "next/server";
import { GAME_ENABLED, OPTION_KEYS, type OptionKey } from "@/config/game";
import { FINAL_VAULT_CODE, MISSIONS } from "@/config/missions";

// Answers stay on the server; the phone only learns a digit after answering correctly.
export async function POST(request: Request) {
  if (!GAME_ENABLED) {
    return NextResponse.json({ error: "Game is disabled" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.type === "answer") {
    const mission = typeof body.mission === "number" ? MISSIONS[body.mission] : undefined;
    const choice = body.choice as OptionKey;
    if (!mission || !OPTION_KEYS.includes(choice)) {
      return NextResponse.json({ error: "Unknown mission or choice" }, { status: 400 });
    }
    return NextResponse.json(choice === mission.answer ? { correct: true, digit: mission.digit } : { correct: false });
  }

  if (body.type === "vault") {
    if (typeof body.code !== "string") {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }
    return NextResponse.json({ correct: body.code === FINAL_VAULT_CODE });
  }

  return NextResponse.json({ error: 'type must be "answer" or "vault"' }, { status: 400 });
}
