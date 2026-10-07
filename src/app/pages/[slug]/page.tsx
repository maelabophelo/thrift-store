import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.pageContent.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
        {page.title}
      </h1>
      <div className="prose prose-neutral text-sm leading-relaxed whitespace-pre-line text-neutral-700">
        {page.content}
      </div>
    </div>
  );
}
