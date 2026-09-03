"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/* kajo declares itself at `:root` as well as `[data-theme="kajo"]`, and the
   light palette in globals.css is `[data-theme="light"]`. So dark is the
   attribute value "kajo", not "dark". */
const ATTR = { dark: "kajo", light: "light" } as const;
const KEY = "pagemd-theme";
const EVENT = "pagemd:theme";

/** Runs before first paint so a stored light preference never flashes dark. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t==="light"?"light":"kajo"}catch(e){}`;

/** The OS preference, live, for as long as no explicit choice is stored.
 *  Once the toggle is used that choice wins and this stops applying — which is
 *  the usual contract: an explicit preference outranks the system one. */
export function followSystemTheme() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      /* private mode: fall through and follow the system */
    }
    document.documentElement.dataset.theme = media.matches
      ? ATTR.dark
      : ATTR.light;
    window.dispatchEvent(new Event(EVENT));
  };
  apply();
  media.addEventListener("change", apply);
  return () => media.removeEventListener("change", apply);
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = ATTR[theme];
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
};

const read = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

/**
 * The theme, live. Any canvas that resolves role tokens once at mount takes
 * this as an effect dependency so it rebuilds against the new palette —
 * `getComputedStyle` was read at build time and will not update itself.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark" as const);
}
