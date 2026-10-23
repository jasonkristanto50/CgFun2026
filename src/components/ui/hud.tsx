import { cn } from "@/lib/utils";

/** Crosshair corner brackets — place inside a `relative` parent. */
export function Corners({ className }: { className?: string }) {
  const base = "pointer-events-none absolute h-3 w-3 border-emerald-500/70";
  return (
    <span aria-hidden className={className}>
      <span className={cn(base, "left-0 top-0 border-l-2 border-t-2")} />
      <span className={cn(base, "right-0 top-0 border-r-2 border-t-2")} />
      <span className={cn(base, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={cn(base, "bottom-0 right-0 border-b-2 border-r-2")} />
    </span>
  );
}

export function HudCard({
  children,
  className,
  label,
  labelClassName,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  labelClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md",
        className,
      )}
    >
      <Corners />
      {label && (
        <div
          className={cn(
            "absolute -top-2.5 left-4 bg-obsidian px-2 font-mono text-[10px] tracking-[0.2em] text-emerald-400",
            labelClassName,
          )}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export function Section({
  id,
  kicker,
  title,
  children,
  className,
}: {
  id?: string;
  kicker: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 px-5 py-10", className)}>
      <p className="font-mono text-[11px] tracking-[0.25em] text-emerald-400 text-glow-green">{kicker}</p>
      {title && (
        <h2 className="mt-2 font-display text-xl font-bold leading-tight tracking-wide text-slate-50">{title}</h2>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Mobile-first centered viewport with HUD framing on larger screens. */
export function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:py-8">
      <div className="relative mx-auto min-h-dvh w-full max-w-md overflow-x-clip bg-obsidian/70 md:min-h-0 md:rounded-2xl md:border md:border-slate-800 md:shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)]">
        <div aria-hidden className="scanlines pointer-events-none absolute inset-0 z-50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-50 h-24 animate-scan bg-linear-to-b from-transparent via-emerald-400/[0.04] to-transparent"
        />
        {children}
      </div>
    </div>
  );
}
