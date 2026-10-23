"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  FINAL_VAULT_CODE,
  LOCKOUT_MS,
  MISSIONS,
  POINTS_PER_MISSION,
  VAULT_POINTS,
} from "@/config/missions";
import { EVENT } from "@/config/event";
import { INITIAL_GAME_STATE, useNow, usePersistentGame, type GameState } from "@/lib/game-state";
import { postToSheets, type MissionLabel } from "@/lib/sheets";
import { cn, formatClock } from "@/lib/utils";
import { CompleteScreen, MissionScreen, StartScreen, VaultScreen } from "./screens";

function report(s: GameState, currentMission: MissionLabel, status: "In Progress" | "FINISHED") {
  postToSheets(
    { type: "GAME", teamName: s.teamName, currentMission, wrongAttempts: s.wrongAttempts, score: s.score, status },
    { keepalive: true },
  ).catch((err) => console.warn("[game] Failed to sync progress:", err));
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
        {MISSIONS.map((m, i) => {
          const digit = state.unlocked[i];
          return (
            <div
              key={m.id}
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

export function GameTerminal() {
  const [state, setState, hydrated] = usePersistentGame();
  const playing = hydrated && state.screen !== "start";
  const now = useNow(250, playing);

  const elapsed = state.startedAt ? (state.finishedAt ?? now) - state.startedAt : 0;
  const lockedMs = state.lockoutUntil ? Math.max(0, state.lockoutUntil - now) : 0;

  function start(teamName: string) {
    const next: GameState = { ...INITIAL_GAME_STATE, screen: "mission", teamName, startedAt: Date.now() };
    setState(next);
    report(next, "Mission 1", "In Progress");
  }

  function penalize() {
    setState({ ...state, wrongAttempts: state.wrongAttempts + 1, lockoutUntil: Date.now() + LOCKOUT_MS });
  }

  function answer(isCorrect: boolean) {
    if (state.revealed || lockedMs > 0) return;
    if (!isCorrect) return penalize();
    const mission = MISSIONS[state.missionIndex];
    const next: GameState = {
      ...state,
      revealed: true,
      score: state.score + POINTS_PER_MISSION,
      unlocked: [...state.unlocked, mission.digit],
    };
    setState(next);
    // currentMission = the mission the team is now on (stays "Mission 6" while at the vault).
    const upcoming = Math.min(state.missionIndex + 2, MISSIONS.length);
    report(next, `Mission ${upcoming}` as MissionLabel, "In Progress");
  }

  function advance() {
    if (!state.revealed) return;
    const last = state.missionIndex >= MISSIONS.length - 1;
    setState({
      ...state,
      revealed: false,
      screen: last ? "vault" : "mission",
      missionIndex: last ? state.missionIndex : state.missionIndex + 1,
    });
  }

  function unlockVault(code: string): boolean {
    if (lockedMs > 0) return false;
    if (code !== FINAL_VAULT_CODE) {
      penalize();
      return false;
    }
    const next: GameState = {
      ...state,
      screen: "complete",
      score: state.score + VAULT_POINTS,
      finishedAt: Date.now(),
      lockoutUntil: null,
    };
    setState(next);
    report(next, "FINISHED", "FINISHED");
    return true;
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
          <span className="flex items-center gap-1.5 font-mono text-[9.5px] text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            LINK OK
          </span>
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
            mission={MISSIONS[state.missionIndex]}
            index={state.missionIndex}
            revealed={state.revealed}
            lockedMs={lockedMs}
            onAnswer={answer}
            onNext={advance}
          />
        ) : state.screen === "vault" ? (
          <VaultScreen digits={state.unlocked} lockedMs={lockedMs} onSubmit={unlockVault} />
        ) : (
          <CompleteScreen state={state} elapsed={elapsed} onReset={reset} />
        )}
      </main>
    </>
  );
}
