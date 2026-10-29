"use client";

import { useState } from "react";
import { HudCard } from "@/components/ui/hud";

// Only codenames ever reach the browser; real names stay on the server / admin page.
export type PublicTeam = { name: string; color: string; codenames: string[] };

export function TeamLookup({ teams }: { teams: PublicTeam[] }) {
  const [selected, setSelected] = useState("");

  const codenames = teams.flatMap((t) => t.codenames).sort((a, b) => a.localeCompare(b));
  const team = teams.find((t) => t.codenames.includes(selected));

  return (
    <div className="space-y-4">
      <HudCard className="p-4">
        <label htmlFor="codename" className="font-mono text-[10px] tracking-[0.2em] text-emerald-400">
          PILIH CODENAME KAMU
        </label>
        <select
          id="codename"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-amber-400 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- pilih codename --</option>
          {codenames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </HudCard>

      {team && (
        <HudCard className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-base font-black tracking-widest" style={{ color: team.color }}>
              TEAM {team.name.toUpperCase()}
            </p>
            <span className="font-mono text-[10px] text-slate-500">{team.codenames.length} AGEN</span>
          </div>
          <ul className="mt-3 divide-y divide-slate-800">
            {[...team.codenames]
              .sort((a, b) => a.localeCompare(b))
              .map((c) => (
                <li key={c} className="py-2 font-mono text-sm text-amber-400">
                  {c}
                  {c === selected && <span className="ml-2 text-[10px] text-emerald-400">{"// KAMU"}</span>}
                </li>
              ))}
          </ul>
        </HudCard>
      )}
    </div>
  );
}

