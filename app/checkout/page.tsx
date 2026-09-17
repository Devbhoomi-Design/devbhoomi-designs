"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MapPin, Plus, Star } from "lucide-react";
import { supabase } from "../lib/supabase";
import { products } from "../products";

type CartItem = {
  id: number;
  quantity: number;
  cartKey?: string;
  customName?: string;
  customSize?: string;
  instructions?: string;
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
  referenceImageUrl?: string;
};

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

type ProductInfo = {
  name: string;
  price: number;
  image?: string;
  image_urls?: string[];
};

const legacyProductImages: Record<string, string> = {
  "Personalised Aipan Nameplate": "/products/nameplate.jpg",
  "Aipan Kalash / Tauli / Lota": "/products/kalash.jpg",
  "Aipan Wall Hanging": "/products/wall-hanging.jpg",
  "Customised Aipan Chowki": "/products/chowki.jpg",
  "Aipan Pooja Thali": "/products/thali.jpg",
  "Mandala Art": "/products/mandala.jpg",
  "Aipan Karwachauth Set": "/products/karwachauth.jpg",
  "Personalised Couple Gift": "/products/couple-gift.jpg",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productMap, setProductMap] = useState<Record<number, ProductInfo>>({});
  const [cartLoaded, setCartLoaded] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const localProductMap = useMemo<Record<number, ProductInfo>>(
    () =>
      Object.fromEntries(
        products.map((product) => [
          product.id,
          { name: product.name, price: Number(product.price) },
        ])
      ),
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedCart = localStorage.getItem("devbhoomi-cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(Array.isArray(parsedCart) ? parsedCart : []);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error("Could not load cart:", error);
        setCart([]);
      } finally {
        setCartLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const applyAddress = (savedAddress: Address) => {
    setSelectedAddressId(savedAddress.id);
    setShowNewAddressForm(false);
    setName(savedAddress.full_name);
    setPhone(savedAddress.phone);
    setAddress(savedAddress.address_line);
    setCity(savedAddress.city);
    setState(savedAddress.state);
    setPincode(savedAddress.pincode);
    setAddressLabel(savedAddress.label);
  };

  const clearForNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setName("");
    setPhone("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setAddressLabel("Home");
    setSaveNewAddress(true);
  };

  useEffect(() => {
    const loadCustomerData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/checkout");
        return;
      }

      const { data: savedAddresses, error: addressError } = await supabase
        .from("customer_addresses")
        .select("id, label, full_name, phone, address_line, city, state, pincode, is_default")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (addressError) {
        console.error("Could not load addresses:", addressError);
        setAddresses([]);
        setAddressesLoaded(true);
        setShowNewAddressForm(true);
        const metadataName = String(user.user_metadata?.full_name || "").trim();
        if (metadataName) setName(metadataName);
      } else {
        const list = (savedAddresses || []) as Address[];
        setAddresses(list);
        setAddressesLoaded(true);

        const defaultAddress = list.find((item) => item.is_default) ?? list[0];
        if (defaultAddress) {
          applyAddress(defaultAddress);
        } else {
          setShowNewAddressForm(true);
          const metadataName = String(user.user_metadata?.full_name || "").trim();
          if (metadataName) setName(metadataName);
        }
      }

      const { data: productRows, error: productError } = await supabase
        .from("products")
        .select("id, name, price, image, image_urls")
        .order("id", { ascending: true });

      if (productError) {
        console.error("Could not load product names:", productError);
      } else {
        const map: Record<number, ProductInfo> = {};
        (productRows || []).forEach((product) => {
          map[Number(product.id)] = {
            name: String(product.name || `Product #${product.id}`),
            price: Number(product.price || 0),
            image: typeof product.image === "string" ? product.image : undefined,
            image_urls: Array.isArray(product.image_urls)
              ? product.image_urls.filter(
                  (url: unknown): url is string =>
                    typeof url === "string" && url.trim().length > 0
                )
              : [],
          };
        });
        setProductMap(map);
      }

      setLoadingProfile(false);
    };

    const timer = window.setTimeout(() => {
      void loadCustomerData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const getProductInfo = (id: number) => productMap[id] ?? localProductMap[id];

  const getProductImage = (product?: ProductInfo) =>
    product?.image?.trim() ||
    product?.image_urls?.find((url) => url.trim()) ||
    (product ? legacyProductImages[product.name] : undefined) ||
    "";

  const getItemUnitPrice = (item: CartItem) =>
    Number(item.variantPrice ?? getProductInfo(item.id)?.price ?? 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + getItemUnitPrice(item) * item.quantity,
    0
  );

  const delivery = 0;
  const total = subtotal + delivery;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const saveCurrentAddress = async (userId: string) => {
    if (selectedAddressId) {
      const { error } = await supabase
        .from("customer_addresses")
        .update({
          label: addressLabel.trim() || "Other",
          full_name: name.trim(),
          phone,
          address_line: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAddressId)
        .eq("user_id", userId);

      if (error) throw error;
      return selectedAddressId;
    }

    if (!saveNewAddress) return null;

    const shouldDefault = addresses.length === 0;
    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        user_id: userId,
        label: addressLabel.trim() || "Other",
        full_name: name.trim(),
        phone,
        address_line: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode,
        is_default: shouldDefault,
      })
      .select("id")
      .single();

    if (error) throw error;

    if (shouldDefault) {
      const { error: defaultError } = await supabase.rpc(
        "set_default_customer_address",
        { p_address_id: data.id }
      );
      if (defaultError) throw defaultError;
    }

    return data.id as string;
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) return;

    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/checkout");
      return;
    }

    if (!name.trim()) {
      alert("Please enter the recipient's full name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!address.trim()) {
      alert("Please enter the delivery address.");
      return;
    }
    if (!city.trim()) {
      alert("Please enter the city.");
      return;
    }
    if (!state.trim()) {
      alert("Please enter the state.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    setPlacingOrder(true);

    try {
      // Save/update the selected delivery address before creating the order.
      await saveCurrentAddress(user.id);

      const orderId = `DBD-${pincode}-${total}-${crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;

      const { error } = await supabase.from("orders").insert({
        order_id: orderId,
        user_id: user.id,
        customer_name: name.trim(),
        customer_phone: phone,
        customer_address: address.trim(),
        customer_city: city.trim(),
        customer_pincode: pincode,
        items: cart,
        subtotal,
        delivery,
        total,
        status: "New Order",
      });

      if (error) {
        console.error("Supabase order error:", error);
        alert("Could not save your order. Please try again.");
        return;
      }

      const localOrder = {
        orderId,
        customer: {
          name: name.trim(),
          phone,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode,
        },
        items: cart,
        subtotal,
        delivery,
        total,
        status: "New Order",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("devbhoomi-last-order", JSON.stringify(localOrder));
      localStorage.removeItem("devbhoomi-cart");
      router.push("/order-success");
    } catch (error) {
      console.error("Order error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cartLoaded || loadingProfile || !addressesLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4] text-[#321817]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />
          <p className="mt-4 font-bold">Loading checkout...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-8 text-[#321817] sm:px-5 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/?openCart=1")}
              className="mb-4 text-sm font-bold text-[#a51c24]"
            >
              ← Back to Cart
            </button>
            <h1 className="text-4xl font-black">Checkout</h1>
            <p className="mt-2 text-sm text-[#795c52]">
              Choose a saved address or add a new one for this order.
            </p>
          </div>

          <Link
            href="/profile?from=checkout&returnTo=cart"
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#dcc8b5] bg-white px-4 py-2.5 text-sm font-black text-[#a51c24] sm:self-auto"
          >
            <MapPin size={16} />
            Manage Addresses
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-3xl border border-[#ead8c7] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Delivery Address</h2>
                <p className="mt-1 text-sm text-[#795c52]">
                  Your saved addresses are linked to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={clearForNewAddress}
                className="inline-flex items-center gap-1 rounded-full border border-[#a51c24] px-4 py-2 text-xs font-black text-[#a51c24]"
              >
                <Plus size={15} /> New
              </button>
            </div>

            {addresses.length > 0 && (
              <div className="mt-6 space-y-3">
                {addresses.map((savedAddress) => {
                  const selected = savedAddress.id === selectedAddressId;
                  return (
                    <button
                      key={savedAddress.id}
                      type="button"
                      onClick={() => applyAddress(savedAddress)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#a51c24] bg-[#fff6f0]"
                          : "border-[#ead8c7] bg-[#fffaf4] hover:border-[#caa997]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#a51c24] bg-[#a51c24] text-white"
                              : "border-[#cdb2a2] bg-white text-transparent"
                          }`}
                        >
                          <Check size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#ffd99c] px-3 py-1 text-[11px] font-black text-[#571719]">
                              {savedAddress.label}
                            </span>
                            {savedAddress.is_default && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#a51c24]">
                                <Star size={12} fill="currentColor" /> Default
                              </span>
                            )}
                          </div>
                          <p className="mt-2 font-black">{savedAddress.full_name}</p>
                          <p className="mt-1 text-sm text-[#795c52]">
                            {savedAddress.phone}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#4e312c]">
                            {savedAddress.address_line}, {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {showNewAddressForm && (
              <div className="mt-6 rounded-3xl border border-[#ead8c7] bg-[#fffaf4] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">
                      {selectedAddressId ? "Edit Selected Address" : "New Delivery Address"}
                    </h3>
                    <p className="mt-1 text-xs text-[#795c52]">
                      Save a different address here for another person or location.
                    </p>
                  </div>
                  {addresses.length > 0 && !selectedAddressId && (
                    <button
                      type="button"
                      onClick={() => {
                        const fallback = addresses.find((item) => item.is_default) ?? addresses[0];
                        if (fallback) applyAddress(fallback);
                      }}
                      className="text-xs font-black text-[#a51c24]"
                    >
                      Use Saved
                    </button>
                  )}
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-bold">Address Label</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Home", "Work", "Family", "Other"].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setAddressLabel(label)}
                          className={`rounded-full px-4 py-2 text-xs font-bold ${
                            addressLabel === label
                              ? "bg-[#a51c24] text-white"
                              : "border border-[#dcc8b5] bg-white text-[#321817]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold">Recipient Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-bold">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House no., street, area, landmark"
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">State</label>
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Pincode</label>
                    <input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="110001"
                      maxLength={6}
                      className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                    />
                  </div>

                  {!selectedAddressId && (
                    <label className="flex items-center gap-3 self-end rounded-2xl border border-[#ead8c7] bg-white p-4">
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="h-5 w-5"
                      />
                      <span className="text-sm font-bold">
                        Save this address to My Profile
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="h-fit rounded-3xl border border-[#ead8c7] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Order Summary</h2>

            {cart.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#fffaf4] p-8 text-center">
                <p className="font-bold">Your cart is empty</p>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-3 font-bold text-[#a51c24]"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-3">
                  {cart.map((item, index) => {
                    const product = getProductInfo(item.id);
                    const unitPrice = getItemUnitPrice(item);
                    if (!product) return null;
                    return (
                      <div
                        key={item.cartKey ?? `${item.id}-${index}`}
                        className="rounded-2xl border border-[#ead8c7] bg-[#fffaf4] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#ead8c7] bg-white">
                            {getProductImage(product) ? (
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="h-full w-full object-contain"
                                loading="eager"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl text-[#a51c24]">
                                ✦
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold">{product.name}</p>
                            {item.variantName && (
                              <p className="mt-1 text-xs font-bold text-[#a51c24]">
                                Variant: {item.variantName}
                              </p>
                            )}
                            {item.customName && (
                              <p className="mt-1 text-xs text-[#795c52]">
                                Custom name: {item.customName}
                              </p>
                            )}
                            {item.customSize && (
                              <p className="text-xs text-[#795c52]">
                                Size: {item.customSize}
                              </p>
                            )}
                            {item.instructions && (
                              <p className="text-xs text-[#795c52]">
                                Instructions: {item.instructions}
                              </p>
                            )}
                            <p className="mt-2 text-sm text-[#795c52]">
                              ₹{unitPrice.toLocaleString("en-IN")} × {item.quantity}
                            </p>
                            <p className="mt-2 font-black">
                              ₹{(unitPrice * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-4 border-t border-[#ead8c7] pt-5">
                  <div className="flex justify-between">
                    <span className="text-[#795c52]">Items</span>
                    <span className="font-bold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#795c52]">Subtotal</span>
                    <span className="font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#795c52]">Delivery</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-[#ead8c7] pt-5 text-xl">
                    <span className="font-black">Total</span>
                    <span className="font-black text-[#a51c24]">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="mt-8 w-full rounded-full bg-[#a51c24] px-6 py-4 font-bold text-white transition hover:bg-[#85161d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? "Saving Order..." : "Place Order"}
                </button>

                <p className="mt-4 text-center text-xs text-[#795c52]">
                  Secure checkout • Pan India delivery
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
