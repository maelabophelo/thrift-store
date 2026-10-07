import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description: "Browse clothing, shoes and streetwear at THE THRIFT STORE.",
};

interface SearchParams {
  q?: string;
  category?: string;
  filter?: string;
  sort?: string;
  min?: string;
  max?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { q, category, filter, sort, min, max } = params;

  const where: any = { isActive: true };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }

  if (filter === "new") where.isNewArrival = true;
  if (filter === "sale") where.isOnSale = true;
  if (filter === "featured") where.isFeatured = true;

  if (min) where.price = { ...(where.price || {}), gte: parseFloat(min) };
  if (max) where.price = { ...(where.price || {}), lte: parseFloat(max) };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };
  if (sort === "featured") orderBy = { isFeatured: "desc" };

  let products: any[] = [];
  let categories: any[] = [];
  try {
    products = await prisma.product.findMany({ where, orderBy, take: 48 });
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch (e) {
    console.error(e);
  }

  const title = q
    ? `Search: “${q}”`
    : filter === "sale"
    ? "Sale"
    : filter === "new"
    ? "New Arrivals"
    : category
    ? categories.find((c) => c.slug === category)?.name || "Shop"
    : "Shop All";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-tight mb-6 md:hidden">{title}</h1>
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Categories
              </h3>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href="/shop"
                    className={!category ? "font-semibold" : "text-neutral-600 hover:text-black"}
                  >
                    All
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/shop?category=${c.slug}`}
                      className={
                        category === c.slug
                          ? "font-semibold"
                          : "text-neutral-600 hover:text-black"
                      }
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Filters
              </h3>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href="/shop?filter=new"
                    className={filter === "new" ? "font-semibold" : "text-neutral-600 hover:text-black"}
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?filter=sale"
                    className={filter === "sale" ? "font-semibold" : "text-neutral-600 hover:text-black"}
                  >
                    On Sale
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Sort
              </h3>
              <ul className="space-y-1.5 text-sm">
                {[
                  { v: "newest", l: "Newest" },
                  { v: "price-asc", l: "Price: Low to High" },
                  { v: "price-desc", l: "Price: High to Low" },
                  { v: "featured", l: "Featured" },
                ].map((s) => (
                  <li key={s.v}>
                    <Link
                      href={`/shop?${new URLSearchParams({
                        ...(category && { category }),
                        ...(filter && { filter }),
                        ...(q && { q }),
                        sort: s.v,
                      }).toString()}`}
                      className={
                        sort === s.v ? "font-semibold" : "text-neutral-600 hover:text-black"
                      }
                    >
                      {s.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="hidden md:flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-neutral-500">{products.length} products</p>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center text-neutral-500">
              <p>No products found.</p>
              <Link href="/shop" className="mt-4 inline-block underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
