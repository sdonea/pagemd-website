"use client";

import { useState } from "react";
import { SulaSegmented } from "@usva-ui/react/sula/sula-segmented";
import { useTheme } from "@/lib/theme";
import { Panel } from "@usva-ui/react/patterns/panel";
import { EmptyState } from "@usva-ui/react/patterns/empty-state";
import { Skeleton } from "@usva-ui/react/primitives/skeleton";
import { Button } from "@usva-ui/react/primitives/button";
import { cn } from "@usva-ui/react/cn";
import { PhoneMockupCard } from "@/components/ui/phone-mockup";
import { BrandMark } from "@/components/brand";
import { BrailleLoader } from "@/components/ui/braille-loader";
import {
  FileText,
  Grid3x3,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
} from "lucide-react";
import {
  SCENARIOS,
  SCENARIO_ORDER,
  type ScenarioId,
} from "@/lib/scenarios";
import { useCallPlayer } from "@/lib/use-call-player";

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;


function Waveform({ active, caller }: { active: boolean; caller: boolean }) {
  return (
    // Colour lives here, not on the loader: BrailleLoader hardcodes
    // `text-current`, which wins over any `text-*` passed in via className, so
    // the only way to tint it is to set the inherited colour on an ancestor.
    <div
      className={cn(
        "flex h-8 items-center justify-center transition-colors duration-base",
        active
          ? caller
            ? "text-accent"
            : "text-accent-alt"
          : "text-border-strong",
      )}
      aria-hidden
    >
      {active ? (
        <BrailleLoader variant="equalizer" fontSize={24} />
      ) : (
        // The loader has no paused state, so idle renders a flat row of the same
        // five braille cells rather than bars bouncing with no call running.
        <span className="font-mono text-[24px] leading-none">
          {"\u28C0\u28C0\u28C0\u28C0\u28C0"}
        </span>
      )}
    </div>
  );
}

