"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Delete,
  Flag,
  Loader2,
  Lock,
  MapPin,
  Power,
  Radio,
  RotateCcw,
  ShieldAlert,
  Unlock,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { RulesList, ScoringTable } from "@/components/shared/rules-list";
import { HudCard } from "@/components/ui/hud";
import {
  LOCKOUT_MS,
  MAX_SCORE,
  MISSION_COUNT,
  OPTION_KEYS,
  POINTS_PER_MISSION,
  type OptionKey,
  type PublicMission,
} from "@/config/game";
import type { GameState } from "@/lib/game-state";
import { cn, formatClock } from "@/lib/utils";

/** "busy" = ignored because a check, lockout or reveal is already in progress. */
export type AttemptOutcome = "correct" | "wrong" | "error" | "busy";

function NetErrorBar({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div role="alert" className="mb-4 flex gap-2.5 rounded-md border border-amber-500/60 bg-amber-500/10 p-3">
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <p className="text-xs leading-relaxed text-amber-100">
        <span className="font-mono font-bold text-amber-400">SINYAL LEMAH.</span> Jawaban belum terkirim — pindah ke
        area dengan sinyal lalu coba lagi. <span className="text-amber-300">Tidak ada penalti.</span>
      </p>
    </div>
  );
}

function LockoutBar({ lockedMs }: { lockedMs: number }) {
  return (
    <AnimatePresence>
      {lockedMs > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
          role="alert"
        >
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 p-3">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-red-400">
              <span className="flex items-center gap-2 text-glow-red">
                <ShieldAlert className="h-4 w-4" /> ACCESS DENIED // SECURITY LOCKOUT
              </span>
              <span className="tabular-nums">{Math.ceil(lockedMs / 1000)}s</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-red-950">
              <div
                className="h-full rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] transition-[width] duration-200 ease-linear"
                style={{ width: `${(lockedMs / LOCKOUT_MS) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DecryptDigit({ digit }: { digit: string }) {
  const [display, setDisplay] = useState("0");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let ticks = 0;
    const id = setInterval(() => {
      ticks++;
      if (ticks >= 16) {
        setDisplay(digit);
        setDone(true);
        clearInterval(id);
      } else {
        setDisplay(String(Math.floor(Math.random() * 10)));
      }
    }, 70);
    return () => clearInterval(id);
  }, [digit]);

  return (
    <motion.div
      animate={done ? { scale: [1, 1.15, 1] } : {}}
      className={cn(
        "flex h-24 w-20 items-center justify-center rounded-lg border-2 font-mono text-6xl font-black transition-colors",
        done
          ? "border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.5)] text-glow-green"
          : "border-slate-700 text-slate-500",
      )}
    >
      {display}
    </motion.div>
  );
}

/* ───────────────────────────── START ───────────────────────────── */

export function StartScreen({ onStart }: { onStart: (teamName: string) => void }) {
  const [teamName, setTeamName] = useState("");
  const valid = teamName.trim().length >= 2;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-red-400">■ TOP SECRET // FILE 07</p>
        <h1 className="mt-3 font-display text-3xl font-black leading-tight text-slate-50">
          OPERATION:
          <br />
          <span className="text-emerald-400 text-glow-green">FIND THE CODE</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          {MISSION_COUNT} misi. {MISSION_COUNT} fragmen kode. 1 brankas. Tunjuk satu HP utama sebagai terminal tim.
        </p>
      </div>

      <HudCard label="[ IDENTIFIKASI TIM ]">
        <label htmlFor="team" className="font-mono text-[11px] tracking-wider text-slate-300">
          <span className="text-amber-400">01</span> TEAM NAME
        </label>
        <input
          id="team"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          maxLength={24}
          placeholder="cth. Squad Rawon"
          className="mt-2 w-full rounded-md border border-slate-700 bg-obsidian/80 px-3.5 py-3 font-mono text-base text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </HudCard>

      <HudCard label="[ 8 ATURAN RESMI ]">
        <RulesList />
        <div className="mt-5">
          <ScoringTable />
        </div>
      </HudCard>

      <button
        type="button"
        disabled={!valid}
        onClick={() => onStart(teamName.trim())}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-4 font-display text-sm font-bold tracking-[0.2em] text-obsidian shadow-[0_0_28px_rgba(16,185,129,0.45)] transition active:scale-[0.98] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
      >
        <Power className="h-4 w-4" /> INITIALIZE OPERATION
      </button>
      {!valid && <p className="-mt-3 text-center font-mono text-[10px] text-slate-500">Masukkan nama tim untuk memulai.</p>}
    </motion.div>
  );
}

/* ──────────────────────────── MISSION ──────────────────────────── */

export function MissionScreen({
  mission,
  index,
  digit,
  checking,
  lockedMs,
  onAnswer,
  onNext,
}: {
  mission: PublicMission;
  index: number;
  /** Set once the server confirmed the answer — the mission is then "revealed". */
  digit: string | undefined;
  checking: boolean;
  lockedMs: number;
  onAnswer: (choice: OptionKey) => Promise<AttemptOutcome>;
  onNext: () => void;
}) {
  const [wrongKey, setWrongKey] = useState<OptionKey | null>(null);
  const [pendingKey, setPendingKey] = useState<OptionKey | null>(null);
  const [netError, setNetError] = useState(false);
  const [shakeId, setShakeId] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const revealed = digit !== undefined;
  const locked = lockedMs > 0;
  const isLast = index === MISSION_COUNT - 1;

  async function choose(key: OptionKey) {
    if (locked || revealed || checking) return;
    setNetError(false);
    setPendingKey(key);
    const outcome = await onAnswer(key);
    setPendingKey(null);
    if (outcome === "wrong") {
      setWrongKey(key);
      setShakeId((n) => n + 1);
    } else if (outcome === "error") {
      setNetError(true);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div>
        <div className="flex items-center justify-between font-mono text-[10px] tracking-widest">
          <span className="rounded border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-amber-400">{mission.code}</span>
          <span className="text-slate-500">
            {index + 1}/{MISSION_COUNT}{" // "}{mission.category.toUpperCase()}
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-black text-slate-50">{mission.title}</h1>
      </div>

      <HudCard label="[ INTERCEPTED TRANSMISSION ]" className="p-4 pt-5">
        <p className="flex gap-2 text-sm leading-relaxed text-slate-300">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <span>{mission.lore}</span>
        </p>
      </HudCard>

      {mission.task && (
        <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-mono text-[10px] tracking-widest text-amber-400">TUGAS LAPANGAN</p>
            <p className="mt-0.5 text-sm text-slate-200">{mission.task}</p>
          </div>
        </div>
      )}

      {mission.clueImage && !imageFailed && (
        <figure className="overflow-hidden rounded-md border border-slate-700">
          <Image
            src={mission.clueImage.src}
            alt={mission.clueImage.alt}
            width={mission.clueImage.width}
            height={mission.clueImage.height}
            className="h-auto w-full"
            onError={() => setImageFailed(true)}
          />
          <figcaption className="bg-slate-900 px-3 py-1.5 font-mono text-[10px] text-slate-500">
            BUKTI VISUAL // {mission.code}
          </figcaption>
        </figure>
      )}

      <div>
        <p className="font-mono text-[10px] tracking-widest text-emerald-400">{"// PERTANYAAN VERIFIKASI"}</p>
        <p className="mt-1.5 text-base font-semibold leading-snug text-slate-50">{mission.question}</p>
      </div>

      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/50 bg-emerald-500/5 p-6 text-center"
          >
            <p className="font-mono text-xs font-bold tracking-[0.25em] text-emerald-400 text-glow-green">
              ✓ ACCESS GRANTED · +{POINTS_PER_MISSION} PTS
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-400">FRAGMEN KODE #{index + 1} BERHASIL DIDEKRIPSI</p>
            <div className="mt-5 flex justify-center">
              <DecryptDigit digit={digit} />
            </div>
            <p className="mt-4 text-xs text-slate-400">Catat digit ini. Kamu akan membutuhkannya untuk FILE 07.</p>
            <button
              type="button"
              onClick={onNext}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-5 py-3.5 font-display text-sm font-bold tracking-wider text-obsidian shadow-[0_0_24px_rgba(245,158,11,0.35)] transition active:scale-[0.98] hover:bg-amber-400"
            >
              {isLast ? "BUKA BRANKAS FILE 07" : `LANJUT KE MISSION ${String(index + 2).padStart(2, "0")}`}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </motion.div>
        ) : (
          <motion.div key="options" exit={{ opacity: 0 }}>
            <LockoutBar lockedMs={lockedMs} />
            <NetErrorBar show={netError && !locked} />
            <div key={shakeId} className={cn("grid gap-2.5", shakeId > 0 && "animate-shake")}>
              {OPTION_KEYS.map((key) => {
                const wasWrong = wrongKey === key;
                const isPending = pendingKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={locked || checking}
                    onClick={() => choose(key)}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3.5 py-3.5 text-left text-sm transition active:scale-[0.98]",
                      wasWrong
                        ? "border-red-500/70 bg-red-500/10 text-red-300"
                        : "border-slate-700 bg-slate-900/80 text-slate-100 hover:border-emerald-500/70 hover:bg-emerald-500/5",
                      isPending && "border-amber-500/70 bg-amber-500/5",
                      (locked || (checking && !isPending)) && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded border font-mono text-sm font-bold",
                        wasWrong ? "border-red-500 text-red-400" : "border-emerald-500/50 text-emerald-400",
                      )}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> : key}
                    </span>
                    {mission.options[key]}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────────────────── VAULT ───────────────────────────── */

const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "DEL"] as const;

export function VaultScreen({
  digits,
  checking,
  lockedMs,
  onSubmit,
}: {
  digits: string[];
  checking: boolean;
  lockedMs: number;
  onSubmit: (code: string) => Promise<AttemptOutcome>;
}) {
  const [code, setCode] = useState("");
  const [shakeId, setShakeId] = useState(0);
  const [netError, setNetError] = useState(false);
  const locked = lockedMs > 0;
  const length = MISSION_COUNT;

  async function submit(full: string) {
    setNetError(false);
    const outcome = await onSubmit(full);
    if (outcome === "wrong") {
      setShakeId((n) => n + 1);
      setCode("");
    } else if (outcome === "error") {
      setNetError(true); // keep the code so they can just resend
    }
  }

  function press(key: string) {
    if (locked || checking) return;
    setNetError(false);
    if (key === "CLR") return setCode("");
    if (key === "DEL") return setCode((c) => c.slice(0, -1));
    if (code.length >= length) return;
    const next = code + key;
    setCode(next);
    if (next.length === length) void submit(next);
  }

  // Physical keyboard support (desktop testing).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("DEL");
      else if (e.key === "Escape") press("CLR");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-red-400">■ FINAL STAGE // TOP SECRET</p>
        <h1 className="mt-2 font-display text-2xl font-black text-slate-50">
          BRANKAS <span className="text-amber-400 text-glow-amber">FILE 07</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Semua fragmen terkumpul. Masukkan {length} digit kode akses sesuai urutan misi.
        </p>
      </div>

      <HudCard label="[ FRAGMEN TERKUMPUL ]" className="p-4 pt-5">
        <div className="grid grid-cols-6 gap-2">
          {digits.map((d, i) => (
            <div key={i} className="text-center">
              <div className="flex h-11 items-center justify-center rounded border border-emerald-500/60 bg-emerald-500/10 font-mono text-xl font-bold text-emerald-300">
                {d}
              </div>
              <p className="mt-1 font-mono text-[8px] text-slate-500">M0{i + 1}</p>
            </div>
          ))}
        </div>
      </HudCard>

      <div>
        <LockoutBar lockedMs={lockedMs} />
        <NetErrorBar show={netError && !locked} />
        <div key={shakeId} className={cn("grid grid-cols-6 gap-2", shakeId > 0 && "animate-shake")}>
          {Array.from({ length }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-14 items-center justify-center rounded-md border-2 font-mono text-2xl font-black",
                code[i]
                  ? "border-amber-400 bg-amber-500/10 text-amber-300"
                  : i === code.length && !locked
                    ? "border-amber-500/60 text-slate-600"
                    : locked
                      ? "border-red-500/50 text-slate-700"
                      : "border-slate-700 text-slate-700",
              )}
            >
              {code[i] ?? "•"}
            </div>
          ))}
        </div>
        {checking && (
          <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] tracking-widest text-amber-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> MEMVERIFIKASI KODE...
          </p>
        )}
        {netError && code.length === length && (
          <button
            type="button"
            onClick={() => void submit(code)}
            className="mt-3 w-full rounded-md border border-amber-500/60 bg-amber-500/10 py-2.5 font-mono text-xs font-bold tracking-widest text-amber-300 active:scale-[0.98]"
          >
            KIRIM ULANG KODE
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {KEYPAD.map((k) => (
          <button
            key={k}
            type="button"
            disabled={locked || checking}
            onClick={() => press(k)}
            className={cn(
              "flex h-14 items-center justify-center rounded-md border font-mono text-xl font-bold transition active:scale-95 disabled:opacity-40",
              k === "CLR"
                ? "border-red-500/40 text-sm text-red-400 hover:bg-red-500/10"
                : k === "DEL"
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-700 bg-slate-900/80 text-slate-100 hover:border-emerald-500/60 hover:text-emerald-300",
            )}
            aria-label={k === "DEL" ? "Hapus" : k === "CLR" ? "Kosongkan" : k}
          >
            {k === "DEL" ? <Delete className="h-5 w-5" /> : k}
          </button>
        ))}
      </div>
      <p className="flex items-center justify-center gap-2 font-mono text-[10px] text-slate-500">
        <Lock className="h-3 w-3" /> Kode salah = lockout {LOCKOUT_MS / 1000} detik
      </p>
    </motion.div>
  );
}

/* ─────────────────────────── COMPLETE ─────────────────────────── */

export function CompleteScreen({
  state,
  elapsed,
  onReset,
}: {
  state: GameState;
  elapsed: number;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const stats = [
    { label: "FINAL SCORE", value: `${state.score} / ${MAX_SCORE}`, accent: "text-amber-400" },
    { label: "TOTAL TIME", value: formatClock(elapsed), accent: "text-emerald-400" },
    { label: "WRONG ATTEMPTS", value: String(state.wrongAttempts), accent: "text-red-400" },
    { label: "FILE 07", value: "UNLOCKED", accent: "text-emerald-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_48px_rgba(16,185,129,0.5)]"
        >
          <Unlock className="h-9 w-9 text-emerald-300" />
        </motion.div>
        <h1 className="mt-5 font-display text-3xl font-black text-emerald-400 text-glow-green">MISSION COMPLETE</h1>
        <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-slate-400">FILE 07 // ACCESS GRANTED</p>
      </div>

      <HudCard label="[ VICTORY CLEARANCE CERTIFICATE ]" className="border-emerald-500/40 p-5 pt-6">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 shrink-0 text-amber-400" />
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-widest text-slate-500">DIBERIKAN KEPADA TIM</p>
            <p className="truncate font-display text-xl font-black text-slate-50">{state.teamName}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border border-slate-800 bg-obsidian/70 p-3">
              <p className="font-mono text-[9px] tracking-widest text-slate-500">{s.label}</p>
              <p className={cn("mt-1 font-mono text-lg font-bold tabular-nums", s.accent)}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center font-mono text-[10px] tracking-wider text-slate-500">
          CODE {state.unlocked.join("")} {"// CG FUN 2026 // CIPUTRA WORLD SBY"}
        </p>
      </HudCard>

      <div className="flex gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-4">
        <Flag className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-sm leading-relaxed text-amber-100">
          <span className="font-bold">Segera lapor ke Game Master di Finish Line!</span> Tunjukkan layar ini sebagai
          bukti operasi selesai.
        </p>
      </div>

      <div className="pt-6 text-center">
        {confirming ? (
          <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
            <span className="text-slate-400">Hapus semua progres?</span>
            <button
              type="button"
              onClick={onReset}
              className="rounded border border-red-500/60 px-2.5 py-1 text-red-400 hover:bg-red-500/10"
            >
              YA, RESET
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded border border-slate-700 px-2.5 py-1 text-slate-400 hover:bg-slate-800"
            >
              BATAL
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-600 hover:text-slate-400"
          >
            <RotateCcw className="h-3 w-3" /> Reset Terminal
          </button>
        )}
      </div>
    </motion.div>
  );
}
