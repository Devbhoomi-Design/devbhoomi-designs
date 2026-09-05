"use client";
import AdminNav from "./components/AdminNav";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Sparkles,
  Heart,
} from "lucide-react";

import { products } from "./products";
import ProductDetails from "./ProductDetails";
import { supabase } from "@/app/lib/supabase";

type CartItem = {
  id: number;
  quantity: number;
  customName?: string;
  customSize?: string;
  instructions?: string;
};

type Product = (typeof products)[number] & {
  in_stock?: boolean;
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
  const router = useRouter();

  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>(products);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  // Load the saved cart when the browser is ready.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedCart = localStorage.getItem("devbhoomi-cart");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          }
        }
      } catch (error) {
        console.error("Could not load cart:", error);
      }
    }, 0);

    return () => window.clearTimeout(timer);
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
  const [customReferenceImage, setCustomReferenceImage] =
    useState<File | null>(null);
  const [sendingCustomRequest, setSendingCustomRequest] = useState(false);

  // =====================================================
  // AUTH + ADMIN STATE
  // =====================================================
  useEffect(() => {
    let mounted = true;

    const checkUserAndAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser?.email) {
        setIsAdmin(false);
        return;
      }

      const { data: admin, error } = await supabase
        .from("admins")
        .select("email")
        .eq("email", currentUser.email)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Could not check admin access:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!admin);
    };

    const timer = window.setTimeout(() => {
      void checkUserAndAdmin();
    }, 0);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      window.setTimeout(() => {
        if (!mounted) return;

        setUser(currentUser);

        if (!currentUser?.email) {
          setIsAdmin(false);
          return;
        }

        void supabase
          .from("admins")
          .select("email")
          .eq("email", currentUser.email)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!mounted) return;

            if (error) {
              console.error("Could not check admin access:", error);
              setIsAdmin(false);
              return;
            }

            setIsAdmin(!!data);
          });
      }, 0);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Load the live product catalogue from Supabase.
  // The local products.ts list remains only as a fallback if Supabase
  // is temporarily unavailable or the table has no products.
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Could not load products from Supabase:", error);
        setProductsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const formattedProducts: Product[] = data.map((product) => ({
          id: Number(product.id),
          name: product.name,
          category: product.category,
          price: Number(product.price),
          originalPrice: Number(product.original_price ?? product.price),
          description: product.description ?? "",
          badge: product.badge ?? undefined,
          customizable: Boolean(product.customizable),
          image: product.image ?? "",
          in_stock: product.in_stock ?? true,
        }));

        setStoreProducts(formattedProducts);
      }

      setProductsLoading(false);
    };

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("Could not log out. Please try again.");
      return;
    }

    setUser(null);
    window.location.href = "/";
  };

  const categories = [
    "All",
    ...Array.from(new Set(storeProducts.map((product) => product.category))),
  ];

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, storeProducts]);

  const addToCart = (
    id: number,
    customization?: {
      customName?: string;
      customSize?: string;
      instructions?: string;
    }
  ) => {
    const product = storeProducts.find((item) => item.id === id);

    if (!product) {
      alert("This product is no longer available.");
      return;
    }

    if (product.in_stock === false) {
      alert("Sorry, this product is currently out of stock.");
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) =>
          item.id === id &&
          item.customName === customization?.customName &&
          item.customSize === customization?.customSize &&
          item.instructions === customization?.instructions
      );

      let updatedCart: CartItem[];

      if (existing) {
        updatedCart = current.map((item) =>
          item === existing
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
            customName: customization?.customName,
            customSize: customization?.customSize,
            instructions: customization?.instructions,
          },
        ];
      }

      localStorage.setItem("devbhoomi-cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    setCartOpen(true);
  };

  const increaseQuantity = (id: number) => {
    const product = storeProducts.find((item) => item.id === id);

    if (product?.in_stock === false) {
      alert("Sorry, this product is currently out of stock.");
      return;
    }

    setCart((current) => {
      const updatedCart = current.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      localStorage.setItem("devbhoomi-cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const decreaseQuantity = (id: number) => {
    setCart((current) => {
      const updatedCart = current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

      localStorage.setItem("devbhoomi-cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((current) => {
      const updatedCart = current.filter((item) => item.id !== id);
      localStorage.setItem("devbhoomi-cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const cartProducts = cart
    .map((item) => {
      const product = storeProducts.find((product) => product.id === item.id);

      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as (Product & { quantity: number })[];

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
    const product = storeProducts.find((item) => item.name === value);

    if (product) {
      setCustomProduct(product);
      setCustomType(product.name);
    } else {
      setCustomProduct(null);
      setCustomType(value);
    }
  };

  const submitCustomRequest = async () => {
    if (!customType) {
      alert("Please select what you would like.");
      return;
    }

    if (!customDescription.trim()) {
      alert("Please describe your idea.");
      return;
    }

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      window.location.href = `/login?next=${encodeURIComponent("/#custom")}`;
      return;
    }

    setSendingCustomRequest(true);

    try {
      let referenceImageUrl: string | null = null;

      if (customReferenceImage) {
        if (!customReferenceImage.type.startsWith("image/")) {
          throw new Error("Please upload an image file.");
        }

        if (customReferenceImage.size > 5 * 1024 * 1024) {
          throw new Error("Please choose an image smaller than 5 MB.");
        }

        const extension =
          customReferenceImage.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("custom-requests")
          .upload(filePath, customReferenceImage, {
            contentType: customReferenceImage.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Custom reference upload error:", uploadError);
          throw new Error(
            `Could not upload the reference image: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("custom-requests")
          .getPublicUrl(filePath);

        referenceImageUrl = publicUrlData.publicUrl;
      }

      const { error: requestError } = await supabase
        .from("custom_requests")
        .insert({
          user_id: currentUser.id,
          customer_name:
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            "",
          customer_email: currentUser.email || "",
          product_name: customProduct?.name || customType,
          custom_name: customName.trim() || null,
          preferred_size: customSize,
          description: customDescription.trim(),
          reference_image_url: referenceImageUrl,
          status: "New Request",
        });

      if (requestError) {
        console.error("Custom request save error:", requestError);
        throw new Error(
          `Could not save your custom request: ${requestError.message}`
        );
      }

      alert(
        "Thank you! Your custom request has been submitted successfully."
      );

      setCustomName("");
      setCustomSize("Small");
      setCustomDescription("");
      setCustomReferenceImage(null);
      setCustomProduct(null);
      setCustomType("Personalised Aipan Nameplate");
    } catch (error) {
      console.error("Custom request error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not submit your custom request. Please try again."
      );
    } finally {
      setSendingCustomRequest(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] pb-16 text-[#351717] md:pb-0">
      {user && isAdmin && (
        <div className="mx-auto max-w-7xl px-5 pt-4">
          <AdminNav />
        </div>
      )}

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#ead8c7] bg-[#fffaf4]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <a href="#" className="flex min-w-0 items-center gap-2">
              <img
                src="/devbhoomi-logo.jpeg"
                alt="Devbhoomi Designs"
                className="h-11 w-16 shrink-0 rounded-xl object-cover sm:h-12 sm:w-20"
              />
              <div className="hidden sm:block">
                <div className="text-lg font-bold tracking-wide">Devbhoomi Designs</div>
                <div className="text-xs tracking-[0.25em] text-[#9b4b35]">
                  ART • HERITAGE • HIMALAYAS
                </div>
              </div>
            </a>

            <nav className="hidden items-center gap-8 md:flex">
              <a href="#" className="font-semibold hover:text-[#a51c24]">Home</a>
              <a href="#shop" className="font-semibold hover:text-[#a51c24]">Shop</a>
              <a href="#story" className="font-semibold hover:text-[#a51c24]">Our Story</a>
              <a href="#custom" className="font-semibold hover:text-[#a51c24]">Customise</a>
            </nav>

            <div className="flex items-center gap-2">
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
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative rounded-full border border-[#dcc8b5] bg-white p-2.5 sm:p-3"
                aria-label="Open cart"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#a51c24] text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/my-orders")}
                className="hidden rounded-full border border-[#dcc8b5] bg-white px-4 py-2 text-sm font-bold text-[#321817] md:block"
              >
                📦 My Orders
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden max-w-[180px] truncate text-sm font-bold text-[#795c52] lg:block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full bg-[#a51c24] px-3 py-2.5 text-sm font-bold text-white sm:px-5 sm:py-3"
                  >
                    <span className="sm:hidden">Account</span>
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { window.location.href = "/login"; }}
                  className="rounded-full bg-[#a51c24] px-3 py-2.5 text-sm font-bold text-white sm:px-5 sm:py-3"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center rounded-2xl border border-[#dcc8b5] bg-white px-3 py-2.5 sm:hidden">
            <Search size={18} className="shrink-0 text-[#795c52]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Aipan art, gifts..."
              className="ml-2 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#a51c24] text-white">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border-[40px] border-[#d94b2b]/40" />

        <div className="mx-auto grid max-w-7xl items-center gap-5 px-5 py-9 sm:gap-10 sm:py-14 md:grid-cols-2 md:py-20">
          <div className="relative z-10">
            <p className="mb-3 text-[10px] font-bold tracking-[0.25em] text-[#ffd99c] sm:mb-5 sm:text-sm sm:tracking-[0.35em]">
              TRADITIONAL • HANDMADE • PERSONALISED
            </p>

            <h1 className="text-4xl font-black leading-[0.95] sm:text-5xl md:text-7xl">
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

            <p className="mt-5 max-w-xl text-sm leading-6 text-[#fff1e5] sm:mt-7 sm:text-lg sm:leading-8">
              Discover traditional Aipan art, personalised nameplates,
              Himalayan-inspired paintings and handcrafted gifts —
              created with love in Uttarakhand.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
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

          <div className="relative flex min-h-[250px] items-center justify-center sm:min-h-[360px] md:min-h-[430px]">
            <div className="absolute h-[230px] w-[230px] rounded-[30px] border-[16px] border-[#df4a28] bg-[#9f1d25] shadow-2xl sm:h-[330px] sm:w-[330px] sm:border-[22px] sm:rounded-[36px] md:h-[390px] md:w-[390px] md:border-[26px] md:rounded-[40px]" />

            <div className="relative flex h-[180px] w-[180px] flex-col items-center justify-center rounded-full border-2 border-[#ffd99c] sm:h-[260px] sm:w-[260px] sm:border-4 md:h-[310px] md:w-[310px]">
              <div className="text-5xl text-[#ffd99c] sm:text-6xl md:text-7xl">ॐ</div>

              <div className="mt-2 text-3xl text-white sm:mt-4 sm:text-5xl">✺</div>

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
      <section className="mx-auto max-w-7xl px-5 py-8 sm:py-12">
        <div className="mb-7">
          <p className="text-sm font-bold tracking-[0.25em] text-[#a51c24]">
            EXPLORE
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl md:text-4xl">
            Find your piece of Uttarakhand
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition sm:px-5 sm:py-3 ${
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
      <section id="shop" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-5 sm:pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.25em] text-[#a51c24]">
              THE COLLECTION
            </p>

            <h2 className="mt-2 text-4xl font-black">
              Handmade favourites
            </h2>
          </div>

          <span className="hidden text-sm text-[#795c52] sm:block">
            {filteredProducts.length} products
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-[#ead8c7] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:rounded-3xl"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#9e2025]">
                <div className="absolute inset-3 rounded-xl border border-[#ffd99c]/50 sm:inset-5 sm:rounded-2xl sm:border-2" />
                <div className="absolute inset-7 rounded-full border border-[#ffd99c]/40 sm:inset-10" />

                <div className="relative px-2 text-center">
                  <div className="text-4xl text-[#ffd99c] sm:text-6xl">
                    {categoryIcons[product.category] || "✦"}
                  </div>

                  <div className="mt-2 text-[9px] font-bold tracking-[0.2em] text-white/80 sm:mt-4 sm:text-xs sm:tracking-[0.3em]">
                    DEVBHOOMI
                  </div>
                </div>

                {product.badge && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#ffd99c] px-2 py-1 text-[9px] font-bold text-[#571719] sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                    {product.badge}
                  </span>
                )}

                {product.in_stock === false && (
                  <span className="absolute left-2 top-11 rounded-full bg-red-700 px-2 py-1 text-[9px] font-bold text-white sm:left-4 sm:top-14 sm:px-3 sm:text-xs">
                    Out of Stock
                  </span>
                )}

                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 sm:right-4 sm:top-4 sm:p-2"
                >
                  <Heart size={17} />
                </button>
              </div>

              <div className="p-3 sm:p-5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#a56c58] sm:text-xs">
                  {product.category}
                </p>

                <h3 className="mt-2 min-h-[44px] text-sm font-bold sm:min-h-[52px] sm:text-lg">
                  {product.name}
                </h3>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="mt-2 text-xs font-bold text-[#a51c24] underline underline-offset-4 sm:text-sm"
                >
                  View Details
                </button>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
                  <span className="text-base font-black sm:text-xl">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>

                  <span className="text-[10px] text-gray-400 line-through sm:text-sm">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {product.customizable && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#a51c24] sm:mt-3 sm:gap-2 sm:text-xs">
                    <Sparkles size={14} />
                    Customisable
                  </div>
                )}

                {product.customizable && (
                  <button
                    type="button"
                    disabled={product.in_stock === false}
                    onClick={() => openCustomize(product)}
                    className="mt-3 w-full rounded-full border border-[#b51c24] px-3 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm text-[#b51c24] transition hover:bg-[#b51c24] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    ✨ Customize This Product
                  </button>
                )}

                <button
                  type="button"
                  disabled={product.in_stock === false}
                  onClick={() => addToCart(product.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#351717] px-3 py-2.5 text-sm font-bold text-white sm:mt-5 sm:gap-2 sm:px-4 sm:py-3 transition hover:bg-[#a51c24] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                >
                  <ShoppingBag size={17} />
                  {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
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
      <section id="custom" className="scroll-mt-24 bg-[#f1dfcd] px-5 py-12 sm:py-20">
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

          <div className="mt-8 grid gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2">
            {/* LEFT */}
            <div className="rounded-3xl bg-[#9f1720] p-6 text-white shadow-xl sm:p-8">
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
            <div className="rounded-3xl border border-[#d8b9a4] bg-[#fffaf5] p-5 shadow-xl sm:p-7">
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

                  {storeProducts
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
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;

                    if (file && file.size > 5 * 1024 * 1024) {
                      alert("Please choose an image smaller than 5 MB.");
                      e.target.value = "";
                      setCustomReferenceImage(null);
                      return;
                    }

                    setCustomReferenceImage(file);
                  }}
                  className="w-full rounded-xl border border-dashed border-[#c49b83] bg-white p-4 text-sm"
                />

                {customReferenceImage && (
                  <p className="mt-2 text-sm font-semibold text-green-700">
                    ✓ {customReferenceImage.name}
                  </p>
                )}

                <p className="mt-2 text-xs text-[#765850]">
                  Optional — upload an image or design reference.
                </p>
              </div>

              {/* SUBMIT */}
              <button
                type="button"
                disabled={sendingCustomRequest}
                onClick={submitCustomRequest}
                className="w-full rounded-full bg-[#8f151d] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#701018] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingCustomRequest
                  ? "Sending Request..."
                  : "✦ Send Custom Request"}
              </button>

              <p className="mt-4 text-center text-xs text-[#765850]">
                Handmade in Uttarakhand • Delivered across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="mx-auto max-w-7xl px-5 py-12 sm:py-20">
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
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-black">Devbhoomi Designs</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
              Traditional Aipan art and personalised creations from Uttarakhand.
            </p>
            <a
              href="https://wa.me/917409724257"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              WhatsApp Us
            </a>
          </div>

          <div>
            <h4 className="font-bold">Contact</h4>
            <p className="mt-3 text-sm text-white/60">Haldwani, Uttarakhand</p>
            <p className="mt-1 text-sm text-white/60">devbhoomidesigns@gmail.com</p>
            <a
              href="https://wa.me/917409724257"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-white/70 transition hover:text-white"
            >
              WhatsApp: +91 74097 24257
            </a>
          </div>

          <div>
            <h4 className="font-bold">Quick Links</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/60">
              <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms & Conditions</Link>
              <Link href="/shipping" className="transition hover:text-white">Shipping Policy</Link>
              <Link href="/refund" className="transition hover:text-white">Refund Policy</Link>
              <Link href="/contact" className="transition hover:text-white">Contact Us</Link>
              <Link href="/faq" className="transition hover:text-white">FAQ</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold">Follow Devbhoomi</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/60">
              <a
                href="https://www.instagram.com/devbhoomi_designs?igsi=dWNod2U2MmM4Mmpp"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61565126644260"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://youtube.com/@devbhoomi_designs?si=ghMAhwN2C7x4BqA4"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/40">
          © 2026 Devbhoomi Designs • Made with love in Uttarakhand
        </div>
      </footer>

      {/* WHATSAPP FLOATING BUTTON */}
      <a
        href="https://wa.me/917409724257"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Devbhoomi Designs on WhatsApp"
        className="fixed bottom-5 right-5 z-40 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105 hover:opacity-90"
      >
        WhatsApp
      </a>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ead8c7] bg-[#fffaf4]/95 px-2 py-2 shadow-[0_-6px_20px_rgba(53,23,23,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <a href="#" className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-[#a51c24]">
            <span className="text-lg leading-none">⌂</span>
            Home
          </a>
          <a href="#shop" className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-[#795c52]">
            <ShoppingBag size={18} />
            Shop
          </a>
          <a href="#custom" className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-[#795c52]">
            <Sparkles size={18} />
            Custom
          </a>
          <button
            type="button"
            onClick={() => router.push("/my-orders")}
            className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-[#795c52]"
          >
            <span className="text-lg leading-none">📦</span>
            Orders
          </button>
          <button
            type="button"
            onClick={() => {
              if (user) {
                router.push("/my-orders");
              } else {
                window.location.href = "/login";
              }
            }}
            className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-[#795c52]"
          >
            <span className="text-lg leading-none">●</span>
            Account
          </button>
        </div>
      </nav>

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
                      key={product.id}
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
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-[#dcc8b5]">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(product.id)
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
                                  increaseQuantity(product.id)
                                }
                                className="p-2"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(product.id)
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
                  onClick={() => router.push("/checkout")}
                  className="mt-5 w-full rounded-full bg-[#a51c24] py-4 font-bold text-white transition hover:bg-[#85161d]"
                >
                  Proceed to Checkout
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/my-orders")}
                  className="mt-3 w-full rounded-full border border-[#a51c24] py-3 font-bold text-[#a51c24] transition hover:bg-[#fff1ed]"
                >
                  📦 My Orders
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
  onAddToCart={(id) => {
    addToCart(id);
    setCartOpen(true);
  }}
/>
      )}
    </main>
  );
}
