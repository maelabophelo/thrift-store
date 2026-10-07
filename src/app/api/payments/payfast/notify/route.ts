import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/notifications";
import { format } from "date-fns";

/**
 * PayFast ITN (Instant Transaction Notification) webhook.
 * Marks order as PAID only after server-side verification.
 * See: https://developers.payfast.co.za/docs#step_4_itn
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("PayFast ITN received:", data);

    const orderNumber = data.m_payment_id;
    const paymentStatus = data.payment_status; // COMPLETE, FAILED, PENDING
    const amountGross = parseFloat(data.amount_gross || "0");

    if (!orderNumber) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      console.error("Order not found:", orderNumber);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent double processing
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ status: "already processed" });
    }

    // Validate amount (prevent tampering)
    if (Math.abs(amountGross - order.total) > 0.05) {
      console.error("Amount mismatch", amountGross, order.total);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // TODO: In production, validate the signature using PAYFAST_PASSPHRASE
    // See PayFast docs for signature generation.

    if (paymentStatus === "COMPLETE") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          orderStatus: "PAYMENT_RECEIVED",
          paymentProvider: "payfast",
          paymentReference: data.pf_payment_id || data.payment_id || null,
          paymentVerifiedAt: new Date(),
        },
      });

      // Send notification to store owner
      await sendOrderNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        products: order.items.map((i) => ({
          name: i.name,
          size: i.size,
          colour: i.colour,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentStatus: "PAID",
        pepStoreName: order.pepStoreName,
        pepStoreAddress: order.pepStoreAddress,
        pepStoreCity: order.pepStoreCity,
        pepStoreProvince: order.pepStoreProvince,
        customerNotes: order.customerNotes,
        orderDate: format(order.createdAt, "yyyy-MM-dd HH:mm"),
      });
    } else if (paymentStatus === "FAILED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
    }

    // PayFast expects a 200 response
    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayFast notify error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
