import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@usva-ui/react/primitives/button";
import { Reveal } from "@usva-ui/react/motion/reveal";
import { BrandDithered404 } from "@/components/brand-dithered-404";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist. Head back to PageMD.",
};

export default function NotFound() {
  return (
    // The canvas is pinned to this section, so it has to be the positioned
    // ancestor and it has to have height of its own.
    // `justify-end`, not `justify-center`: the canvas centres its glyphs in
    // this box, so centred copy lands directly on top of the 404 and neither
    // reads. The copy sits in the lower band instead, clear of the numerals.
    <section className="relative isolate flex min-h-svh flex-col items-center justify-end overflow-hidden px-6 pb-[14vh] text-center">
      <BrandDithered404 />

      {/* Sibling, not a child: the component draws the 404 glyphs itself. */}
      <Reveal variant="veil" className="relative z-10 block">
        <p className="text-muted mx-auto max-w-md text-lg leading-relaxed">
          That page does not exist. The line is still open, though.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="solid" size="lg">
            <Link href="/">Back to PageMD</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/#demo">Hear a live call</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
