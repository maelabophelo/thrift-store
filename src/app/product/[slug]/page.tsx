import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatZAR } from "@/lib/utils";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.isActive) notFound();

  let images: string[] = [];
  let sizes: string[] = [];
  let colours: string[] = [];
  try {
    images = JSON.parse(product.images || "[]");
    sizes = JSON.parse(product.sizes || "[]");
    colours = JSON.parse(product.colours || "[]");
  } catch {}

  const onSale = product.isOnSale && product.salePrice != null;
  const displayPrice = onSale ? product.salePrice! : product.price;

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
  });

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: displayPrice,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center"
              style={
                images[0]
                  ? {
                      backgroundImage: `url(${images[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!images[0] && (
                <span className="text-neutral-400 text-sm uppercase tracking-widest">
                  Product Image
                </span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square bg-neutral-100"
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && (
            <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl font-semibold">{formatZAR(displayPrice)}</span>
            {onSale && (
              <span className="text-neutral-400 line-through">
                {formatZAR(product.price)}
              </span>
            )}
            {onSale && (
              <span className="text-xs font-bold text-red-600 uppercase">Sale</span>
            )}
          </div>

          <p className="mt-2 text-sm text-neutral-500">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </p>

          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              salePrice: product.salePrice,
              image: images[0] || "",
              stock: product.stock,
              slug: product.slug,
              sizes,
              colours,
            }}
          />

          <div className="mt-8 pt-8 border-t border-neutral-200">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">
              Description
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="mt-6 text-xs text-neutral-400">
            SKU: {product.sku}
            {product.category && ` · ${product.category.name}`}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            You may also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
