"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "../products";
import { supabase } from "../lib/supabase";

type CartItem = {
  id: number;
  quantity: number;
  cartKey?: string;
  customName?: string;
  customSize?: string;
  instructions?: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // =====================================================
  // LOAD CART
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedCart = localStorage.getItem("devbhoomi-cart");

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);

          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          } else {
            setCart([]);
          }
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }

      setCartLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // FIND PRODUCT
  // =====================================================

  const getProduct = (id: number) => {
    return products.find((product) => product.id === id);
  };

  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const subtotal = cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    if (!product) {
      return sum;
    }

    return sum + product.price * item.quantity;
  }, 0);

  const delivery = 0;
  const total = subtotal + delivery;

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    // Empty cart
    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/");
      return;
    }

    // Validate name
    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    // Validate phone
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Validate address
    if (!address.trim()) {
      alert("Please enter your address.");
      return;
    }

    // Validate city
    if (!city.trim()) {
      alert("Please enter your city.");
      return;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    setPlacingOrder(true);

    try {
      // =================================================
      // CREATE ORDER ID
      // =================================================

      const orderId =
  `DBD-${pincode}-${total}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;

      // =================================================
      // SAVE ORDER TO SUPABASE
      // =================================================

      const { error } = await supabase
        .from("orders")
        .insert({
          order_id: orderId,

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

      // =================================================
      // CHECK DATABASE ERROR
      // =================================================

      if (error) {
        console.error("Supabase order error:", error);

        alert(
          "Could not save your order. Please try again."
        );

        setPlacingOrder(false);
        return;
      }

      // =================================================
      // SAVE LAST ORDER LOCALLY
      // =================================================

      const localOrder = {
        orderId,

        customer: {
          name: name.trim(),
          phone,
          address: address.trim(),
          city: city.trim(),
          pincode,
        },

        items: cart,

        subtotal,
        delivery,
        total,

        status: "New Order",

        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "devbhoomi-last-order",
        JSON.stringify(localOrder)
      );

      // =================================================
      // REMOVE CART
      // =================================================

      localStorage.removeItem("devbhoomi-cart");

      // =================================================
      // GO TO SUCCESS PAGE
      // =================================================

      router.push("/order-success");

    } catch (error) {
      console.error("Order error:", error);

      alert(
        "Something went wrong while placing your order."
      );

      setPlacingOrder(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!cartLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />

          <p className="mt-4 font-bold text-[#321817]">
            Loading checkout...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 text-sm font-bold text-[#a51c24]"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-black text-[#321817]">
            Checkout
          </h1>

          <p className="mt-2 text-[#795c52]">
            Enter your delivery details to place your order.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2">

          {/* =============================================
              DELIVERY DETAILS
          ============================================= */}

          <section className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-black text-[#321817]">
              Delivery Details
            </h2>

            {/* NAME */}

            <div className="mt-6">

              <label className="text-sm font-bold text-[#321817]">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 text-[#321817] outline-none focus:border-[#a51c24]"
              />

            </div>

            {/* PHONE */}

            <div className="mt-5">

              <label className="text-sm font-bold text-[#321817]">
                Mobile Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="10-digit mobile number"
                maxLength={10}
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 text-[#321817] outline-none focus:border-[#a51c24]"
              />

            </div>

            {/* ADDRESS */}

            <div className="mt-5">

              <label className="text-sm font-bold text-[#321817]">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, area"
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 text-[#321817] outline-none focus:border-[#a51c24]"
              />

            </div>

            {/* CITY */}

            <div className="mt-5">

              <label className="text-sm font-bold text-[#321817]">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Delhi"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 text-[#321817] outline-none focus:border-[#a51c24]"
              />

            </div>

            {/* PINCODE */}

            <div className="mt-5">

              <label className="text-sm font-bold text-[#321817]">
                Pincode
              </label>

              <input
                type="text"
                value={pincode}
                onChange={(e) =>
                  setPincode(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="110001"
                maxLength={6}
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 text-[#321817] outline-none focus:border-[#a51c24]"
              />

            </div>

          </section>

          {/* =============================================
              ORDER SUMMARY
          ============================================= */}

          <section className="h-fit rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-black text-[#321817]">
              Order Summary
            </h2>

            {cart.length === 0 ? (

              <div className="mt-6 rounded-2xl bg-[#fffaf4] p-8 text-center">

                <p className="font-bold text-[#321817]">
                  Your cart is empty
                </p>

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

                {/* PRODUCTS */}

                <div className="mt-6 space-y-3">

                  {cart.map((item, index) => {

                    const product = getProduct(item.id);

                    if (!product) {
                      return null;
                    }

                    return (
                      <div
                        key={
                          item.cartKey ??
                          `${item.id}-${index}`
                        }
                        className="rounded-2xl border border-[#ead8c7] bg-[#fffaf4] p-4"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="font-bold text-[#321817]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-sm text-[#795c52]">
                              ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}{" "}
                              × {item.quantity}
                            </p>

                            {item.customName && (
                              <p className="mt-1 text-xs text-[#795c52]">
                                Custom: {item.customName}
                              </p>
                            )}

                            {item.customSize && (
                              <p className="text-xs text-[#795c52]">
                                Size: {item.customSize}
                              </p>
                            )}

                            {item.instructions && (
                              <p className="text-xs text-[#795c52]">
                                Instructions:{" "}
                                {item.instructions}
                              </p>
                            )}

                          </div>

                          <p className="font-black text-[#321817]">
                            ₹
                            {(
                              product.price *
                              item.quantity
                            ).toLocaleString("en-IN")}
                          </p>

                        </div>

                      </div>
                    );
                  })}

                </div>

                {/* PRICE */}

                <div className="mt-6 space-y-4 border-t border-[#ead8c7] pt-5">

                  <div className="flex justify-between">

                    <span className="text-[#795c52]">
                      Items
                    </span>

                    <span className="font-bold">
                      {totalItems}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-[#795c52]">
                      Subtotal
                    </span>

                    <span className="font-bold">
                      ₹
                      {subtotal.toLocaleString("en-IN")}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-[#795c52]">
                      Delivery
                    </span>

                    <span className="font-bold text-green-600">
                      FREE
                    </span>

                  </div>

                  <div className="flex justify-between border-t border-[#ead8c7] pt-5 text-xl">

                    <span className="font-black">
                      Total
                    </span>

                    <span className="font-black text-[#a51c24]">
                      ₹
                      {total.toLocaleString("en-IN")}
                    </span>

                  </div>

                </div>

                {/* PLACE ORDER */}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="mt-8 w-full rounded-full bg-[#a51c24] px-6 py-4 font-bold text-white transition hover:bg-[#85161d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder
                    ? "Saving Order..."
                    : "Place Order"}
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