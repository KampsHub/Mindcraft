import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/goals", "/weekly-review", "/day/", "/coach", "/my-account", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://mindcraft.ing/sitemap.xml",
  };
}
