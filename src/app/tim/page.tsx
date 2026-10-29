import { ArrowLeft, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HudHeader } from "@/components/home/hud-header";
import { HudCard, Section, TerminalShell } from "@/components/ui/hud";
import { TEAMS } from "@/config/teams";
import { listAgents } from "@/lib/apps-script";
import { TeamLookup, type PublicTeam } from "@/components/teams/team-lookup";
import { splitNama, teamOrder } from "@/lib/teams";

export const metadata: Metadata = {
  title: "Pembagian Tim — CG FUN 2026",
  description: "Cek kamu masuk tim mana untuk CG Fun 2026.",
};

// Always read the live sheet so a re-shuffle shows up immediately.
export const dynamic = "force-dynamic";

async function loadTeams(): Promise<PublicTeam[] | null> {
  try {
    const groups = new Map<string, string[]>();
    for (const a of await listAgents()) {
      // Real names are dropped here on purpose: only codenames are exposed publicly.
      const { codename } = splitNama(a.nama);
      if (!a.team || !codename) continue;
      groups.set(a.team, [...(groups.get(a.team) ?? []), codename]);
    }
    return [...groups.entries()]
      .sort(([x], [y]) => teamOrder(x) - teamOrder(y) || x.localeCompare(y))
      .map(([name, codenames]) => ({
        name,
        color: TEAMS.find((t) => t.name === name)?.color ?? "#94a3b8",
        codenames,
      }));
  } catch (err) {
    console.error("[tim] Failed to load teams:", err);
    return null;
  }
}

export default async function TeamsPage() {
  const teams = await loadTeams();

  return (
    <TerminalShell>
      <HudHeader />
      <main>
        <Section kicker="// SQUAD ASSIGNMENT" title="CEK TIM KAMU">
          {teams === null ? (
            <HudCard className="text-sm text-red-300">Data tim gagal dimuat. Coba refresh beberapa saat lagi.</HudCard>
          ) : teams.length === 0 ? (
            <HudCard className="text-center">
              <Users className="mx-auto h-6 w-6 text-slate-500" />
              <p className="mt-3 font-display text-sm font-bold tracking-wider text-slate-100">BELUM DIUMUMKAN</p>
              <p className="mt-1 text-sm text-slate-400">Panitia belum membagi tim. Cek lagi menjelang hari H.</p>
            </HudCard>
          ) : (
            <TeamLookup teams={teams} />
          )}
          <Link
            href="/"
            className="mt-8 flex items-center justify-center gap-2 font-mono text-xs text-emerald-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke halaman utama
          </Link>
        </Section>
      </main>
    </TerminalShell>
  );
}
