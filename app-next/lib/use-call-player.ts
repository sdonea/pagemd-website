"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SCENARIOS,
  type Capture,
  type ScenarioId,
  type Turn,
  audioPath,
} from "./scenarios";

export interface Line {
  speaker: Turn["speaker"];
  text: string;
}
export interface Field {
  label: string;
  value: Capture[string];
}
export type Phase = "idle" | "playing" | "complete";

/* Ported from the original page. `token` is the cancel contract: every start,
   stop or scenario change increments it, and any sleep or audio promise that
   resolves against a stale token rejects instead of continuing. Do not replace
   it with a boolean — overlapping calls need to be distinguishable, not just
   stopped. */
export function useCallPlayer(scenarioId: ScenarioId) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [speaker, setSpeaker] = useState<Turn["speaker"] | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [muted, setMuted] = useState(false);

  const token = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  useEffect(() => {
    mutedRef.current = muted;
    if (audio.current) audio.current.muted = muted;
  }, [muted]);

  const teardown = useCallback(() => {
    token.current += 1;
    if (audio.current) {
      try {
        audio.current.pause();
      } catch {}
      audio.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  const reset = useCallback(() => {
    teardown();
    setPhase("idle");
    setElapsed(0);
    setSpeaker(null);
    setLines([]);
    setFields([]);
  }, [teardown]);

  // Scenario change is a stop, not a pause.
  useEffect(() => {
    reset();
    for (const [i, turn] of SCENARIOS[scenarioId].turns.entries()) {
      const a = new Audio(audioPath(scenarioId, i, turn.speaker));
      a.preload = "auto";
    }
  }, [scenarioId, reset]);

  // Stop everything on unmount, so a route change never leaves audio playing.
  useEffect(() => teardown, [teardown]);

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const start = useCallback(async () => {
    teardown();
    const tok = ++token.current;
    const live = () => tok === token.current;

    setPhase("playing");
    setElapsed(0);
    setLines([]);
    setFields([]);

    const sleep = (ms: number) =>
      new Promise<void>((res, rej) =>
        setTimeout(() => (live() ? res() : rej(new Error("cancelled"))), ms),
      );

    // The MP3s are the real thing; TTS is the fallback when a file is missing
    // or autoplay is blocked. Never remove it — without it the demo is silent.
    const speak = (text: string) =>
      new Promise<void>((res, rej) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          setTimeout(
            () => (live() ? res() : rej(new Error("cancelled"))),
            Math.min(4500, 1500 + text.length * 32),
          );
          return;
        }
        const u = new SpeechSynthesisUtterance(text);
        let done = false;
        const fin = () => {
          if (done) return;
          done = true;
          live() ? res() : rej(new Error("cancelled"));
        };
        u.onend = fin;
        u.onerror = fin;
        window.speechSynthesis.speak(u);
      });

    const play = (el: HTMLAudioElement, text: string) =>
      new Promise<void>((res, rej) => {
        let done = false;
        const fin = () => {
          if (done) return;
          done = true;
          live() ? res() : rej(new Error("cancelled"));
        };
        const fallback = () => {
          if (done) return;
          done = true;
          speak(text).then(res, rej);
        };
        el.addEventListener("ended", fin);
        el.addEventListener("pause", fin);
        el.addEventListener("error", fallback);
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(fallback);
      });

    try {
      const turns = SCENARIOS[scenarioId].turns;
      for (const [i, turn] of turns.entries()) {
        await sleep(i === 0 ? 600 : 350);
        setSpeaker(turn.speaker);
        setLines((prev) =>
          [...prev, { speaker: turn.speaker, text: turn.text }].slice(-3),
        );
        if (turn.capture) {
          const next = Object.entries(turn.capture).map(([label, value]) => ({
            label,
            value,
          }));
          setFields((prev) => [...prev, ...next]);
        }
        const el = new Audio(audioPath(scenarioId, i, turn.speaker));
        el.muted = mutedRef.current;
        audio.current = el;
        await play(el, turn.text);
        audio.current = null;
      }
      setSpeaker(null);
      setPhase("complete");
    } catch {
      // Cancelled. reset() already owns the visible state.
    }
  }, [scenarioId, teardown]);

  return {
    phase,
    elapsed,
    speaker,
    lines,
    fields,
    muted,
    setMuted,
    start,
    reset,
  };
}