function CallControl({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-full border transition-colors duration-base active:translate-y-px",
        pressed
          ? "border-transparent bg-ink text-bg"
          : "border-border bg-surface-2 text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function CallDemo() {
  const theme = useTheme();
  const [scenario, setScenario] = useState<ScenarioId>("nurse");
  const [keypad, setKeypad] = useState(false);
  const {
    phase,
    elapsed,
    speaker,
    lines,
    fields,
    muted,
    setMuted,
    start,
    reset,
  } = useCallPlayer(scenario);

  const running = phase === "playing";

  return (
    <div className="space-y-8">
      {/* The demo is one region and SulaSegmented is its one sula element.
          Its liquid field resolves the role tokens once at mount, so the key
          remounts it when the palette flips — otherwise the thumb keeps kajo's
          near-black on the light ground. */}
      <SulaSegmented
        key={theme}
        className="mx-auto w-fit"
        items={SCENARIO_ORDER.map((id) => ({
          value: id,
          label: SCENARIOS[id].label,
        }))}
        value={scenario}
        onValueChange={(v) => setScenario(v as ScenarioId)}
        aria-label="Call scenario"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        {/* The phone. `PhoneMockupCard` is the nexvyn registry frame, retokened
            onto usva roles; everything inside it is the call UI as before. The
            frame owns a fixed aspect ratio and clips, so the screen content is
            a flex column with the controls pushed to the bottom rather than a
            plain flow. `pt-11` clears the dynamic island. */}
        <div className="mx-auto w-full max-w-[20rem]">
          <PhoneMockupCard className="w-full shadow-overlay">
            <div className="flex h-full flex-col px-5 pt-11 pb-7">
            <div className="flex items-center justify-between font-mono text-xs text-muted">
              <span>9:41</span>
              <span aria-live="polite">{clock(elapsed)}</span>
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              {/* The caller sees PageMD, so the avatar is the mark itself. The
                  wrapper is only the pulse host now — its radius matches the
                  mark's own rx (44 of 200) so the ring hugs the tile. */}
              <div
                className={cn(
                  "grid size-20 place-items-center rounded-[22%] transition-transform duration-slow ease-soft",
                  speaker === "ai" &&
                    "motion-safe:animate-[orb_1.6s_ease-in-out_infinite]",
                )}
                aria-hidden
              >
                <BrandMark id="call" className="size-20" />
              </div>
              <p className="text-ink mt-4 text-lg font-bold">PageMD</p>
              <p className="text-muted text-sm">Riverside Family Medicine</p>
              <p
                className={cn(
                  "mt-3 h-5 text-xs font-semibold tracking-wide uppercase transition-opacity duration-base",
                  speaker ? "opacity-100" : "opacity-0",
                  speaker === "caller" ? "text-accent" : "text-accent-alt",
                )}
                aria-live="polite"
              >
                {speaker === "caller" ? "Caller speaking" : "PageMD speaking"}
              </p>
              <div className="mt-2 w-full">
                <Waveform active={!!speaker} caller={speaker === "caller"} />
              </div>
            </div>

            {/* Live transcript */}
            <div className="mt-5 min-h-[7.5rem] flex-1 overflow-hidden rounded-xl border border-border bg-surface p-3 text-left">
              <p className="text-muted mb-2 font-mono text-[0.6rem] tracking-widest uppercase">
                Live transcription
              </p>
              <div className="space-y-2" aria-live="polite">
                {lines.length === 0 ? (
                  <p className="text-muted text-sm">
                    Tap the call button to start
                  </p>
                ) : (
                  lines.map((line, i) => (
                    <p
                      key={`${i}-${line.text.slice(0, 12)}`}
                      className={cn(
                        "text-sm leading-snug",
                        i === lines.length - 1 ? "text-ink" : "text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "mr-1.5 font-mono text-[0.6rem] tracking-wider uppercase",
                          line.speaker === "caller"
                            ? "text-accent"
                            : "text-accent-alt",
                        )}
                      >
                        {line.speaker === "ai" ? "PageMD" : "Caller"}
                      </span>
                      {line.text}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 flex shrink-0 items-center justify-center gap-3">
              <CallControl
                label={muted ? "Unmute" : "Mute"}
                pressed={muted}
                onClick={() => setMuted(!muted)}
              >
                {muted ? (
                  <MicOff className="size-4" />
                ) : (
                  <Mic className="size-4" />
                )}
              </CallControl>
              <button
                type="button"
                onClick={() => (running ? reset() : start())}
                aria-label={
                  running
                    ? "End call"
                    : phase === "complete"
                      ? "Replay call"
                      : "Start call"
                }
                className={cn(
                  "grid size-14 place-items-center rounded-full shadow-floating transition-colors duration-base active:translate-y-px",
                  running
                    ? "bg-danger text-bg"
                    : "bg-live text-bg shadow-[var(--usva-glow-accent-strong)]",
                )}
              >
                {running ? (
                  <PhoneOff className="size-6" />
                ) : (
                  <Phone className="size-6" />
                )}
              </button>
              <CallControl
                label="Keypad"
                pressed={keypad}
                onClick={() => setKeypad(!keypad)}
              >
                <Grid3x3 className="size-4" />
              </CallControl>
            </div>
            </div>
          </PhoneMockupCard>

          <p className="text-muted mt-4 text-center text-xs" aria-live="polite">
            {running ? (
              "Call in progress…"
            ) : phase === "complete" ? (
              <>
                Call complete ·{" "}
                <strong className="text-ink">page sent to provider</strong>
              </>
            ) : (
              <>
                Tap <strong className="text-live">the button</strong> to start
                the call
              </>
            )}
          </p>
        </div>

        {/* The page that comes out of it */}
        <Panel
          title="Structured page"
          eyebrow="Delivered to provider"
          badge={
            phase !== "idle" ? (
              <span
                className={cn(
                  "font-mono text-[0.65rem] tracking-[0.18em] uppercase",
                  running ? "text-accent" : "text-accent-alt",
                )}
              >
                {running ? "Live" : "Sent"}
              </span>
            ) : null
          }
          surface="elevated"
          className="min-h-[22rem]"
        >
          {fields.length === 0 ? (
            /* Three states, not one: idle, waiting on the first capture, and
               populated. The middle is a real wait — the AI has to hear a name
               before it has anything to write down. */
            running ? (
              <div aria-live="polite" aria-busy className="space-y-4 py-2">
                <span className="sr-only">Listening for the first capture</span>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
                  >
                    <Skeleton variant="text" width="5.5rem" />
                    <Skeleton variant="text" width={i === 1 ? "90%" : "65%"} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                variant="dashed"
                icon={<FileText className="size-5" />}
                title="Nothing paged yet"
                description="Start the call and the structured message routed to your provider builds here, field by field."
              />
            )
          ) : (
            <dl className="divide-y divide-border">
              {fields.map((field, i) => (
                <div
                  key={`${field.label}-${i}`}
                  className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="text-muted font-mono text-[0.65rem] tracking-widest uppercase">
                    {field.label}
                  </dt>
                  <dd className="text-ink text-sm leading-relaxed">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>
    </div>
  );
}
