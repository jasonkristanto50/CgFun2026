/**
 * Team maker settings. Edit freely.
 * `name` is exactly what gets written into the sheet's "Team" column, so renaming a team
 * here means re-generating (or re-saving) the teams afterwards.
 */

export const TEAMS = [
  { name: "Alpha", color: "#34d399" },
  { name: "Bravo", color: "#f59e0b" },
  { name: "Charlie", color: "#60a5fa" },
  { name: "Delta", color: "#f472b6" },
  { name: "Echo", color: "#a78bfa" },
  { name: "Foxtrot", color: "#f87171" },
];

export const MIN_TEAMS = 4;
export const MAX_TEAMS = TEAMS.length;
/** Used to suggest a team count from the number of confirmed agents. */
export const IDEAL_TEAM_SIZE = 5;
