import Link from "next/link";

const faqs = [
  ["Do you deliver across India?", "Yes. We aim to provide delivery across India, subject to courier serviceability for the destination PIN code."],
  ["Are the products handmade?", "Our store focuses on handmade Aipan art, personalised creations and Himalayan-inspired artwork. Small variations are normal in handmade work."],
  ["Can I request a custom design?", "Yes. Use the Customise section on the home page. You can select a product, describe your idea and optionally upload a reference image."],
  ["Do I need an account to order?", "An account is required for the current order system so that your orders can be linked to your account and tracked from My Orders."],
  ["Can I cancel a personalised order?", "Please contact us as early as possible. Once personalised work has started, cancellation may not be possible."],
  ["What if my order arrives damaged?", "Contact us promptly with your order details and clear photographs of the package and product. We will review the issue and guide you on the next step."],
  ["How can I contact Devbhoomi Designs?", "Email devbhoomidesigns@gmail.com. We are based in Haldwani, Uttarakhand."],
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#351717]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/" className="text-sm font-bold text-[#a51c24]">← Back to Devbhoomi Designs</Link>
        <p className="mt-10 text-sm font-bold tracking-[0.25em] text-[#a51c24]">DEVBHOOMI DESIGNS</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Frequently Asked Questions</h1>

        <div className="mt-10 space-y-4">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-2xl border border-[#ead8c7] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none pr-6 text-lg font-black">
                {question}
              </summary>
              <p className="mt-3 leading-7 text-[#795c52]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}