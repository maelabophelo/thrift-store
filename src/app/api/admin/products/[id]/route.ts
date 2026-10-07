import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Keep slug stable unless name changed significantly – update slug only if name changed
    let slug = existing.slug;
    if (body.name && body.name !== existing.name) {
      slug = slugify(body.name) + "-" + id.slice(-6);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice ?? null,
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
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ product });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft-delete if product is on any order; hard delete otherwise
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false, stock: 0 },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: "Product deactivated (it appears on past orders)",
      });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, softDeleted: false });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
