import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg tracking-tight uppercase mb-4">
              THE THRIFT STORE
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Affordable sneakers, formal shoes and boots delivered to PEP stores across South Africa via PAXI.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-white transition">All Shoes</Link></li>
              <li><Link href="/shop?category=sneakers" className="hover:text-white transition">Sneakers</Link></li>
              <li><Link href="/shop?category=formal" className="hover:text-white transition">Formal</Link></li>
              <li><Link href="/shop?filter=sale" className="hover:text-white transition">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pages/delivery" className="hover:text-white transition">Delivery Info</Link></li>
              <li><Link href="/pages/paxi" className="hover:text-white transition">PAXI / PEP</Link></li>
              <li><Link href="/pages/returns" className="hover:text-white transition">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pages/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/pages/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
            </ul>
            <div className="mt-6">
              <a
                href="https://wa.me/27723551014?text=Hi%20THE%20THRIFT%20STORE%2C%20I%20need%20help%20with%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
              >
                WhatsApp 072 355 1014
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} THE THRIFT STORE. Shoes only. South Africa.
        </div>
      </div>
    </footer>
  );
}
