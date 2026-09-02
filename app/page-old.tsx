const products = [
  {
    name: "Personalised Aipan Nameplate",
    category: "Personalised Art",
    price: "₹1,499",
    oldPrice: "₹1,799",
    badge: "BESTSELLER",
    symbol: "ॐ",
  },
  {
    name: "Aipan Kalash / Tauli / Lota",
    category: "Aipan Collection",
    price: "₹899",
    oldPrice: "₹1,099",
    badge: "HANDMADE",
    symbol: "✦",
  },
  {
    name: "Aipan Wall Hanging",
    category: "Wall Art",
    price: "₹1,999",
    oldPrice: "₹2,499",
    badge: "POPULAR",
    symbol: "✺",
  },
  {
    name: "Customised Aipan Chowki",
    category: "Custom Creations",
    price: "₹1,299",
    oldPrice: "₹1,599",
    badge: "CUSTOM",
    symbol: "ॐ",
  },
];

const categories = [
  { title: "Aipan Art", subtitle: "Traditional Uttarakhand Art", icon: "✺" },
  { title: "Personalised", subtitle: "Made specially for you", icon: "♡" },
  { title: "Wall Art", subtitle: "Bring tradition home", icon: "◉" },
  { title: "Gifts", subtitle: "Gifts with a story", icon: "✦" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#321b16]">

      {/* TOP ANNOUNCEMENT */}
      <div className="bg-[#8f1717] px-4 py-2 text-center text-xs font-medium tracking-[0.18em] text-white sm:text-sm">
        ✦ HANDCRAFTED IN UTTARAKHAND • DELIVERING ACROSS INDIA ✦
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#ead8c8] bg-[#fffaf4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          {/* LOGO */}
          <link href="/" className="flex items-center gap-3">
            <img
              src="/devbhoomi-logo.jpeg"
              alt="Devbhoomi Designs"
              className="h-12 w-auto rounded-md object-contain"
            />
          </link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#" className="transition hover:text-[#a21b1b]">Home</a>
            <a href="#shop" className="transition hover:text-[#a21b1b]">Shop</a>
            <a href="#collections" className="transition hover:text-[#a21b1b]">Collections</a>
            <a href="#story" className="transition hover:text-[#a21b1b]">Our Story</a>
            <a href="#custom" className="transition hover:text-[#a21b1b]">Customise</a>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-[#d9bca5] p-3 transition hover:bg-[#f4e5d8] sm:block">
              🔍
            </button>

            <button className="relative rounded-full border border-[#d9bca5] p-3 transition hover:bg-[#f4e5d8]">
              🛒
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#a21b1b] text-[10px] text-white">
                0
              </span>
            </button>

            <button className="hidden rounded-full bg-[#a21b1b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7e1111] sm:block">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#9d1717]">

        {/* AIPAN-STYLE DECORATION */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full border-[2px] border-dashed border-white/20" />
        <div className="absolute -right-40 bottom-[-180px] h-[500px] w-[500px] rounded-full border-[2px] border-dashed border-white/20" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

          {/* HERO TEXT */}
          <div className="relative z-10 text-white">

            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#ffd7a8]">
              Traditional • Handmade • Personalised
            </p>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Art that carries
              <span className="mt-2 block text-[#ffd28e]">
                a piece of Devbhoomi.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/85">
              Discover traditional Aipan art, personalised nameplates,
              Himalayan-inspired paintings and handcrafted gifts —
              created with love in Uttarakhand.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <link
                href="#shop"
                className="rounded-full bg-white px-7 py-4 font-bold text-[#8f1717] shadow-xl transition hover:-translate-y-1"
              >
                Explore Collection →
              </link>

              <link
                href="#custom"
                className="rounded-full border border-white/50 px-7 py-4 font-bold text-white transition hover:bg-white/10"
              >
                ✦ Create Your Own
              </link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-white/75">
              <div>
                <strong className="block text-2xl text-white">5000+</strong>
                Orders Delivered
              </div>
              <div>
                <strong className="block text-2xl text-white">100%</strong>
                Handmade Love
              </div>
              <div>
                <strong className="block text-2xl text-white">India</strong>
                Wide Delivery
              </div>
            </div>
          </div>

          {/* HERO ART PANEL */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative aspect-square overflow-hidden rounded-[40px] border border-white/20 bg-[#d83a20] p-5 shadow-2xl">

              <div className="absolute inset-5 rounded-[30px] border-2 border-dashed border-[#ffd8a5]/60" />

              <div className="relative flex h-full flex-col items-center justify-center rounded-[25px] bg-[#a81717] text-center">

                <div className="mb-5 text-8xl text-[#ffd9a8] drop-shadow-lg">
                  ॐ
                </div>

                <div className="text-5xl text-white/90">
                  ✺
                </div>

                <p className="mt-5 px-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#ffd9a8]">
                  Aipan • Himalayan • Handmade
                </p>

                <div className="mt-8 h-px w-32 bg-[#ffd9a8]/60" />

                <p className="mt-5 text-2xl font-bold text-white">
                  From Uttarakhand
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-[#fff7ed] px-5 py-4 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8f1717]">
                Made with ❤️
              </p>
              <p className="font-bold">in Devbhoomi</p>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section id="collections" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a21b1b]">
            Explore
          </p>
          <h2 className="mt-2 text-4xl font-black sm:text-5xl">
            Shop by Collection
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#735b51]">
            Traditional craftsmanship meets contemporary gifting.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <link
              href="#shop"
              key={category.title}
              className="group relative overflow-hidden rounded-3xl border border-[#ead8c8] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="absolute right-[-25px] top-[-25px] h-28 w-28 rounded-full border border-[#a21b1b]/10" />

              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a21b1b] text-3xl text-[#ffd9a8]">
                {category.icon}
              </div>

              <h3 className="text-xl font-bold">{category.title}</h3>
              <p className="mt-2 text-sm text-[#806a60]">
                {category.subtitle}
              </p>

              <div className="mt-6 font-bold text-[#a21b1b]">
                Explore →
              </div>
            </link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section id="shop" className="bg-[#f5e7da] px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a21b1b]">
                Handpicked for you
              </p>
              <h2 className="mt-2 text-4xl font-black sm:text-5xl">
                Our Bestsellers
              </h2>
            </div>

            <button className="font-bold text-[#a21b1b]">
              View All Products →
            </button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => (
              <article
                key={product.name}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >

                {/* TEMPORARY PRODUCT ART */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#a21b1b]">

                  <div className="absolute inset-5 rounded-2xl border-2 border-dashed border-[#ffd9a8]/60" />

                  <div className="text-center">
                    <div className="text-7xl text-[#ffd9a8]">
                      {product.symbol}
                    </div>

                    <div className="mt-3 text-2xl font-black text-white/90">
                      AIPAN
                    </div>

                    <div className="text-xs uppercase tracking-[0.25em] text-[#ffd9a8]">
                      Devbhoomi Designs
                    </div>
                  </div>

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-black tracking-wider text-[#8f1717]">
                    {product.badge}
                  </span>

                  <button className="absolute bottom-4 right-4 rounded-full bg-white p-3 opacity-0 shadow-lg transition group-hover:opacity-100">
                    🛒
                  </button>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#a21b1b]">
                    {product.category}
                  </p>

                  <h3 className="mt-2 min-h-[52px] text-lg font-bold">
                    {product.name}
                  </h3>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xl font-black">
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  <button className="mt-5 w-full rounded-full bg-[#a21b1b] py-3 font-bold text-white transition hover:bg-[#7e1111]">
                    Add to Cart
                  </button>
                </div>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* CUSTOM SECTION */}
      <section id="custom" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-[#8f1717] p-8 text-white sm:p-12 lg:p-16">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#ffd9a8]">
                Make it yours
              </p>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                Your story.
                <br />
                Your Aipan.
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
                Create a personalised nameplate, wall art, gift or
                custom Aipan piece designed specially for you.
              </p>

              <button className="mt-8 rounded-full bg-[#ffd9a8] px-7 py-4 font-black text-[#8f1717] transition hover:-translate-y-1">
                Start Customising ✦
              </button>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center">

              <div className="absolute h-64 w-64 rounded-full border-2 border-dashed border-[#ffd9a8]/60" />
              <div className="absolute h-48 w-48 rounded-full border border-[#ffd9a8]/40" />

              <div className="relative text-center">
                <div className="text-8xl text-[#ffd9a8]">✺</div>
                <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em]">
                  Crafted for you
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="border-y border-[#ead8c8] bg-[#fffaf4] px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a21b1b]">
            The Devbhoomi Story
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Nurturing creativity amidst the Himalayan vibes.
          </h2>

          <p className="mt-7 text-lg leading-9 text-[#735b51]">
            From the beautiful landscapes of Uttarakhand comes art
            inspired by tradition, culture and stories. Devbhoomi Designs
            brings Aipan art into modern homes, celebrations and gifts —
            keeping the spirit of our heritage alive through handmade
            creativity.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-[#f4e2d4] px-5 py-2 text-sm font-bold">
              🏔️ Uttarakhand
            </span>
            <span className="rounded-full bg-[#f4e2d4] px-5 py-2 text-sm font-bold">
              🎨 Traditional Aipan
            </span>
            <span className="rounded-full bg-[#f4e2d4] px-5 py-2 text-sm font-bold">
              ❤️ Handmade
            </span>
            <span className="rounded-full bg-[#f4e2d4] px-5 py-2 text-sm font-bold">
              ✨ Personalised
            </span>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#24100d] px-6 py-14 text-white lg:px-8">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          <div className="md:col-span-2">
            <img
              src="/devbhoomi-logo.jpeg"
              alt="Devbhoomi Designs"
              className="h-16 w-auto rounded-lg"
            />

            <p className="mt-5 max-w-md leading-7 text-white/60">
              Traditional Aipan art, personalised gifts and Himalayan
              creativity — handcrafted in Uttarakhand and delivered
              across India.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Shop</h3>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>Aipan Art</p>
              <p>Wall Art</p>
              <p>Personalised Gifts</p>
              <p>Custom Creations</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Connect</h3>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>Instagram</p>
              <p>WhatsApp</p>
              <p>Email</p>
              <p>Haldwani, Uttarakhand</p>
            </div>
          </div>

        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-white/40">
          © 2026 Devbhoomi Designs • Made with love in Uttarakhand ❤️
        </div>

      </footer>

    </main>
  );
}