"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EVENT } from "@/config/event";
import {
  LOCKOUT_MS,
  MISSION_COUNT,
  POINTS_PER_MISSION,
  VAULT_POINTS,
  type OptionKey,
  type PublicMission,
} from "@/config/game";
import { INITIAL_GAME_STATE, useNow, usePersistentGame, type GameState } from "@/lib/game-state";
import { enqueueGameReport, useSyncStatus } from "@/lib/outbox";
import type { MissionLabel } from "@/lib/sheets";
import { cn, formatClock } from "@/lib/utils";
import { verifyAnswer, verifyVault } from "@/lib/verify";
import { CompleteScreen, MissionScreen, StartScreen, VaultScreen, type AttemptOutcome } from "./screens";

function report(s: GameState, currentMission: MissionLabel, status: "In Progress" | "FINISHED") {
  enqueueGameReport({
    type: "GAME",
    teamName: s.teamName,
    currentMission,
    wrongAttempts: s.wrongAttempts,
    score: s.score,
    status,
  });
}

function SyncBadge({ pending, online }: { pending: number; online: boolean }) {
  const [label, tone] = !online
    ? ["OFFLINE", "red"]
    : pending > 0
      ? [`SYNC ${pending}`, "amber"]
      : ["LINK OK", "emerald"];
  return (
    <span
      title={pending > 0 ? `${pending} update menunggu sinyal` : undefined}
      className={cn(
        "flex items-center gap-1.5 font-mono text-[9.5px]",
        tone === "red" ? "text-red-400" : tone === "amber" ? "text-amber-400" : "text-emerald-400",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 animate-pulse rounded-full",
          tone === "red"
            ? "bg-red-400 shadow-[0_0_8px_#f87171]"
            : tone === "amber"
              ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
              : "bg-emerald-400 shadow-[0_0_8px_#34d399]",
        )}
      />
      {label}
    </span>
  );
}

