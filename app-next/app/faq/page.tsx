import type { Metadata } from "next";
import { FAQS } from "@/lib/faqs";
import { FaqList } from "@/components/faq-list";
import Link from "next/link";
import { PageHeader } from "@usva-ui/react/patterns/page-header";
import { CtaBanner } from "@usva-ui/react/patterns/cta-banner";
import { Button } from "@usva-ui/react/primitives/button";
import { Reveal } from "@usva-ui/react/motion/reveal";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "How PageMD answers calls, pages your team, and keeps patient data safe.",
};


export default function Faq() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <PageHeader
        eyebrow="Questions & answers"
        title="Frequently asked"
        titleAccent="questions."
        meta="Everything you need to know about how PageMD answers calls, pages your team, and keeps patient data safe."
      />

      <div className="mt-12">
        <FaqList items={FAQS} />
      </div>

      <Reveal variant="veil" className="mt-16 block">
        <CtaBanner
          title="Still have a question we didn't cover?"
          body="Tell us about your clinic and we'll take it from there."
          headingLevel="h2"
          action={
            <Button
              asChild
              variant="solid"
              size="lg"
              className="active:translate-y-px"
            >
              <Link href="/#signup">Get in touch</Link>
            </Button>
          }
        />
      </Reveal>
    </div>
  );
}
