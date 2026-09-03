import Link from "next/link";
import { SectionHeading } from "@usva-ui/react/patterns/section-heading";
import { homeFaqs } from "@/lib/faqs";
import { FaqList } from "@/components/faq-list";
import { ColorBends } from "@/components/color-bends";
import { LightRays } from "@/components/light-rays";
import { SectionLabel } from "@usva-ui/react/patterns/section-label";
import { Pullquote } from "@usva-ui/react/patterns/pullquote";
import { Card, CardBody } from "@usva-ui/react/primitives/card";
import { Reveal } from "@usva-ui/react/motion/reveal";
import { Hero } from "@/components/home/hero";
import { Section } from "@/components/section";
import { CallDemo } from "@/components/home/call-demo";
import { CallTimeline } from "@/components/home/call-timeline";
import { FeatureSection } from "@/components/home/how-it-works";
import { SignupForm } from "@/components/home/signup-form";


export default function Home() {
  return (
    <>
      <Hero />

      {/* ── The proof line ─────────────────────────────────────────────── */}
      <Section id="problem" tone="surface">
        <Reveal variant="veil">
          <CallTimeline />
        </Reveal>
        <Reveal variant="veil" delay={0.1}>
          <p className="text-ink mx-auto mt-12 max-w-3xl text-center text-2xl leading-snug font-light sm:text-3xl">
            From call to page in{" "}
            <strong className="font-extrabold">under 60 seconds</strong>. Every
            call gets answered and routed to the right provider, before the
            caller even has time to hang up.
          </p>
        </Reveal>
      </Section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <Section id="how">
        {/* A bento wants the full column, so the heading sits above it rather
            than beside it as the other split sections do. */}
        <Reveal variant="veil">
          <SectionHeading
            eyebrow="How PageMD works"
            title={
              <>
                Replace the operator.
                <br />
                <span className="text-muted">Not your workflow.</span>
              </>
            }
            as="h2"
          />
          <p className="text-muted mt-6 max-w-2xl leading-relaxed">
            PageMD answers and processes inbound calls through a conversational
            AI built specifically for clinical communication. No workflow change
            required.
          </p>
        </Reveal>
        <Reveal variant="veil" delay={0.1}>
          <div className="mt-14">
            <FeatureSection />
          </div>
        </Reveal>
      </Section>

      {/* ── The demo ───────────────────────────────────────────────────── */}
      <Section id="demo" tone="surface">
        <Reveal variant="veil">
          <SectionLabel
            index="01"
            title="See it in action"
            description="Pick a scenario and start the call. Watch the phone on the left, and see the structured page get built for your provider in real time on the right."
            className="mb-12"
          />
        </Reveal>
        <CallDemo />
      </Section>

      {/* ── The questions that stall a decision ────────────────────────
          The three a clinic actually hesitates on, pulled from the same data
          /faq renders so the two can never disagree. Composed from usva's
          DisclosureRow rather than a hand-rolled accordion. */}
      <Section
        id="questions"
        /* The ink panel is what makes the rays work on the light page: they are
           additive light, so the band carries the dark ground and the beams
           read as light rather than grey. Inert in kajo, which is dark already. */
        className="bg-bg"
        ink
        /* Rays from the top, in the accent, aimed down past the heading and
           behind the cards. `mouseInfluence` is low and `followMouse` on, so
           the beams lean toward the cursor without chasing it. */
        backdrop={
          <LightRays
            raysOrigin="top-center"
            raysSpeed={0.6}
            lightSpread={0.9}
            rayLength={1.6}
            fadeDistance={1.1}
            saturation={0.9}
            mouseInfluence={0.06}
            noiseAmount={0.06}
            distortion={0.04}
          />
        }
      >
        <Reveal variant="veil">
          <SectionHeading
            eyebrow="Before you ask"
            title={
              <>
                The questions clinics stall on.
                <br />
                <span className="text-muted">Answered plainly.</span>
              </>
            }
            as="h2"
          />
        </Reveal>

        <div className="mt-12">
          <FaqList items={homeFaqs()} />
        </div>

        <Reveal variant="veil" className="mt-8 block">
          <Link
            href="/faq"
            className="text-accent hover:text-accent-alt font-semibold transition-colors duration-base"
          >
            Read the full FAQ &rarr;
          </Link>
        </Reveal>
      </Section>

      {/* ── The ask. Dark region: a themed subtree, not a forked palette, so
          the ColorBends field behind it has a ground to bend against. ── */}
      <section
        id="signup"
        data-theme="ink"
        className="bg-bg text-ink border-t border-border scroll-mt-28 relative isolate overflow-hidden py-20 sm:py-28"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <ColorBends
            rotation={180}
            speed={0.18}
            scale={1.1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.5}
            parallax={0.4}
            /* Noise is achromatic: on a single-hue field it only greys the
               band cores, which is half of what read as white. */
            noise={0}
            iterations={2}
            intensity={1}
            bandWidth={7}
          />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <Pullquote attribution="PageMD founding team">
              We built PageMD because we watched nurses spend hours a week
              trapped on hold: time that should have been spent with patients.
            </Pullquote>
          </div>

          <Card surface="flat" className="h-fit">
            <CardBody>
              <div className="mb-6">
                <p className="text-accent font-mono text-[0.7rem] tracking-[0.2em] uppercase">
                  Request access
                </p>
                <h3 className="text-ink mt-3 text-xl font-bold">
                  Your practice, always reachable.
                </h3>
              </div>
              <SignupForm />
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}
