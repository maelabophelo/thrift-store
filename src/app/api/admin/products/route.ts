import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const slug = slugify(body.name) + "-" + Date.now().toString(36);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice,
        sku: body.sku,
        brand: body.brand || null,
        categoryId: body.categoryId,
        stock: body.stock,
        images: JSON.stringify(body.images || []),
        sizes: JSON.stringify(body.sizes || []),
        colours: JSON.stringify(body.colours || []),
        tags: JSON.stringify(body.tags || []),
        isFeatured: !!body.isFeatured,
        isNewArrival: !!body.isNewArrival,
        isOnSale: !!body.isOnSale,
      },
    });

    return NextResponse.json({ product });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
