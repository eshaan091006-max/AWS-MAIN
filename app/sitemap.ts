import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { INITIAL_EVENTS } from "@/lib/data/initialData";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/teams",
    "/events",
    "/gallery",
    "/projects",
    "/contact",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const eventRoutes = INITIAL_EVENTS.map((event) => ({
    url: `${siteConfig.url}/events/${event.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...eventRoutes];
}
