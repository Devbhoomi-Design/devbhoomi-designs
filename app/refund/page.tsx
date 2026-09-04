import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#351717]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/" className="text-sm font-bold text-[#a51c24]">← Back to Devbhoomi Designs</Link>
        <p className="mt-10 text-sm font-bold tracking-[0.25em] text-[#a51c24]">DEVBHOOMI DESIGNS</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Cancellation & Refund Policy</h1>
        <p className="mt-3 text-sm text-[#795c52]">Last updated: 4 September 2026</p>

        <div className="mt-10 space-y-8 leading-8 text-[#5f4740]">
          <section><h2 className="text-2xl font-black text-[#351717]">1. Cancellation</h2>
            <p className="mt-3">Cancellation requests should be made as soon as possible. Because personalised and handmade orders may enter production quickly, cancellation may not be possible after work has started.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">2. Personalised Products</h2>
            <p className="mt-3">Personalised or custom-made products are generally not eligible for return simply because you changed your mind or entered incorrect customisation details. Please check all submitted details carefully.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">3. Damaged or Incorrect Items</h2>
            <p className="mt-3">If you receive a damaged, defective, or incorrect item, contact us promptly with your order details and clear photographs. We will review the case and, where appropriate, offer a replacement, correction, or refund.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">4. Refunds</h2>
            <p className="mt-3">If a refund is approved, the amount and method will depend on the payment method and the circumstances of the order. Processing time can vary after a refund is initiated.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">5. Contact Before Returning</h2>
            <p className="mt-3">Please contact us before sending any product back. Unauthorised returns may not be accepted.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">6. Contact</h2>
            <p className="mt-3">For cancellation or refund support, email <a className="font-bold text-[#a51c24] underline" href="mailto:devbhoomidesigns@gmail.com">devbhoomidesigns@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}