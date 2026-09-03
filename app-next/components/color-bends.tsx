"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { hexToRgb } from "@/components/prismatic-burst";
import { useTheme } from "@/lib/theme";

/* ColorBends, ported from the Svelte Bits component the same way Aurora,
   RotatingText and LightRays were.

   Two departures from the source, both this repo's standing rules:

     · three is not a dependency here and does not need to become one. The
       original uses it for an orthographic camera over a full-screen plane,
       which is a fullscreen-quad shader wearing a scene graph; ogl draws the
       same thing with a Triangle and is already installed for LightRays.
     · The palette is read from role tokens off the host element rather than
       written as hex, so the ink panel's blues carry through and a retheme
       moves it. Pass `colors` to override.

   The rAF loop is gated on visibility and stops on `prefers-reduced-motion`
   after one frame, like every other canvas on this page. */

const MAX_COLORS = 8;

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;
#define MAX_COLORS ${MAX_COLORS}

uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  col *= uIntensity;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}`;

export interface ColorBendsProps {
  /** Base rotation, degrees. */
  rotation?: number;
  /** Degrees per second added to the base rotation. */
  autoRotate?: number;
  speed?: number;
  /** Up to 8 hex colours. Omit and the accent roles are read off the host. */
  colors?: string[];
  transparent?: boolean;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  /** 1–5 extra warp passes. */
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  className?: string;
}

export function ColorBends({ className, ...props }: ColorBendsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Read inside the loop, so changing a prop never tears the GL context down.
  const latest = useRef(props);
  latest.current = props;

  const theme = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: Renderer | null = null;
    let mesh: Mesh | null = null;
    let uniforms: Record<string, { value: unknown }> | null = null;
    let raf = 0;
    let running = false;
    let start = 0;

    const pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Resolved once, off the host: inside an ink panel these roles carry the
       light-on-navy values. Reading a live CSSStyleDeclaration per frame
       flushes the document's pending style work, which is what froze the tab
       when PrismaticBurst did it. */
    const styles = getComputedStyle(host);
    const role = (name: string) => styles.getPropertyValue(name).trim();
    /* One stop by default, and that is deliberate: the shader sums every
       band's colour and clamps the total, so any two light stops overlap
       their way to white. `--usva-beam` is the sky blue that survives that;
       `accent-alt` is the fallback for a theme that has not set one. */
    const palette = () =>
      (latest.current.colors ?? [
        role("--usva-beam") || role("--usva-accent-alt"),
      ])
        .filter(Boolean)
        .slice(0, MAX_COLORS)
        .map(hexToRgb);

    const build = () => {
      if (renderer || host.clientWidth === 0) return;

      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      gl.canvas.style.display = "block";
      host.replaceChildren(gl.canvas);

      const p = latest.current;
      const colors = palette();
      uniforms = {
        uCanvas: { value: [1, 1] },
        uTime: { value: 0 },
        uSpeed: { value: p.speed ?? 0.2 },
        uRot: { value: [1, 0] },
        uColorCount: { value: colors.length },
        // Fixed length: a GLSL array uniform is set in one call, and ogl
        // flattens an array of arrays for it.
        uColors: {
          value: Array.from(
            { length: MAX_COLORS },
            (_, i) => colors[i] ?? [0, 0, 0],
          ),
        },
        uTransparent: { value: (p.transparent ?? true) ? 1 : 0 },
        uScale: { value: p.scale ?? 1 },
        uFrequency: { value: p.frequency ?? 1 },
        uWarpStrength: { value: p.warpStrength ?? 1 },
        uPointer: { value: [0, 0] },
        uMouseInfluence: { value: p.mouseInfluence ?? 1 },
        uParallax: { value: p.parallax ?? 0.5 },
        uNoise: { value: p.noise ?? 0.15 },
        uIterations: { value: p.iterations ?? 1 },
        uIntensity: { value: p.intensity ?? 1.5 },
        uBandWidth: { value: p.bandWidth ?? 6 },
      };

      mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program: new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms,
          transparent: true,
        }),
      });

      place();
      window.addEventListener("resize", place);
    };

    const place = () => {
      if (!renderer || !uniforms || !mesh) return;
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = host.clientWidth;
      const h = host.clientHeight;
      const next = [
        Math.round(w * renderer.dpr),
        Math.round(h * renderer.dpr),
      ];
      const prev = uniforms.uCanvas.value as number[];
      // `setSize` reallocates the drawing buffer and clears it, so a no-op
      // resize would blank the canvas for a frame.
      if (prev[0] === next[0] && prev[1] === next[1]) return;

      renderer.setSize(w, h);
      uniforms.uCanvas.value = next;
      renderer.render({ scene: mesh });
    };

    const frame = (now: number) => {
      if (!renderer || !uniforms || !mesh) return;
      const p = latest.current;
      if (!start) start = now;
      const elapsed = (now - start) * 0.001;

      uniforms.uTime.value = elapsed;
      uniforms.uSpeed.value = p.speed ?? 0.2;
      uniforms.uScale.value = p.scale ?? 1;
      uniforms.uFrequency.value = p.frequency ?? 1;
      uniforms.uWarpStrength.value = p.warpStrength ?? 1;
      uniforms.uMouseInfluence.value = p.mouseInfluence ?? 1;
      uniforms.uParallax.value = p.parallax ?? 0.5;
      uniforms.uNoise.value = p.noise ?? 0.15;
      uniforms.uIterations.value = p.iterations ?? 1;
      uniforms.uIntensity.value = p.intensity ?? 1.5;
      uniforms.uBandWidth.value = p.bandWidth ?? 6;

      const deg = ((p.rotation ?? 90) % 360) + (p.autoRotate ?? 0) * elapsed;
      const rad = (deg * Math.PI) / 180;
      uniforms.uRot.value = [Math.cos(rad), Math.sin(rad)];

      smooth.x += (pointer.x - smooth.x) * 0.12;
      smooth.y += (pointer.y - smooth.y) * 0.12;
      uniforms.uPointer.value = [smooth.x, smooth.y];

      renderer.render({ scene: mesh });
      if (!reduced.matches) raf = requestAnimationFrame(frame);
      else running = false;
    };

    const run = () => {
      if (running || !mesh) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove);

    const view = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? (build(), run()) : stop()),
      { threshold: 0.05 },
    );
    view.observe(host);

    let settle = 0;
    const size = new ResizeObserver(() => {
      if (!renderer) return build();
      clearTimeout(settle);
      settle = window.setTimeout(place, 120);
    });
    size.observe(host);

    return () => {
      view.disconnect();
      size.disconnect();
      clearTimeout(settle);
      stop();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", place);
      renderer?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      host.replaceChildren();
      renderer = null;
      uniforms = null;
      mesh = null;
    };
    // Rebuilt on a palette change: the colours are resolved at build time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full overflow-hidden ${className ?? ""}`}
    />
  );
}
