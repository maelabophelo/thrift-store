import { prisma } from "./prisma";

const DEFAULTS: Record<string, string> = {
  paxi_delivery_fee: "69",
  store_name: "THE THRIFT STORE",
  whatsapp_number: "27723551014",
  contact_email: "",
  free_shipping_threshold: "0",
};

export async function getSetting(key: string): Promise<string> {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key } });
    return setting?.value ?? DEFAULTS[key] ?? "";
  } catch {
    return DEFAULTS[key] ?? "";
  }
}

export async function setSetting(key: string, value: string) {
  await prisma.storeSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getPaxiFee(): Promise<number> {
  const fee = await getSetting("paxi_delivery_fee");
  return parseFloat(fee) || 69;
}
