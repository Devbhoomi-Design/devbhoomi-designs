"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "../products";

type Order = {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: {
    id: number;
    quantity: number;
  }[];
  total: number;
  createdAt: string;
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders] = useState<Order[]>(() => {
  if (typeof window === "undefined") {
    return [];
  }

  const savedOrder =
  localStorage.getItem("devbhoomi_order") ||
  localStorage.getItem("devbhoomi-last-order");

  if (!savedOrder) {
    return [];
  }

  try {
    const order = JSON.parse(savedOrder);
    return [order];
  } catch {
    return [];
  }
});

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-12">
      <div className="mx-auto max-w-4xl">

        <button
          onClick={() => router.push("/")}
          className="mb-8 font-bold text-[#a51c24]"
        >
          ← Back to Store
        </button>

        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.2em] text-[#a51c24]">
            DEVBHOOMI DESIGNS
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#321817]">
            My Orders
          </h1>

          <p className="mt-2 text-[#795c52]">
            View your orders and track their delivery status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#ead8c7] bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📦</div>

            <h2 className="mt-5 text-2xl font-black text-[#321817]">
              No Orders Yet
            </h2>

            <p className="mt-2 text-[#795c52]">
              You have not placed any orders yet.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-full bg-[#a51c24] px-8 py-3 font-bold text-white"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm text-[#795c52]">
                      Order ID
                    </p>

                    <p className="mt-1 text-xl font-black text-[#a51c24]">
                      {order.orderId}
                    </p>

                    <p className="mt-2 text-sm text-[#795c52]">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm text-[#795c52]">
                      Total
                    </p>

                    <p className="text-xl font-black text-[#321817]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>
                  </div>

                </div>

                <div className="mt-5 border-t border-[#ead8c7] pt-5">

                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl bg-[#fffaf4] p-4"
                    >
                      <div>
                        {(() => {
  const product = products.find((p) => p.id === item.id);

  if (!product) {
    return (
      <p className="font-bold text-[#321817]">
        Product #{item.id}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <img
        src={product.image}
        alt={product.name}
        className="h-20 w-20 rounded-xl object-cover"
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#a51c24]">
          {product.category}
        </p>

        <p className="mt-1 font-bold text-[#321817]">
          {product.name}
        </p>

        <p className="mt-1 text-sm text-[#795c52]">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="mt-1 text-sm text-[#795c52]">
          Quantity: {item.quantity}
        </p>
      </div>
    </div>
  );
})()}

                        <p className="mt-1 text-sm text-[#795c52]">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <span className="font-bold text-green-600">
                        Confirmed
                      </span>
                    </div>
                  ))}

                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={() =>
                      router.push(
                        `/track-order?orderId=${encodeURIComponent(
                          order.orderId
                        )}`
                      )
                    }
                    className="flex-1 rounded-full bg-[#a51c24] px-6 py-3 font-bold text-white"
                  >
                    Track Order
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 rounded-full border border-[#a51c24] px-6 py-3 font-bold text-[#a51c24]"
                  >
                    Continue Shopping
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}