import { ArrowRight, CheckCircle2, Clock, Eye, Fingerprint, KeyRound, MapPin, Shirt, Users } from "lucide-react";
import { CHECKLIST, EVENT } from "@/config/event";
import { HudCard, Section } from "@/components/ui/hud";

export function Manifesto() {
  return (
    <section className="relative border-y border-slate-800 bg-night/60 px-5 py-14">
      <p className="font-mono text-[11px] tracking-[0.25em] text-emerald-400 text-glow-green">{"// TRANSMISI PANITIA"}</p>
      <blockquote className="mt-5 font-display text-[2rem] font-black leading-[1.08] text-slate-50">
        &ldquo;WE DON&apos;T JUST HANG OUT, WE BUILD{" "}
        <span className="relative inline-block text-amber-400 text-glow-amber">
          FAMILY.
          <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-linear-to-r from-amber-400 to-emerald-400" />
        </span>
        &rdquo;
      </blockquote>
      <p className="mt-6 font-mono text-xs text-slate-400">— Command Center CG Fun 2026</p>
    </section>
  );
}

const MODULES = [
  { code: "MOD-01", title: "RECONNAISSANCE", sub: "Observasi Visual", desc: "Temukan detail tersembunyi di sekitar mall.", Icon: Eye },
  { code: "MOD-02", title: "CRYPTOGRAPHY", sub: "Pecah Sandi", desc: "Dekripsi pesan rahasia dengan kunci sandi.", Icon: KeyRound },
  { code: "MOD-03", title: "SQUAD SYNC", sub: "Logika Tim", desc: "Gabungkan kepala seluruh agen untuk satu jawaban.", Icon: Users },
  { code: "MOD-04", title: "PATTERN DECODE", sub: "Akses File 07", desc: "Baca pola, kumpulkan digit, buka brankas.", Icon: Fingerprint },
];

export function MissionModules() {
  return (
    <Section kicker="// MISSION MODULES" title="4 JENIS TANTANGAN, 1 KODE FINAL">
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(({ code, title, sub, desc, Icon }) => (
          <HudCard key={code} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                <Icon className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="font-mono text-[9px] text-slate-500">{code}</span>
            </div>
            <p className="mt-3 font-display text-[11.5px] font-bold tracking-wider text-slate-50">{title}</p>
            <p className="mt-0.5 text-xs italic text-amber-400">{sub}</p>
            <p className="mt-2 text-[11px] leading-snug text-slate-400">{desc}</p>
          </HudCard>
        ))}
      </div>
    </Section>
  );
}

export function Briefing() {
  const rows = [
    {
      Icon: Clock,
      label: "WAKTU OPERASI",
      body: <>{EVENT.durationMinutes} Menit (Briefing tepat waktu di titik kumpul)</>,
    },
    {
      Icon: MapPin,
      label: "TITIK KUMPUL",
      body: (
        <>
          {EVENT.address}
          <a
            href={EVENT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 flex w-fit items-center gap-1 font-mono text-xs text-emerald-400 underline-offset-4 hover:underline"
          >
            Buka Google Maps <ArrowRight className="h-3 w-3" />
          </a>
        </>
      ),
    },
    {
      Icon: Shirt,
      label: "DRESS CODE & GEAR",
      body: "Pakaian kasual nyaman & sepatu jalan, 1 HP utama per tim dengan baterai penuh, dilarang berlari di dalam mall.",
    },
  ];

  return (
    <Section kicker="// PENGUMUMAN PANITIA" title="PETUNJUK HARI H">
      <HudCard className="p-0">
        {rows.map(({ Icon, label, body }) => (
          <div key={label} className="flex gap-3 border-b border-slate-800 px-4 py-4 last:border-b-0">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-mono text-[10px] tracking-widest text-emerald-400">{label}</p>
              <div className="mt-1 text-sm leading-relaxed text-slate-200">{body}</div>
            </div>
          </div>
        ))}
      </HudCard>
      <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-800">
        <iframe
          title="Peta Ciputra World Surabaya"
          src={EVENT.mapsEmbedUrl}
          className="h-56 w-full grayscale invert-[0.92] hue-rotate-180"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </Section>
  );
}

export function FooterCallout() {
  return (
    <section className="px-5 pb-12 pt-4">
      <HudCard className="border-amber-500/30 bg-linear-to-b from-slate-900/90 to-obsidian p-6">
        <p className="font-mono text-[10px] tracking-[0.25em] text-amber-400">{"// FINAL CHECK"}</p>
        <h2 className="mt-2 font-display text-2xl font-black text-slate-50">SIAP UNTUK OPERASI INI?</h2>
        <ul className="mt-5 space-y-3">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#daftar"
          className="group mt-6 flex items-center justify-center gap-2 rounded-md bg-amber-500 px-5 py-3.5 font-display text-sm font-bold tracking-wider text-obsidian shadow-[0_0_24px_rgba(245,158,11,0.35)] transition active:scale-[0.98] hover:bg-amber-400"
        >
          DAFTAR SEKARANG <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </a>
      </HudCard>
      <p className="mt-8 text-center font-mono text-[10px] tracking-widest text-slate-600">
        © 2026 CG FUN COMMAND CENTER // END OF TRANSMISSION
      </p>
    </section>
  );
}
