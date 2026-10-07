import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding THE THRIFT STORE (shoes only)...");

  const hashed = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "ChangeMeImmediately123!",
    12
  );
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@thethriftstore.co.za" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@thethriftstore.co.za",
      password: hashed,
      name: "Store Owner",
    },
  });
  console.log("Admin created");

  await prisma.storeSetting.upsert({
    where: { key: "paxi_delivery_fee" },
    update: {},
    create: { key: "paxi_delivery_fee", value: "69" },
  });

  // Remove old clothing categories & products so store is shoes-only
  await prisma.orderItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({}).catch(() => {});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const categories = [
    { name: "Sneakers", slug: "sneakers" },
    { name: "Formal Shoes", slug: "formal" },
    { name: "Boots", slug: "boots" },
    { name: "Sandals", slug: "sandals" },
    { name: "Sports", slug: "sports" },
    { name: "Kids", slug: "kids" },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log("Shoe categories created");

  const sneakers = await prisma.category.findUnique({ where: { slug: "sneakers" } });
  const formal = await prisma.category.findUnique({ where: { slug: "formal" } });
  const boots = await prisma.category.findUnique({ where: { slug: "boots" } });
  const sports = await prisma.category.findUnique({ where: { slug: "sports" } });

  const products = [
    {
      name: "Urban Runner Sneakers",
      slug: "urban-runner-sneakers",
      description: "Lightweight street sneakers. Cushioned sole, breathable upper. Built for the city.",
      price: 799,
      salePrice: 649,
      sku: "TTS-SNK-001",
      brand: "StreetLab",
      categoryId: sneakers!.id,
      stock: 15,
      images: JSON.stringify(["/images/placeholder-sneakers.jpg"]),
      sizes: JSON.stringify(["6", "7", "8", "9", "10", "11"]),
      colours: JSON.stringify(["White/Black", "All Black"]),
      tags: JSON.stringify(["sneakers", "streetwear"]),
      isFeatured: true,
      isNewArrival: true,
      isOnSale: true,
    },
    {
      name: "Classic White Sneaker",
      slug: "classic-white-sneaker",
      description: "Clean white everyday sneaker. Easy to style with anything.",
      price: 599,
      salePrice: null,
      sku: "TTS-SNK-002",
      brand: "THE THRIFT STORE",
      categoryId: sneakers!.id,
      stock: 20,
      images: JSON.stringify(["/images/placeholder-sneakers.jpg"]),
      sizes: JSON.stringify(["5", "6", "7", "8", "9", "10"]),
      colours: JSON.stringify(["White", "Off-White"]),
      tags: JSON.stringify(["sneakers", "white"]),
      isFeatured: true,
      isNewArrival: true,
      isOnSale: false,
    },
    {
      name: "Oxford Formal Shoe",
      slug: "oxford-formal-shoe",
      description: "Smart leather-look oxford. Perfect for work and formal events.",
      price: 899,
      salePrice: 749,
      sku: "TTS-FRM-001",
      brand: "THE THRIFT STORE",
      categoryId: formal!.id,
      stock: 12,
      images: JSON.stringify(["/images/placeholder-formal.jpg"]),
      sizes: JSON.stringify(["7", "8", "9", "10", "11"]),
      colours: JSON.stringify(["Black", "Brown"]),
      tags: JSON.stringify(["formal", "oxford"]),
      isFeatured: true,
      isNewArrival: false,
      isOnSale: true,
    },
    {
      name: "Chelsea Boot",
      slug: "chelsea-boot",
      description: "Slip-on chelsea boot with elastic side panels. Street and smart.",
      price: 999,
      salePrice: null,
      sku: "TTS-BOT-001",
      brand: "THE THRIFT STORE",
      categoryId: boots!.id,
      stock: 10,
      images: JSON.stringify(["/images/placeholder-boots.jpg"]),
      sizes: JSON.stringify(["7", "8", "9", "10", "11"]),
      colours: JSON.stringify(["Black", "Tan"]),
      tags: JSON.stringify(["boots", "chelsea"]),
      isFeatured: true,
      isNewArrival: true,
      isOnSale: false,
    },
    {
      name: "Trail Runner",
      slug: "trail-runner",
      description: "Grip sole sports shoe for training and light trails.",
      price: 699,
      salePrice: 549,
      sku: "TTS-SPT-001",
      brand: "StreetLab",
      categoryId: sports!.id,
      stock: 18,
      images: JSON.stringify(["/images/placeholder-sports.jpg"]),
      sizes: JSON.stringify(["6", "7", "8", "9", "10", "11"]),
      colours: JSON.stringify(["Grey/Orange", "Black/Red"]),
      tags: JSON.stringify(["sports", "running"]),
      isFeatured: false,
      isNewArrival: true,
      isOnSale: true,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("Demo shoe products created");

  const pages = [
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: `THE THRIFT STORE ("we", "us") respects your privacy. We collect only the information necessary to process your orders: name, phone, email, and PEP store collection details. We do not sell your data. Payment information is handled securely by our payment provider and is never stored on our servers. Contact us at 072 355 1014 for any privacy requests.`,
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      content: `By placing an order with THE THRIFT STORE you agree to these terms. We sell footwear only. All prices are in South African Rand (ZAR). Orders are fulfilled via PAXI to your selected PEP collection point. You are responsible for collecting your parcel within the PAXI collection window. We reserve the right to cancel orders in case of stock errors or suspected fraud.`,
    },
    {
      slug: "returns",
      title: "Returns & Refund Policy",
      content: `We accept returns of unused shoes in original condition within 7 days of collection from the PEP store. Contact us on WhatsApp 072 355 1014 to initiate a return. Sale items may be final sale. Refunds are processed to the original payment method within 5–10 business days after we receive the returned item.`,
    },
    {
      slug: "delivery",
      title: "Delivery Information",
      content: `THE THRIFT STORE delivers exclusively via PAXI to PEP stores across South Africa. We do not offer home delivery. After payment, your order is prepared and handed to PAXI. You will receive a tracking/collection notification. Please ensure the PEP store details you provide are accurate.`,
    },
    {
      slug: "paxi",
      title: "PAXI Delivery Information",
      content: `PAXI is a convenient parcel service that delivers to PEP stores nationwide. Choose the PEP store closest to you at checkout. Once your order is ready for collection you will be notified. Bring your ID and the collection reference. Collection windows are usually a few days – please collect promptly.`,
    },
    {
      slug: "contact",
      title: "Contact Us",
      content: `THE THRIFT STORE\nSouth Africa\n\nWhatsApp: 072 355 1014\nEmail: [add your email in Admin]\n\nWe typically reply within a few hours during business hours.`,
    },
  ];

  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      update: { title: page.title, content: page.content },
      create: page,
    });
  }
  console.log("Legal pages created");
  console.log("Seed complete! (shoes only)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
