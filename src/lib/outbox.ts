"use client";

import { useEffect, useState } from "react";
import { postToSheets, SheetsError, type GamePayload } from "./sheets";

/**
 * Game progress reports are queued in localStorage and sent in order, so a team
 * walking through a no-signal corner of the mall never loses an update.
 */

const KEY = "cgfun2026.outbox.v1";
const MAX_QUEUE = 50;
const RETRY_MS = 15_000;

const listeners = new Set<(pending: number) => void>();
let flushing = false;

function read(): GamePayload[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as GamePayload[];
  } catch {
    return [];
  }
}

function write(queue: GamePayload[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(queue));
  } catch {
    // Storage unavailable — the report is lost, the game itself still works.
  }
  listeners.forEach((l) => l(queue.length));
}

export function enqueueGameReport(payload: GamePayload) {
  write([...read(), payload].slice(-MAX_QUEUE));
  void flushOutbox();
}

export async function flushOutbox() {
  if (flushing) return;
  flushing = true;
  try {
    while (read().length) {
      try {
        await postToSheets(read()[0], { keepalive: true });
      } catch (err) {
        // Network or 5xx: keep it and retry later. Other errors would never succeed, so drop.
        const retryable = !(err instanceof SheetsError) || err.status >= 500;
        if (retryable) break;
        console.warn("[outbox] Dropping report the server rejected:", err);
      }
      // Only this loop removes items and new ones are appended, so the head is still ours.
      const before = read().length;
      write(read().slice(1));
      if (read().length >= before) break; // storage not writable — don't resend forever

    }
  } finally {
    flushing = false;
  }
}

/** Pending report count + connectivity, and keeps retrying while anything is queued. */
export function useSyncStatus() {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setPending(read().length);
    setOnline(navigator.onLine);
    listeners.add(setPending);

    const onOnline = () => {
      setOnline(true);
      void flushOutbox();
    };
    const onOffline = () => setOnline(false);
    const onVisible = () => !document.hidden && void flushOutbox();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    const retry = setInterval(() => read().length && void flushOutbox(), RETRY_MS);
    void flushOutbox();

    return () => {
      listeners.delete(setPending);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(retry);
    };
  }, []);

  return { pending, online };
}
