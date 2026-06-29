# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file HTML/CSS/JS marketing landing page for **PageMD** — AI-powered paging for outpatient clinics. No build system, no framework, no package.json. Open `index.html` directly in a browser to preview.

```
open "index.html"    # macOS — opens in default browser
```

## File structure

```
index.html                        # Entire page: HTML + CSS + JS in one file
audio/
  refill/     00_ai.mp3, 01_caller.mp3, …12_ai.mp3   (13 turns)
  symptom/    00_ai.mp3, 01_caller.mp3, …10_ai.mp3   (11 turns)
  appointment/00_ai.mp3, 01_caller.mp3, …10_ai.mp3   (11 turns)
More Better PageMD Executive Summary (3).pdf          # Source brand material
```

Audio files are numbered `{turn-index}_{speaker}.mp3` where speaker is `ai` or `caller`. The JS constructs paths as `audio/{scenarioId}/{zeroPaddedIndex}_{speaker}.mp3`.

## Design system — non-negotiable

The page follows the **PageMD brand system** defined in the Claude Design bundle. Key rules:

| Token | Value |
|---|---|
| Font sans | Mulish 300–900 (Google Fonts) |
| Font serif | Source Serif 4 Italic — tagline/editorial only |
| Font mono | system `ui-monospace` — data/numbers only |
| Primary action | `#5A89F2` (brand-blue) |
| Display headings | `#2A3674` (brand-ink) |
| Page background | `#F7F9FD` (bg) |
| Card surface | `#FFFFFF` |
| Hairline border | `#E1E8F4` (line) |

**Aurora gradient** (`linear-gradient(135deg, #8B7AE8 0%, #6FA5F5 45%, #B6DDE6 100%)`) is reserved for: logo mark, hero orb backdrop, featured pricing card, footer CTA section, and icon chips. Do not apply it to arbitrary cards.

Dark sections only appear in the footer CTA (`--gradient-ink`) and footer background (`#1B2350`). The rest of the page is light.

**Never use**: Syne, Space Grotesk, Inter, mint/green as primary accent, full-page dark backgrounds outside the footer area.

## Demo JavaScript architecture

The interactive phone demo in `#demo` is the most complex piece. Critical IDs and how they're used:

| ID | Purpose |
|---|---|
| `callButton` | Toggles play/stop; gets class `start` when idle (green), loses it when active (red) |
| `callTimer` | Clock display — updated by `setInterval` |
| `avatarOrb` | Gets class `active` while AI is speaking (triggers CSS pulse animation) |
| `speakerLabel` | Gets class `show` when visible, `caller` when caller is speaking |
| `waveform` | Gets class `active` + optionally `caller` to switch waveform color |
| `captionContent` | Live transcript — JS appends `.caption-line` divs; max 3 visible |
| `outputCard` | Structured page output — JS appends `.field-row` divs as captures arrive |
| `callHint` | Status text below the phone |

`SCENARIOS` object keys: `refill`, `symptom`, `appointment`. Each has a `turns` array. Every turn has `{ speaker, text, capture? }`. The `capture` object's keys become field labels, values become field values. A value with `{ value, tag }` shape renders as a `.priority-tag` with the given class.

Audio playback falls back to Web Speech API TTS if MP3 files aren't found (graceful degradation). Never remove the TTS fallback.

`playToken` is an integer cancel-token pattern — incrementing it stops any in-flight `sleep()` or `playAudio()` promise. Do not refactor this without preserving the cancellation contract.

## Signup form

The form action is currently `REPLACE_WITH_FORMSPREE_URL`. To activate:
1. Create a form at https://formspree.io pointing to `sebdonea@yahoo.com`.
2. Replace the placeholder with the Formspree endpoint URL.

## Adding a new demo scenario

1. Add a key to `SCENARIOS` with a `turns` array.
2. Add a `<button class="demo-tab" data-scenario="{key}">` in `#demoTabs`.
3. Record/generate MP3 files into `audio/{key}/` following the `{index}_{speaker}.mp3` naming.
4. Call `preloadAudio(activeScenario)` is already wired — no code change needed there.

## Scroll reveal

Elements with class `rv` start invisible and fade+slide in on scroll via `IntersectionObserver`. Stagger delays use `rv-d1` through `rv-d4` (100ms increments). `prefers-reduced-motion` disables all animations. Do not change the threshold (`0.08`) or rootMargin without testing on mobile — aggressive values cause elements to never trigger.
