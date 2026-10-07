"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatZAR } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    images: string;
    isOnSale?: boolean;
    isNewArrival?: boolean;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  let images: string[] = [];
  try {
    images = JSON.parse(product.images || "[]");
  } catch {}
  const image = images[0] || "/images/placeholder.jpg";
  const onSale = product.isOnSale && product.salePrice != null;
  const displayPrice = onSale ? product.salePrice! : product.price;

  return (
    <article className="product-card group relative bg-white">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          {/* Placeholder gradient if no real image */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center"
            style={
              image.startsWith("http") || image.startsWith("/")
                ? {
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {(!image || image.includes("placeholder")) && (
              <span className="text-neutral-400 text-xs uppercase tracking-widest">
                Photo
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {onSale && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                Sale
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                New
              </span>
            )}
            {product.stock <= 0 && (
              <span className="bg-neutral-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                Sold Out
              </span>
            )}
          </div>

          <button
            className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // Wishlist handled on product page / account
            }}
            aria-label="Add to wishlist"
          >
            <Heart size={16} />
          </button>
        </div>

        <div className="pt-3 pb-2 px-0.5">
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold">{formatZAR(displayPrice)}</span>
            {onSale && (
              <span className="text-xs text-neutral-400 line-through">
                {formatZAR(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
