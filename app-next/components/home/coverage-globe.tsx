"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { hexToRgb } from "@/components/prismatic-burst";
import { useTheme } from "@/lib/theme";

/* The globe from `@efferd/features-6`, kept and re-marked.

   It spins, as the block intended. What changed is the markers: stock they sit
   on San Francisco and New York, read as a coast-to-coast footprint, and PageMD
   is a pilot-stage clinic product in Evansville. So there is one mark, a
   glowing X on Evansville.

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

// Evansville, marked with the glowing X. It is drawn in HTML over the canvas
// because cobe markers are flat single-colour discs. The regional caller dots
// that used to ring it are gone: at this scale Louisville, Indianapolis,
// Nashville and St. Louis are all within a few dots of each other and merged
// into one blob sitting on top of the city.
const EVANSVILLE: [number, number] = [37.9716, -87.5711];

/* cobe's own marker projection (the `O` + `U` pair in its dist), checked
   against cobe's anchor output, so the X lands exactly where a surface marker
   would. Returns canvas fractions and z, positive on the visible hemisphere. */
function project([lat, lon]: [number, number], phi: number, theta: number) {
  const R = 0.8; // cobe's sphere radius in clip space
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180 - Math.PI;
  const px = -Math.cos(la) * Math.cos(lo) * R;
  const py = Math.sin(la) * R;
  const pz = Math.cos(la) * Math.sin(lo) * R;
  const [cp, sp, ct, st] = [Math.cos(phi), Math.sin(phi), Math.cos(theta), Math.sin(theta)];
  const x = cp * px + sp * pz;
  const y = sp * st * px + ct * py - cp * st * pz;
  const z = -sp * ct * px + st * py + cp * ct * pz;
  return { x: (x + 1) / 2, y: (1 - y) / 2, z: z / R };
}

export function CoverageGlobe({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
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
        markers: [],
      });
      start();
    };

    const start = () => {
      if (running || !globe) return;
      running = true;
      let frames = 0;
      const loop = () => {
        globe?.update({ phi: BASE_PHI + t, theta: THETA });
        const mark = markRef.current;
        if (mark) {
          const p = project(EVANSVILLE, BASE_PHI + t, THETA);
          mark.style.transform = `translate(${p.x * GLOBE_PX}px, ${p.y * GLOBE_PX}px) translate(-50%, -50%)`;
          // Fades out over the limb instead of popping when it rotates away.
          mark.style.opacity = String(Math.min(Math.max(p.z * 6, 0), 1));
        }
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
      {/* The canvas and the X share this box so the projection's fractions
          map straight onto it. */}
      <div
        className="-translate-x-1/2 pointer-events-none absolute left-1/2 sm:-right-14 sm:translate-x-0 sm:left-auto"
        // Deliberately larger than the cell it sits in: `maxWidth: 100%` would
        // shrink the sphere instead of cutting it. Sitting half a sphere below
        // the wrapper puts the equator on the card's bottom edge. cobe reads
        // the canvas width once at init to size its buffer.
        style={{ width: GLOBE_PX, height: GLOBE_PX, bottom: -HALF_PX }}
      >
        <canvas aria-hidden="true" className="absolute inset-0 size-full" ref={canvasRef} />
        <span
          ref={markRef}
          aria-hidden="true"
          className="absolute top-0 left-0 size-5 opacity-0"
          style={{
            // One tight glow that follows the strokes. A wider second layer
            // blurred into a round disc behind the X.
            filter: "drop-shadow(0 0 2px var(--usva-accent))",
          }}
        >
          <span className="bg-accent absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 rotate-45 rounded-full" />
          <span className="bg-accent absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 -rotate-45 rounded-full" />
        </span>
      </div>
    </div>
  );
}
