"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@usva-ui/react/cn";

type StaggerFrom = "first" | "last" | "center" | "random" | number;
type SplitBy = "characters" | "words" | "lines" | (string & {});

export interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  loop?: boolean;
  auto?: boolean;
  splitBy?: SplitBy;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  transitionDamping?: number;
  transitionStiffness?: number;
  initialY?: string | number;
  animateY?: string | number;
  exitY?: string | number;
  onNext?: (index: number) => void;
  style?: React.CSSProperties;
}

function splitIntoCharacters(s: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(seg.segment(s), (g) => g.segment);
  }
  return Array.from(s);
}

/* RotatingText, ported from the Svelte Bits component. The Svelte original
   drives the spring imperatively because Svelte has no AnimatePresence; in
   React the exit animation is declarative, so the swap queue and the manual
   `animate()` calls collapse into one <AnimatePresence mode="wait">. */
export function RotatingText({
  texts,
  rotationInterval = 2000,
  staggerDuration = 0,
  staggerFrom = "first",
  loop = true,
  auto = true,
  splitBy = "characters",
  mainClassName,
  style,
  splitLevelClassName,
  elementLevelClassName,
  transitionDamping = 30,
  transitionStiffness = 420,
  initialY = "100%",
  animateY = 0,
  exitY = "-100%",
  onNext,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  const elements = useMemo(() => {
    const value = texts[index] ?? "";
    if (splitBy === "characters") {
      const words = value.split(" ");
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    const parts =
      splitBy === "words"
        ? value.split(" ")
        : splitBy === "lines"
          ? value.split("\n")
          : value.split(splitBy);
    return parts.map((part, i) => ({
      characters: [part],
      needsSpace: i !== parts.length - 1,
    }));
  }, [texts, index, splitBy]);

  const total = elements.reduce((sum, w) => sum + w.characters.length, 0);

  const delayFor = useCallback(
    (i: number) => {
      if (staggerFrom === "first") return i * staggerDuration;
      if (staggerFrom === "last") return (total - 1 - i) * staggerDuration;
      if (staggerFrom === "center")
        return Math.abs(Math.floor(total / 2) - i) * staggerDuration;
      if (staggerFrom === "random")
        return (
          Math.abs(Math.floor(Math.random() * total) - i) * staggerDuration
        );
      return Math.abs(staggerFrom - i) * staggerDuration;
    },
    [staggerFrom, staggerDuration, total],
  );

  useEffect(() => {
    if (!auto || texts.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i === texts.length - 1 ? (loop ? 0 : i) : i + 1));
    }, rotationInterval);
    return () => clearInterval(id);
  }, [auto, loop, rotationInterval, texts.length]);

  /* Reported after the swap commits, never from inside the setIndex updater.
     React is free to call an updater during render, and notifying the parent
     from there is a setState on a different component mid-render — which is
     exactly what the Hero's underline listener tripped. The ref keeps an inline
     callback from restarting the interval on every render. */
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);
  useEffect(() => {
    onNextRef.current?.(index);
  }, [index]);

  return (
    /* A fixed, clipped line box. The characters enter from +100% and leave at
       -120%, so without `overflow-hidden` they spill over whatever sits above
       and below; without a reserved height the line collapses to nothing the
       moment a phrase exits, and the page jumps. */
    <span
      className={cn(
        "relative block min-h-[1.42em] overflow-hidden",
        mainClassName,
      )}
      /* `--rt-len` is the current phrase's character count. Phrases here range
         from two characters to thirty-five, so no single font size fits them
         all on one line; a caller can size off this to fit each one. */
      style={{ ["--rt-len" as string]: texts[index].length, ...style }}
    >
      {/* The only copy a screen reader sees; the glyphs are decorative. */}
      <span className="sr-only" aria-live="polite">
        {texts[index]}
      </span>
      {/* Not `mode="wait"`: waiting for a staggered exit to finish leaves the
          line visibly empty for half a second, which reads as broken. Both
          phrases coexist for a beat instead, and the exit is fast and
          unstaggered so the outgoing word is gone almost immediately. The
          absolute child means neither costs any layout. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={index}
          aria-hidden
          className="absolute inset-0 flex flex-nowrap items-center justify-center whitespace-pre leading-none"
        >
          {elements.map((word, wordIndex) => {
            const before = elements
              .slice(0, wordIndex)
              .reduce((sum, w) => sum + w.characters.length, 0);
            return (
              <span
                key={wordIndex}
                className={cn("inline-flex", splitLevelClassName)}
              >
                {word.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    className={cn("inline-block", elementLevelClassName)}
                    initial={{ y: initialY, opacity: 0 }}
                    animate={{ y: animateY, opacity: 1 }}
                    exit={{
                      y: exitY,
                      opacity: 0,
                      transition: { duration: 0.12, ease: "easeIn" },
                    }}
                    transition={{
                      type: "spring",
                      damping: transitionDamping,
                      stiffness: transitionStiffness,
                      delay: delayFor(before + charIndex),
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                {word.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
