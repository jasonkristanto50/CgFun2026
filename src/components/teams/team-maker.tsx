"use client";

import { ExternalLink, KeyRound, Loader2, RefreshCw, Save, Shuffle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HudCard, Section } from "@/components/ui/hud";
import { MAX_TEAMS, MIN_TEAMS, TEAMS } from "@/config/teams";
import {
  generateTeams,
  isNewcomer,
  splitNama,
  suggestTeamCount,
  teamNames,
  teamOrder,
  type Agent,
} from "@/lib/teams";
import { cn } from "@/lib/utils";

const KEY_STORAGE = "cgfun-admin-key";

async function api<T>(key: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": key },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw Object.assign(new Error(data.error ?? `Request failed (${res.status})`), { status: res.status });
  return data;
}

const btn =
  "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 font-mono text-[11px] font-semibold tracking-wider transition active:scale-[0.98] disabled:opacity-50";

function MemberRow({ a, teams, onMove }: { a: Agent; teams: string[]; onMove: (row: number, team: string) => void }) {
  const { name, codename } = splitNama(a.nama);
  return (
    <li className="flex items-center gap-2 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-100">
          {name}
          {codename && <span className="ml-1.5 font-mono text-[10px] text-amber-400">{codename}</span>}
        </p>
        <p className="font-mono text-[9px] tracking-wider text-slate-500">
          {a.status.toUpperCase()}
          {isNewcomer(a) && <span className="text-sky-400"> • TEMAN BARU</span>}
        </p>
      </div>
      <select
        aria-label={`Pindah tim ${name}`}
        value={a.team}
        onChange={(e) => onMove(a.row, e.target.value)}
        className="rounded border border-slate-700 bg-obsidian px-1.5 py-1 font-mono text-[10px] text-slate-300"
      >
        <option value="">— tanpa tim</option>
        {teams.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </li>
  );
}

export function TeamMaker() {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [saved, setSaved] = useState<Agent[] | null>(null);
  const [draft, setDraft] = useState<Agent[]>([]);
  const [teamCount, setTeamCount] = useState(MIN_TEAMS);
  const [includeUnsure, setIncludeUnsure] = useState(false);
  const [busy, setBusy] = useState<"load" | "save" | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function load(withKey: string) {
    setBusy("load");
    setMessage(null);
    try {
      const { rows } = await api<{ rows: Agent[] }>(withKey, { action: "list" });
      const existing = new Set(rows.map((r) => r.team).filter(Boolean));
      setKey(withKey);
      try {
        sessionStorage.setItem(KEY_STORAGE, withKey);
      } catch {}
      setSaved(rows);
      setDraft(rows);
      setTeamCount(
        existing.size >= MIN_TEAMS && existing.size <= MAX_TEAMS
          ? existing.size
          : suggestTeamCount(rows.filter((r) => r.status === "Ikut").length),
      );
    } catch (err) {
      if ((err as { status?: number }).status === 401) {
        setKey("");
        try {
          sessionStorage.removeItem(KEY_STORAGE);
        } catch {}
      }
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(KEY_STORAGE);
    } catch {}
    if (stored) void load(stored);
  }, []);

  async function save() {
    setBusy("save");
    setMessage(null);
    try {
      await api(key, { action: "save", assignments: draft.map(({ row, nama, team }) => ({ row, nama, team })) });
      setSaved(draft);
      setMessage({ kind: "ok", text: "Tim tersimpan ke Google Sheet dan sudah tampil di halaman /tim." });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  const dirty = useMemo(
    () => saved !== null && draft.some((a, i) => a.team !== saved[i]?.team),
    [draft, saved],
  );

  if (!key || saved === null) {
    return (
      <Section kicker="// PANITIA ONLY" title="TEAM MAKER">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (keyInput.trim()) void load(keyInput.trim());
          }}
          className="space-y-3"
        >
          <label htmlFor="adminKey" className="block font-mono text-[11px] tracking-wider text-slate-300">
            KODE AKSES PANITIA
          </label>
          <input
            id="adminKey"
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-obsidian/80 px-3.5 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500"
            autoComplete="current-password"
          />
          {message && <p className="text-xs text-red-400">{message.text}</p>}
          <button type="submit" disabled={busy !== null} className={cn(btn, "w-full bg-amber-500 text-obsidian hover:bg-amber-400")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} MASUK
          </button>
        </form>
      </Section>
    );
  }

  const names = teamNames(teamCount);
  const extraTeams = [...new Set(draft.map((a) => a.team).filter((t) => t && !names.includes(t)))].sort(
    (x, y) => teamOrder(x) - teamOrder(y),
  );
  const columns = [...names, ...extraTeams];
  const unassigned = draft.filter((a) => !a.team);
  const counts = {
    ikut: draft.filter((a) => a.status === "Ikut").length,
    ragu: draft.filter((a) => a.status === "Masih Ragu").length,
    baru: draft.filter((a) => a.status === "Ikut" && isNewcomer(a)).length,
  };

  function shuffleTeams(keepExisting: boolean) {
    setDraft((d) => generateTeams(d, teamCount, { includeUnsure, keepExisting }));
    setMessage(null);
  }

  function move(row: number, team: string) {
    setDraft((d) => d.map((a) => (a.row === row ? { ...a, team } : a)));
  }

  return (
    <Section kicker="// PANITIA ONLY" title="TEAM MAKER">
      <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/70 text-center">
        {[
          ["IKUT", counts.ikut],
          ["MASIH RAGU", counts.ragu],
          ["TEMAN BARU", counts.baru],
        ].map(([label, n]) => (
          <div key={label} className="px-2 py-3">
            <p className="font-mono text-[9px] tracking-widest text-emerald-400">{label}</p>
            <p className="mt-1 font-display text-lg font-black text-slate-50">{n}</p>
          </div>
        ))}
      </div>

      <HudCard className="mt-5 space-y-4 p-4">
        <div>
          <p className="mb-2 font-mono text-[11px] tracking-wider text-slate-300">JUMLAH TIM</p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, i) => MIN_TEAMS + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTeamCount(n)}
                aria-pressed={teamCount === n}
                className={cn(
                  "rounded-full border py-2 font-mono text-xs font-semibold transition",
                  teamCount === n
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500",
                )}
              >
                {n} TIM
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Saran: {suggestTeamCount(counts.ikut + (includeUnsure ? counts.ragu : 0))} tim (± 5 agen per tim).
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={includeUnsure}
            onChange={(e) => setIncludeUnsure(e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          Ikutkan yang &ldquo;Masih Ragu&rdquo;
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => shuffleTeams(false)}
            className={cn(btn, "bg-amber-500 text-obsidian hover:bg-amber-400")}
          >
            <Shuffle className="h-4 w-4" /> ACAK SEMUA
          </button>
          <button
            type="button"
            onClick={() => shuffleTeams(true)}
            disabled={unassigned.length === 0}
            className={cn(btn, "border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/15")}
          >
            <UserPlus className="h-4 w-4" /> ISI YANG KOSONG
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          <b className="text-slate-400">Acak semua</b> membagi ulang semua agen secara rata, teman baru disebar ke tiap
          tim. <b className="text-slate-400">Isi yang kosong</b> hanya menaruh pendaftar yang belum punya tim ke tim
          terkecil.
        </p>
      </HudCard>

      <div className="mt-5 space-y-3">
        {columns.map((team) => {
          const members = draft.filter((a) => a.team === team);
          const color = TEAMS.find((t) => t.name === team)?.color ?? "#94a3b8";
          return (
            <HudCard key={team} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-black tracking-widest" style={{ color }}>
                  TEAM {team.toUpperCase()}
                </p>
                <span className="font-mono text-[10px] text-slate-500">
                  {members.length} AGEN • {members.filter(isNewcomer).length} BARU
                </span>
              </div>
              {members.length ? (
                <ul className="mt-2 divide-y divide-slate-800">
                  {members.map((a) => (
                    <MemberRow key={a.row} a={a} teams={columns} onMove={move} />
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Kosong.</p>
              )}
            </HudCard>
          );
        })}

        {unassigned.length > 0 && (
          <HudCard className="border-dashed p-4">
            <p className="font-display text-sm font-black tracking-widest text-slate-400">
              BELUM ADA TIM ({unassigned.length})
            </p>
            <ul className="mt-2 divide-y divide-slate-800">
              {unassigned.map((a) => (
                <MemberRow key={a.row} a={a} teams={columns} onMove={move} />
              ))}
            </ul>
          </HudCard>
        )}
      </div>

      {message && (
        <p
          className={cn(
            "mt-5 rounded-md border px-3 py-2 text-xs",
            message.kind === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300",
          )}
        >
          {message.text}
        </p>
      )}

      <div className="sticky bottom-3 z-30 mt-5 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || busy !== null}
          className={cn(btn, "bg-emerald-500 py-3.5 text-obsidian shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:bg-emerald-400")}
        >
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {dirty ? "SIMPAN KE SHEET" : "TERSIMPAN"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!dirty || confirm("Buang perubahan yang belum disimpan dan muat ulang dari sheet?")) void load(key);
          }}
          disabled={busy !== null}
          aria-label="Muat ulang dari sheet"
          className={cn(btn, "border border-slate-700 bg-obsidian px-4 text-slate-300 hover:border-slate-500")}
        >
          <RefreshCw className={cn("h-4 w-4", busy === "load" && "animate-spin")} />
        </button>
      </div>

      <Link
        href="/tim"
        target="_blank"
        className="mt-6 flex items-center justify-center gap-1.5 font-mono text-xs text-emerald-400 hover:underline"
      >
        Lihat halaman tim publik <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </Section>
  );
}
