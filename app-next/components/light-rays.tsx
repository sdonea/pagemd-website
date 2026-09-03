"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { hexToRgb } from "@/components/prismatic-burst";

/* LightRays, ported from the Svelte Bits component at the owner's request, the
   same way Aurora and RotatingText were.

   Three changes from the original, all of them things this repo has already
   been bitten by with the hero's PrismaticBurst:

     · The colour is read from a role token rather than passed as a hex, so a
       retheme carries through and no raw hex lands in a component.
     · The original's IntersectionObserver only ever *starts* the loop. Here it
       stops it too, so a second WebGL canvas is not running rAF for the whole
       page once you scroll past it.
     · `prefers-reduced-motion` renders a single frame and stops, rather than
       animating regardless.

   Props are read through a ref inside the loop so changing one never tears the
   GL context down and rebuilds it. */

export type RaysOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "right"
  | "left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

export interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  /** Hex. Omit it and the rays take `--usva-accent`. */
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

function anchorAndDir(origin: RaysOrigin, w: number, h: number) {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default:
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
}

export function LightRays({ className, ...props }: LightRaysProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // The loop reads props through this, so a prop change never rebuilds the
  // GL context.
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

    const mouse = { x: 0.5, y: 0.5 };
    const smooth = { x: 0.5, y: 0.5 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Resolved once, off the host rather than the document: inside an
    // `.ink-panel` the accent is re-declared to its light-on-navy value, and
    // reading the root would take the page's dark-on-white one instead.
    // Reading a live CSSStyleDeclaration inside the render loop flushes the
    // document's pending style work every frame, which is what froze the tab
    // when PrismaticBurst did it.
    const accent = getComputedStyle(host)
      .getPropertyValue("--usva-accent")
      .trim();
    const colorOf = (hex?: string) => hexToRgb(hex ?? accent);

    const build = () => {
      if (renderer || host.clientWidth === 0) return;

      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: true,
      });
      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      host.replaceChildren(gl.canvas);

      const p = latest.current;
      uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: colorOf(p.raysColor) },
        raysSpeed: { value: p.raysSpeed ?? 1 },
        lightSpread: { value: p.lightSpread ?? 1 },
        rayLength: { value: p.rayLength ?? 2 },
        pulsating: { value: p.pulsating ? 1 : 0 },
        fadeDistance: { value: p.fadeDistance ?? 1 },
        saturation: { value: p.saturation ?? 1 },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: p.mouseInfluence ?? 0.1 },
        noiseAmount: { value: p.noiseAmount ?? 0 },
        distortion: { value: p.distortion ?? 0 },
      };

      mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program: new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms,
        }),
      });

      place();
      window.addEventListener("resize", place);
      start();
    };

    const place = () => {
      if (!renderer || !uniforms || !mesh) return;
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      // `setSize` reallocates the drawing buffer, which clears it to
      // transparent. Skipping a no-op keeps an unchanged size from blanking the
      // canvas for a frame.
      const dpr = renderer.dpr;
      const next: [number, number] = [
        Math.round(host.clientWidth * dpr),
        Math.round(host.clientHeight * dpr),
      ];
      const prev = uniforms.iResolution.value as [number, number];
      if (prev[0] === next[0] && prev[1] === next[1]) return;

      renderer.setSize(host.clientWidth, host.clientHeight);
      const w = host.clientWidth * renderer.dpr;
      const h = host.clientHeight * renderer.dpr;
      uniforms.iResolution.value = [w, h];
      const { anchor, dir } = anchorAndDir(
        latest.current.raysOrigin ?? "top-center",
        w,
        h,
      );
      uniforms.rayPos.value = anchor;
      uniforms.rayDir.value = dir;
      renderer.render({ scene: mesh });
    };

    const frame = (t: number) => {
      if (!renderer || !uniforms || !mesh) return;
      const p = latest.current;

      uniforms.iTime.value = t * 0.001;
      uniforms.raysColor.value = colorOf(p.raysColor);
      uniforms.raysSpeed.value = p.raysSpeed ?? 1;
      uniforms.lightSpread.value = p.lightSpread ?? 1;
      uniforms.rayLength.value = p.rayLength ?? 2;
      uniforms.pulsating.value = p.pulsating ? 1 : 0;
      uniforms.fadeDistance.value = p.fadeDistance ?? 1;
      uniforms.saturation.value = p.saturation ?? 1;
      uniforms.mouseInfluence.value = p.mouseInfluence ?? 0.1;
      uniforms.noiseAmount.value = p.noiseAmount ?? 0;
      uniforms.distortion.value = p.distortion ?? 0;

      if ((p.followMouse ?? true) && (p.mouseInfluence ?? 0.1) > 0) {
        const s = 0.92;
        smooth.x = smooth.x * s + mouse.x * (1 - s);
        smooth.y = smooth.y * s + mouse.y * (1 - s);
        uniforms.mousePos.value = [smooth.x, smooth.y];
      }

      renderer.render({ scene: mesh });
      // Reduced motion gets the scene once and then nothing moves.
      if (!reduced.matches) raf = requestAnimationFrame(frame);
      else running = false;
    };

    const start = () => {
      if (running || !mesh) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouseMove);

    // The original only ever started the loop here. Stopping it on the way out
    // is the whole point of gating a second canvas on a long page.
    const view = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? (build(), start()) : stop()),
      { threshold: 0.05 },
    );
    view.observe(host);

    let settle = 0;
    const size = new ResizeObserver(() => {
      if (!renderer) return build();
      // Trailing debounce. The FAQ rows animate their height, which fires this
      // once per frame; resizing the GL buffer that often blanked the canvas
      // for the length of the animation. The canvas is CSS-sized at 100%, so it
      // just stretches until the height settles.
      clearTimeout(settle);
      settle = window.setTimeout(place, 120);
    });
    size.observe(host);

    return () => {
      view.disconnect();
      size.disconnect();
      clearTimeout(settle);
      stop();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", place);
      renderer?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      host.replaceChildren();
      renderer = null;
      uniforms = null;
      mesh = null;
    };
    // Rebuilt when the palette changes: the accent is resolved at build time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  /* The beams are additive light, so they only read on a dark ground. On the
     light page that ground is the section's own `.ink-panel`; put this on a
     white section and it goes back to painting grey. */
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      /* The panel's accent is a light blue so the beams read against navy, and
         at full strength they wash the ground out entirely. Half is enough to
         keep the shafts and the ground both legible. */
      className={`pointer-events-none h-full w-full overflow-hidden ${
        theme === "dark" ? "" : "opacity-45"
      } ${className ?? ""}`}
    />
  );
}
