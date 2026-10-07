import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/lib/cart-context";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "THE THRIFT STORE | Affordable Shoes South Africa",
    template: "%s | THE THRIFT STORE",
  },
  description:
    "Affordable sneakers, formal shoes and boots delivered across South Africa via PAXI to PEP stores.",
  keywords: [
    "thrift store",
    "shoes South Africa",
    "sneakers SA",
    "PAXI delivery",
    "PEP collection",
    "boots",
    "formal shoes",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "THE THRIFT STORE",
    title: "THE THRIFT STORE | Affordable Shoes South Africa",
    description:
      "Affordable sneakers and footwear delivered to PEP stores across South Africa.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
