import type { Metadata } from "next";
import { HudHeader } from "@/components/home/hud-header";
import { TeamMaker } from "@/components/teams/team-maker";
import { TerminalShell } from "@/components/ui/hud";

export const metadata: Metadata = {
  title: "Team Maker — CG FUN 2026",
  robots: { index: false, follow: false },
};

export default function TeamAdminPage() {
  return (
    <TerminalShell>
      <HudHeader />
      <main>
        <TeamMaker />
      </main>
    </TerminalShell>
  );
}
