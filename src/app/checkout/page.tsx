"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { formatZAR, isValidSAPhone, SA_PROVINCES } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(69);
  const [confirmed, setConfirmed] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pepStoreName: "",
    pepStoreAddress: "",
    pepStoreCity: "",
    pepStoreProvince: "Gauteng",
    paxiReference: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/settings/paxi-fee")
      .then((r) => r.json())
      .then((d) => {
        if (d.fee) setDeliveryFee(d.fee);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/shop" className="mt-4 inline-block underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = subtotal + deliveryFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!isValidSAPhone(form.phone)) {
      setError("Please enter a valid South African mobile number (e.g. 0712345678)");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!form.pepStoreName.trim() || !form.pepStoreAddress.trim() || !form.pepStoreCity.trim()) {
      setError("Please enter complete PEP store details");
      return;
    }
    if (!confirmed) {
      setError("Please confirm that the PEP store information is correct");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.fullName.trim(),
          customerPhone: form.phone.trim(),
          customerEmail: form.email.trim().toLowerCase(),
          pepStoreName: form.pepStoreName.trim(),
          pepStoreAddress: form.pepStoreAddress.trim(),
          pepStoreCity: form.pepStoreCity.trim(),
          pepStoreProvince: form.pepStoreProvince,
          paxiReference: form.paxiReference.trim() || null,
          customerNotes: form.notes.trim() || null,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size || null,
            colour: i.colour || null,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // Redirect to payment or confirmation depending on gateway
      if (data.paymentUrl) {
        // Clear cart only after successful redirect intent
        clearCart();
        window.location.href = data.paymentUrl;
      } else {
        clearCart();
        router.push(`/order/${data.orderNumber}?status=pending`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer details */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Your Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Mobile Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </section>

          {/* PAXI Collection Point */}
          <section className="border border-neutral-200 p-5 bg-neutral-50">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2">
              PAXI Collection Point
            </h2>
            <p className="text-sm text-neutral-600 mb-5">
              Your order will be delivered to your selected PEP PAXI collection
              point. Please choose the PEP store that is most convenient for you.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  PEP Store Name *
                </label>
                <input
                  name="pepStoreName"
                  placeholder="e.g. PEP Vanderbijlpark"
                  value={form.pepStoreName}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  PEP Store Address *
                </label>
                <input
                  name="pepStoreAddress"
                  placeholder="Street / shopping centre address"
                  value={form.pepStoreAddress}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Town / City *
                </label>
                <input
                  name="pepStoreCity"
                  value={form.pepStoreCity}
                  onChange={handleChange}
                  required
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Province *
                </label>
                <select
                  name="pepStoreProvince"
                  value={form.pepStoreProvince}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  PAXI Reference (optional)
                </label>
                <input
                  name="paxiReference"
                  value={form.paxiReference}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
            </div>

            <label className="mt-5 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I confirm that the PEP store information I entered is correct.
              </span>
            </label>
          </section>

          <section>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Order Notes (optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Any special instructions..."
            />
          </section>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-neutral-50 p-6 sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Order Summary
            </h2>
            <ul className="space-y-3 text-sm mb-4">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.size}-${i.colour}`}
                  className="flex justify-between gap-2"
                >
                  <span className="text-neutral-700 line-clamp-1">
                    {i.name} × {i.quantity}
                    {i.size ? ` (${i.size})` : ""}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    {formatZAR((i.salePrice ?? i.price) * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-sm border-t border-neutral-200 pt-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>{formatZAR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">PAXI Delivery</span>
                <span>{formatZAR(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span>{formatZAR(total)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Delivery method: PAXI – PEP Collection Point
            </p>

            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3.5 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-neutral-800 disabled:opacity-60 transition"
            >
              {loading ? "Processing..." : `Pay ${formatZAR(total)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
