import { prisma } from "@/lib/prisma";
import { formatZAR, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { orderNumber } = await params;
  const { status } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const isPaid = order.paymentStatus === "PAID";
  const isPending = order.paymentStatus === "PENDING";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-10">
        {isPaid ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-700 text-2xl mb-4">
              ✓
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-neutral-600">
              Thank you for shopping with THE THRIFT STORE.
            </p>
          </>
        ) : isPending ? (
          <>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Order Received
            </h1>
            <p className="mt-2 text-neutral-600">
              We are waiting for payment confirmation.
              {status === "return" &&
                " If you just paid, confirmation may take a moment."}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Order Update</h1>
            <p className="mt-2 text-neutral-600">
              Payment status: {order.paymentStatus}
            </p>
          </>
        )}
      </div>

      <div className="border border-neutral-200 p-6 space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Order number</span>
          <span className="font-semibold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Date</span>
          <span>{format(order.createdAt, "dd MMM yyyy, HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Status</span>
          <span>
            {ORDER_STATUS_LABELS[order.orderStatus as OrderStatus] ||
              order.orderStatus}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Payment</span>
          <span className="font-medium">{order.paymentStatus}</span>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <p className="text-neutral-500 mb-1">PAXI Collection Point</p>
          <p className="font-medium">{order.pepStoreName}</p>
          <p className="text-neutral-600">{order.pepStoreAddress}</p>
          <p className="text-neutral-600">
            {order.pepStoreCity}, {order.pepStoreProvince}
          </p>
        </div>

        <hr className="border-neutral-200" />

        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
                {item.size ? ` · ${item.size}` : ""}
                {item.colour ? ` · ${item.colour}` : ""}
              </span>
              <span>{formatZAR(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between pt-2">
          <span className="text-neutral-500">Subtotal</span>
          <span>{formatZAR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">PAXI Delivery</span>
          <span>{formatZAR(order.deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-neutral-200">
          <span>Total</span>
          <span>{formatZAR(order.total)}</span>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-neutral-600">
        You will receive updates regarding your order. Questions?{" "}
        <a
          href="https://wa.me/27723551014"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp us
        </a>
      </p>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-black text-white text-sm font-semibold uppercase"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
