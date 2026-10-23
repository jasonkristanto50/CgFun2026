"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { getSpyMusic } from "@/lib/spy-music";
import { cn } from "@/lib/utils";

const PREF_KEY = "cgfun2026.bgm";

function savePref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // Preference just won't persist.
  }
}

/** Floating BGM switch. Lives in the root layout so music survives page navigation. */
export function MusicToggle() {
  const [on, setOn] = useState(false);

  // Browsers block autoplay: if the visitor turned music on before, resume on their first tap.
  useEffect(() => {
    let pref = false;
    try {
      pref = localStorage.getItem(PREF_KEY) === "on";
    } catch {}
    if (!pref) return;

    function resume(e: PointerEvent) {
      window.removeEventListener("pointerdown", resume);
      if ((e.target as Element | null)?.closest("[data-music-toggle]")) return;
      getSpyMusic().start();
      setOn(true);
    }
    window.addEventListener("pointerdown", resume);
    return () => window.removeEventListener("pointerdown", resume);
  }, []);

  function toggle() {
    const music = getSpyMusic();
    const next = !music.playing;
    if (next) music.start();
    else music.stop();
    setOn(next);
    savePref(next);
  }

  return (
    <button
      type="button"
      data-music-toggle
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Matikan musik" : "Nyalakan musik"}
      className={cn(
        "fixed bottom-4 right-4 z-[55] flex h-11 items-center gap-2 rounded-full border px-3.5 font-mono text-[10px] font-bold tracking-widest backdrop-blur-md transition active:scale-95 md:right-[calc(50%-208px)]",
        on
          ? "border-emerald-500/60 bg-obsidian/85 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
          : "border-slate-700 bg-obsidian/85 text-slate-400 hover:text-slate-200",
      )}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {on ? (
        <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] animate-pulse rounded-sm bg-emerald-400"
              style={{ height: `${[60, 100, 40, 80][i]}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      ) : (
        "BGM"
      )}
    </button>
  );
}
