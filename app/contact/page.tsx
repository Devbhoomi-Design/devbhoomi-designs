import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#351717]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/" className="text-sm font-bold text-[#a51c24]">← Back to Devbhoomi Designs</Link>
        <p className="mt-10 text-sm font-bold tracking-[0.25em] text-[#a51c24]">DEVBHOOMI DESIGNS</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Contact Us</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#795c52]">We are happy to help with orders, custom artwork, delivery questions, and general enquiries.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-[#ead8c7] bg-white p-7 shadow-sm">
            <p className="text-sm font-bold tracking-widest text-[#a51c24]">EMAIL</p>
            <a href="mailto:devbhoomidesigns@gmail.com" className="mt-3 block text-xl font-black text-[#351717]">devbhoomidesigns@gmail.com</a>
          </div>
          <div className="rounded-3xl border border-[#ead8c7] bg-white p-7 shadow-sm">
            <p className="text-sm font-bold tracking-widest text-[#a51c24]">LOCATION</p>
            <p className="mt-3 text-xl font-black text-[#351717]">Haldwani, Uttarakhand</p>
            <p className="mt-1 text-[#795c52]">India</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-[#a51c24] p-8 text-white">
          <h2 className="text-2xl font-black">Custom artwork?</h2>
          <p className="mt-3 leading-7 text-[#ffe9dc]">Use the Customise section on the home page to send your idea and reference image.</p>
          <Link href="/#custom" className="mt-5 inline-block rounded-full bg-[#ffd99c] px-6 py-3 font-bold text-[#571719]">Start a Custom Request</Link>
        </div>
      </div>
    </main>
  );
}