"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@usva-ui/react/primitives/button";
import { useEffect } from "react";
import { followSystemTheme, setTheme, useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  /* THEME_SCRIPT reads the OS preference once, before paint. This keeps
     following it while the visitor has made no choice of their own, so
     flipping the system setting flips the page. */
  useEffect(followSystemTheme, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      iconOnly
      shape="rounded"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
