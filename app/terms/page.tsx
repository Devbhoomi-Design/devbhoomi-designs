import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#351717]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/" className="text-sm font-bold text-[#a51c24]">← Back to Devbhoomi Designs</Link>
        <p className="mt-10 text-sm font-bold tracking-[0.25em] text-[#a51c24]">DEVBHOOMI DESIGNS</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Terms & Conditions</h1>
        <p className="mt-3 text-sm text-[#795c52]">Effective date: 4 September 2026</p>

        <div className="mt-10 space-y-8 leading-8 text-[#5f4740]">
          <section><h2 className="text-2xl font-black text-[#351717]">1. About Our Store</h2>
            <p className="mt-3">Devbhoomi Designs offers handmade Aipan art, personalised creations, paintings, and gifts. Product appearance may vary slightly because handmade products are individually created.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">2. Product Information</h2>
            <p className="mt-3">We aim to display accurate product descriptions, prices, images, sizes, and availability. Colours can appear different depending on your screen and lighting.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">3. Orders</h2>
            <p className="mt-3">An order request is subject to product availability and confirmation. We may contact you if information is incomplete or a product cannot be fulfilled.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">4. Custom Orders</h2>
            <p className="mt-3">Custom work is prepared according to the information supplied by the customer. Customers are responsible for checking names, spellings, dates, sizes, and other details before submitting a request.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">5. Intellectual Property</h2>
            <p className="mt-3">Website content, branding, original artwork, product photographs, and other materials belonging to Devbhoomi Designs may not be copied, reproduced, or commercially reused without permission.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">6. Pricing & Availability</h2>
            <p className="mt-3">Prices and availability may change without prior notice. If an obvious pricing or catalogue error occurs, we may contact you before fulfilling the order.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">7. Contact</h2>
            <p className="mt-3">Questions about these terms can be sent to <a className="font-bold text-[#a51c24] underline" href="mailto:devbhoomidesigns@gmail.com">devbhoomidesigns@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}