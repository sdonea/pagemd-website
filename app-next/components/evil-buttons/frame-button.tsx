"use client";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import type { UrlObject } from "url";
import type { Route } from "next";

type ButtonVariant = "outline" | "default" | "secondary";
const MotionLink = motion.create(Link);
type Href = Route | UrlObject;

type BaseProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  glow?: boolean;
  size?: number | string;
  offset?: number;
  hoverOffset?: number;
};

type ButtonProps = BaseProps &
  ComponentPropsWithoutRef<typeof motion.button> & {
    as?: "button";
    href?: never;
  };

type AnchorProps = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof motion.a>, "href"> & {
    as: "link";
    href: Href;
  };

type FrameButtonProps = ButtonProps | AnchorProps;

export function FrameButton({
  children,
  className,
  variant = "default",
  glow = false,
  size = 20,
  offset = 7.5,
  hoverOffset = 7,
  ...props
}: FrameButtonProps) {
  const commonStyles = cn(
    "group relative inline-flex overflow-visible items-center justify-center",
    "border px-8 py-4",
    "cursor-pointer no-underline",
    "uppercase tracking-[0.2em]",
    "text-sm font-medium",
    "transition-all duration-300",
    "select-none",

    // Retokened onto usva roles. The registry ships `dark:` variants, but
    // this site is dark at `:root` via the kajo theme with no `dark` class, so
    // `dark:` resolves off the visitor's OS preference and would flip the
    // button to its light branch for anyone whose system is set to light.
    "text-ink border-[1.5px] border-current/30",

    "hover:bg-current/10",

    "active:scale-[0.985]",

    variant === "default" && [
      "bg-accent text-on-accent border-transparent hover:bg-accent-2",
    ],

    variant === "secondary" && [
      "text-ink hover:bg-accent hover:text-on-accent",
    ],

    variant === "outline" && ["bg-transparent", "hover:bg-current/10"],

    className,
  );

  const glowLayer = glow ? (
    <div
      className={cn(
        "absolute inset-0 -z-10 opacity-0 blur-2xl",
        "group-hover:opacity-40",
        "group-hover:scale-110",
      )}
      style={{
        background: "currentColor",
      }}
    />
  ) : null;

  const Content = (
    <>
      {glowLayer}
      {children}
      <FrameMarkers size={size} offset={offset} hoverOffset={hoverOffset} />
    </>
  );

  if (props.as === "link") {
    const { as, href, ...anchorProps } = props;

    return (
      <MotionLink
        href={href}
        className={commonStyles}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        {...anchorProps}>
        {Content}
      </MotionLink>
    );
  }

  const { as, ...buttonProps } = props;

  return (
    <motion.button className={commonStyles} {...buttonProps}>
      {Content}
    </motion.button>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

export function ChevronDownLeft({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down-left",
        className,
      )}
      {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 8v8h8" />
    </svg>
  );
}

export function ChevronDownRight({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down-right",
        className,
      )}
      {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M16 8v8h-8" />
    </svg>
  );
}

export function ChevronUpLeft({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-left",
        className,
      )}
      {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 16v-8h8" />
    </svg>
  );
}

export function ChevronUpRight({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right",
        className,
      )}
      {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M16 16v-8h-8" />
    </svg>
  );
}

interface FrameMarkersProps {
  className?: string;
  size?: number | string;
  offset?: number;
  hoverOffset?: number;
}

export function FrameMarkers({
  className,
  size = 20,
  offset = 7.5,
  hoverOffset = 4,
}: FrameMarkersProps) {
  const isSizeString = typeof size === "string" && size.includes("-");

  const baseStyles = cn(
    // `muted-foreground` / `accent-foreground` are shadcn role names and do not
    // exist here. Colouring the markers independently of the button's text also
    // keeps them visible on the solid variant, where `currentColor` would be
    // the near-black ink that sits on the accent fill.
    "absolute text-muted transition-all duration-300 ease-out",
    "group-hover:text-accent pointer-events-none",
    isSizeString ? size : "",
    className,
  );

  const styleBase = isSizeString ? {} : { width: size, height: size };
  const offsetPx = `-${offset}px`;
  const movePx = `${hoverOffset}px`;
  const negMovePx = `-${hoverOffset}px`;

  return (
    <>
      {/* Top Left */}
      <ChevronUpLeft
        style={
          {
            ...styleBase,
            top: offsetPx,
            left: offsetPx,
            "--move-x": negMovePx,
            "--move-y": negMovePx,
          } as unknown as React.CSSProperties
        }
        className={cn(
          baseStyles,
          "group-hover:transform-[translate(var(--move-x),var(--move-y))]",
        )}
      />
      {/* Top Right */}
      <ChevronUpRight
        style={
          {
            ...styleBase,
            top: offsetPx,
            right: offsetPx,
            "--move-x": movePx,
            "--move-y": negMovePx,
          } as unknown as React.CSSProperties
        }
        className={cn(
          baseStyles,
          "group-hover:transform-[translate(var(--move-x),var(--move-y))]",
        )}
      />
      {/* Bottom Right */}
      <ChevronDownRight
        style={
          {
            ...styleBase,
            bottom: offsetPx,
            right: offsetPx,
            "--move-x": movePx,
            "--move-y": movePx,
          } as unknown as React.CSSProperties
        }
        className={cn(
          baseStyles,
          "group-hover:transform-[translate(var(--move-x),var(--move-y))]",
        )}
      />
      {/* Bottom Left */}
      <ChevronDownLeft
        style={
          {
            ...styleBase,
            bottom: offsetPx,
            left: offsetPx,
            "--move-x": negMovePx,
            "--move-y": movePx,
          } as unknown as React.CSSProperties
        }
        className={cn(
          baseStyles,
          "group-hover:transform-[translate(var(--move-x),var(--move-y))]",
        )}
      />
    </>
  );
}
