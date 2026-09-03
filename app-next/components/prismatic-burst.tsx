"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

/* PrismaticBurst, ported from the Svelte Bits component to React.

   Two changes from the original beyond the framework swap:
   1. Colours default to the theme's accent roles rather than the shader's own
      spectral ramp, so the burst is kajo's violet-to-blue and never green.
   2. `prefers-reduced-motion` parks it on a single frame. The upstream
      component has a `paused` prop but never checks the media query. */
const DEFAULT_ROLES = ["--usva-accent-2", "--usva-accent", "--usva-accent-alt"];

export type BurstAnimation = "rotate" | "rotate3d" | "hover";

export interface PrismaticBurstProps {
  /** Brightness. */
  intensity?: number;
  /** Animation speed. */
  speed?: number;
  animationType?: BurstAnimation;
  /** Gradient stops. Defaults to the theme's accent roles. */
  colors?: string[];
  /** Bend distortion strength, 0–50. */
  distort?: number;
  paused?: boolean;
  offset?: { x?: number | string; y?: number | string };
  /** Hover damping, 0–1. Only meaningful in `hover` mode. */
  hoverDampness?: number;
  /** Discrete ray count. 0 leaves the rays continuous. */
  rayCount?: number;
  mixBlendMode?: string;
  /**
   * Device-pixel-ratio ceiling. This shader ray-marches 44 steps per pixel, so
   * cost is linear in buffer area: at dpr 2 across a full viewport that is
   * ~6.5M pixels and ~286M loop iterations a frame, which measured at 1fps.
   * A diffuse glow field gains nothing from retina resolution.
   */
  dprCap?: number;
  /** Extra buffer downscale, CSS-stretched back up. 1 renders at full size. */
  resolutionScale?: number;
  /** Frame ceiling. The field drifts slowly; 60 is wasted on it. */
  fps?: number;
  /**
   * Ray-march depth. Cost is pixels x steps, so this is the other half of the
   * budget. Upstream ships 44; the difference below ~24 is a slightly thinner
   * accumulation, not a different picture.
   */
  steps?: number;
  className?: string;
}

const VERT = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const frag = (steps: number) => `#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int uAnimType;
uniform vec2 uMouse;
uniform int uColorCount;
uniform float uDistort;
uniform vec2 uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int uRayCount;
float hash21(vec2 p) { p = floor(p); float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005))); return fract(f); }
mat2 rot30() { return mat2(0.8, -0.5, 0.5, 0.8); }
float layeredNoise(vec2 fragPx) {
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}
vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist) { float focal = res.y * max(dist, 1e-3); return normalize(vec3(2.0 * (frag - offset) - res, focal)); }
float edgeFade(vec2 frag, vec2 res, vec2 offset) {
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y));
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }
vec3 sampleGradient(float t) { t = clamp(t, 0.0, 1.0); return texture(uGradient, vec2(t, 0.5)).rgb; }
vec2 rot2(vec2 v, float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c) * v; }
float bendAngle(vec3 q, float t) {
  float a = 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);
  return a;
}
void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = uTime * uSpeed;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
  mat2 M2 = mat2(c.x, c.y, c.z, c.w);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
  mat3 rot3dMat = mat3(1.0);
  if (uAnimType == 1) { vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17); rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x); }
  mat3 hoverMat = mat3(1.0);
  if (uAnimType == 2) { vec2 m = uMouse * 2.0 - 1.0; vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0); hoverMat = rotY(ang.y) * rotX(ang.x); }
  for (int i = 0; i < ${steps}; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));
    if (uAnimType == 0) Pl.xz *= M2;
    else if (uAnimType == 1) Pl = rot3dMat * Pl;
    else Pl = hoverMat * Pl;
    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;
    float grow = smoothstep(0.35, 3.0, marchT);
    float a1 = amp * grow * bendAngle(Pl * 0.6, t);
    float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
    vec3 Pb = Pl;
    Pb.xz = rot2(Pb.xz, a1);
    Pb.xy = rot2(Pb.xy, a2);
    float rayPattern = smoothstep(0.5, 0.7, sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t)));
    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }
    vec3 spectralDefault = 1.0 + vec3(cos(marchT * 3.0 + 0.0), cos(marchT * 3.0 + 1.0), cos(marchT * 3.0 + 2.0));
    float saw = fract(marchT * 0.25);
    float tRay = saw * saw * (3.0 - 2.0 * saw);
    vec3 userGradient = 2.0 * sampleGradient(tRay);
    vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
    vec3 base = (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral;
    col += base * rayPattern;
    marchT += stepLen;
  }
  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;
  vec3 outCol = clamp(col, 0.0, 1.0);
  fragColor = vec4(outCol, max(max(outCol.r, outCol.g), outCol.b));
}`;

