"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatZAR } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Find something you love.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block px-6 py-3 bg-black text-white text-sm font-semibold uppercase"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.salePrice ?? item.price;
            return (
              <div
                key={`${item.productId}-${item.size}-${item.colour}`}
                className="flex gap-4 border-b border-neutral-200 pb-4"
              >
                <div
                  className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-100 flex-shrink-0"
                  style={{
                    backgroundImage: item.image ? `url(${item.image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-sm font-medium hover:underline line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-1 text-xs text-neutral-500 space-x-2">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.colour && <span>Colour: {item.colour}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold">{formatZAR(price)}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        className="px-2.5 py-1 text-sm"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.size,
                            item.colour
                          )
                        }
                      >
                        −
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        className="px-2.5 py-1 text-sm"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.size,
                            item.colour
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeItem(item.productId, item.size, item.colour)
                      }
                      className="p-1.5 text-neutral-400 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold hidden sm:block">
                  {formatZAR(price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-neutral-50 p-6 sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">{formatZAR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Delivery (PAXI)</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between font-semibold">
              <span>Estimated Total</span>
              <span>{formatZAR(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full py-3.5 bg-black text-white text-center text-sm font-semibold uppercase tracking-wide hover:bg-neutral-800 transition"
            >
              Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-neutral-600 hover:underline"
            >
              Continue Shopping
            </Link>
            <p className="mt-4 text-xs text-neutral-500 text-center">
              Delivery via PAXI to your nearest PEP store
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
