import { cn } from "@usva-ui/react/cn";

export function Section({
  id,
  className,
  children,
  tone = "bg",
  backdrop,
  ink,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "bg" | "surface" | "sunken";
  /** Full-bleed layer painted behind the content. Gets its own stacking
   *  context so it cannot escape the section or sit over the copy. */
  backdrop?: React.ReactNode;
  /** Paints the band on the navy ink ground in light mode, so additive light
   *  (rays, glows) has something to read against. No-op in kajo. */
  ink?: boolean;
}) {
  return (
    <section
      id={id}
      data-theme={ink ? "ink" : undefined}
      className={cn(
        "scroll-mt-28 border-t border-border py-24 sm:py-32",
        backdrop && "relative isolate overflow-hidden",
        tone === "surface" && "bg-surface",
        tone === "sunken" && "bg-sunken",
        className,
      )}
    >
      {backdrop && (
        <div className="pointer-events-none absolute inset-0 z-0">
          {backdrop}
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        {children}
      </div>
    </section>
  );
}
