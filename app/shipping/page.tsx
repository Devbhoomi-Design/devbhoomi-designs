import Link from "next/link";

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#351717]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/" className="text-sm font-bold text-[#a51c24]">← Back to Devbhoomi Designs</Link>
        <p className="mt-10 text-sm font-bold tracking-[0.25em] text-[#a51c24]">DEVBHOOMI DESIGNS</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Shipping & Delivery</h1>
        <p className="mt-3 text-sm text-[#795c52]">Last updated: 4 September 2026</p>

        <div className="mt-10 space-y-8 leading-8 text-[#5f4740]">
          <section><h2 className="text-2xl font-black text-[#351717]">1. Delivery Area</h2>
            <p className="mt-3">We aim to deliver orders across India. Serviceability can depend on the destination PIN code and courier availability.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">2. Processing Time</h2>
            <p className="mt-3">Handmade and personalised products may require additional preparation time. The estimated processing and delivery timeline will depend on the product and destination.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">3. Delivery Delays</h2>
            <p className="mt-3">Courier delays may occur because of weather, transport disruption, public holidays, remote-area service, or circumstances outside our control. We will assist with tracking when tracking information is available.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">4. Address Accuracy</h2>
            <p className="mt-3">Customers are responsible for providing a complete and accurate delivery address, phone number, and PIN code. Incorrect or incomplete details may cause delays or additional delivery attempts.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">5. Damaged Packages</h2>
            <p className="mt-3">If your package arrives visibly damaged, please contact us as soon as possible with photographs of the package and product so we can review the issue.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">6. Contact</h2>
            <p className="mt-3">For delivery questions, email <a className="font-bold text-[#a51c24] underline" href="mailto:devbhoomidesigns@gmail.com">devbhoomidesigns@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}