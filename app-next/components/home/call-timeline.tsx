"use client";

import { memo, useEffect, useState } from "react";
import { RoadmapTimeline } from "@usva-ui/react/patterns/roadmap-timeline";
import { cn } from "@/lib/utils";

/* The sixty seconds of a call, on one track.

   RoadmapTimeline is the registry's timeline (`@usva/roadmap-timeline`); the
   only thing added here is time. Its `tone` already drives the node ring and
   the card lift, so the animation is a cursor walking `current` down the list
   rather than a second set of styles.

   The one thing not borrowed is the track. The library's fill only renders
   once a node is reached, so it pops into place on the first step and vanishes
   on the loop — three discrete jumps per cycle. Redrawn here as one always-
   mounted bar scaled by `progress`, it glides the whole hold and rewinds at
   the end instead of blinking out. Same geometry, same tones as the original.

   `status` is deliberately unused: it renders `rounded-full`, and nothing on
   this site is a pill. `version` is `rounded-lg` and carries the clock. */
const STAGES = [
  {
    version: "0.0s",
    title: "Call received",
    body: "PageMD picks up on the first ring. No queue, no operator, no voicemail.",
  },
  {
    version: "~45s",
    title: "Intake captured",
    body: "Caller, patient, reason and callback number, structured as the conversation happens.",
  },
  {
    version: "~60s",
    title: "Page delivered",
    body: "The finished message routes to the right provider, in a fixed format.",
  },
];

const HOLD_MS = 1600;

const NODE_TONES = {
  done: "border-accent/40 bg-accent/30",
  current:
    "border-accent bg-accent shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-accent)_18%,transparent)]",
  planned: "border-border-strong bg-sunken",
} as const;

// The track runs node-centre to node-centre, so it insets by half a column at
// each end — the same `center(0, count)` the library uses.
const EDGE = `${(0.5 / STAGES.length) * 100}%`;

export const CallTimeline = memo(function CallTimeline() {
  // Starts complete, so a reader who never sees the animation still gets the
  // finished story. The loop then walks it from the top.
  const [active, setActive] = useState(STAGES.length - 1);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;

    const run = () => {
      clearInterval(timer);
      if (reduced.matches) {
        setActive(STAGES.length - 1);
        return;
      }
      timer = setInterval(
        () => setActive((i) => (i + 1) % (STAGES.length + 1)),
        HOLD_MS,
      );
    };

    run();
    reduced.addEventListener("change", run);
    return () => {
      clearInterval(timer);
      reduced.removeEventListener("change", run);
    };
  }, []);

  // The extra index past the end leaves every stage `done`: the call is
  // finished and the track is full, which is the beat worth resting on.
  const tones = STAGES.map((_, i) =>
    i < active ? "done" : i === active ? "current" : "planned",
  ) as (keyof typeof NODE_TONES)[];

  const progress = Math.min(active, STAGES.length - 1) / (STAGES.length - 1);

  return (
    <div className="@container">
      <div
        aria-hidden="true"
        className="relative mb-3 hidden h-3 w-full @2xl:block"
      >
        <div
          className="-translate-y-1/2 absolute top-1/2 h-0.5 bg-[repeating-linear-gradient(90deg,var(--color-border-strong)_0,var(--color-border-strong)_7px,transparent_7px,transparent_16px)]"
          style={{ left: EDGE, right: EDGE }}
        />
        <div
          className="-translate-y-1/2 absolute top-1/2 h-0.5 origin-left bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-accent)_25%,transparent),var(--color-accent))] motion-reduce:!transition-none"
          style={{
            left: EDGE,
            right: EDGE,
            transform: `scaleX(${progress})`,
            // Linear and exactly one hold long, so the fill is always travelling
            // rather than darting and waiting. The one exception is the wrap
            // back to the first stage: a bar sliding backwards reads as undo,
            // so that step cuts to empty instead.
            transition: active === 0 ? "none" : `transform ${HOLD_MS}ms linear`,
          }}
        />
        {tones.map((tone, i) => (
          <span
            key={i}
            className={cn(
              "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 size-3 rounded-full border transition-control",
              NODE_TONES[tone],
            )}
            style={{ left: `${((i + 0.5) / STAGES.length) * 100}%` }}
          />
        ))}
      </div>

      <RoadmapTimeline
        hideTrack
        headingLevel="h3"
        // The card title is a different size when `current`, and font-size is
        // not in `transition-control`'s property set, so it snapped on every
        // step. Nothing else here changes type size.
        className="[&_h3]:transition-[font-size] [&_h3]:duration-slow [&_h3]:ease-soft motion-reduce:[&_h3]:transition-none"
        milestones={STAGES.map((stage, i) => ({ ...stage, tone: tones[i] }))}
      />
    </div>
  );
});
