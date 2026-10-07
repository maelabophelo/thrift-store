import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatZAR(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPhoneZA(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("27") && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+27${cleaned.slice(1)}`;
  }
  return phone;
}

export function isValidSAPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // 0XXXXXXXXX (10 digits) or 27XXXXXXXXX (11 digits)
  if (cleaned.startsWith("0") && cleaned.length === 10) return true;
  if (cleaned.startsWith("27") && cleaned.length === 11) return true;
  return false;
}

export function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `TTS-${num}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "Eastern Cape",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
] as const;

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_RECEIVED",
  "PREPARING_ORDER",
  "SENT_VIA_PAXI",
  "READY_FOR_COLLECTION",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_RECEIVED: "Payment Received",
  PREPARING_ORDER: "Preparing Order",
  SENT_VIA_PAXI: "Sent via PAXI",
  READY_FOR_COLLECTION: "Ready for Collection",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};