const ANIM: Record<BurstAnimation, number> = { rotate: 0, rotate3d: 1, hover: 2 };

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const v = parseInt(h, 16);
  if (Number.isNaN(v) || (h.length !== 6 && h.length !== 8)) return [1, 1, 1];
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

const toPx = (v: number | string | undefined): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).trim().replace("px", ""));
  return Number.isNaN(n) ? 0 : n;
};

export function PrismaticBurst({
  intensity = 2,
  speed = 0.5,
  animationType = "rotate3d",
  colors,
  distort = 0,
  paused = false,
  offset,
  hoverDampness = 0,
  rayCount = 0,
  mixBlendMode = "lighten",
  dprCap = 1,
  resolutionScale = 0.75,
  fps = 30,
  steps = 32,
  className,
}: PrismaticBurstProps) {
  const host = useRef<HTMLDivElement>(null);
  // The rAF loop reads props through a ref so a prop change never rebuilds the
  // GL context.
  const props = useRef({
    intensity,
    speed,
    animationType,
    colors,
    distort,
    paused,
    offset,
    hoverDampness,
    rayCount,
    mixBlendMode,
  });
  props.current = {
    intensity,
    speed,
    animationType,
    colors,
    distort,
    paused,
    offset,
    hoverDampness,
    rayCount,
    mixBlendMode,
  };

  const theme = useTheme();

  useEffect(() => {
    const ctn = host.current;
    if (!ctn) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, Math.max(dprCap, 0.25)),
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
      });
    } catch {
      // No WebGL. The hero reads fine without it.
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctn.appendChild(canvas);

    const gradient = new Texture(gl, {
      image: new Uint8Array([255, 255, 255, 255]),
      width: 1,
      height: 1,
      generateMipmaps: false,
      flipY: false,
    });
    gradient.minFilter = gl.LINEAR;
    gradient.magFilter = gl.LINEAR;
    gradient.wrapS = gl.CLAMP_TO_EDGE;
    gradient.wrapT = gl.CLAMP_TO_EDGE;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: frag(Math.round(Math.min(Math.max(steps, 6), 64))),
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uSpeed: { value: 1 },
        uAnimType: { value: 1 },
        uMouse: { value: [0.5, 0.5] },
        uColorCount: { value: 0 },
        uDistort: { value: 0 },
        uOffset: { value: [0, 0] },
        uGradient: { value: gradient },
        uNoiseAmount: { value: 0.8 },
        uRayCount: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    // Resolved once, not per frame. `getPropertyValue` on a live
    // CSSStyleDeclaration forces a style recalculation, and calling it from
    // inside the render loop flushes the whole document's pending style work
    // every frame. With the rotating headline mutating the DOM alongside, that
    // pinned the main thread hard enough to freeze the tab — the ray-march
    // itself was never the bottleneck.
    const fromTokens = () => {
      const styles = getComputedStyle(document.documentElement);
      return DEFAULT_ROLES.map((role) => styles.getPropertyValue(role).trim());
    };

    let uploaded = "";
    const syncGradient = (list: string[]) => {
      const key = list.join("|");
      if (key === uploaded) return;
      uploaded = key;
      const capped = list.slice(0, 64);
      const data = new Uint8Array(capped.length * 4);
      capped.forEach((hex, i) => {
        const [r, g, b] = hexToRgb(hex);
        data.set(
          [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 255],
          i * 4,
        );
      });
      gradient.image = data;
      gradient.width = capped.length;
      gradient.height = 1;
      gradient.format = gl.RGBA;
      gradient.type = gl.UNSIGNED_BYTE;
      gradient.needsUpdate = true;
      program.uniforms.uColorCount.value = capped.length;
    };

    syncGradient(props.current.colors ?? fromTokens());
    let lastColorKey = (props.current.colors ?? []).join("|");
    let lastBlend = "";

    const scale = Math.min(Math.max(resolutionScale, 0.1), 1);
    const resize = () => {
      // The canvas is stretched back to 100% by CSS, so the buffer can be
      // smaller than the box it fills.
      renderer.setSize(
        Math.max(1, Math.round((ctn.clientWidth || 1) * scale)),
        Math.max(1, Math.round((ctn.clientHeight || 1) * scale)),
      );
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      program.uniforms.uResolution.value = [
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
      ];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(ctn);
    resize();

    const target: [number, number] = [0.5, 0.5];
    const smooth: [number, number] = [0.5, 0.5];
    const onPointer = (e: PointerEvent) => {
      const r = ctn.getBoundingClientRect();
      target[0] = Math.min(Math.max((e.clientX - r.left) / Math.max(r.width, 1), 0), 1);
      target[1] = Math.min(Math.max((e.clientY - r.top) / Math.max(r.height, 1), 0), 1);
    };
    ctn.addEventListener("pointermove", onPointer, { passive: true });

    // Offscreen and background-tab frames are skipped: this is a ray-march, and
    // it is not worth a watt when nobody is looking at it.
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]) visible = entries[0].isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(ctn);

    const apply = () => {
      const p = props.current;
      program.uniforms.uIntensity.value = p.intensity ?? 1;
      program.uniforms.uSpeed.value = p.speed ?? 1;
      program.uniforms.uAnimType.value = ANIM[p.animationType ?? "rotate3d"];
      program.uniforms.uDistort.value =
        typeof p.distort === "number" ? p.distort : 0;
      program.uniforms.uOffset.value = [toPx(p.offset?.x), toPx(p.offset?.y)];
      program.uniforms.uRayCount.value = Math.max(0, Math.floor(p.rayCount ?? 0));

      // Style writes are only made when the value actually changed; assigning
      // every frame invalidates style on every frame.
      const blend =
        p.mixBlendMode && p.mixBlendMode !== "none" ? p.mixBlendMode : "";
      if (blend !== lastBlend) {
        lastBlend = blend;
        canvas.style.mixBlendMode = blend;
      }

      // Only an explicit `colors` prop can change after mount. The token
      // fallback is never re-read from CSS inside the loop.
      if (p.colors) {
        const key = p.colors.join("|");
        if (key !== lastColorKey) {
          lastColorKey = key;
          syncGradient(p.colors);
        }
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let lastDraw = 0;
    const minDelta = 1000 / Math.min(Math.max(fps, 1), 120);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.max(0, now - last) * 0.001;
      last = now;
      // Time keeps advancing on skipped frames so the drift stays smooth and
      // frame-rate independent.
      if (!props.current.paused) elapsed += dt;
      if (!visible || document.hidden) return;
      if (now - lastDraw < minDelta) return;
      lastDraw = now;
      apply();
      const tau =
        0.02 + Math.min(Math.max(props.current.hoverDampness ?? 0, 0), 1) * 0.5;
      const a = 1 - Math.exp(-dt / tau);
      smooth[0] += (target[0] - smooth[0]) * a;
      smooth[1] += (target[1] - smooth[1]) * a;
      program.uniforms.uMouse.value = smooth;
      program.uniforms.uTime.value = elapsed;
      renderer.render({ scene: mesh });
    };

    const still = () => {
      apply();
      program.uniforms.uTime.value = 0;
      renderer.render({ scene: mesh });
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced.matches) still();
      else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    start();
    reduced.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      reduced.removeEventListener("change", start);
      ctn.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      io.disconnect();
      try {
        if (gradient.texture) gl.deleteTexture(gradient.texture);
      } catch {
        /* context already lost */
      }
      if (canvas.parentElement === ctn) ctn.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // Rebuilt only when the palette under it changes; live values otherwise
    // flow through `props`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return <div ref={host} aria-hidden className={className} />;
}
