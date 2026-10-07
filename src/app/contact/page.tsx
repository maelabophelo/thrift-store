import Link from "next/link";

export const metadata = {
  title: "Contact",
  description: "Contact THE THRIFT STORE – WhatsApp 072 355 1014 | maelabophelo@gmail.com",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        Contact Us
      </h1>
      <div className="space-y-6 text-sm text-neutral-700">
        <div>
          <p className="font-semibold text-black text-base">THE THRIFT STORE</p>
          <p>South Africa</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
            WhatsApp
          </p>
          <a
            href="https://wa.me/27723551014?text=Hi%20THE%20THRIFT%20STORE%2C%20I%20need%20help%20with%20an%20order."
            className="text-lg font-medium text-green-700 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            072 355 1014
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
            Email
          </p>
          <a
            href="mailto:maelabophelo@gmail.com"
            className="text-lg font-medium hover:underline"
          >
            maelabophelo@gmail.com
          </a>
        </div>
        <p className="text-neutral-600">
          We typically reply within a few hours during business hours. For order
          updates, include your order number.
        </p>
        <a
          href="https://wa.me/27723551014?text=Hi%20THE%20THRIFT%20STORE%2C%20I%20need%20help%20with%20an%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-full"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
