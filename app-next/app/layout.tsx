import type { Metadata, Viewport } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrandStretchyFooter } from "@/components/brand-stretchy-footer";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-fira-sans",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pagemd.ai"),
  title: {
    default: "PageMD — The answering service, without the hold time.",
    template: "%s · PageMD",
  },
  description:
    "AI phone answering and clinical paging for outpatient clinics. Every inbound call answered on the first ring, structured into a complete message, and paged to the right provider in about sixty seconds.",
  openGraph: {
    type: "website",
    siteName: "PageMD",
    url: "https://pagemd.ai",
    title: "PageMD — The answering service, without the hold time.",
    description:
      "AI phone answering and clinical paging for outpatient clinics. Answer every call instantly. Deliver every page accurately.",
    images: ["/og-image.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0613" },
    { media: "(prefers-color-scheme: light)", color: "#f7f9fd" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${firaSans.variable} ${firaCode.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before first paint. Without it a stored light
            preference flashes kajo's near-black for a frame. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-bg text-ink font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        {/* `data-stretchy-page` is the selector StretchyFooter looks for in
            windowScroll mode — it is the block that rolls up into the aurora
            once you hit the bottom of the page. */}
        <div data-stretchy-page>
          <SiteHeader />
          <main id="main">{children}</main>
          {/* Same reason as the FAQ band: the footer's glow is additive, and
              the legacy brand painted this region #1B2350 on a light page
              anyway. Inert in kajo. */}
          <div className="bg-bg" data-theme="ink">
            <SiteFooter />
          </div>
        </div>
        <BrandStretchyFooter />
      </body>
    </html>
  );
}
