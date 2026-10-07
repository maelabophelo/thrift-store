import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let newArrivals: any[] = [];
  let bestSellers: any[] = [];
  let saleProducts: any[] = [];

  try {
    newArrivals = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    bestSellers = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    saleProducts = await prisma.product.findMany({
      where: { isActive: true, isOnSale: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("DB fetch error:", e);
  }

  return (
    <div>
      <section className="relative bg-neutral-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              YOUR KICKS.
              <br />
              YOUR STREET.
              <br />
              YOUR STORE.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-neutral-300 max-w-md">
              Affordable sneakers, formal shoes and boots delivered across South Africa via PAXI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black text-sm font-semibold uppercase tracking-wide hover:bg-neutral-100 transition"
              >
                Shop All Shoes
              </Link>
              <Link
                href="/shop?filter=sale"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white text-sm font-semibold uppercase tracking-wide hover:bg-white hover:text-black transition"
              >
                View Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">New Arrivals</h2>
            <Link href="/shop?filter=new" className="text-sm font-medium underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Best Sellers</h2>
            <Link href="/shop" className="text-sm font-medium underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {saleProducts.length > 0 && (
        <section className="bg-neutral-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-red-600">On Sale</h2>
                <p className="text-sm text-neutral-600 mt-1">Limited stock – grab them while they last</p>
              </div>
              <Link href="/shop?filter=sale" className="text-sm font-medium underline underline-offset-4">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {saleProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Delivered to your nearest PEP
        </h2>
        <p className="mt-3 text-neutral-600 max-w-lg mx-auto">
          We ship via PAXI to PEP collection points across South Africa. No home
          address needed – just pick the store that works for you.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex px-8 py-3.5 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-neutral-800 transition"
        >
          Shop Shoes
        </Link>
      </section>
    </div>
  );
}
