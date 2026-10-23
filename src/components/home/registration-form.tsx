"use client";

import { ArrowRight, Camera, Dices, IdCard, Loader2, X } from "lucide-react";
import { useState } from "react";
import { CODENAMES } from "@/config/event";
import { Corners } from "@/components/ui/hud";
import { postToSheets, type CgStatus, type RsvpStatus } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { AgentIdCardModal, type AgentCardData } from "./agent-id-card";

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "Ikut", label: "Ikut" },
  { value: "Masih Ragu", label: "Masih Ragu" },
];
const CG_OPTIONS: { value: CgStatus; label: string }[] = [
  { value: "CG People", label: "CG People" },
  { value: "VIP / Teman Baru", label: "Teman Baru" },
];

const inputClass =
  "w-full rounded-md border border-slate-700 bg-obsidian/80 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

async function readPhoto(file: File, maxSize = 640): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function FieldLabel({ no, label, htmlFor, hint }: { no: string; label: string; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline gap-2 font-mono text-[11px] tracking-wider text-slate-300">
      <span className="text-amber-400">{no}</span>
      {label}
      {hint && <span className="text-slate-500">{hint}</span>}
    </label>
  );
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full border px-3 py-2.5 font-mono text-xs font-semibold tracking-wider transition active:scale-[0.97]",
              active
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                : "border-slate-700 text-slate-400 hover:border-slate-500",
            )}
          >
            {active ? "● " : "○ "}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type Errors = Partial<Record<"fullName" | "codename" | "phone" | "alamat" | "form", string>>;

export function RegistrationForm() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [codename, setCodename] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [status, setStatus] = useState<RsvpStatus>("Ikut");
  const [statusCg, setStatusCg] = useState<CgStatus>("CG People");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState<AgentCardData | null>(null);
  const [lastCard, setLastCard] = useState<AgentCardData | null>(null);

  function rollCodename() {
    const pool = CODENAMES.filter((c) => c !== codename);
    setCodename(pool[Math.floor(Math.random() * pool.length)]);
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPhoto(await readPhoto(file));
    } catch {
      setErrors((er) => ({ ...er, form: "Foto tidak bisa dibaca. Coba file lain (JPG/PNG)." }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^(62|0)/, "");
    const next: Errors = {};
    if (fullName.trim().length < 2) next.fullName = "Nama lengkap wajib diisi.";
    if (!codename.trim()) next.codename = "Pilih codename — atau tekan ACAK.";
    if (digits.length < 8 || digits.length > 13) next.phone = "Nomor WhatsApp tidak valid.";
    if (!alamat.trim()) next.alamat = "Alamat / domisili wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await postToSheets({
        type: "RSVP",
        nama: `${fullName.trim()} [${codename.trim()}]`,
        nomorTelepon: `+62${digits}`,
        alamat: alamat.trim(),
        status,
        statusCg,
      });
      const data: AgentCardData = {
        fullName: fullName.trim(),
        codename: codename.trim(),
        photo,
        agentId: `CG-07-${String(Math.floor(1000 + Math.random() * 9000))}`,
        status,
        statusCg,
      };
      setCard(data);
      setLastCard(data);
    } catch {
      setErrors({ form: "Transmisi gagal. Periksa koneksi lalu coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="daftar" className="scroll-mt-24 px-5 py-10">
      <div className="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/80 p-5 pt-7 backdrop-blur-md">
        <Corners />
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-obsidian px-2 font-mono text-[9px] tracking-[0.15em] text-amber-400">
          [ FORMULIR OTORISASI AGEN // CUT ALONG DOTTED LINE ]
        </div>

        <h2 className="font-display text-xl font-black tracking-wide text-slate-50">AGENT REGISTRATION</h2>
        <p className="mt-1 text-sm text-slate-400">
          Daftar sekarang dan dapatkan <span className="font-semibold text-emerald-400">AGENT CLEARANCE ID CARD</span>{" "}
          digital.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <FieldLabel no="01" label="FOTO PROFIL AGEN" hint="(Opsional)" />
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-emerald-500/40 bg-obsidian">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                  <img src={photo} alt="Preview foto agen" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-slate-600" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer rounded-md border border-slate-700 px-3 py-2 text-center font-mono text-[11px] text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300">
                  {photo ? "GANTI FOTO" : "UPLOAD FOTO"}
                  <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
                </label>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="flex items-center justify-center gap-1 font-mono text-[10px] text-slate-500 hover:text-red-400"
                  >
                    <X className="h-3 w-3" /> HAPUS
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Foto hanya dipakai di ID card kamu, tidak dikirim ke server.</p>
          </div>

          <div>
            <FieldLabel no="02" label="NAMA LENGKAP" htmlFor="fullName" />
            <input
              id="fullName"
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="cth. Jason Kristanto"
              autoComplete="name"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
          </div>

          <div>
            <FieldLabel no="03" label="CODENAME (NAMA SAMARAN)" htmlFor="codename" />
            <div className="flex gap-2">
              <input
                id="codename"
                className={inputClass}
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="cth. Agent Falcon"
                maxLength={32}
              />
              <button
                type="button"
                onClick={rollCodename}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 font-mono text-[11px] font-bold text-amber-300 transition active:scale-95 hover:bg-amber-500/20"
              >
                <Dices className="h-4 w-4" /> ACAK
              </button>
            </div>
            {errors.codename && <p className="mt-1 text-xs text-red-400">{errors.codename}</p>}
          </div>

          <div>
            <FieldLabel no="04" label="NO. WHATSAPP" htmlFor="phone" />
            <div className="flex">
              <span className="flex items-center rounded-l-md border border-r-0 border-slate-700 bg-slate-800 px-3 font-mono text-sm text-slate-300">
                +62
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                className={cn(inputClass, "rounded-l-none")}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="81234567890"
                autoComplete="tel-national"
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
          </div>

          <div>
            <FieldLabel no="05" label="ALAMAT / DOMISILI" htmlFor="alamat" />
            <input
              id="alamat"
              className={inputClass}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="cth. Surabaya Barat"
              autoComplete="address-level2"
            />
            {errors.alamat && <p className="mt-1 text-xs text-red-400">{errors.alamat}</p>}
          </div>

          <div>
            <FieldLabel no="06" label="STATUS KEHADIRAN & CG" />
            <div className="space-y-2">
              <PillGroup name="Status kehadiran" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
              <PillGroup name="Status CG" options={CG_OPTIONS} value={statusCg} onChange={setStatusCg} />
            </div>
          </div>

          {errors.form && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{errors.form}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-5 py-3.5 font-display text-sm font-bold tracking-wider text-obsidian shadow-[0_0_24px_rgba(245,158,11,0.35)] transition active:scale-[0.98] hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> MENGIRIM TRANSMISI...
              </>
            ) : (
              <>
                Daftar &amp; Generate ID Card <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </>
            )}
          </button>

          {lastCard && !card && (
            <button
              type="button"
              onClick={() => setCard(lastCard)}
              className="flex w-full items-center justify-center gap-2 font-mono text-xs text-emerald-400 hover:underline"
            >
              <IdCard className="h-4 w-4" /> Lihat lagi ID Card kamu
            </button>
          )}
        </form>
      </div>

      <AgentIdCardModal data={card} onClose={() => setCard(null)} />
    </section>
  );
}
