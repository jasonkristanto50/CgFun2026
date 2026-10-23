import { TICKER_ITEMS } from "@/config/event";

export function HudHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-obsidian/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-4 pt-2 font-mono text-[9.5px] tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          SYS.STATUS: <span className="text-emerald-400">ONLINE</span> {"// CW-SBY"}
        </span>
        <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-400">
          CLEARANCE: LEVEL 07
        </span>
      </div>
      <p className="px-4 pb-2 pt-1 text-center font-display text-[13px] font-bold tracking-[0.25em] text-slate-100">
        CG FUN 2026 <span className="text-emerald-400">{"//"}</span> HQ TERMINAL
      </p>
    </header>
  );
}

export function IntelTicker() {
  const text = TICKER_ITEMS.join("  ◆  ") + "  ◆  ";
  return (
    <div className="flex items-center gap-3 border-b border-slate-800 bg-night/80 py-2 pl-3">
      <span className="shrink-0 rounded border border-red-500/50 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-red-400 text-glow-red">
        [<span className="animate-pulse">●</span> LIVE INTEL]
      </span>
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1} className="whitespace-pre font-mono text-xs text-amber-300">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
