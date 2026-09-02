
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Sparkles,
  Heart,
  Home as HomeIcon,
  Grid2X2,
  ClipboardList,
  User,
} from "lucide-react";

import { supabase } from "@/app/lib/supabase";
import ProductDetails from "./ProductDetails";
import type { Product } from "./products";

type CartItem = {
  cartKey: string;
  id: number;
  quantity: number;
  customName?: string;
  customSize?: string;
  instructions?: string;
};


const categoryIcons: Record<string, string> = {
  "Personalised Art": "✦",
  "Aipan Collection": "◉",
  "Wall Art": "✺",
  "Custom Creations": "✦",
  "Pooja Collection": "ॐ",
  "Mandala Art": "✹",
  "Festive Gifts": "❈",
  "Personalised Gifts": "♡",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
const [productsLoading, setProductsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
  console.error("Error loading products:", error);
  setProducts([]);
} else {
  const formattedProducts: Product[] = (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    originalPrice: item.original_price,
    description: item.description || "",
    badge: item.badge || undefined,
    customizable: item.customizable ?? false,
    image: item.image || "",
  }));

  setProducts(formattedProducts);
}

    setProductsLoading(false);
  };

  loadProducts();
}, []);

  // Product opened in the product-details popup.
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product selected for the customisation form.
  // This is intentionally kept separate from selectedProduct so the
  // selected custom product remains after the popup is closed.
  const [customProduct, setCustomProduct] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [customType, setCustomType] = useState(
    "Personalised Aipan Nameplate"
  );
  const [customName, setCustomName] = useState("");
  const [customSize, setCustomSize] = useState("Small");
  const [customDescription, setCustomDescription] = useState("");

  const categories = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
}, [products, search, selectedCategory]);

 const addToCart = (
  id: number,
  customization?: {
    customName?: string;
    customSize?: string;
    instructions?: string;
  }
) => {
  setCart((current) => {
    const customName = customization?.customName || "";
    const customSize = customization?.customSize || "";
    const instructions = customization?.instructions || "";

    const cartKey = `${id}-${customName}-${customSize}-${instructions}`;

    const existing = current.find(
      (item) => item.cartKey === cartKey
    );

    let updatedCart;

    if (existing) {
      updatedCart = current.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      updatedCart = [
        ...current,
        {
          id,
          quantity: 1,
          cartKey,
          customName,
          customSize,
          instructions,
        },
      ];
    }

    localStorage.setItem(
      "devbhoomi-cart",
      JSON.stringify(updatedCart)
    );

    return updatedCart;
  });

  setCartOpen(true);
};

 const increaseQuantity = (cartKey: string) => {
  setCart((current) => {
    const updatedCart = current.map((item) =>
      item.cartKey === cartKey
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    localStorage.setItem(
      "devbhoomi-cart",
      JSON.stringify(updatedCart)
    );

    return updatedCart;
  });
};

  const decreaseQuantity = (cartKey: string) => {
  setCart((current) => {
    const updatedCart = current
      .map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: Math.max(0, item.quantity - 1),
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    localStorage.setItem(
      "devbhoomi-cart",
      JSON.stringify(updatedCart)
    );

    return updatedCart;
  });
};

  const removeFromCart = (cartKey: string) => {
  setCart((current) => {
    const updatedCart = current.filter(
      (item) => item.cartKey !== cartKey
    );

    localStorage.setItem(
      "devbhoomi-cart",
      JSON.stringify(updatedCart)
    );

    return updatedCart;
  });
};

  const cartProducts = cart
    .map((item) => {
      const product = products.find((product) => product.id === item.id);

      if (!product) return null;

      return {
        ...product,
        cartKey: item.cartKey,
        quantity: item.quantity,
        customName: item.customName,
        customSize: item.customSize,
        instructions: item.instructions,
      };
    })
    .filter(Boolean) as Array<
    Product & {
      cartKey: string;
      quantity: number;
      customName?: string;
      customSize?: string;
      instructions?: string;
    }
  >;

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // This is the central customisation function.
  // Every "Customize This Product" button uses this same function,
  // so the previously selected product is remembered.
  const openCustomize = (product: Product) => {
    setCustomProduct(product);
    setCustomType(product.name);

    document.getElementById("custom")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCustomTypeChange = (value: string) => {
    const product = products.find((item) => item.name === value);

    if (product) {
      setCustomProduct(product);
      setCustomType(product.name);
    } else {
      setCustomProduct(null);
      setCustomType(value);
    }
  };

  if (productsLoading) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
      <div className="text-center">
        <div className="text-5xl">🎨</div>
        <h2 className="mt-4 text-2xl font-black text-[#321817]">
          Loading Devbhoomi Designs...
        </h2>
        <p className="mt-2 text-[#795c52]">
          Please wait while we load our collection.
        </p>
      </div>
    </main>
  );
}

