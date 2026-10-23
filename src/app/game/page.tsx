import type { Metadata } from "next";
import { GameTerminal } from "@/components/game/game-terminal";
import { TerminalShell } from "@/components/ui/hud";
import { getPublicMissions } from "@/config/missions";

export const metadata: Metadata = {
  title: "Field Terminal — CG FUN 2026",
  description: "Terminal misi Operation: Find the Code. Pecahkan 6 misi dan buka brankas FILE 07.",
};

export default function GamePage() {
  return (
    <TerminalShell>
      <GameTerminal missions={getPublicMissions()} />
    </TerminalShell>
  );
}
