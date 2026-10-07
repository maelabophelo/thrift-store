"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sku: "",
    brand: "",
    categoryId: "",
    stock: "0",
    sizes: "",
    colours: "",
    tags: "",
    images: "",
    isFeatured: false,
    isNewArrival: false,
    isOnSale: false,
    isActive: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`, { credentials: "include" }),
          fetch("/api/admin/categories", { credentials: "include" }),
        ]);

        if (prodRes.status === 401 || catRes.status === 401) {
          router.push("/admin/login");
          return;
        }

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (!prodRes.ok) {
          setError(prodData.error || "Product not found");
          setLoading(false);
          return;
        }

        const p = prodData.product;
        let images: string[] = [];
        let sizes: string[] = [];
        let colours: string[] = [];
        let tags: string[] = [];
        try {
          images = JSON.parse(p.images || "[]");
          sizes = JSON.parse(p.sizes || "[]");
          colours = JSON.parse(p.colours || "[]");
          tags = JSON.parse(p.tags || "[]");
        } catch {}

        setForm({
          name: p.name || "",
          description: p.description || "",
          price: String(p.price ?? ""),
          salePrice: p.salePrice != null ? String(p.salePrice) : "",
          sku: p.sku || "",
          brand: p.brand || "",
          categoryId: p.categoryId || "",
          stock: String(p.stock ?? 0),
          sizes: sizes.join(","),
          colours: colours.join(","),
          tags: tags.join(","),
          images: images.join("\n"),
          isFeatured: !!p.isFeatured,
          isNewArrival: !!p.isNewArrival,
          isOnSale: !!p.isOnSale,
          isActive: p.isActive !== false,
        });

        if (catData.categories) setCategories(catData.categories);
      } catch (e) {
        setError("Failed to load product");
      }
      setLoading(false);
    }
    if (id) load();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          sku: form.sku,
          brand: form.brand,
          categoryId: form.categoryId,
          stock: parseInt(form.stock, 10),
          sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colours: form.colours.split(",").map((c) => c.trim()).filter(Boolean),
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: form.images
            .split("\n")
            .map((i) => i.trim())
            .filter(Boolean),
          isFeatured: form.isFeatured,
          isNewArrival: form.isNewArrival,
          isOnSale: form.isOnSale,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      setSuccess("Product saved!");
      setSaving(false);
      setTimeout(() => setSuccess(""), 2500);
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this product? If it is on past orders it will be hidden instead of permanently deleted."
      )
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete");
        setDeleting(false);
        return;
      }
      router.push("/admin/products");
    } catch {
      setError("Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin/products" className="font-bold text-sm">
            ← Products
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete product"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="bg-white border p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Price (R) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Sale Price (R)</label>
              <input
                type="number"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">SKU *</label>
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Stock *</label>
              <input
                required
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Brand</label>
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Category *</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Sizes (comma-separated)
            </label>
            <input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
              placeholder="S,M,L,XL"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Colours (comma-separated)
            </label>
            <input
              value={form.colours}
              onChange={(e) => setForm({ ...form, colours: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              rows={4}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="w-full border px-3 py-2 text-sm"
              placeholder={"/images/my-product.jpg\n/images/my-product-2.jpg"}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Put files in <code>public/images/</code> then use paths like{" "}
              <code>/images/photo.jpg</code>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) =>
                  setForm({ ...form, isNewArrival: e.target.checked })
                }
              />
              New Arrival
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isOnSale}
                onChange={(e) => setForm({ ...form, isOnSale: e.target.checked })}
              />
              On Sale
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active (visible in shop)
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 p-3">{success}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-black text-white text-sm font-semibold uppercase disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <Link
              href="/admin/products"
              className="px-5 py-3 border text-sm font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
