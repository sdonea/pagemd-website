import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@usva-ui/react/primitives/button";
import { Card } from "@usva-ui/react/primitives/card";
import { Reveal, RevealGroup } from "@usva-ui/react/motion/reveal";

export const metadata: Metadata = {
  title: "About / Team",
  description:
    "PageMD is building the AI paging line for outpatient care, so no caller waits on hold and no nurse spends their day relaying messages.",
};

/* Layout is a one-for-one rebuild of the legacy about.html: centred hero, wide
   hero photo, a narrow prose column carrying the pull quote and an inline
   photo, a three-up founder grid, a two-up moments grid, then the CTA over a
   rule. Only the skin is usva — structure, order and copy are the old page's.

   The founder crops are the legacy `background-position` / `background-size`
   values verbatim; they frame a face out of a wider shot, which is a job
   next/image cannot do, so these stay CSS backgrounds. */
const FOUNDERS = [
  {
    name: "Sebastian Donea",
    role: "Chief Executive Officer",
    linkedin: "https://www.linkedin.com/in/sebastian-donea/",
    image: "/images/team/sebastian-solo.jpg",
    size: "255% auto",
    position: "52% 88%",
  },
  {
    name: "Veronica Rodionova",
    role: "Chief Compliance Officer",
    linkedin: "https://www.linkedin.com/in/veronica-rodionova-7560a9316/",
    image: "/images/team/veronica-solo.jpg",
    size: "cover",
    position: "50% 20%",
  },
  {
    name: "Chaz Burkett",
    role: "Chief Operating Officer",
    linkedin: "https://www.linkedin.com/in/chaz-burkett-12588b395/",
    image: "/images/team/chaz-solo.jpg",
    size: "235% auto",
    position: "53% 44%",
  },
];

const MOMENTS = [
  {
    src: "/images/team/team-booth.jpg",
    alt: "The PageMD team demoing at a startup showcase",
    caption: "Demoing PageMD live: “AI answers every call. No hold. Ever.”",
  },
  {
    src: "/images/team/team-stage.jpg",
    alt: "The PageMD team on stage at the STARTedUP Challenge",
    caption: "PageMD at the STARTedUP Challenge.",
  },
];

/* Lucide dropped its brand glyphs, so this is the same LinkedIn path the old
   page inlined. A brand mark, not a component — nothing to pull from a registry. */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6 1.12 6 0 4.88 0 3.5 0 2.12 1.12 1 2.49 1c1.38 0 2.49 1.12 2.49 2.5zM.24 8h4.5v14.5H.24V8zm7.5 0h4.31v1.98h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9v8.96h-4.5v-7.94c0-1.9-.03-4.34-2.64-4.34-2.64 0-3.05 2.06-3.05 4.2v8.08h-4.5V8z" />
    </svg>
  );
}

const EYEBROW = "text-accent-alt text-xs font-bold tracking-[0.12em] uppercase";

