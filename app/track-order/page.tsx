"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type OrderItem = {
  id: number;
  quantity: number;
  cartKey?: string;
  customName?: string;
  customSize?: string;
  instructions?: string;
};

type TrackedOrder = {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_pincode: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
};

const statuses = [
  "New Order",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const findOrder = async (event?: FormEvent) => {
    event?.preventDefault();

    const cleanOrderId = orderId.trim();
    const cleanPhone = phone.trim();

    if (!cleanOrderId) {
      setMessage("Please enter your Order ID.");
      setOrder(null);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setMessage("");
    setOrder(null);

    try {
      const { data, error } = await supabase.rpc("track_order", {
        p_order_id: cleanOrderId,
        p_phone: cleanPhone,
      });

      if (error) {
        console.error("Track order error:", error);
        setMessage("Unable to find this order. Please check your Order ID and mobile number.");
        return;
      }

      const found = Array.isArray(data) ? data[0] : data;

      if (!found) {
        setMessage("No order found. Please check your Order ID and mobile number.");
        return;
      }

      setOrder({
        ...found,
        items: Array.isArray(found.items) ? found.items : [],
        subtotal: Number(found.subtotal || 0),
        delivery: Number(found.delivery || 0),
        total: Number(found.total || 0),
      });
    } catch (error) {
      console.error("Unexpected tracking error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically refresh the live status every 20 seconds.
  useEffect(() => {
    if (!order) return;

    const timer = window.setInterval(() => {
      void findOrder();
    }, 20000);

    return () => window.clearInterval(timer);
  }, [order, orderId, phone]);

  const currentIndex = order
    ? Math.max(0, statuses.indexOf(order.status))
    : -1;

  const formattedDate = order
    ? new Date(order.created_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-10 text-[#321817]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-block text-sm font-bold text-[#a51c24]"
        >
          ← Back to Home
        </Link>

        <div className="mt-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#a56c58]">
            Devbhoomi Designs
          </p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">
            Track Your Order
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#795c52]">
            Enter your Order ID and the mobile number used while placing the
            order.
          </p>
        </div>

        <form
          onSubmit={findOrder}
          className="mt-8 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-black">
                Order ID
              </label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Example: DBD-248001-999-AB12CD34"
                className="w-full rounded-2xl border border-[#dcc8b5] bg-[#fffaf4] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Mobile Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                placeholder="10-digit mobile number"
                className="w-full rounded-2xl border border-[#dcc8b5] bg-[#fffaf4] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[#a51c24] px-5 py-4 font-black text-white transition hover:bg-[#8f171e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Finding Order..." : "Track My Order"}
          </button>

          {message && (
            <div className="mt-4 rounded-2xl bg-[#fff1ed] p-4 text-center text-sm font-bold text-[#a51c24]">
              {message}
            </div>
          )}
        </form>

        {order && (
          <section className="mt-8 space-y-6">
            <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#a56c58]">
                    Order ID
                  </p>
                  <h2 className="mt-1 break-all text-2xl font-black text-[#a51c24]">
                    {order.order_id}
                  </h2>
                  <p className="mt-2 text-sm text-[#795c52]">
                    Placed on {formattedDate}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7eadc] px-5 py-3 text-center">
                  <p className="text-xs font-black uppercase text-[#795c52]">
                    Current Status
                  </p>
                  <p className="mt-1 text-lg font-black text-[#a51c24]">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-black">Order Status</h2>

              <div className="mt-8 space-y-5">
                {statuses.map((status, index) => {
                  const completed = index <= currentIndex;
                  const active = index === currentIndex;

                  return (
                    <div key={status} className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-black ${
                          completed
                            ? "border-[#a51c24] bg-[#a51c24] text-white"
                            : "border-[#dcc8b5] bg-[#fffaf4] text-[#a56c58]"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <div className="pt-1">
                        <p
                          className={`font-black ${
                            active ? "text-[#a51c24]" : "text-[#321817]"
                          }`}
                        >
                          {status}
                        </p>
                        {active && (
                          <p className="mt-1 text-sm text-[#795c52]">
                            Your order is currently here.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-8 rounded-2xl bg-[#f7eadc] p-4 text-sm text-[#795c52]">
                This page refreshes the order status automatically every 20
                seconds.
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-black">Order Details</h2>

              <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                <div className="rounded-2xl bg-[#fffaf4] p-4">
                  <p className="font-black">Customer</p>
                  <p className="mt-1 text-[#795c52]">{order.customer_name}</p>
                </div>

                <div className="rounded-2xl bg-[#fffaf4] p-4">
                  <p className="font-black">Delivery Location</p>
                  <p className="mt-1 text-[#795c52]">
                    {order.customer_city} - {order.customer_pincode}
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-[#ead8c7]">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.cartKey || index}`}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-bold">
                        Product #{item.id}
                        {item.customName ? ` — ${item.customName}` : ""}
                      </p>
                      <p className="text-sm text-[#795c52]">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#ead8c7] pt-5 text-lg font-black">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-block rounded-2xl border border-[#dcc8b5] bg-white px-6 py-3 font-black text-[#a51c24] hover:bg-[#f7eadc]"
              >
                Continue Shopping
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
