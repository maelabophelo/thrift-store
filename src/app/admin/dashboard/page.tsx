import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin/login");
  }

  const [productCount, orderCount, pendingOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "PENDING_PAYMENT" } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-bold tracking-tight">THE THRIFT STORE Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/dashboard" className="font-medium">
              Dashboard
            </Link>
            <Link href="/admin/products" className="text-neutral-600 hover:text-black">
              Products
            </Link>
            <Link href="/admin/orders" className="text-neutral-600 hover:text-black">
              Orders
            </Link>
            <Link href="/admin/settings" className="text-neutral-600 hover:text-black">
              Settings
            </Link>
            <Link href="/" className="text-neutral-600 hover:text-black">
              View Store
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase">Products</p>
            <p className="text-2xl font-bold mt-1">{productCount}</p>
          </div>
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase">Orders</p>
            <p className="text-2xl font-bold mt-1">{orderCount}</p>
          </div>
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase">Pending Payment</p>
            <p className="text-2xl font-bold mt-1">{pendingOrders}</p>
          </div>
          <div className="bg-white p-5 border border-neutral-200">
            <Link
              href="/admin/products/new"
              className="text-sm font-semibold text-black underline"
            >
              + Add Product
            </Link>
          </div>
        </div>

        <h3 className="font-semibold mb-4">Recent Orders</h3>
        <div className="bg-white border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">PEP Store</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <br />
                    <span className="text-xs text-neutral-500">{o.customerPhone}</span>
                  </td>
                  <td className="px-4 py-3">{formatZAR(o.total)}</td>
                  <td className="px-4 py-3">{o.paymentStatus}</td>
                  <td className="px-4 py-3">{o.orderStatus}</td>
                  <td className="px-4 py-3 text-xs">{o.pepStoreName}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
