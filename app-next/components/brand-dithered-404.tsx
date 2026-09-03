"use client";

import { useEffect, useState } from "react";
import { Dithered404 } from "@/components/ui/dithered-404";
import { useTheme } from "@/lib/theme";

/* The 23rd.dev dithered 404, pinned to this site's theme and palette.

   Two things it gets wrong here on its own:
     · `theme="auto"` resolves dark mode from `html.dark`, `data-theme="dark"`,
       then the OS setting. This site's dark attribute value is "kajo", so auto
       would hand a light palette to anyone whose system is set to light. It is
       driven off the site's own theme instead.
     · `color` wants a concrete hex, and its default is a stock zinc. Resolved
       from the accent role token instead, so a retheme carries through and no
       raw hex lands in the file. */
export function BrandDithered404() {
  const theme = useTheme();
  const [color, setColor] = useState<string>();

  useEffect(() => {
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--usva-accent")
      .trim();
    if (accent) setColor(accent);
  }, [theme]);

  // Waiting for the token keeps the stock zinc from flashing on first frame.
  if (!color) return null;

  return (
    <Dithered404
      className="absolute inset-0"
      color={color}
      theme={theme}
      pixelSize={4}
      brush={28}
    />
  );
}
