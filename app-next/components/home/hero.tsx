"use client";

import { FrameButton } from "@/components/evil-buttons/frame-button";
import { PrismaticBurst } from "@/components/prismatic-burst";
import { useTheme } from "@/lib/theme";
import { RotatingText } from "@/components/rotating-text";
import { motion } from "motion/react";
import { useState } from "react";

/* Centred hero. Not HeroSplit: that pattern is a copy column beside a visual,
   and this region has no visual — the aurora is the room, the headline is the
   whole subject. usva's own guidance is that a plain surface is a legitimate
   answer when the pattern does not fit.

   No sula element here. The nav above owns the page's one assertion. */
/* Each line completes "Medical paging, but …". Rotation order is the array
   order — edit the list, that is the whole contract. */
const ROTATION = [
  "AI-Powered",
  "nobody's on hold",
  "efficient",
  "it never calls in sick",
  "automatic",
  "no operator",
  "at 2 AM",
  "modern",
  "weekends",
];

/* Average glyph width of Fira Sans italic as a fraction of the em. One
   calibration knob, used twice: it solves the phrase's font size, and it solves
   the rule's width from the same number so the rule tracks the text. Nudge it
   up if a phrase ever touches the viewport edges. */
const GLYPH_EM = 0.52;
const MAX_PHRASE_REM = 7;

/* The phrase's solved font size, shared by the text and the rule under it. */
const PHRASE_SIZE = `min(${MAX_PHRASE_REM}rem, calc((100vw - 3rem) / (var(--rt-len) * ${GLYPH_EM})))`;

export function Hero() {
  const theme = useTheme();
  /* Drives the underline's wipe. RotatingText owns the index; this mirrors it
     so the rule can be re-keyed on every swap. */
  const [phrase, setPhrase] = useState(0);

  return (
    // Two things the burst needs, and both bite silently.
    //   `bg-bg`: the canvas blends with `lighten`, and `isolate` scopes that
    //   blend to this section. Over a transparent backdrop there is nothing to
    //   lighten against and the canvas renders as nothing.
    //   Positive z-indexes: a negative one paints *behind* the section's own
    //   background, so `bg-bg` would then cover the canvas it just enabled.
    <section className="bg-bg relative isolate overflow-hidden border-b border-border">
      <PrismaticBurst
        /* On light the shader switches to an ink mode (see `uLight`): the
           burst paints as blue coverage instead of added light. */
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        animationType="rotate3d"
        intensity={4}
        speed={0.28}
        distort={1.6}
        rayCount={0}
        /* `lighten` needs a dark ground. Light composites normally, and
           the shader's ink mode does the rest. */
        mixBlendMode={theme === "dark" ? "lighten" : "normal"}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        /* The scrim that lands the canvas into the page ground. On light it
           was doing the fading twice, with the canvas already at low opacity,
           so it pulls back to a thinner veil. */
        style={{
          backgroundImage:
            theme === "dark"
              ? "linear-gradient(to bottom, color-mix(in oklab, var(--usva-bg) 35%, transparent), color-mix(in oklab, var(--usva-bg) 72%, transparent) 55%, var(--usva-bg))"
              : "linear-gradient(to bottom, color-mix(in oklab, var(--usva-bg) 18%, transparent), color-mix(in oklab, var(--usva-bg) 52%, transparent) 55%, var(--usva-bg))",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        {/* The setup line steps down so the rotating phrase is the subject of
            the hero rather than its equal. Size only — no opacity change. */}
        <h1 className="text-ink text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1.05] font-bold">
          <span className="block text-balance">Medical paging, but</span>
          {/* Breaks out of the hero's max-w-5xl: a long phrase cannot sit on one
              line inside 1024px at heading size, and wrapping it overflowed the
              fixed line box and sliced the second line in half. It gets the full
              viewport instead, and the size is solved per phrase from `--rt-len`
              against GLYPH_EM so every one fits on one line. */}
          <RotatingText
            texts={ROTATION}
            rotationInterval={2600}
            staggerDuration={0.015}
            staggerFrom="last"
            splitBy="characters"
            onNext={setPhrase}
            mainClassName={`${theme === "dark" ? "text-accent-alt" : "text-accent"} relative left-1/2 mt-2 w-screen -translate-x-1/2 px-6 italic`}
            style={{
              fontSize: PHRASE_SIZE,
              /* Additive bloom only ever adds light, so on the light ground it
                 renders as a grey smear rather than a halo. Light mode buys the
                 same emphasis with weight instead. */
              ...(theme === "dark"
                ? {
                    textShadow:
                      "0 0 30px color-mix(in oklab, var(--usva-accent-alt) 45%, transparent), 0 0 70px color-mix(in oklab, var(--usva-accent-alt) 22%, transparent)",
                  }
                : { fontWeight: 800 }),
            }}
          />

          {/* Re-keyed on every swap so the wipe replays, and because the remount
              happens at scaleX 0 the new width lands while the rule is invisible
              — it never visibly resizes. Width is the phrase's own rendered
              width, from the same solver as the font size: len * GLYPH_EM * the
              size, which collapses to the min() below. */}
          <motion.span
            key={phrase}
            aria-hidden
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto block h-[3px] origin-left rounded-full motion-reduce:transition-none"
            style={{
              /* RotatingText reserves a 1.42em line box, which leaves dead space
                 under the descenders, and that space grows with the phrase size.
                 Pull back by a fraction of the same size so the rule sits a
                 constant hair below the text at every width. */
              ["--rt-len" as string]: ROTATION[phrase]?.length ?? 1,
              marginTop: `calc(${PHRASE_SIZE} * -0.22)`,
              width: `min(${(ROTATION[phrase]?.length ?? 0) * GLYPH_EM * MAX_PHRASE_REM}rem, calc(100vw - 3rem))`,
              backgroundImage:
                "linear-gradient(to right, transparent, var(--usva-accent-alt) 25%, var(--usva-accent-alt) 75%, transparent)",
            }}
          />
        </h1>

        {/* gap-6, not gap-3: the frame markers sit 7.5px outside each button,
            so a tighter gap has them overlapping mid-hover. */}
        <div className="flex flex-wrap justify-center gap-6">
          <FrameButton as="link" href="#signup">
            Request access
          </FrameButton>
          <FrameButton as="link" href="#demo" variant="outline">
            Hear a live call
          </FrameButton>
        </div>
      </div>
    </section>
  );
}
