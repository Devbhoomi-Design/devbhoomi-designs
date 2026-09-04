import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#351717]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/" className="text-sm font-bold text-[#a51c24]">← Back to Devbhoomi Designs</Link>
        <p className="mt-10 text-sm font-bold tracking-[0.25em] text-[#a51c24]">DEVBHOOMI DESIGNS</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#795c52]">Effective date: 4 September 2026</p>

        <div className="mt-10 space-y-8 leading-8 text-[#5f4740]">
          <section><h2 className="text-2xl font-black text-[#351717]">1. Information We Collect</h2>
            <p className="mt-3">When you create an account, place an order, request a custom creation, or contact us, we may collect information such as your name, email address, phone number, delivery address, order details, and information you provide for a custom design.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">2. How We Use Your Information</h2>
            <p className="mt-3">We use your information to process and deliver orders, manage your account, respond to enquiries and custom requests, provide order updates, improve our store, and prevent misuse or fraud.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">3. Custom Design Images</h2>
            <p className="mt-3">If you upload a reference image for a custom request, we use it to understand and prepare your requested artwork. Please do not upload material that you do not have permission to share.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">4. Payments</h2>
            <p className="mt-3">When online payments are enabled, payment processing may be handled by a third-party payment provider. We do not intend to store your complete card, UPI, or banking credentials on our own servers.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">5. Data Security</h2>
            <p className="mt-3">We take reasonable technical and organisational measures to protect account and order information. No internet-based service can guarantee absolute security.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">6. Data Sharing</h2>
            <p className="mt-3">We may share necessary information with service providers involved in hosting, order fulfilment, delivery, customer support, or payment processing. We do not sell your personal information.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">7. Your Choices</h2>
            <p className="mt-3">You may contact us to ask about your personal information or to request correction of inaccurate information, subject to applicable law and operational requirements.</p>
          </section>
          <section><h2 className="text-2xl font-black text-[#351717]">8. Contact</h2>
            <p className="mt-3">For privacy questions, contact <a className="font-bold text-[#a51c24] underline" href="mailto:devbhoomidesigns@gmail.com">devbhoomidesigns@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}