function GameHud({ state, elapsed }: { state: GameState; elapsed: number }) {
  const overtime = elapsed > EVENT.durationMinutes * 60_000;
  const warning = elapsed > (EVENT.durationMinutes - 10) * 60_000;
  return (
    <div className="border-t border-slate-800 px-4 pb-3 pt-2.5">
      <div className="flex items-center justify-between gap-3 font-mono">
        <div className="min-w-0">
          <p className="text-[9px] tracking-widest text-slate-500">TEAM</p>
          <p className="truncate text-sm font-bold text-slate-100">{state.teamName}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] tracking-widest text-slate-500">{overtime ? "OVERTIME" : "ELAPSED"}</p>
          <p
            className={cn(
              "text-lg font-bold tabular-nums",
              overtime ? "text-red-400 text-glow-red" : warning ? "text-amber-400 text-glow-amber" : "text-emerald-400 text-glow-green",
            )}
          >
            {formatClock(elapsed)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest text-slate-500">SCORE</p>
          <p className="text-lg font-bold tabular-nums text-amber-400">{state.score}</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {Array.from({ length: MISSION_COUNT }, (_, i) => {
          const digit = state.unlocked[i];
          return (
            <div
              key={i}
              className={cn(
                "flex h-8 items-center justify-center rounded border font-mono text-sm font-bold transition",
                digit
                  ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                  : i === state.missionIndex && state.screen === "mission"
                    ? "border-amber-500/60 text-amber-400"
                    : "border-slate-700 text-slate-600",
              )}
            >
              {digit ?? "?"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GameTerminal({ missions }: { missions: PublicMission[] }) {
  const [state, setState, hydrated] = usePersistentGame();
  const [checking, setChecking] = useState(false);
  const { pending, online } = useSyncStatus();
  const playing = hydrated && state.screen !== "start";
  const now = useNow(250, playing);

  const elapsed = state.startedAt ? (state.finishedAt ?? now) - state.startedAt : 0;
  const lockedMs = state.lockoutUntil ? Math.max(0, state.lockoutUntil - now) : 0;

  function start(teamName: string) {
    const next: GameState = { ...INITIAL_GAME_STATE, screen: "mission", teamName, startedAt: Date.now() };
    setState(next);
    report(next, "Mission 1", "In Progress");
  }

  function penalize(s: GameState) {
    setState({ ...s, wrongAttempts: s.wrongAttempts + 1, lockoutUntil: Date.now() + LOCKOUT_MS });
  }

  // While a check is in flight every other action is blocked, so `state` can't go stale.
  async function answer(choice: OptionKey): Promise<AttemptOutcome> {
    if (checking || state.revealed || lockedMs > 0) return "busy";
    const s = state;
    setChecking(true);
    const result = await verifyAnswer(s.missionIndex, choice);
    setChecking(false);

    if (result.status === "error") return "error";
    if (result.status === "wrong") {
      penalize(s);
      return "wrong";
    }
    const next: GameState = {
      ...s,
      revealed: true,
      score: s.score + POINTS_PER_MISSION,
      unlocked: [...s.unlocked.slice(0, s.missionIndex), result.digit ?? "?"],
    };
    setState(next);
    // currentMission = the mission the team is now on (stays "Mission 6" while at the vault).
    const upcoming = Math.min(s.missionIndex + 2, MISSION_COUNT);
    report(next, `Mission ${upcoming}` as MissionLabel, "In Progress");
    return "correct";
  }

  function advance() {
    if (!state.revealed) return;
    const last = state.missionIndex >= MISSION_COUNT - 1;
    setState({
      ...state,
      revealed: false,
      screen: last ? "vault" : "mission",
      missionIndex: last ? state.missionIndex : state.missionIndex + 1,
    });
  }

  async function unlockVault(code: string): Promise<AttemptOutcome> {
    if (checking || lockedMs > 0) return "busy";
    const s = state;
    setChecking(true);
    const result = await verifyVault(code);
    setChecking(false);

    if (result.status === "error") return "error";
    if (result.status === "wrong") {
      penalize(s);
      return "wrong";
    }
    const next: GameState = {
      ...s,
      screen: "complete",
      score: s.score + VAULT_POINTS,
      finishedAt: Date.now(),
      lockoutUntil: null,
    };
    setState(next);
    report(next, "FINISHED", "FINISHED");
    return "correct";
  }

  function reset() {
    setState(INITIAL_GAME_STATE);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-obsidian/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-slate-400 hover:text-emerald-400">
            <ChevronLeft className="h-3.5 w-3.5" /> HQ
          </Link>
          <p className="font-display text-[12px] font-bold tracking-[0.22em] text-slate-100">
            FIELD <span className="text-emerald-400">{"//"}</span> TERMINAL
          </p>
          <SyncBadge pending={pending} online={online} />
        </div>
        {playing && <GameHud state={state} elapsed={elapsed} />}
      </header>

      <main className="px-5 pb-12 pt-6">
        {!hydrated ? (
          <div className="flex flex-col items-center gap-3 py-24 font-mono text-xs text-emerald-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            BOOTING FIELD TERMINAL...
          </div>
        ) : state.screen === "start" ? (
          <StartScreen onStart={start} />
        ) : state.screen === "mission" ? (
          <MissionScreen
            key={state.missionIndex}
            mission={missions[state.missionIndex]}
            index={state.missionIndex}
            digit={state.revealed ? state.unlocked[state.missionIndex] : undefined}
            checking={checking}
            lockedMs={lockedMs}
            onAnswer={answer}
            onNext={advance}
          />
        ) : state.screen === "vault" ? (
          <VaultScreen digits={state.unlocked} checking={checking} lockedMs={lockedMs} onSubmit={unlockVault} />
        ) : (
          <CompleteScreen state={state} elapsed={elapsed} onReset={reset} />
        )}
      </main>
    </>
  );
}
