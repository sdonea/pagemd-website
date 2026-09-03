"use client";

import { useEffect, useState } from "react";
import { StretchyFooter } from "@/components/ui/stretchy-footer";
import { hexToRgb } from "@/components/prismatic-burst";
import { useTheme } from "@/lib/theme";

/* The 23rd.dev stretchy footer, wearing PageMD's palette.

   `colors` is a plain string array on the component, so the ramp has to be
   resolved rather than written down: this repo's rule is that colour moves by
   role token and a raw hex never appears in a component. The three accent
   roles give the light half of the ramp, and the two dark stops are those same
   roles mixed toward the page background, so retheming the accent retints the
   whole footer with no edit here.

   The reference palette in the docs runs navy through teal; teal is out, since
   nothing on this site is green. This ramp is blue end to end. */

const toHex = (rgb: [number, number, number]) =>
  `#${rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("")}`;

const mix = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export function BrandStretchyFooter() {
  const theme = useTheme();
  const [colors, setColors] = useState<string[] | undefined>();

  useEffect(() => {
    // Resolved off the ink panel, not the root: this aurora is the footer's
    // continuation, and the footer sits on the navy ground in light mode. The
    // component portals to `body`, so inheritance cannot carry the scope here.
    // In kajo the panel inherits the root anyway, so this is the same read.
    const scope =
      document.querySelector('[data-theme="ink"]') ?? document.documentElement;
    const styles = getComputedStyle(scope);
    const role = (name: string) =>
      hexToRgb(styles.getPropertyValue(name).trim());

    const bg = role("--usva-bg");
    const deep = role("--usva-accent-2");
    const mid = role("--usva-accent");
    const light = role("--usva-accent-alt");

    setColors([
      toHex(mix(deep, bg, 0.72)),
      toHex(mix(deep, bg, 0.4)),
      toHex(deep),
      toHex(mid),
      toHex(light),
    ]);
  }, [theme]);

  // Nothing paints until the ramp is resolved, so the default red-to-pink
  // spectrum never flashes on first frame.
  if (!colors) return null;

  return <StretchyFooter windowScroll colors={colors} maxStretch={220} />;
}
