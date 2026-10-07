export const metadata = {
  title: "About",
  description: "About THE THRIFT STORE – affordable shoes for South Africa.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        About THE THRIFT STORE
      </h1>
      <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
        <p>
          THE THRIFT STORE is a South African online <strong>shoe store</strong>.
          We only sell footwear – sneakers, formal shoes, boots and more – at
          prices that make sense for everyday shoppers.
        </p>
        <p>
          Instead of home delivery, we use <strong>PAXI</strong> to send your
          order to the <strong>PEP store</strong> closest to you. It&apos;s
          convenient, nationwide and designed for how many South Africans
          already collect parcels.
        </p>
        <p>
          Your kicks. Your street. Your store.
        </p>
      </div>
    </div>
  );
}
