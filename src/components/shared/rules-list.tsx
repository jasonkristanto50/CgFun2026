import { GAME_RULES } from "@/config/event";
import { MAX_SCORE, MISSIONS, POINTS_PER_MISSION, VAULT_POINTS } from "@/config/missions";

export function RulesList() {
  return (
    <ol className="space-y-2.5">
      {GAME_RULES.map((rule, i) => (
        <li key={rule} className="flex gap-3 text-sm leading-relaxed text-slate-300">
          <span className="mt-0.5 shrink-0 font-mono text-xs text-amber-400">{String(i + 1).padStart(2, "0")}</span>
          <span>{rule}</span>
        </li>
      ))}
    </ol>
  );
}

export function ScoringTable() {
  const rows = [
    { label: `Mission 01–0${MISSIONS.length}`, detail: `+${POINTS_PER_MISSION} / misi`, pts: MISSIONS.length * POINTS_PER_MISSION },
    { label: "Brankas FILE 07", detail: "Kode final benar", pts: VAULT_POINTS },
  ];
  return (
    <div className="overflow-hidden rounded-md border border-slate-800 font-mono text-xs">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5">
          <div>
            <p className="text-slate-200">{r.label}</p>
            <p className="text-[10px] text-slate-500">{r.detail}</p>
          </div>
          <span className="text-emerald-400">+{r.pts}</span>
        </div>
      ))}
      <div className="flex items-center justify-between bg-amber-500/10 px-3 py-2.5">
        <span className="tracking-widest text-amber-300">MAX SCORE</span>
        <span className="text-base font-bold text-amber-400 text-glow-amber">{MAX_SCORE}</span>
      </div>
      <p className="px-3 py-2 text-[10px] leading-relaxed text-slate-500">
        Skor seri? Pemenang ditentukan dari waktu tercepat, lalu jumlah wrong attempts paling sedikit.
      </p>
    </div>
  );
}
