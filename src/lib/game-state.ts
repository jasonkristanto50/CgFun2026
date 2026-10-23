"use client";

import { useEffect, useState } from "react";
import { MISSION_COUNT } from "@/config/game";

export type Screen = "start" | "mission" | "vault" | "complete";

export type GameState = {
  screen: Screen;
  teamName: string;
  missionIndex: number;
  /** Mission answered correctly, digit revealed, waiting for "next". */
  revealed: boolean;
  unlocked: string[];
  score: number;
  wrongAttempts: number;
  startedAt: number | null;
  finishedAt: number | null;
  lockoutUntil: number | null;
};

export const INITIAL_GAME_STATE: GameState = {
  screen: "start",
  teamName: "",
  missionIndex: 0,
  revealed: false,
  unlocked: [],
  score: 0,
  wrongAttempts: 0,
  startedAt: null,
  finishedAt: null,
  lockoutUntil: null,
};

const STORAGE_KEY = "cgfun2026.terminal.v1";

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_GAME_STATE;
    const parsed = { ...INITIAL_GAME_STATE, ...(JSON.parse(raw) as Partial<GameState>) };
    parsed.missionIndex = Math.min(Math.max(0, parsed.missionIndex), MISSION_COUNT - 1);
    return parsed;
  } catch {
    return INITIAL_GAME_STATE;
  }
}

/** Game state persisted to localStorage so a refresh never loses progress. */
export function usePersistentGame() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full / private mode — game still works for this session.
    }
  }, [state, hydrated]);

  return [state, setState, hydrated] as const;
}

export function useNow(intervalMs: number, active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return now;
}
