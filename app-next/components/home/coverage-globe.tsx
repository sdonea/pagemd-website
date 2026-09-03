"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { hexToRgb } from "@/components/prismatic-burst";
import { useTheme } from "@/lib/theme";

/* The globe from `@efferd/features-6`, kept and re-marked.

   It spins, as the block intended. What changed is the markers: stock they sit
   on San Francisco and New York, read as a coast-to-coast footprint, and PageMD
   is a pilot-stage clinic product in Evansville. These are the places a clinic's
   inbound calls dial from instead, which is the claim the FAQ already makes —
   the people calling a clinic are outside its building.

   Two things the block did not do and this page needs:
     · Colour comes from the accent role token, not cobe's hardcoded cyan.
     · The render loop is gated on visibility. A permanent rAF behind a long
       scrolling page is the cost that got the globe cut the first time. */

// cobe has no "look at this longitude" input, so this is a calibration knob:
// phi 0 happens to put the Americas front and centre, which is where the
// rotation starts. Nudge it to change the opening frame.
const BASE_PHI = 0;
const THETA = 0.35; // tilt, ~38°N
const SPIN = 0.01; // radians per frame — a full turn in roughly ten seconds
// Rendered size. Both of these stay inside this module: it is a "use client"
// file, and a plain constant exported across that boundary into a server
// component arrives `undefined` — which silently became `bottom: NaNpx`.
const GLOBE_PX = 560;
const HALF_PX = GLOBE_PX / 2;

// Where a clinic's inbound calls come from: regional hospitals, pharmacies and
// referring providers. Illustrative of the caller mix, not a customer map.
const CALLERS: { location: [number, number]; size: number }[] = [
  { location: [37.9716, -87.5711], size: 0.05 }, // Evansville
  { location: [38.2527, -85.7585], size: 0.03 }, // Louisville
  { location: [39.7684, -86.1581], size: 0.03 }, // Indianapolis
  { location: [36.1627, -86.7816], size: 0.028 }, // Nashville
  { location: [38.627, -90.1994], size: 0.028 }, // St. Louis
];

export function CoverageGlobe({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let rafId = 0;
    let running = false;
    let t = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Resolved once. Reading a live CSSStyleDeclaration inside a render loop
    // flushes the document's pending style work every frame; this page has
    // already been bitten by that in PrismaticBurst.
    const styles = getComputedStyle(document.documentElement);
    const token = (role: string) =>
      hexToRgb(styles.getPropertyValue(role).trim());

    const build = () => {
      const side = canvas.offsetWidth;
      if (side === 0 || globe) return;

      // cobe's shading is written for a dark ground: the same base colour and
      // brightness that read as a lit sphere on near-black paint a navy blob on
      // white. Light gets a near-white sphere, a flatter diffuse and a much
      // lower map brightness, so the dot map is the only dark thing in it.
      const light = theme !== "dark";

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: side,
        height: side,
        phi: BASE_PHI,
        theta: THETA,
        dark: light ? 0 : 1,
        diffuse: light ? 0.4 : 1.2,
        mapSamples: 16_000,
        mapBrightness: light ? 1.2 : 6,
        baseColor: light ? token("--usva-accent-tint") : token("--usva-muted"),
        markerColor: token("--usva-accent"),
        glowColor: light ? token("--usva-bg") : token("--usva-accent-2"),
        markers: CALLERS,
      });
      start();
    };

    const start = () => {
      if (running || !globe) return;
      running = true;
      let frames = 0;
      const loop = () => {
        globe?.update({ phi: BASE_PHI + t, theta: THETA });
        // Reduced motion still needs a few frames to get the dot map on screen,
        // then it holds that single still image instead of animating.
        if (reduced.matches) {
          if (++frames > 3) return stop();
        } else {
          t += SPIN;
        }
        rafId = requestAnimationFrame(loop);
      };
      loop();
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Both observers do the same job at different moments: the first tells us
    // the canvas finally has a width, the second keeps the loop off whenever
    // the card is scrolled away.
    const sizeObserver = new ResizeObserver(() => {
      if (canvas.offsetWidth > 0) {
        sizeObserver.disconnect();
        build();
      }
    });
    sizeObserver.observe(canvas);

    const viewObserver = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { rootMargin: "200px" },
    );
    viewObserver.observe(canvas);

    return () => {
      sizeObserver.disconnect();
      viewObserver.disconnect();
      stop();
      globe?.destroy();
    };
  }, [theme]);

  return (
    // This wrapper is the grid item and the canvas's containing block. Both
    // matter: an absolutely positioned *direct* child of a grid container is
    // laid out against its auto-placed grid area rather than the card, which
    // silently anchored the globe to the middle of the row. Its height reserves
    // the dome; the canvas hangs out of it in every other direction and is
    // cropped only by the card's own `overflow-hidden`.
    <div className={`relative ${className ?? ""}`} style={{ height: HALF_PX }}>
      <canvas
        aria-hidden="true"
        className="-translate-x-1/2 pointer-events-none absolute left-1/2 sm:-right-14 sm:translate-x-0 sm:left-auto"
        ref={canvasRef}
        // Deliberately larger than the cell it sits in: `maxWidth: 100%` would
        // shrink the sphere instead of cutting it. Sitting half a sphere below
        // the wrapper puts the equator on the card's bottom edge. cobe reads
        // this width once at init to size its buffer.
        style={{ width: GLOBE_PX, height: GLOBE_PX, bottom: -HALF_PX }}
      />
    </div>
  );
}
