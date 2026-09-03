import type { MetadataRoute } from "next";

/* Generated, not a file in public/: a static sitemap.xml drifts the moment a
   route is added or removed, and `public/robots.txt` already points crawlers
   here. Add a route below when you add a page. */
const ROUTES = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `https://pagemd.ai${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
