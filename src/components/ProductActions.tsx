"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    image: string;
    stock: number;
    slug: string;
    sizes: string[];
    colours: string[];
  };
}

export default function ProductActions({ product }: Props) {
  const [size, setSize] = useState(product.sizes[0] || "");
  const [colour, setColour] = useState(product.colours[0] || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    if (product.sizes.length && !size) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.image,
      size: size || undefined,
      colour: colour || undefined,
      stock: product.stock,
      slug: product.slug,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/checkout");
  };

  return (
    <div className="mt-6 space-y-5">
      {product.sizes.length > 0 && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Size
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-[2.75rem] px-3 py-2 text-sm border ${
                  size === s
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colours.length > 0 && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Colour
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colours.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColour(c)}
                className={`px-3 py-2 text-sm border ${
                  colour === c
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {!outOfStock && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Quantity
          </label>
          <div className="mt-2 flex items-center border border-neutral-300 w-fit">
            <button
              type="button"
              className="px-3 py-2 text-lg"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>
            <span className="px-4 py-2 text-sm font-medium min-w-[2.5rem] text-center">
              {qty}
            </span>
            <button
              type="button"
              className="px-3 py-2 text-lg"
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 py-3.5 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition"
        >
          {outOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 py-3.5 border border-black text-sm font-semibold uppercase tracking-wide hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
