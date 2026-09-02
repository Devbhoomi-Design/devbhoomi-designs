"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    cartKey?: string;
    customName?: string;
    customSize?: string;
    instructions?: string;
  }[];
  subtotal?: number;
  delivery?: number;
  total: number;
  status?: string;
  createdAt: string;
};

export default function OrderSuccessPage() {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("devbhoomi-last-order");

    if (!savedOrder) {
      router.push("/");
      return;
    }

    const loadOrder = async () => {
      try {
        const parsedOrder = JSON.parse(savedOrder) as Order;

        // Prevent React setState-in-effect warning
        await Promise.resolve();

        setOrder(parsedOrder);
      } catch (error) {
        console.error("Error reading order:", error);

        await Promise.resolve();

        router.push("/");
      }
    };

    loadOrder();
  }, [router]);

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />

          <p className="mt-4 font-bold text-[#321817]">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">

        {/* SUCCESS ICON */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl font-black text-green-600">
          ✓
        </div>

        {/* BRAND */}
        <p className="mt-7 text-sm font-bold tracking-[0.2em] text-[#a51c24]">
          DEVBHOOMI DESIGNS
        </p>

        {/* TITLE */}
        <h1 className="mt-3 text-4xl font-black text-[#321817]">
          Order Confirmed!
        </h1>

        <p className="mt-3 text-[#795c52]">
          Thank you, {order.customer.name}! Your order has been
          successfully received.
        </p>

        {/* ORDER CARD */}
        <div className="mt-8 rounded-3xl border border-[#ead8c7] bg-white p-7 text-left shadow-sm">

          {/* ORDER ID + TOTAL */}
          <div className="flex items-center justify-between border-b border-[#ead8c7] pb-5">

            <div>
              <p className="text-sm text-[#795c52]">
                Order ID
              </p>

              <p className="mt-1 text-xl font-black text-[#a51c24]">
                {order.orderId}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-[#795c52]">
                Total
              </p>

              <p className="mt-1 text-xl font-black text-[#321817]">
                ₹{order.total.toLocaleString("en-IN")}
              </p>
            </div>

          </div>

          {/* ORDER ITEMS */}
          <div className="mt-6">

            <h2 className="font-black text-[#321817]">
              Order Details
            </h2>

            <div className="mt-3 space-y-3">

              {order.items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-2xl bg-[#fffaf4] p-4"
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="font-bold text-[#321817]">
                        {item.customName || `Product #${item.id}`}
                      </p>

                      <p className="mt-1 text-sm text-[#795c52]">
                        Quantity: {item.quantity}
                      </p>

                      {item.customSize && (
                        <p className="text-xs text-[#795c52]">
                          Size: {item.customSize}
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* DELIVERY DETAILS */}
          <div className="mt-6 border-t border-[#ead8c7] pt-6">

            <h2 className="font-black text-[#321817]">
              Delivery Details
            </h2>

            <div className="mt-3 text-sm leading-6 text-[#795c52]">

              <p>
                <strong>Name:</strong>{" "}
                {order.customer.name}
              </p>

              <p>
                <strong>Mobile:</strong>{" "}
                {order.customer.phone}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {order.customer.address}
              </p>

              <p>
                <strong>City:</strong>{" "}
                {order.customer.city}
              </p>

              <p>
                <strong>Pincode:</strong>{" "}
                {order.customer.pincode}
              </p>

            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6 rounded-2xl bg-[#fffaf4] p-5">

            <p className="font-bold text-[#321817]">
              Order Status
            </p>

            <p className="mt-1 text-sm font-bold text-green-600">
              ✓ Order received
            </p>

            <p className="mt-1 text-sm text-[#795c52]">
              We will contact you regarding your order and delivery.
            </p>

          </div>

        </div>

        {/* CONTINUE SHOPPING */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-8 rounded-full bg-[#a51c24] px-10 py-4 font-bold text-white transition hover:bg-[#85161d]"
        >
          Continue Shopping
        </button>

        <p className="mt-5 text-xs text-[#795c52]">
          Handmade in Uttarakhand • Pan India delivery
        </p>

      </div>
    </main>
  );
}