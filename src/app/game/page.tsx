import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameTerminal } from "@/components/game/game-terminal";
import { TerminalShell } from "@/components/ui/hud";
import { GAME_ENABLED } from "@/config/game";
import { getPublicMissions } from "@/config/missions";

export const metadata: Metadata = {
  title: "Field Terminal — CG FUN 2026",
  description: "Terminal misi Operation: Find the Code. Pecahkan 6 misi dan buka brankas FILE 07.",
};

export default function GamePage() {
  if (!GAME_ENABLED) notFound();
  return (
    <TerminalShell>
      <GameTerminal missions={getPublicMissions()} />
    </TerminalShell>
  );
}
