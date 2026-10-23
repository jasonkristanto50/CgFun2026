"use client";

import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { hashString } from "@/lib/utils";

export type AgentCardData = {
  fullName: string;
  codename: string;
  photo: string | null;
  agentId: string;
  status: string;
  statusCg: string;
};

function SpySilhouette() {
  return (
    <svg viewBox="0 0 120 140" className="h-full w-full" aria-label="Siluet agen">
      <rect width="120" height="140" fill="#0b1220" />
      <path d="M60 22c-18 0-30 13-30 31 0 20 13 36 30 36s30-16 30-36c0-18-12-31-30-31z" fill="#1e293b" />
      <path d="M26 46c4-20 18-30 34-30s30 10 34 30c-10-6-22-9-34-9s-24 3-34 9z" fill="#0f172a" />
      <rect x="36" y="52" width="20" height="9" rx="3" fill="#10B981" opacity="0.9" />
      <rect x="64" y="52" width="20" height="9" rx="3" fill="#10B981" opacity="0.9" />
      <rect x="55" y="55" width="10" height="2" fill="#10B981" />
      <path d="M10 140c4-30 24-46 50-46s46 16 50 46z" fill="#1e293b" />
      <path d="M52 94l8 20 8-20z" fill="#0f172a" />
    </svg>
  );
}

function Barcode({ seed }: { seed: string }) {
  let h = hashString(seed);
  const bars = Array.from({ length: 46 }, () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return 1 + (h % 3);
  });
  return (
    <div className="flex h-9 items-stretch gap-[2px]">
      {bars.map((w, i) => (
        <span key={i} className={i % 2 ? "bg-transparent" : "bg-slate-200"} style={{ width: w }} />
      ))}
    </div>
  );
}

export const AgentIdCard = forwardRef<HTMLDivElement, { data: AgentCardData }>(function AgentIdCard({ data }, ref) {
  return (
    <div
      ref={ref}
      className="relative mx-auto w-[300px] overflow-hidden rounded-xl border border-emerald-500/40 bg-[#090D16] p-4 text-slate-100"
    >
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="font-display text-[11px] font-bold tracking-[0.2em] text-emerald-400">CG FUN 2026</span>
          <span className="rounded-sm border border-[#EF4444] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-[#EF4444]">
            TOP SECRET
          </span>
        </div>
        <p className="mt-1 font-mono text-[8.5px] tracking-[0.18em] text-slate-400">SECRET AGENT CLEARANCE ID CARD</p>
        <div className="mt-3 h-px bg-linear-to-r from-emerald-500/70 via-amber-500/60 to-transparent" />

        <div className="mt-4 flex gap-3">
          <div className="relative h-[140px] w-[112px] shrink-0 overflow-hidden rounded-md border border-emerald-500/50">
            {data.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL, rendered into the downloadable PNG
              <img src={data.photo} alt={data.fullName} className="h-full w-full object-cover" />
            ) : (
              <SpySilhouette />
            )}
            <span className="absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-emerald-400" />
            <span className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-emerald-400" />
          </div>
          <div className="min-w-0 flex-1 font-mono">
            <p className="text-[8px] tracking-widest text-slate-500">CODENAME</p>
            <p className="font-display text-[15px] font-black leading-tight text-[#F59E0B]">{data.codename.toUpperCase()}</p>
            <p className="mt-2 text-[8px] tracking-widest text-slate-500">NAMA</p>
            <p className="break-words text-[11px] font-semibold leading-tight text-slate-100">{data.fullName}</p>
            <p className="mt-2 text-[8px] tracking-widest text-slate-500">AGENT ID</p>
            <p className="text-[11px] text-emerald-400">{data.agentId}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5 font-mono">
          {[
            ["CLEARANCE", "LEVEL 07"],
            ["STATUS", data.status.toUpperCase()],
            ["UNIT", data.statusCg === "CG People" ? "CG PEOPLE" : "VIP"],
          ].map(([k, v]) => (
            <div key={k} className="rounded border border-slate-700 bg-[#0F172A] px-1.5 py-1">
              <p className="text-[7px] tracking-widest text-slate-500">{k}</p>
              <p className="text-[9.5px] font-bold text-slate-100">{v}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 font-mono text-[8.5px] tracking-wider text-emerald-400/90">
          OPERATION: FIND THE CODE // FILE 07
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <Barcode seed={data.agentId + data.codename} />
          <span className="pb-0.5 font-mono text-[8px] text-slate-500">CW-SBY</span>
        </div>
        <p className="mt-2 font-mono text-[7.5px] tracking-[0.2em] text-slate-500">
          CIPUTRA WORLD SURABAYA • VALID 2026
        </p>
      </div>
    </div>
  );
});

export function AgentIdCardModal({ data, onClose }: { data: AgentCardData | null; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    if (!cardRef.current || !data) return;
    setDownloading(true);
    setError(null);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true, backgroundColor: "#090D16" });
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent-id-${data.codename.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
    } catch {
      setError("Gagal membuat gambar. Silakan screenshot kartu ini.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Modal open={data !== null} onClose={onClose} title="// CLEARANCE GRANTED">
      {data && (
        <>
          <p className="mb-4 text-center text-sm text-slate-300">
            Selamat bergabung, <span className="font-semibold text-amber-400">{data.codename}</span>. Data agen sudah
            terkirim ke Command Center.
          </p>
          <AgentIdCard ref={cardRef} data={data} />
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-3 font-display text-xs font-bold tracking-wider text-obsidian transition active:scale-[0.98] hover:bg-emerald-400 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            DOWNLOAD ID CARD
          </button>
          <p className="mt-2 text-center font-mono text-[10px] text-slate-500">
            {error ?? "Atau screenshot kartu ini & share ke squad kamu."}
          </p>
        </>
      )}
    </Modal>
  );
}
