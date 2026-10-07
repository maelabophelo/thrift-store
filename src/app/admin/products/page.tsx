import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") redirect("/admin/login");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="font-bold">
            ← Admin
          </Link>
          <Link
            href="/admin/products/new"
            className="text-sm font-semibold bg-black text-white px-4 py-2"
          >
            + Add Product
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Products ({products.length})</h1>
        <div className="bg-white border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{p.sku}</td>
                  <td className="px-4 py-3">
                    {p.isOnSale && p.salePrice != null ? (
                      <>
                        <span className="text-red-600">{formatZAR(p.salePrice)}</span>
                        <span className="text-xs line-through ml-1 text-neutral-400">
                          {formatZAR(p.price)}
                        </span>
                      </>
                    ) : (
                      formatZAR(p.price)
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 text-xs">{p.category?.name}</td>
                  <td className="px-4 py-3 text-xs space-x-1">
                    {p.isFeatured && <span className="bg-neutral-200 px-1">Feat</span>}
                    {p.isNewArrival && <span className="bg-neutral-200 px-1">New</span>}
                    {p.isOnSale && <span className="bg-red-100 text-red-700 px-1">Sale</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="underline text-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
