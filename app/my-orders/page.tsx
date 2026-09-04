"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type OrderItem = {
  id: number;
  quantity: number;
  cartKey?: string;
  customName?: string;
  customSize?: string;
  instructions?: string;
};

type Order = {
  order_id: string;
  customer_name: string;
  customer_city: string;
  customer_pincode: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
};

const statuses = [
  "New Order",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [, startTransition] = useTransition();

  const loadOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/my-orders");
      return;
    }

    startTransition(() => {
      setEmail(user.email || "");
    });

    const { data, error } = await supabase.rpc("get_my_orders");

    if (error) {
      console.error("My orders error:", error);

      startTransition(() => {
        setOrders([]);
        setLoading(false);
      });

      return;
    }

    const formattedOrders: Order[] = (data || []).map((row: Order) => ({
      ...row,
      items: Array.isArray(row.items) ? row.items : [],
      total: Number(row.total || 0),
      status: row.status || "New Order",
    }));

    startTransition(() => {
      setOrders(formattedOrders);
      setLoading(false);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />
          <p className="mt-4 font-bold">Loading your orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-10 text-[#321817]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-[#a51c24]">
              ← Home
            </Link>

            <h1 className="mt-3 text-4xl font-black">Your Orders</h1>

            <p className="mt-2 text-sm text-[#795c52]">{email}</p>
          </div>

          <Link
            href="/"
            className="rounded-2xl bg-[#a51c24] px-5 py-3 text-center font-black text-white"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#ead8c7] bg-white p-12 text-center shadow-sm">
            <div className="text-6xl">📦</div>

            <h2 className="mt-5 text-2xl font-black">No orders yet</h2>

            <p className="mt-2 text-[#795c52]">
              Your placed orders will appear here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#a51c24] px-6 py-3 font-bold text-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const statusIndex = statuses.indexOf(order.status);
              const currentIndex = statusIndex >= 0 ? statusIndex : 0;

              return (
                <article
                  key={order.order_id}
                  className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 border-b border-[#ead8c7] pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#a56c58]">
                        Order
                      </p>

                      <h2 className="mt-1 break-all font-black text-[#a51c24]">
                        {order.order_id}
                      </h2>

                      <p className="mt-1 text-sm text-[#795c52]">
                        {new Date(order.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="rounded-full bg-[#f7eadc] px-4 py-2 text-sm font-black text-[#a51c24]">
                      {order.status}
                    </div>
                  </div>

                  <div className="mt-5">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.id}-${item.cartKey || index}`}
                        className="flex items-center justify-between border-b border-[#f0e3d8] py-3 last:border-0"
                      >
                        <div>
                          <p className="font-bold">
                            Product #{item.id}
                            {item.customName ? ` — ${item.customName}` : ""}
                          </p>

                          <p className="text-sm text-[#795c52]">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-black">Total</span>

                    <span className="text-xl font-black text-[#a51c24]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between gap-1">
                      {statuses.map((status, index) => (
                        <div
                          key={status}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${
                              index <= currentIndex
                                ? "bg-[#a51c24]"
                                : "bg-[#dcc8b5]"
                            }`}
                          />

                          <span className="mt-2 hidden text-center text-[10px] font-bold sm:block">
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 h-1 rounded-full bg-[#ead8c7]">
                      <div
                        className="h-1 rounded-full bg-[#a51c24] transition-all"
                        style={{
                          width: `${
                            (currentIndex / (statuses.length - 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/track-order?orderId=${encodeURIComponent(
                      order.order_id
                    )}`}
                    className="mt-6 block rounded-2xl border border-[#a51c24] px-5 py-3 text-center font-black text-[#a51c24] hover:bg-[#fff1ed]"
                  >
                    View & Track Order
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
