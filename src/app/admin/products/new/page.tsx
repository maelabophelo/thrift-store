"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sku: "",
    brand: "THE THRIFT STORE",
    categoryId: "",
    stock: "10",
    sizes: "S,M,L,XL",
    colours: "Black,White",
    tags: "",
    images: "",
    isFeatured: false,
    isNewArrival: true,
    isOnSale: false,
  });

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) {
          setCategories(d.categories);
          if (d.categories[0]) setForm((f) => ({ ...f, categoryId: d.categories[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          stock: parseInt(form.stock, 10),
          sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colours: form.colours.split(",").map((c) => c.trim()).filter(Boolean),
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: form.images
            ? form.images.split("\n").map((i) => i.trim()).filter(Boolean)
            : ["/images/placeholder.jpg"],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        setLoading(false);
        return;
      }
      router.push("/admin/products");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/admin/products" className="font-bold text-sm">
            ← Products
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Add Product</h1>
        <form onSubmit={handleSubmit} className="bg-white border p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description *</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Price (R) *</label>
              <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Sale Price (R)</label>
              <input type="number" step="0.01" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="w-full border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">SKU *</label>
              <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Stock *</label>
              <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Brand</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Category *</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Sizes (comma-separated)</label>
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="w-full border px-3 py-2 text-sm" placeholder="S,M,L,XL" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Colours (comma-separated)</label>
            <input value={form.colours} onChange={(e) => setForm({ ...form, colours: e.target.value })} className="w-full border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Image URLs (one per line)</label>
            <textarea rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full border px-3 py-2 text-sm" placeholder="/images/my-product.jpg or https://..." />
            <p className="text-xs text-neutral-500 mt-1">Put image files in public/images/ or use external URLs.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} />
              New Arrival
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm({ ...form, isOnSale: e.target.checked })} />
              On Sale
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-black text-white text-sm font-semibold uppercase disabled:opacity-60">
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </main>
    </div>
  );
}
