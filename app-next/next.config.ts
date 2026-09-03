import type { NextConfig } from "next";

/* The legacy static site is still what pagemd.ai serves, and its pages are
   indexed at `.html` paths. Cutting over to this app makes every one of them a
   404, so each keeps a permanent redirect to its App Router equivalent. Delete
   these only once the old URLs have dropped out of the index. */
const LEGACY = {
  "/about.html": "/about",
  "/faq.html": "/faq",
  "/privacy.html": "/privacy",
  "/terms.html": "/terms",
  "/index.html": "/",
} as const;

const nextConfig: NextConfig = {
  /* Without this, Next walks up past the repo and picks
     `/Users/sebastiandonea/package-lock.json` as the workspace root, which it
     warns about on every build and which makes file tracing guess wrong. */
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,

  async redirects() {
    return [
      // Apex is canonical. Vercel's own www redirect lived in the repo-root
      // vercel.json, which stops being read once the project root moves here.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.pagemd.ai" }],
        destination: "https://pagemd.ai/:path*",
        permanent: true,
      },
      ...Object.entries(LEGACY).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