return (
  <main className="min-h-screen bg-[#fffaf4] text-[#351717]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#ead8c7] bg-[#fffaf4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#" className="flex items-center gap-3">
            <img
              src="/devbhoomi-logo.jpeg"
              alt="Devbhoomi Designs"
              className="h-12 w-20 rounded-xl object-cover"
            />

            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-wide">
                Devbhoomi Designs
              </div>
              <div className="text-xs tracking-[0.25em] text-[#9b4b35]">
                ART • HERITAGE • HIMALAYAS
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="font-semibold hover:text-[#a51c24]">
              Home
            </a>
            <a
              href="#shop"
              className="font-semibold hover:text-[#a51c24]"
            >
              Shop
            </a>
            <a
              href="#story"
              className="font-semibold hover:text-[#a51c24]"
            >
              Our Story
            </a>
            <a
              href="#custom"
              className="font-semibold hover:text-[#a51c24]"
            >
              Customise
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-full border border-[#dcc8b5] bg-white px-3 py-2 sm:flex">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search art..."
                className="ml-2 w-28 bg-transparent text-sm outline-none"
              />
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-[#dcc8b5] bg-white p-3 transition hover:scale-105"
            >
              <ShoppingBag size={20} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#a51c24] text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
  type="button"
  onClick={() => (window.location.href = "/login")}
  className="rounded-full bg-[#a51c24] px-5 py-3 font-bold text-white transition hover:bg-[#85161d]"
>
  Login
</button>

          </div>
        </div>
      </header>

      <div className="sticky top-[81px] z-30 border-b border-[#ead8c7] bg-[#fffaf4] px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-[#dcc8b5] bg-white px-3 py-2.5 shadow-sm">
            <Search size={17} className="shrink-0 text-[#795c52]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for Aipan, gifts..."
              className="ml-2 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-xl bg-[#a51c24] p-3 text-white shadow-sm"
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffd99c] text-[10px] font-black text-[#571719]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#795c52]">
          <span>📍</span>
          <span>Delivering across India</span>
          <span className="ml-auto text-[#a51c24]">Haldwani, Uttarakhand</span>
        </div>
      </div>

      <div className="sticky top-[143px] z-20 border-b border-[#ead8c7] bg-[#fffaf4] md:hidden">
        <div className="flex gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ${
                selectedCategory === category
                  ? "bg-[#a51c24] text-white"
                  : "border border-[#dcc8b5] bg-white text-[#351717]"
              }`}
            >
              <span>{categoryIcons[category] || "✦"}</span>
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE SHOPPING BANNER */}
      <section className="mx-3 mt-3 overflow-hidden rounded-2xl bg-[#a51c24] text-white shadow-sm md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#ffd99c]">
              HANDMADE • UTTARAKHAND
            </p>
            <h2 className="mt-1 text-lg font-black leading-tight">
              A piece of Devbhoomi
              <br />
              for your home.
            </h2>
            <a
              href="#shop"
              className="mt-3 inline-flex rounded-full bg-[#ffd99c] px-4 py-2 text-xs font-black text-[#571719]"
            >
              Shop Now
            </a>
          </div>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-[#ffd99c] text-5xl text-[#ffd99c]">
            ॐ
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative hidden overflow-hidden bg-[#a51c24] text-white md:block">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border-[40px] border-[#d94b2b]/40" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          <div className="relative z-10">
            <p className="mb-5 text-sm font-bold tracking-[0.35em] text-[#ffd99c]">
              TRADITIONAL • HANDMADE • PERSONALISED
            </p>

            <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">
              Art that
              <br />
              carries
              <br />
              <span className="text-[#ffd99c]">
                a piece of
                <br />
                Devbhoomi.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#fff1e5]">
              Discover traditional Aipan art, personalised nameplates,
              Himalayan-inspired paintings and handcrafted gifts —
              created with love in Uttarakhand.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#shop"
                className="rounded-full bg-[#ffd99c] px-7 py-4 font-bold text-[#571719] transition hover:scale-105"
              >
                Explore Collection
              </a>

              <a
                href="#custom"
                className="rounded-full border border-white/50 px-7 py-4 font-bold transition hover:bg-white/10"
              >
                Create Something Custom
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[430px] items-center justify-center">
            <div className="absolute h-[390px] w-[390px] rounded-[40px] border-[26px] border-[#df4a28] bg-[#9f1d25] shadow-2xl" />

            <div className="relative flex h-[310px] w-[310px] flex-col items-center justify-center rounded-full border-4 border-[#ffd99c]">
              <div className="text-7xl text-[#ffd99c]">ॐ</div>

              <div className="mt-4 text-5xl text-white">✺</div>

              <p className="mt-8 text-center text-xs font-bold tracking-[0.35em] text-[#ffd99c]">
                AIPAN • HIMALAYAN
                <br />
                • HANDMADE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="mx-auto hidden max-w-7xl px-5 py-12 md:block">
        <div className="mb-7">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#a51c24] md:text-sm md:tracking-[0.25em]">
            EXPLORE
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Find your piece of Uttarakhand
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition ${
                selectedCategory === category
                  ? "bg-[#a51c24] text-white"
                  : "border border-[#dcc8b5] bg-white hover:border-[#a51c24]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="mx-auto max-w-7xl px-3 pb-24 pt-4 sm:px-5 md:pb-20 md:pt-0">
        <div className="mb-4 flex items-end justify-between md:mb-8">
          <div>
            <p className="text-sm font-bold tracking-[0.25em] text-[#a51c24]">
              THE COLLECTION
            </p>

            <h2 className="mt-1 text-xl font-black md:mt-2 md:text-4xl">
              Handmade favourites
            </h2>
          </div>

          <span className="text-xs font-semibold text-[#795c52] sm:text-sm">
            {filteredProducts.length} products
          </span>
        </div>

<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-xl border border-[#ead8c7] bg-white shadow-sm md:rounded-2xl"
>
              <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden bg-[#fff8f2] md:aspect-square">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-4 rounded-2xl border-2 border-[#ffd99c]/50 md:inset-5" />
                    <div className="absolute inset-8 rounded-full border border-[#ffd99c]/40 md:inset-10" />

                    <div className="relative text-center">
                      <div className="text-4xl text-[#ffd99c] md:text-6xl">
                        {categoryIcons[product.category] || "✦"}
                      </div>

                      <div className="mt-2 text-[9px] font-bold tracking-[0.25em] text-[#a56c58] md:mt-4 md:text-xs">
                        DEVBHOOMI
                      </div>
                    </div>
                  </>
                )}

                {product.badge && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#ffd99c] px-2 py-1 text-[9px] font-bold text-[#571719] md:left-4 md:top-4 md:px-3 md:text-xs">
                    {product.badge}
                  </span>
                )}

                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 md:right-4 md:top-4 md:p-2"
                >
                  <Heart size={17} />
                </button>
              </div>

              <div className="p-2.5 md:p-5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#a56c58] md:text-xs md:tracking-wider">
                  {product.category}
                </p>

                <h3 className="mt-1 min-h-[40px] text-[13px] font-bold leading-5 md:mt-2 md:min-h-[52px] md:text-lg md:leading-normal">
                  {product.name}
                </h3>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="mt-1 text-[11px] font-bold text-[#a51c24] underline underline-offset-4 md:mt-2 md:text-sm"
                >
                  View Details
                </button>

                <div className="mt-2 flex items-center gap-1.5 md:mt-4 md:gap-2">
                  <span className="text-[15px] font-black md:text-xl">
₹{Number(product.price).toLocaleString("en-IN")}
                  </span>

                  <span className="text-[9px] text-gray-400 line-through md:text-sm">
  ₹{Number(product.originalPrice).toLocaleString("en-IN")}
</span>
                </div>

                {product.customizable && (
                  <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-[#a51c24] md:mt-3 md:gap-2 md:text-xs">
                    <Sparkles size={14} />
                    Customisable
                  </div>
                )}

                {product.customizable && (
                  <button
                    type="button"
                    onClick={() => openCustomize(product)}
                    className="mt-2 w-full rounded-lg border border-[#b51c24] px-2 py-2 text-[9px] font-bold text-[#b51c24] transition hover:bg-[#b51c24] hover:text-white md:mt-3 md:rounded-full md:px-5 md:py-3 md:text-sm"
                  >
                    ✨ Customize This Product
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => addToCart(product.id)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#351717] px-2 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#a51c24] md:mt-5 md:rounded-full md:gap-2 md:px-4 md:py-3 md:text-base"
                >
                  <ShoppingBag size={17} />
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-[#ead8c7] bg-white p-12 text-center">
            <h3 className="text-xl font-bold">No products found</h3>
            <p className="mt-2 text-[#795c52]">
              Try another search or category.
            </p>
          </div>
        )}
      </section>

      {/* CUSTOM SECTION */}
      <section id="custom" className="scroll-mt-24 bg-[#f1dfcd] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.3em] text-[#a51c24]">
              MADE JUST FOR YOU
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#351313] md:text-5xl">
              Your idea. Our art.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#633f38]">
              Create something personal with traditional Aipan art,
              Himalayan inspiration and handmade craftsmanship.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* LEFT */}
            <div className="rounded-3xl bg-[#9f1720] p-8 text-white shadow-xl">
              <p className="text-sm font-bold tracking-[0.25em] text-[#ffd99b]">
                DEV BHOOMI • HANDMADE • PERSONAL
              </p>

              <h3 className="mt-4 text-3xl font-black">
                Turn your idea into Aipan art.
              </h3>

              <p className="mt-4 leading-7 text-[#f8ddd0]">
                Personalised nameplates, wedding gifts, wall art,
                pooja artwork, couple gifts and Himalayan-inspired
                creations made especially for you.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-lg font-bold">
                    ✦ Personalised Nameplates
                  </div>
                  <div className="mt-1 text-sm text-[#f8ddd0]">
                    Add your family name, names or special message.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-lg font-bold">
                    ✦ Custom Aipan Artwork
                  </div>
                  <div className="mt-1 text-sm text-[#f8ddd0]">
                    Choose your style, size and colours.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-lg font-bold">
                    ✦ Custom Gifts
                  </div>
                  <div className="mt-1 text-sm text-[#f8ddd0]">
                    Create something meaningful for someone special.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - CUSTOM FORM */}
            <div className="rounded-3xl border border-[#d8b9a4] bg-[#fffaf5] p-7 shadow-xl">
              <div className="mb-6">
                <p className="text-sm font-bold tracking-widest text-[#a51c24]">
                  START CREATING
                </p>

                <h3 className="mt-2 text-2xl font-black text-[#351313]">
                  Tell us what you want
                </h3>

                {customProduct && (
                  <div className="mt-4 rounded-xl border border-[#e4c6b2] bg-[#fff1e5] px-4 py-3 text-sm">
                    <span className="font-bold text-[#a51c24]">
                      Selected product:
                    </span>{" "}
                    {customProduct.name}
                  </div>
                )}
              </div>

              {/* PRODUCT TYPE */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold text-[#351313]">
                  What would you like?
                </label>

                <select
                  value={customProduct?.name || customType}
                  onChange={(e) =>
                    handleCustomTypeChange(e.target.value)
                  }
                  className="w-full rounded-xl border border-[#d8b9a4] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                >
                  <option value="">Select a product</option>

                  {products
                    .filter((product) => product.customizable)
                    .map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))}

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* NAME */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold text-[#351313]">
                  Name / Text
                </label>

                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Example: The Sharma Family"
                  className="w-full rounded-xl border border-[#d8b9a4] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                />
              </div>

              {/* SIZE */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold text-[#351313]">
                  Preferred Size
                </label>

                <select
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="w-full rounded-xl border border-[#d8b9a4] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                  <option>12 × 32 inch</option>
                  <option>Custom Size</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold text-[#351313]">
                  Describe your idea
                </label>

                <textarea
                  value={customDescription}
                  onChange={(e) =>
                    setCustomDescription(e.target.value)
                  }
                  placeholder="Tell us about your design, colours, occasion or anything special..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-[#d8b9a4] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                />
              </div>

              {/* REFERENCE UPLOAD */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-[#351313]">
                  Upload Reference Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-dashed border-[#c49b83] bg-white p-4 text-sm"
                />

                <p className="mt-2 text-xs text-[#765850]">
                  Optional — upload an image or design reference.
                </p>
              </div>

              {/* SUBMIT */}
              <button
                type="button"
                onClick={() => {
                  if (!customProduct) {
                    alert("Please select a product first.");
                    return;
                  }

                  addToCart(customProduct.id, {
                    customName: customName.trim() || undefined,
                    customSize,
                    instructions: customDescription.trim() || undefined,
                  });

                  alert(
                    `Thank you! Your custom request for ${customProduct.name} has been added to your cart.`
                  );

                  setCustomName("");
                  setCustomDescription("");
                }}
                className="w-full rounded-full bg-[#8f151d] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#701018]"
              >
                ✦ Add Custom Request to Cart
              </button>

              <p className="mt-4 text-center text-xs text-[#765850]">
                Handmade in Uttarakhand • Delivered across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold tracking-[0.3em] text-[#a51c24]">
              OUR STORY
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              From the Himalayan heartland.
            </h2>

            <p className="mt-6 leading-8 text-[#63453d]">
              Devbhoomi Designs celebrates the artistic traditions of
              Uttarakhand through handmade Aipan art, personalised
              creations and meaningful gifts.
            </p>

            <p className="mt-4 leading-8 text-[#63453d]">
              Every creation is designed to carry a little piece of
              Himalayan culture into your home.
            </p>
          </div>

          <div className="rounded-[40px] bg-[#a51c24] p-10 text-center text-white">
            <div className="text-8xl text-[#ffd99c]">ॐ</div>

            <p className="mt-7 text-sm font-bold tracking-[0.35em] text-[#ffd99c]">
              HALDWANI
            </p>

            <p className="mt-2">Uttarakhand, India</p>

            <p className="mt-6 text-sm text-white/70">
              Handmade • Personalised • Himalayan
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#351717] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-black">
              Devbhoomi Designs
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Traditional Aipan art and personalised creations from
              Uttarakhand.
            </p>
          </div>

          <div>
            <h4 className="font-bold">Contact</h4>

            <p className="mt-3 text-sm text-white/60">
              Haldwani, Uttarakhand
            </p>

            <p className="mt-1 text-sm text-white/60">
              devbhoomidesigns@gmail.com
            </p>
          </div>

          <div>
            <h4 className="font-bold">Follow Devbhoomi</h4>

            <p className="mt-3 text-sm text-white/60">
              Instagram • YouTube • Facebook
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/40">
          © 2026 Devbhoomi Designs • Made with love in Uttarakhand
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCartOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffaf4] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ead8c7] p-5">
              <div>
                <h2 className="text-2xl font-black">Your Cart</h2>

                <p className="text-sm text-[#795c52]">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-[#dcc8b5] p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartProducts.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag
                    size={55}
                    className="text-[#a51c24]"
                  />

                  <h3 className="mt-5 text-xl font-bold">
                    Your cart is empty
                  </h3>

                  <p className="mt-2 text-sm text-[#795c52]">
                    Discover something beautiful from Devbhoomi.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="mt-6 rounded-full bg-[#a51c24] px-6 py-3 font-bold text-white"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cartProducts.map((product) => (
                    <div
                      key={product.cartKey}
                      className="rounded-2xl border border-[#ead8c7] bg-white p-4"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#9e2025] text-3xl text-[#ffd99c]">
                          {categoryIcons[product.category] || "✦"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">
                            {product.name}
                          </h3>

                          <p className="mt-1 font-black">
                         ₹{Number(product.price).toLocaleString("en-IN")}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-[#dcc8b5]">
                              <button
                                type="button"
                                onClick={() =>
                                decreaseQuantity(product.cartKey)
                                }
                                className="p-2"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="w-5 text-center text-sm font-bold">
                                {product.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                              increaseQuantity(product.cartKey)
                                }
                                className="p-2"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(product.cartKey)
                              }
                              className="text-[#a51c24]"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartProducts.length > 0 && (
              <div className="border-t border-[#ead8c7] bg-white p-5">
                <div className="flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span>
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
  window.location.href = "/checkout";
}} 
                  className="mt-5 w-full rounded-full bg-[#a51c24] py-4 font-bold text-white transition hover:bg-[#85161d]"
                >
                  Proceed to Checkout
                </button>

                <p className="mt-3 text-center text-xs text-[#795c52]">
                  Secure checkout • Pan India delivery
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* PRODUCT DETAILS */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ead8c7] bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_18px_rgba(53,23,23,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <a href="#" className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-[#a51c24]">
            <HomeIcon size={20} /> Home
          </a>
          <a href="#shop" className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-[#795c52]">
            <Grid2X2 size={20} /> Categories
          </a>
          <button type="button" onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-[#795c52]">
            <ShoppingBag size={20} /> Cart
            {cartCount > 0 && (
              <span className="absolute left-1/2 top-0 ml-1 flex h-4 min-w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#a51c24] px-1 text-[9px] font-black text-white">
                {cartCount}
              </span>
            )}
          </button>
          <a href="/my-orders" className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-[#795c52]">
            <ClipboardList size={20} /> Orders
          </a>
          <button type="button" onClick={() => alert("Login page coming next.")} className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-[#795c52]">
            <User size={20} /> Account
          </button>
        </div>
      </nav>
    </main>
  );
}
