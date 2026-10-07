"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=sneakers", label: "Sneakers" },
  { href: "/shop?category=formal", label: "Formal" },
  { href: "/shop?category=boots", label: "Boots" },
  { href: "/shop?filter=new", label: "New Arrivals" },
  { href: "/shop?filter=sale", label: "Sale" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex-shrink-0">
            <span className="text-lg md:text-xl font-bold tracking-tight uppercase">
              THE THRIFT STORE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="text-neutral-700 hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="p-2"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link href="/wishlist" className="p-2 hidden sm:block" aria-label="Wishlist">
              <Heart size={20} />
            </Link>
            <Link href="/cart" className="p-2 relative" aria-label="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-3">
            <form action="/shop" method="get" className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search shoes..."
                className="w-full border border-neutral-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search size={18} className="text-neutral-500" />
              </button>
            </form>
          </div>
        )}
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="py-2.5 text-sm font-medium text-neutral-800"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              className="py-2.5 text-sm font-medium text-neutral-800"
              onClick={() => setOpen(false)}
            >
              Wishlist
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
