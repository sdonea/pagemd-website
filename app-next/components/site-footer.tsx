import { Footer } from "@usva-ui/react/patterns/footer";
import { BrandLockup } from "./brand";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <Footer
      glow
      // No width cap here. Footer already centres its own content at
      // max-w-[72.5rem]; constraining the root instead clipped the glow into a
      // visible rectangle that cut against the full-bleed stretchy footer.
      brand={<BrandLockup tagline id="footer" />}
      tagline="AI phone answering and clinical paging for outpatient clinics. Answer every call instantly. Deliver every page accurately."
      columns={[
        {
          title: "Navigate",
          links: [
            { label: "The problem", href: "/#problem" },
            { label: "How it works", href: "/#how" },
            { label: "Live demo", href: "/#demo" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About / Team", href: "/about" },
            { label: "FAQ", href: "/faq" },
            { label: "team@pagemd.ai", href: "mailto:team@pagemd.ai" },
          ],
        },
        {
          title: "Legal",
          tone: "accent-alt",
          links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ],
        },
      ]}
      copyright={`© ${YEAR} PageMD, Inc. All rights reserved.`}
      note="Evansville, Indiana"
    />
  );
}
