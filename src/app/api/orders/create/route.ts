import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaxiFee } from "@/lib/settings";
import { generateOrderNumber, isValidSAPhone } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email(),
  pepStoreName: z.string().min(2),
  pepStoreAddress: z.string().min(5),
  pepStoreCity: z.string().min(2),
  pepStoreProvince: z.string().min(2),
  paxiReference: z.string().nullable().optional(),
  customerNotes: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        size: z.string().nullable().optional(),
        colour: z.string().nullable().optional(),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (!isValidSAPhone(data.customerPhone)) {
      return NextResponse.json(
        { error: "Invalid South African phone number" },
        { status: 400 }
      );
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== new Set(productIds).size) {
      return NextResponse.json(
        { error: "One or more products are unavailable" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItems: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      size: string | null;
      colour: string | null;
      image: string | null;
    }[] = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
      const unitPrice =
        product.isOnSale && product.salePrice != null
          ? product.salePrice
          : product.price;
      subtotal += unitPrice * item.quantity;

      let images: string[] = [];
      try {
        images = JSON.parse(product.images || "[]");
      } catch {}

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        size: item.size || null,
        colour: item.colour || null,
        image: images[0] || null,
      });
    }

    const deliveryFee = await getPaxiFee();
    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          pepStoreName: data.pepStoreName,
          pepStoreAddress: data.pepStoreAddress,
          pepStoreCity: data.pepStoreCity,
          pepStoreProvince: data.pepStoreProvince,
          paxiReference: data.paxiReference,
          customerNotes: data.customerNotes,
          subtotal,
          deliveryFee,
          total,
          paymentStatus: "PENDING",
          orderStatus: "PENDING_PAYMENT",
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });
    });

    let paymentUrl: string | null = null;
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;

    if (merchantId && merchantKey) {
      const base =
        process.env.PAYFAST_SANDBOX === "true"
          ? "https://sandbox.payfast.co.za/eng/process"
          : "https://www.payfast.co.za/eng/process";

      const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";
      const params = new URLSearchParams({
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${storeUrl}/order/${orderNumber}?status=return`,
        cancel_url: `${storeUrl}/checkout?cancelled=1`,
        notify_url: `${storeUrl}/api/payments/payfast/notify`,
        name_first: data.customerName.split(" ")[0] || data.customerName,
        email_address: data.customerEmail,
        cell_number: data.customerPhone.replace(/\D/g, "").slice(-9),
        m_payment_id: orderNumber,
        amount: total.toFixed(2),
        item_name: `THE THRIFT STORE Order ${orderNumber}`,
      });

      paymentUrl = `${base}?${params.toString()}`;
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      total: order.total,
      paymentUrl,
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
