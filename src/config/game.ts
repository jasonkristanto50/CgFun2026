/**
 * Game settings that are safe to send to players' phones.
 * Mission content and answers live in missions.ts, which never leaves the server.
 */

/**
 * Master switch for the mission game (/game, /api/verify, GAME rows to Sheets).
 * The site is RSVP + team maker only for now — flip to true to bring the game back.
 */
export const GAME_ENABLED = false;

export type OptionKey = "A" | "B" | "C" | "D";
export const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

/** What the phone sees for each mission — no answer, no digit. */
export type PublicMission = {
  id: number;
  code: string;
  title: string;
  category: string;
  lore: string;
  task?: string;
  question: string;
  options: Record<OptionKey, string>;
  clueImage?: { src: string; alt: string; width: number; height: number };
};

/** Must match the number of missions in missions.ts (the build fails if it doesn't). */
export const MISSION_COUNT = 6;

export const POINTS_PER_MISSION = 100;
export const VAULT_POINTS = 200;
export const MAX_SCORE = MISSION_COUNT * POINTS_PER_MISSION + VAULT_POINTS;
export const LOCKOUT_MS = 10_000;
