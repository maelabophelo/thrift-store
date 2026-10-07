/**
 * Order notification service.
 * Sends order details to the store owner via WhatsApp/SMS.
 * Configure WHATSAPP_API_URL + WHATSAPP_API_KEY or use a webhook.
 */

export interface OrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  products: Array<{
    name: string;
    size?: string | null;
    colour?: string | null;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: string;
  pepStoreName: string;
  pepStoreAddress: string;
  pepStoreCity: string;
  pepStoreProvince: string;
  customerNotes?: string | null;
  orderDate: string;
}

export function formatOrderMessage(payload: OrderNotificationPayload): string {
  const lines = [
    `NEW ORDER – THE THRIFT STORE`,
    `Order #: ${payload.orderNumber}`,
    ``,
    `Customer:`,
    payload.customerName,
    `Phone: ${payload.customerPhone}`,
    `Email: ${payload.customerEmail}`,
    ``,
    `Products:`,
  ];

  for (const p of payload.products) {
    lines.push(`${p.name}`);
    if (p.size) lines.push(`Size: ${p.size}`);
    if (p.colour) lines.push(`Colour: ${p.colour}`);
    lines.push(`Qty: ${p.quantity} × R${p.price}`);
    lines.push(``);
  }

  lines.push(`PAXI Collection Point:`);
  lines.push(payload.pepStoreName);
  lines.push(payload.pepStoreAddress);
  lines.push(`${payload.pepStoreCity}, ${payload.pepStoreProvince}`);
  lines.push(``);
  lines.push(`Subtotal: R${payload.subtotal}`);
  lines.push(`Delivery: R${payload.deliveryFee}`);
  lines.push(`TOTAL: R${payload.total}`);
  lines.push(`Payment: ${payload.paymentStatus}`);
  lines.push(`Date: ${payload.orderDate}`);
  if (payload.customerNotes) {
    lines.push(``);
    lines.push(`Notes: ${payload.customerNotes}`);
  }

  return lines.join("\n");
}

export async function sendOrderNotification(
  payload: OrderNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const message = formatOrderMessage(payload);
  const to = process.env.WHATSAPP_TO_NUMBER || "27723551014";
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  // Log always (visible in server logs / Vercel logs)
  console.log("=== ORDER NOTIFICATION ===");
  console.log(message);
  console.log("==========================");

  if (!apiUrl || !apiKey) {
    // No external service configured – notification is logged.
    // Owner can connect Twilio, Africa's Talking, Make.com webhook, etc.
    return {
      success: true,
      error: "Notification logged (no WhatsApp API configured). Check server logs.",
    };
  }

  try {
    // Generic webhook / API call – adapt to your provider
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to,
        message,
        type: "order_notification",
        store: "THE THRIFT STORE",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Notification API error:", text);
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Notification send failed:", err);
    return { success: false, error: err.message };
  }
}
