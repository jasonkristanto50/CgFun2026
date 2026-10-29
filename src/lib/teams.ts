import { IDEAL_TEAM_SIZE, MAX_TEAMS, MIN_TEAMS, TEAMS } from "@/config/teams";

/** One RSVP row from the sheet. `row` is the 1-based sheet row, used to write the Team cell back. */
export type Agent = {
  row: number;
  nama: string;
  status: string;
  statusCg: string;
  team: string;
};

export type TeamAssignment = Pick<Agent, "row" | "nama" | "team">;

export const isNewcomer = (a: Agent) => a.statusCg !== "CG People";

/** "Jason [Crest]" → { name: "Jason", codename: "Crest" }. */
export function splitNama(nama: string) {
  const m = nama.match(/^(.*?)\s*\[(.+)\]\s*$/);
  return m ? { name: m[1], codename: m[2] } : { name: nama, codename: "" };
}

export function suggestTeamCount(agentCount: number) {
  return Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, Math.round(agentCount / IDEAL_TEAM_SIZE)));
}

export function teamNames(count: number) {
  return TEAMS.slice(0, count).map((t) => t.name);
}

/** Sort key that keeps teams in config order, unknown names last. */
export function teamOrder(name: string) {
  const i = TEAMS.findIndex((t) => t.name === name);
  return i === -1 ? TEAMS.length : i;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Splits eligible agents into `teamCount` teams of near-equal size, spreading newcomers
 * (VIP / Teman Baru) evenly so no team is all strangers.
 *
 * - `includeUnsure`: also place "Masih Ragu" agents; otherwise only "Ikut".
 * - `keepExisting`: leave agents already in one of the teams where they are and only place the
 *   rest (for late registrants). Otherwise everyone is reshuffled and ineligible agents lose their team.
 */
export function generateTeams(
  agents: Agent[],
  teamCount: number,
  { includeUnsure, keepExisting }: { includeUnsure: boolean; keepExisting: boolean },
): Agent[] {
  const names = teamNames(teamCount);
  const eligible = (a: Agent) => a.status === "Ikut" || (includeUnsure && a.status === "Masih Ragu");
  const stays = (a: Agent) => keepExisting && names.includes(a.team);

  const size = new Map(names.map((n) => [n, 0]));
  const newcomers = new Map(names.map((n) => [n, 0]));
  for (const a of agents.filter(stays)) {
    size.set(a.team, size.get(a.team)! + 1);
    if (isNewcomer(a)) newcomers.set(a.team, newcomers.get(a.team)! + 1);
  }

  // Place newcomers first so they get spread before the teams fill up.
  const toPlace = agents.filter((a) => eligible(a) && !stays(a));
  const queue = [...shuffle(toPlace.filter(isNewcomer)), ...shuffle(toPlace.filter((a) => !isNewcomer(a)))];

  const placed = new Map<number, string>();
  for (const a of queue) {
    const candidates = shuffle(names).sort(
      (x, y) => size.get(x)! - size.get(y)! || (isNewcomer(a) ? newcomers.get(x)! - newcomers.get(y)! : 0),
    );
    const team = candidates[0];
    placed.set(a.row, team);
    size.set(team, size.get(team)! + 1);
    if (isNewcomer(a)) newcomers.set(team, newcomers.get(team)! + 1);
  }

  return agents.map((a) => {
    if (placed.has(a.row)) return { ...a, team: placed.get(a.row)! };
    if (stays(a) || (keepExisting && !eligible(a))) return a;
    return { ...a, team: "" };
  });
}
