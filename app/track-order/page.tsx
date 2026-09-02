"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "../products";
import { supabase } from "../lib/supabase";

type OrderItem = {
  id: number;
  quantity: number;
  customName?: string;
  customSize?: string;
  instructions?: string;
};

type Order = {
  orderId: string;

  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };

  items: OrderItem[];

  total: number;

  createdAt: string;

  status?: string;
};

const trackingSteps = [
  "Order Received",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function TrackOrderPage() {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  
 useEffect(() => {
  const loadOrder = async () => {
    try {
      const savedOrder = localStorage.getItem("devbhoomi-last-order");

      // If we have a local order, use its ID
      if (savedOrder) {
        const localOrder = JSON.parse(savedOrder) as Order;

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", localOrder.orderId)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          setOrder(localOrder);
          setLoading(false);
          return;
        }

        if (data) {
          const updatedOrder: Order = {
            orderId: data.order_id,
            customer: {
              name: data.customer_name,
              phone: data.customer_phone,
              address: data.customer_address,
              city: data.customer_city,
              pincode: data.customer_pincode,
            },
            items: data.items || [],
            total: Number(data.total || 0),
            createdAt: data.created_at,
            status: data.status || "New Order",
          };

          setOrder(updatedOrder);

          localStorage.setItem(
            "devbhoomi-last-order",
            JSON.stringify(updatedOrder)
          );
        }

        setLoading(false);
        return;
      }

      // No local order — get latest order from Supabase
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Could not load latest order:", error);
        setOrder(null);
        setLoading(false);
        return;
      }

      if (data) {
        const newOrder: Order = {
          orderId: data.order_id,
          customer: {
            name: data.customer_name,
            phone: data.customer_phone,
            address: data.customer_address,
            city: data.customer_city,
            pincode: data.customer_pincode,
          },
          items: data.items || [],
          total: Number(data.total || 0),
          createdAt: data.created_at,
          status: data.status || "New Order",
        };

        setOrder(newOrder);

        localStorage.setItem(
          "devbhoomi-last-order",
          JSON.stringify(newOrder)
        );
      }
    } catch (error) {
      console.error("Unable to load order:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  loadOrder();
}, []);



  /*
    Convert the order status into a tracking step.

    For now, newly placed orders start at:
    Order Received

    Later, when we connect the admin panel to Supabase,
    the admin will be able to change the status.
  */
  const getCurrentStep = () => {
    if (!order?.status) {
      return 0;
    }

    const status = order.status.toLowerCase();

    if (status.includes("delivered")) {
      return 5;
    }

    if (status.includes("out")) {
      return 4;
    }

    if (status.includes("shipped")) {
      return 3;
    }

    if (status.includes("processing")) {
      return 2;
    }

    if (status.includes("confirm")) {
      return 1;
    }

    return 0;
  };

  const currentStep = getCurrentStep();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <p className="font-bold text-[#321817]">
          Loading your order...
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4] px-5">
        <div className="w-full max-w-lg rounded-3xl border border-[#ead8c7] bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">📦</div>

          <h1 className="mt-5 text-3xl font-black text-[#321817]">
            No Order Found
          </h1>

          <p className="mt-3 text-[#795c52]">
            We could not find your latest order on this device.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-7 rounded-full bg-[#a51c24] px-8 py-3 font-bold text-white transition hover:bg-[#85161d]"
          >
            Back to Store
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-12 md:px-8">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="text-center">

          <p className="text-sm font-bold tracking-[0.2em] text-[#a51c24]">
            DEVBHOOMI DESIGNS
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#321817] md:text-5xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[#795c52]">
            Follow your order from confirmation to delivery.
          </p>

        </div>


        {/* ORDER HEADER */}

        <section className="mt-10 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm text-[#795c52]">
                Order ID
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#a51c24]">
                {order.orderId}
              </h2>

            </div>


            <div className="md:text-right">

              <p className="text-sm text-[#795c52]">
                Order Date
              </p>

              <p className="mt-1 font-bold text-[#321817]">
                {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>

            </div>


            <div className="rounded-full bg-green-100 px-5 py-2 text-center font-bold text-green-700">
              {order.status || "Order Received"}
            </div>

          </div>

        </section>


        {/* TRACKING */}

        <section className="mt-7 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-black text-[#321817]">
            Order Tracking
          </h2>

          <p className="mt-2 text-sm text-[#795c52]">
            Current status of your order
          </p>


          <div className="mt-8">

            {trackingSteps.map((step, index) => {

              const completed = index <= currentStep;
              const active = index === currentStep;

              return (
                <div
                  key={step}
                  className="relative flex min-h-[82px] gap-5"
                >

                  {/* VERTICAL LINE */}

                  {index < trackingSteps.length - 1 && (
                    <div
                      className={`absolute left-[19px] top-[40px] h-[60px] w-[3px] ${
                        index < currentStep
                          ? "bg-[#a51c24]"
                          : "bg-[#ead8c7]"
                      }`}
                    />
                  )}


                  {/* NUMBER */}

                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${
                      completed
                        ? "border-[#a51c24] bg-[#a51c24] text-white"
                        : "border-[#ead8c7] bg-white text-[#795c52]"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>


                  {/* TEXT */}

                  <div className="pt-1">

                    <p
                      className={`font-bold ${
                        active
                          ? "text-[#a51c24]"
                          : completed
                          ? "text-[#321817]"
                          : "text-[#795c52]"
                      }`}
                    >
                      {step}
                    </p>

                    {active && (
                      <p className="mt-1 text-sm text-[#795c52]">
                        Your order is currently at this stage.
                      </p>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* ORDER ITEMS */}

        <section className="mt-7 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-black text-[#321817]">
              Your Order
            </h2>

            <p className="font-black text-[#a51c24]">
              ₹{order.total.toLocaleString("en-IN")}
            </p>

          </div>


          <div className="mt-6 space-y-4">

            {order.items.map((item, index) => {

              /*
                IMPORTANT:
                Find the actual product from products.ts
                using the product ID saved in the order.
              */

              const product = products.find(
                (product) => product.id === item.id
              );


              /*
                Fallback if the product cannot be found.
              */

              if (!product) {
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="rounded-2xl border border-[#ead8c7] bg-[#fffaf4] p-5"
                  >

                    <p className="font-bold text-[#321817]">
                      Product #{item.id}
                    </p>

                    <p className="mt-1 text-sm text-[#795c52]">
                      Quantity: {item.quantity}
                    </p>

                  </div>
                );
              }


              return (
                <div
                  key={`${product.id}-${index}`}
                  className="flex flex-col gap-5 rounded-2xl border border-[#ead8c7] bg-[#fffaf4] p-4 sm:flex-row sm:items-center"
                >

                  {/* PRODUCT IMAGE */}

                  <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-28 sm:w-28">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />

                  </div>


                  {/* PRODUCT INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 text-lg font-black text-[#321817]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#795c52]">
                      {product.description}
                    </p>


                    {/* CUSTOM DETAILS */}

                    {item.customName && (
                      <p className="mt-2 text-sm text-[#795c52]">
                        <strong>Custom Name:</strong>{" "}
                        {item.customName}
                      </p>
                    )}

                    {item.customSize && (
                      <p className="text-sm text-[#795c52]">
                        <strong>Size:</strong>{" "}
                        {item.customSize}
                      </p>
                    )}

                    {item.instructions && (
                      <p className="text-sm text-[#795c52]">
                        <strong>Instructions:</strong>{" "}
                        {item.instructions}
                      </p>
                    )}

                  </div>


                  {/* PRICE + QUANTITY */}

                  <div className="flex items-center justify-between gap-6 sm:block sm:text-right">

                    <div>

                      <p className="text-sm text-[#795c52]">
                        Quantity
                      </p>

                      <p className="font-bold text-[#321817]">
                        × {item.quantity}
                      </p>

                    </div>


                    <p className="mt-2 font-black text-[#321817]">
                      ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* DELIVERY DETAILS */}

        <section className="mt-7 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-black text-[#321817]">
            Delivery Details
          </h2>


          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                Customer
              </p>

              <p className="mt-1 font-bold text-[#321817]">
                {order.customer.name}
              </p>

            </div>


            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                Mobile
              </p>

              <p className="mt-1 font-bold text-[#321817]">
                {order.customer.phone}
              </p>

            </div>


            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                Address
              </p>

              <p className="mt-1 text-[#795c52]">
                {order.customer.address}
              </p>

            </div>


            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                City
              </p>

              <p className="mt-1 text-[#795c52]">
                {order.customer.city}
              </p>

            </div>


            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                Pincode
              </p>

              <p className="mt-1 font-bold text-[#321817]">
                {order.customer.pincode}
              </p>

            </div>

          </div>

        </section>


        {/* BUTTONS */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-[#a51c24] px-8 py-3 font-bold text-[#a51c24] transition hover:bg-[#fff1e8]"
          >
            Continue Shopping
          </button>


          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-[#a51c24] px-8 py-3 font-bold text-white transition hover:bg-[#85161d]"
          >
            Refresh Tracking
          </button>

        </div>


        {/* FOOTER */}

        <p className="mt-8 pb-8 text-center text-xs text-[#795c52]">
          Handmade in Uttarakhand • Pan India delivery
        </p>

      </div>

    </main>
  );
}