"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SulaNav } from "@usva-ui/react/sula/sula-nav";
import { Button } from "@usva-ui/react/primitives/button";
import { Radio } from "lucide-react";
import { BrandLockup } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "@/lib/theme";

/* The header is one region and SulaNav is its one sula element. Nothing below
   gets a liquid field: the sections structure, they do not assert.

   One view rather than several. SulaNav's views are route groups and its items
   are the sections inside the active one, which is an app's shape, not a five
   page marketing site's: split across views, every subpage would show a bar
   holding nothing but two icons. One view keeps every link in the bar on every
   page. */
const ITEMS = [
  { href: "/#how", label: "How it works" },
  { href: "/#demo", label: "Demo" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

const VIEWS = [
  {
    href: "/",
    label: "PageMD",
    icon: <Radio className="size-4" />,
    items: ITEMS,
  },
];

export function SiteHeader() {
  const pathname = usePathname();
  const theme = useTheme();

  // Section links only ever match on the home page; a subpage matches by path.
  const activeItem =
    ITEMS.find((i) => !i.href.includes("#") && pathname.startsWith(i.href))
      ?.href ?? (pathname === "/" ? "/#how" : undefined);

  return (
    /* The bar is glass, so without a scrim behind it page content reads
       straight through the gaps between the brand, the bar and the CTA. */
    <div className="sticky top-0 z-40 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-24 before:bg-[linear-gradient(to_bottom,var(--usva-bg)_28%,transparent)]">
      <SulaNav
        /* Remounted on a theme flip: the liquid bar resolves its role tokens
           once at mount and will not re-read them on its own. */
        key={theme}
        /* Full bleed, not max-w-7xl: the brand and the CTA are corner
           furniture, and a centred container parks them a couple of hundred
           pixels short of the corners they belong in. */
        className="px-5 sm:px-8"
        views={VIEWS}
        activeView="/"
        activeItem={activeItem}
        linkComponent={Link}
        brand={<BrandLockup id="nav" />}
        brandHref="/"
        brandLabel="PageMD, home"
        ariaLabel="Primary"
        labelsFrom="md"
        collapseBelow="md"
        menuLabel="Open menu"
        satellites={[
          {
            id: "theme",
            align: "right",
            label: "Theme",
            children: <ThemeToggle />,
          },
          {
            id: "cta",
            align: "right",
            label: "Get started",
            children: (
              <Button
                asChild
                size="lg"
                variant="solid"
                className="active:translate-y-px"
              >
                <Link href="/#signup">Request access</Link>
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
