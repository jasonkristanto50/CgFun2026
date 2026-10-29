import { ArrowLeft, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HudHeader } from "@/components/home/hud-header";
import { HudCard, Section, TerminalShell } from "@/components/ui/hud";
import { TEAMS } from "@/config/teams";
import { listAgents } from "@/lib/apps-script";
import { splitNama, teamOrder, type Agent } from "@/lib/teams";

export const metadata: Metadata = {
  title: "Pembagian Tim — CG FUN 2026",
  description: "Cek kamu masuk tim mana untuk CG Fun 2026.",
};

// Always read the live sheet so a re-shuffle shows up immediately.
export const dynamic = "force-dynamic";

async function loadTeams(): Promise<[string, Agent[]][] | null> {
  try {
    const groups = new Map<string, Agent[]>();
    for (const a of await listAgents()) {
      if (!a.team) continue;
      groups.set(a.team, [...(groups.get(a.team) ?? []), a]);
    }
    return [...groups.entries()]
      .sort(([x], [y]) => teamOrder(x) - teamOrder(y) || x.localeCompare(y))
      .map(([team, members]) => [team, members.sort((a, b) => a.nama.localeCompare(b.nama))]);
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
        <Section kicker="// SQUAD ASSIGNMENT" title="PEMBAGIAN TIM">
          {teams === null ? (
            <HudCard className="text-sm text-red-300">Data tim gagal dimuat. Coba refresh beberapa saat lagi.</HudCard>
          ) : teams.length === 0 ? (
            <HudCard className="text-center">
              <Users className="mx-auto h-6 w-6 text-slate-500" />
              <p className="mt-3 font-display text-sm font-bold tracking-wider text-slate-100">BELUM DIUMUMKAN</p>
              <p className="mt-1 text-sm text-slate-400">Panitia belum membagi tim. Cek lagi menjelang hari H.</p>
            </HudCard>
          ) : (
            <div className="space-y-4">
              {teams.map(([team, members]) => {
                const color = TEAMS.find((t) => t.name === team)?.color ?? "#94a3b8";
                return (
                  <HudCard key={team} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base font-black tracking-widest" style={{ color }}>
                        TEAM {team.toUpperCase()}
                      </p>
                      <span className="font-mono text-[10px] text-slate-500">{members.length} AGEN</span>
                    </div>
                    <ul className="mt-3 divide-y divide-slate-800">
                      {members.map((m) => {
                        const { name, codename } = splitNama(m.nama);
                        return (
                          <li key={m.row} className="flex items-baseline justify-between gap-3 py-2">
                            <span className="text-sm font-semibold text-slate-100">{name}</span>
                            {codename && <span className="truncate font-mono text-[11px] text-amber-400">{codename}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </HudCard>
                );
              })}
            </div>
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
