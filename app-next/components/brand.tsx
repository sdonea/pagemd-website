import { cn } from "@usva-ui/react/cn";

/* The real PageMD mark, lifted from the old site's <symbol id="pagemd-mark">:
   an aurora-filled rounded square holding a square and a rotated square.
   A logo keeps its own colours — the role tokens govern the UI around it, not
   the identity itself. IDs are suffixed so two marks on one page cannot
   collide in the SVG id namespace. */
export function BrandMark({
  className,
  id = "mark",
}: {
  className?: string;
  id?: string;
}) {
  const aurora = `pagemd-aurora-${id}`;
  const square = `pagemd-square-${id}`;
  const diamond = `pagemd-diamond-${id}`;

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="PageMD"
      className={cn("size-8 shrink-0", className)}
    >
      <defs>
        <linearGradient id={aurora} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B7AE8" />
          <stop offset="50%" stopColor="#6FA5F5" />
          <stop offset="100%" stopColor="#7FCBD8" />
        </linearGradient>
        <linearGradient id={square} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7A6BE0" />
          <stop offset="100%" stopColor="#5A89F2" />
        </linearGradient>
        <linearGradient id={diamond} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6FA5F5" />
          <stop offset="100%" stopColor="#9DD8E0" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="44" fill={`url(#${aurora})`} />
      <g transform="translate(100 100)">
        <rect
          x="-56"
          y="-56"
          width="112"
          height="112"
          rx="5"
          fill={`url(#${square})`}
          opacity="0.92"
        />
        <rect
          x="-56"
          y="-56"
          width="112"
          height="112"
          rx="5"
          fill={`url(#${diamond})`}
          opacity="0.78"
          transform="rotate(45)"
        />
      </g>
    </svg>
  );
}

export function BrandLockup({
  tagline = false,
  id = "mark",
}: {
  /** The strapline under the wordmark. Room for it in the footer, none in the
   *  nav — there it outruns the wordmark and makes the lockup bottom-heavy. */
  tagline?: boolean;
  id?: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      {/* Sized well inside its host. At 44px the mark filled the nav's liquid
          droplet edge to edge and spilled past the curve. */}
      <BrandMark id={id} className={tagline ? "size-9" : "size-7"} />
      <span className="flex flex-col justify-center leading-none">
        <span className="text-ink text-[1.05rem] leading-none font-bold tracking-[-0.01em]">
          PageMD
        </span>
        {tagline && (
          <span className="text-muted mt-1.5 text-[0.72rem] leading-none font-medium">
            The answering service, without the hold time.
          </span>
        )}
      </span>
    </span>
  );
}
