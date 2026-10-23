"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EVENT } from "@/config/event";
import { Corners } from "@/components/ui/hud";

const GLYPHS = "0123456789#$%&@";

function VaultGraphic() {
  const [chars, setChars] = useState<string[]>(() => Array(6).fill("?"));

  // Occasionally "glitch" one slot to suggest live decryption attempts.
  useEffect(() => {
    let revert: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      const slot = Math.floor(Math.random() * 6);
      const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      setChars((c) => c.map((v, i) => (i === slot ? glyph : v)));
      revert = setTimeout(() => setChars(Array(6).fill("?")), 160);
    }, 650);
    return () => {
      clearInterval(id);
      clearTimeout(revert);
    };
  }, []);

  return (
    <div className="relative mt-8 overflow-hidden rounded-xl border border-slate-800 bg-night/80 px-4 pb-5 pt-8">
      <Corners />
      <div aria-hidden className="bg-blueprint absolute inset-0 opacity-60" />
      {/* Radar */}
      <div aria-hidden className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-emerald-500/15" />
        <div className="absolute inset-8 rounded-full border border-emerald-500/15" />
        <div className="absolute inset-16 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-0 animate-sweep rounded-full bg-[conic-gradient(from_0deg,rgba(16,185,129,0.28),transparent_25%)]" />
      </div>

      <p className="relative text-center font-mono text-[10px] tracking-[0.3em] text-red-400">
        ■ TOP SECRET // FILE 07 // ENCRYPTED
      </p>
      <div className="relative mt-4 grid grid-cols-6 gap-2">
        {chars.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex aspect-[3/4] items-center justify-center rounded-md border border-emerald-500/40 bg-obsidian/90 font-mono text-2xl font-bold text-emerald-400 shadow-[inset_0_0_16px_rgba(16,185,129,0.15)] text-glow-green"
          >
            {c}
          </motion.div>
        ))}
      </div>
      <p className="relative mt-4 flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest text-slate-400">
        <Lock className="h-3 w-3 text-amber-400" /> 0/6 FRAGMEN DITEMUKAN
      </p>
    </div>
  );
}

export function Hero() {
  const telemetry = [
    { label: "TANGGAL", value: EVENT.date },
    { label: "LOKASI", value: EVENT.location },
    { label: "KUOTA OPERASI", value: `${EVENT.quota} (${EVENT.quotaNote})` },
  ];

  return (
    <section className="relative px-5 pb-10 pt-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.3)]"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        CLASSIFIED OPERATION • SURABAYA
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-center font-display text-[clamp(1.75rem,8.2vw,2.6rem)] font-black leading-[1.02] tracking-tight text-slate-50"
      >
        OPERATION:
        <br />
        <span className="bg-linear-to-r from-emerald-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]">
          FIND THE CODE
        </span>
      </motion.h1>

      <p className="mt-3 text-center font-mono text-[11px] tracking-[0.2em] text-amber-400">
        A REAL-WORLD MALL MISSION &amp; HANGOUT GAME
      </p>
      <p className="mt-4 text-center text-sm leading-relaxed text-slate-300">
        Bekerja sama dalam tim, pecahkan petunjuk lokasi di Ciputra World, kumpulkan 6 fragmen angka rahasia, dan buka
        brankas digital <span className="font-semibold text-emerald-400">FILE 07</span> sebelum waktu habis.
      </p>

      <VaultGraphic />

      <div className="mt-6 flex flex-col gap-3">
        <a
          href="#daftar"
          className="group flex items-center justify-center gap-2 rounded-md bg-amber-500 px-5 py-3.5 font-display text-sm font-bold tracking-wider text-obsidian shadow-[0_0_24px_rgba(245,158,11,0.35)] transition active:scale-[0.98] hover:bg-amber-400"
        >
          DAFTAR JADI AGENT
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </a>
        <Link
          href="/game"
          className="group flex items-center justify-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/5 px-5 py-3.5 font-mono text-xs font-semibold tracking-wider text-emerald-300 transition active:scale-[0.98] hover:bg-emerald-500/15"
        >
          <Terminal className="h-4 w-4" />
          BUKA TERMINAL MISI (HARI H)
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 divide-x divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/70">
        {telemetry.map((t) => (
          <div key={t.label} className="px-2.5 py-3">
            <p className="font-mono text-[9px] tracking-widest text-emerald-400">{t.label}</p>
            <p className="mt-1 text-[11.5px] font-semibold leading-snug text-slate-100">{t.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
