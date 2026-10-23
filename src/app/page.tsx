import { Hero } from "@/components/home/hero";
import { HudHeader, IntelTicker } from "@/components/home/hud-header";
import { RegistrationForm } from "@/components/home/registration-form";
import { SectorMap } from "@/components/home/sector-map";
import { Briefing, FooterCallout, Manifesto, MissionModules } from "@/components/home/static-sections";
import { TerminalShell } from "@/components/ui/hud";

export default function Home() {
  return (
    <TerminalShell>
      <HudHeader />
      <IntelTicker />
      <main>
        <Hero />
        <Manifesto />
        <MissionModules />
        <SectorMap />
        <Briefing />
        <RegistrationForm />
        <FooterCallout />
      </main>
    </TerminalShell>
  );
}
