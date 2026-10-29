import { NextResponse } from "next/server";
import { callAppsScript, listAgents } from "@/lib/apps-script";
import type { TeamAssignment } from "@/lib/teams";

// Panitia-only. The key comes from the CG_FUN_ADMIN_KEY env var; any key works in local dev if it's unset.
function authorized(request: Request) {
  const expected = process.env.CG_FUN_ADMIN_KEY;
  if (!expected) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-admin-key") === expected;
}

function parseAssignments(value: unknown): TeamAssignment[] | null {
  if (!Array.isArray(value)) return null;
  const out: TeamAssignment[] = [];
  for (const v of value) {
    if (!v || typeof v !== "object") return null;
    const { row, nama, team } = v as Record<string, unknown>;
    if (typeof row !== "number" || row < 2 || typeof nama !== "string" || typeof team !== "string") return null;
    out.push({ row, nama, team: team.trim() });
  }
  return out;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Kode akses panitia salah." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "list") {
    try {
      return NextResponse.json({ rows: await listAgents() });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal membaca sheet" }, { status: 502 });
    }
  }

  if (body.action === "save") {
    const assignments = parseAssignments(body.assignments);
    if (!assignments) return NextResponse.json({ error: "Invalid assignments" }, { status: 400 });
    const { status, data } = await callAppsScript({ type: "SAVE_TEAMS", assignments });
    return NextResponse.json(status === 200 ? data : { error: data.error ?? "Gagal menyimpan ke sheet" }, { status });
  }

  return NextResponse.json({ error: 'action must be "list" or "save"' }, { status: 400 });
}