/** The legacy caption: italic, over a gradient scrim, pinned to the bottom. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption
      className="text-ink/85 absolute inset-x-0 bottom-0 px-5 pt-10 pb-4 text-sm italic"
      style={{
        backgroundImage:
          "linear-gradient(to top, color-mix(in oklab, var(--usva-bg) 88%, transparent) 0%, transparent 100%)",
      }}
    >
      {children}
    </figcaption>
  );
}

export default function About() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Reveal
        variant="veil"
        as="section"
        className="block pt-16 pb-2 text-center"
      >
        <span className={`${EYEBROW} mb-4 inline-block`}>Our Story</span>
        <h1 className="text-ink text-[clamp(2rem,5.4vw,3.25rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
          We&rsquo;re giving clinics
          <br />
          their phones back.
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-[37.5rem] text-[1.125rem] leading-[1.62] text-balance">
          PageMD is building the AI paging line for outpatient care, so no
          caller waits on hold and no nurse spends their day relaying messages.{" "}
          <em className="text-ink font-light italic">
            Fewer rings, more care.
          </em>
        </p>
      </Reveal>

      {/* ── Hero photo ───────────────────────────────────────────────── */}
      <Reveal
        variant="veil"
        as="figure"
        className="relative mx-auto mt-11 block max-w-[60rem] overflow-hidden rounded-3xl border border-border shadow-overlay"
      >
        <Image
          src="/images/team/team-portrait.jpg"
          alt="The PageMD founding team: Sebastian Donea, Veronica Rodionova, and Chaz Burkett"
          width={1800}
          height={1200}
          priority
          className="block h-auto w-full"
        />
        <Caption>The founding team: Sebastian, Veronica &amp; Chaz.</Caption>
      </Reveal>

      {/* ── Story ────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[42.5rem]">
        <Reveal variant="veil">
          <h2 className={`${EYEBROW} mb-5 block text-center`}>
            Why we built PageMD
          </h2>
          <p className="text-muted mb-5 text-[1.09rem] leading-[1.75] text-pretty">
            Every outpatient clinic runs on the phone. Pharmacies calling to
            verify a refill, referring providers trying to reach a doctor,
            patients returning a call. All of it lands on a front desk that can
            only pick up one line at a time. The rest go to hold, to voicemail,
            or to a nurse who spends the afternoon relaying messages instead of
            caring for patients.
          </p>
          <p className="text-ink mx-auto my-10 max-w-[37.5rem] text-center text-[clamp(1.3rem,3vw,1.65rem)] leading-[1.45] font-light italic text-balance">
            &ldquo;The bottleneck was never the medicine. It was the
            phone.&rdquo;
          </p>
        </Reveal>

        <Reveal
          variant="veil"
          as="figure"
          className="relative mt-2 mb-9 block overflow-hidden rounded-2xl border border-border shadow-floating"
        >
          <Image
            src="/images/team/story-stage.jpg"
            alt="The PageMD team presenting on stage"
            width={1800}
            height={1200}
            className="block h-auto w-full"
          />
          <Caption>Sharing the PageMD story on stage.</Caption>
        </Reveal>

        <Reveal variant="veil">
          <p className="text-muted mb-5 text-[1.09rem] leading-[1.75] text-pretty">
            We started PageMD to fix exactly that. Our AI answers every inbound
            call on the first ring, has a natural conversation, captures a
            complete message, and pages the right provider in about sixty
            seconds,{" "}
            <strong className="text-ink font-bold">
              without triaging, judging urgency, or making a single clinical
              decision.
            </strong>{" "}
            That judgment stays where it belongs: with your team.
          </p>
          <p className="text-muted text-[1.09rem] leading-[1.75] text-pretty">
            We&rsquo;re a small founding team that moves fast, ships in the real
            world, and sits with the clinics we build for. PageMD is in pilot
            today, and we&rsquo;re just getting started.
          </p>
        </Reveal>
      </section>

      {/* ── Founders ─────────────────────────────────────────────────── */}
      <section className="mt-24">
        <Reveal variant="veil" className="mb-11 block text-center">
          <span className={`${EYEBROW} mb-3 inline-block`}>The Founders</span>
          <h2 className="text-ink text-[clamp(1.6rem,4vw,2.375rem)] leading-[1.14] font-extrabold tracking-[-0.03em] text-balance">
            Three people, one mission.
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {FOUNDERS.map((person) => (
            /* Double-bezel: an outer tray holding an inner plate, with the
               inner radius stepped down by the tray's padding so the curves
               stay concentric.

               `elevated`, not `glass`. usva's glass skin is `backdrop-blur-md`,
               and these cards scroll — a blurred layer over moving content
               repaints every frame. Nothing meaningful sits behind them on a
               dark page, so the blur cost bought nothing. */
            <div
              key={person.name}
              className="rounded-[1.75rem] border border-border bg-surface-2/40 p-1.5 shadow-floating"
            >
              <Card
                surface="elevated"
                interactive
                className="flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-0.375rem)] p-0"
              >
                <div
                  role="img"
                  aria-label={person.name}
                  className="aspect-4/5 border-b border-border bg-no-repeat"
                  style={{
                    backgroundImage: `url(${person.image})`,
                    backgroundSize: person.size,
                    backgroundPosition: person.position,
                  }}
                />
                <div className="flex flex-1 flex-col p-[22px] pb-6">
                  <h3 className="text-ink text-[1.19rem] leading-[1.2] font-extrabold tracking-[-0.02em]">
                    {person.name}
                  </h3>
                  <div className="text-accent-alt mt-1 text-[0.78rem] font-bold tracking-[0.06em] uppercase">
                    {person.role}
                  </div>
                  <div className="mt-auto flex gap-2.5 pt-[18px]">
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener"
                      aria-label={`${person.name} on LinkedIn`}
                      className="text-muted hover:text-ink hover:border-border-strong grid size-[34px] place-items-center rounded-lg border border-border transition-tint"
                    >
                      <LinkedInIcon />
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </RevealGroup>
      </section>

      {/* ── Moments ──────────────────────────────────────────────────── */}
      <section className="mt-24">
        <Reveal variant="veil" className="mb-9 block text-center">
          <h2 className="text-ink text-[clamp(1.5rem,3.6vw,2.125rem)] leading-[1.16] font-extrabold tracking-[-0.03em] text-balance">
            Building it in the real world.
          </h2>
          <p className="text-muted mx-auto mt-3 max-w-[32.5rem] text-base text-balance">
            From the demo floor to clinic pilots, meeting the people PageMD is
            built for.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-[22px] sm:grid-cols-2">
          {MOMENTS.map((moment) => (
            <figure
              key={moment.src}
              className="relative overflow-hidden rounded-2xl border border-border shadow-floating"
            >
              <Image
                src={moment.src}
                alt={moment.alt}
                width={1800}
                height={1200}
                className="block aspect-3/2 h-full w-full object-cover"
              />
              <Caption>{moment.caption}</Caption>
            </figure>
          ))}
        </RevealGroup>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <Reveal
        variant="veil"
        as="section"
        className="mt-24 block border-t border-border pt-14 text-center"
      >
        <h2 className="text-ink mb-3 text-[clamp(1.5rem,3.4vw,2rem)] font-extrabold tracking-[-0.03em] text-balance">
          Want to bring PageMD to your clinic?
        </h2>
        <p className="text-muted mx-auto mb-6 max-w-[28.75rem] text-[1.03rem]">
          We&rsquo;re onboarding a limited number of pilot clinics right now.
        </p>
        <Button
          asChild
          variant="solid"
          size="lg"
          className="active:translate-y-px"
        >
          <Link href="/#signup">Request access →</Link>
        </Button>
      </Reveal>
    </div>
  );
}
