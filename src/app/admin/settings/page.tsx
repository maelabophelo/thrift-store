"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [fee, setFee] = useState("69");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings/paxi-fee")
      .then((r) => r.json())
      .then((d) => setFee(String(d.fee || 69)));
  }, []);

  const save = async () => {
    setLoading(true);
    await fetch("/api/admin/settings", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "paxi_delivery_fee", value: fee }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="font-bold">
            ← Admin
          </Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Store Settings</h1>

        <div className="bg-white border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              PAXI Delivery Fee (ZAR)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">R</span>
              <input
                type="number"
                step="1"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="border border-neutral-300 px-3 py-2 text-sm w-32"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              This fee is added at checkout and can be changed anytime.
            </p>
          </div>

          <button
            onClick={save}
            disabled={loading}
            className="px-5 py-2.5 bg-black text-white text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>

        <div className="mt-8 bg-white border p-6 text-sm text-neutral-600 space-y-2">
          <p className="font-medium text-black">Payment Gateway</p>
          <p>
            Configure PayFast (or another SA gateway) via environment variables:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>PAYFAST_MERCHANT_ID</li>
            <li>PAYFAST_MERCHANT_KEY</li>
            <li>PAYFAST_PASSPHRASE</li>
            <li>PAYFAST_SANDBOX=true/false</li>
          </ul>
          <p className="mt-2 text-xs">
            Never put bank account details in the frontend. Capitec account is
            only for your private PayFast / bank settlement configuration.
          </p>
        </div>
      </main>
    </div>
  );
}
