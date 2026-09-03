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

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

---

# app-next/ — the usva rebuild

The site is being rebuilt in `app-next/` as a Next.js 16 App Router app on the
**usva** design system. The legacy single-file site above still lives at the repo
root and is untouched; nothing has been cut over yet.

```
cd app-next && bun run dev     # http://localhost:3000
cd app-next && bun run build   # all 5 routes prerender static
```

## Never hand-roll a component

**Search a registry first.** Writing a component from scratch is the last resort,
not the first move. Page-level composition and layout are fine to write directly;
reusable widgets are not.

`components.json` is wired for both registries — verified working:

```bash
npx shadcn@latest view @usva/button      # inspect before installing
npx shadcn@latest add @usva/segmented-control
npx shadcn@latest add accordion --dry-run   # shadcn/ui default registry
npx shadcn@latest search <term>
```

`shadcn init` was deliberately **not** run: it rewrites `globals.css` and would
fight the kajo theme. `components.json` is hand-written, and `lib/utils.ts`
re-exports usva's `cn` so registry components resolve `@/lib/utils` without a
second copy of the helper.

The bottom of `globals.css` carries a **token-collision guard** re-asserting
`border`, `border-strong`, `accent`, `muted` and `ring` from the usva vars.
`border`/`accent`/`muted`/`ring` are role names in both systems and whichever
`@theme inline` block lands last wins. Keep that block at the end of the file.

## usva rules that bite

Read `.claude/skills/usva/SKILL.md` before touching UI — it carries the library's
own failure modes. The ones this repo has already hit:

- **Tailwind must scan node_modules.** `@source "../node_modules/@usva-ui/react/dist"`
  in `globals.css`. Without it every usva component renders unstyled and nothing errors.
- **Import from the subpath**, never the barrel: `@usva-ui/react/primitives/button`.
- **`HeroSplit` needs a container ancestor.** It puts `@container` and its `@5xl:`
  variants on the same element, and an element cannot match its own container query,
  so the split silently never happens unless a parent is a container.
- **Sula canvases paint wider than their host.** `html, body { overflow-x: clip }`
  guards the horizontal scrollbar. `clip`, not `hidden` — `hidden` breaks sticky.
- **Never wrap a sula or atmosphere canvas in something that animates `transform`
  or `clip-path`.** Chrome blanks the canvas and nothing errors.
- **SulaNav's reveal takes ~3s.** A screenshot before that shows the bar without its
  brand or satellites. Not a bug.

## Intensity budget

One sula element per region, at most. Currently: `SulaNav` owns the header,
`SulaSegmented` owns the demo's scenario picker. Nothing else asserts.

## Theme

Stock **kajo** (usva's dark default), with three token moves in `globals.css` and
no forked components:

- fonts → Fira Sans / Fira Code via `next/font`
- `--usva-accent-alt`, `--usva-live`, `--usva-success` → blue, so **nothing on the
  site is green**

Retheme by moving role tokens. Never a raw hex, never fork a component for a colour.

**Light mode** is a `[data-theme="light"]` role block at the bottom of
`globals.css` — the legacy brand's palette, not usva's `savi`. Dark's attribute
value is `kajo`, not `dark`, because kajo declares itself at `:root`.
`lib/theme.ts` owns the switch: `setTheme`, a `useTheme()` store, and
`THEME_SCRIPT` (inlined in `<head>` so a stored preference does not flash).

Anything that reads role tokens through `getComputedStyle` resolves them **once
at mount** and will not re-read them — that covers every WebGL canvas here
(`PrismaticBurst`, `LightRays`, the globe, the stretchy footer, the dithered
404) and usva's own sula components. They all take `useTheme()` as an effect
dep or a remount `key`. Add a new one and it needs the same, or it keeps the
palette it was born with.

They also need their **strength** halved on light. Every one of these effects
was drawn to glow on a near-black ground: on white the same energy reads as
grey smears. The hero burst drops `mix-blend-mode: lighten` for plain
compositing at `opacity-30`, and `LightRays` pulls back to `opacity-25`.
`darken` is not the fix — the burst's own highlights are neutral, so it paints
soot.

## Design constraints from the owner

- **No pills.** No lozenge-shaped chips, badges, or announcement bars anywhere in
  page content. Circles (call buttons, list bullets) are fine. The one exception is
  SulaNav itself, whose liquid bar is inherently pill-shaped.
- **No green.**
- The **hero is centred**, has no phone imagery, and uses `<Aurora />` full-bleed
  behind a rotating headline (`Medical paging, but …`).
- The **real logo** is `components/brand.tsx` — the aurora-filled mark from the
  legacy site's `<symbol id="pagemd-mark">`. A logo keeps its own colours; the role
  tokens govern the UI around it, not the identity.

## Ported components

`components/aurora.tsx` and `components/rotating-text.tsx` are Svelte Bits
components ported to React at the owner's request. Aurora reads its gradient from
the live role tokens rather than hardcoded hex.

## Signup form

`NEXT_PUBLIC_FORM_ENDPOINT` is unset. Until it is set, the form shows an explicit
error rather than pretending to send. Create a Formspree form pointing at
`sebdonea@yahoo.com` and set the env var.
