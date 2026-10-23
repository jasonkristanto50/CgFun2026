"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { RulesList, ScoringTable } from "@/components/shared/rules-list";
import { Corners, Section } from "@/components/ui/hud";
import { Modal } from "@/components/ui/modal";

// Positions are percentages of the map card.
const CHECKPOINTS = [
  { id: "CP-01", grid: "B2", x: 24, y: 30 },
  { id: "CP-02", grid: "D1", x: 64, y: 22 },
  { id: "CP-03", grid: "E3", x: 76, y: 66 },
  { id: "CP-04", grid: "B4", x: 30, y: 76 },
];

function MallSchematic() {
  return (
    <svg viewBox="0 0 320 240" className="absolute inset-0 h-full w-full" aria-hidden>
      {/* Building blocks */}
      <g fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.55)" strokeWidth="1">
        <path d="M28 40 H200 V110 H150 V150 H28 Z" />
        <path d="M210 30 H292 V130 H210 Z" />
        <path d="M60 165 H292 V212 H60 Z" />
        <circle cx="175" cy="135" r="22" />
      </g>
      {/* Walkways */}
      <g stroke="rgba(245,158,11,0.5)" strokeWidth="1" strokeDasharray="4 4" fill="none">
        <path d="M76 72 L205 68 L245 160 L96 186" />
      </g>
      <g fill="rgba(148,163,184,0.7)" fontFamily="var(--font-jetbrains), monospace" fontSize="7" letterSpacing="1">
        <text x="36" y="52">SEKTOR A // MALL</text>
        <text x="216" y="44">SEKTOR B // TOWER</text>
        <text x="68" y="206">SEKTOR C // PROMENADE</text>
        <text x="162" y="138">ATRIUM</text>
      </g>
      {/* Grid coordinates */}
      <g fill="rgba(16,185,129,0.6)" fontFamily="var(--font-jetbrains), monospace" fontSize="7">
        {["A", "B", "C", "D", "E", "F"].map((l, i) => (
          <text key={l} x={22 + i * 52} y="14">{l}</text>
        ))}
        {["1", "2", "3", "4"].map((n, i) => (
          <text key={n} x="6" y={42 + i * 55}>{n}</text>
        ))}
      </g>
    </svg>
  );
}

export function SectorMap() {
  const [open, setOpen] = useState(false);

  return (
    <Section kicker="// SECTOR MAP" title="EKSPLORASI CIPUTRA WORLD">
      <figure>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-800 bg-night">
          <Corners />
          <div aria-hidden className="bg-blueprint absolute inset-0" />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 animate-sweep rounded-full bg-[conic-gradient(from_0deg,rgba(16,185,129,0.18),transparent_20%)]"
          />
          <MallSchematic />

          {CHECKPOINTS.map((cp, i) => (
            <div
              key={cp.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${cp.x}%`, top: `${cp.y}%` }}
            >
              <span
                className="absolute inset-0 m-auto h-3 w-3 animate-ping rounded-full bg-emerald-400/60"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
              <span className="relative block h-3 w-3 rounded-full border-2 border-obsidian bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-obsidian/90 px-1 font-mono text-[8px] text-emerald-300">
                {cp.id} {"//"} {cp.grid}
              </span>
            </div>
          ))}

          {/* Compass */}
          <div className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/50 bg-obsidian/80">
            <svg viewBox="0 0 40 40" className="h-9 w-9" aria-label="Kompas">
              <polygon points="20,5 24,20 20,18 16,20" fill="#F59E0B" />
              <polygon points="20,35 24,20 20,22 16,20" fill="rgba(148,163,184,0.5)" />
              <text x="20" y="4.5" textAnchor="middle" fontSize="5" fill="#F59E0B" fontFamily="monospace">N</text>
            </svg>
          </div>
          <div className="absolute bottom-2 right-3 font-mono text-[8px] text-slate-500">
            7.2913°S 112.7186°E
          </div>
        </div>
        <figcaption className="mt-2 font-mono text-[10px] text-slate-500">
          FIG. 01 - Radar area operasi Ciputra World Surabaya.
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/5 px-5 py-3 font-mono text-xs font-semibold tracking-wider text-emerald-300 transition active:scale-[0.98] hover:bg-emerald-500/15"
      >
        Lihat Briefing &amp; Aturan Main <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="// BRIEFING & ATURAN MAIN">
        <p className="mb-3 font-display text-sm font-bold tracking-wider text-slate-50">8 ATURAN RESMI OPERASI</p>
        <RulesList />
        <p className="mb-3 mt-6 font-display text-sm font-bold tracking-wider text-slate-50">SISTEM SKOR</p>
        <ScoringTable />
      </Modal>
    </Section>
  );
}
