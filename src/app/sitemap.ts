import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";

  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {}

  const staticPages = ["", "/shop", "/about", "/contact", "/pages/privacy", "/pages/terms", "/pages/returns", "/pages/delivery", "/pages/paxi"];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
