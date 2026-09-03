"use client";

import { FrameButton } from "@/components/evil-buttons/frame-button";
import { PrismaticBurst } from "@/components/prismatic-burst";
import { useTheme } from "@/lib/theme";
import { RotatingText } from "@/components/rotating-text";

/* Centred hero. Not HeroSplit: that pattern is a copy column beside a visual,
   and this region has no visual — the aurora is the room, the headline is the
   whole subject. usva's own guidance is that a plain surface is a legitimate
   answer when the pattern does not fit.

   No sula element here. The nav above owns the page's one assertion. */
/* Each line completes "Medical paging, but …".

   Grouped by what the line actually claims, then interleaved rather than
   hand-ordered: `interleave` always draws from the largest group that did not
   supply the previous line, so two lines making the same point never land back
   to back, including across the loop's wrap. Add a phrase to its group and the
   order re-solves itself instead of quietly breaking the rule. */
const THEMES = {
  quality: ["instant", "intelligent", "automatic", "efficient", "AI", "cheap"],
  hold: [
    "nobody's on hold",
    "it picks up",
    "there's no hold music",
    "no waiting",
  ],
  hours: [
    "at 2am",
    "after hours",
    "weekends",
    "it never takes lunch",
    "it never calls in sick",
  ],
  capacity: ["every call at once", "it never runs out of lines"],
  middleman: ["no operator", "no call center"],
  deadEnd: ["no missed message", 'no "leave a message after the tone"'],
};

function interleave(themes: Record<string, string[]>): string[] {
  const pools = Object.entries(themes).map(([name, items]) => ({
    name,
    items: [...items],
  }));
  const out: string[] = [];
  let last = "";

  while (pools.some((p) => p.items.length > 0)) {
    const pick = pools
      .filter((p) => p.items.length > 0 && p.name !== last)
      .sort((a, b) => b.items.length - a.items.length)[0];
    // Only reachable if one group outnumbers all the others combined, which
    // would make the no-repeats rule unsatisfiable. Fail the build rather than
    // silently drop phrases or emit two of the same theme in a row.
    if (!pick) {
      throw new Error(
        "Hero rotation: one theme is too large to interleave without repeats.",
      );
    }
    out.push(pick.items.shift() as string);
    last = pick.name;
  }

  return out;
}

const ROTATION = interleave(THEMES);

export function Hero() {
  const theme = useTheme();

  return (
    // Two things the burst needs, and both bite silently.
    //   `bg-bg`: the canvas blends with `lighten`, and `isolate` scopes that
    //   blend to this section. Over a transparent backdrop there is nothing to
    //   lighten against and the canvas renders as nothing.
    //   Positive z-indexes: a negative one paints *behind* the section's own
    //   background, so `bg-bg` would then cover the canvas it just enabled.
    <section className="bg-bg relative isolate overflow-hidden border-b border-border">
      <PrismaticBurst
        /* Light needs the saturate as much as the opacity: at 30% over white
           the burst was there, it just had no colour left, so it read as a
           grey haze. Pushing chroma up and the veil down gives a blue that is
           actually visible without turning the headline's ground busy. */
        className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${
          theme === "dark" ? "" : "opacity-55 saturate-[1.7]"
        }`}
        animationType="rotate3d"
        intensity={4}
        speed={0.28}
        distort={1.6}
        rayCount={0}
        /* `lighten` only shows where the burst is brighter than the ground,
           and on a near-white ground nothing is, so the aurora vanishes. Its
           mirror, `darken`, does show — as grey soot, because the burst's own
           highlights are neutral. On light the canvas composites normally at
           low opacity instead: a soft blue wash, no grime. */
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
        <h1 className="text-ink text-[clamp(2.4rem,6.5vw,5rem)] leading-[1.05] font-bold">
          <span className="block text-balance">Medical paging, but</span>
          {/* Breaks out of the hero's max-w-5xl: "no \"leave a message after the
              tone\"" cannot sit on one line inside 1024px at heading size, and
              wrapping it overflowed the fixed line box and sliced the second
              line in half. It gets the full viewport instead, and the size is
              solved per phrase from `--rt-len` so every one fits on one line.
              0.52 is the average glyph width of Fira Sans italic as a fraction
              of the em — a calibration knob, not a derived constant. Nudge it
              up if a phrase ever touches the edges. */}
          <RotatingText
            texts={ROTATION}
            rotationInterval={2600}
            staggerDuration={0.015}
            staggerFrom="last"
            splitBy="characters"
            mainClassName="text-accent-alt relative left-1/2 mt-3 w-screen -translate-x-1/2 px-6 italic"
            style={{
              fontSize:
                "min(5rem, calc((100vw - 3rem) / (var(--rt-len) * 0.52)))",
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
