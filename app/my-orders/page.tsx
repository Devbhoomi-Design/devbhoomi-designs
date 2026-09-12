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
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
  productName?: string;
  productImage?: string;
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

type ProductInfo = {
  name: string;
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

const getOrderProductImage = (product?: ProductInfo) =>
  product?.image?.trim() ||
  product?.image_urls?.find(
    (url) => typeof url === "string" && url.trim().length > 0
  ) ||
  (product ? legacyProductImages[product.name] : undefined) ||
  "";

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

    const normalizedOrders: Order[] = (data || []).map((row: Order) => ({
      ...row,
      items: Array.isArray(row.items) ? row.items : [],
      total: Number(row.total || 0),
      status: row.status || "New Order",
    }));

    const productIds = Array.from(
      new Set(
        normalizedOrders.flatMap((order) =>
          order.items
            .map((item) => Number(item.id))
            .filter((id) => Number.isFinite(id))
        )
      )
    );

    let productMap: Record<number, ProductInfo> = {};

    if (productIds.length > 0) {
      const { data: productRows, error: productError } = await supabase
        .from("products")
        .select("id, name, image, image_urls")
        .in("id", productIds);

      if (productError) {
        console.error("Could not load product details:", productError);
      } else {
        productMap = Object.fromEntries(
          (productRows || []).map((product) => [
            Number(product.id),
            {
              name: String(product.name || `Product #${product.id}`),
              image:
                typeof product.image === "string"
                  ? product.image
                  : undefined,
              image_urls: Array.isArray(product.image_urls)
                ? product.image_urls.filter(
                    (url: unknown): url is string =>
                      typeof url === "string" && url.trim().length > 0
                  )
                : [],
            },
          ])
        );
      }
    }

    const ordersWithProductDetails = normalizedOrders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const product = productMap[Number(item.id)];

        return {
          ...item,
          productName: product?.name || `Product #${item.id}`,
          productImage: getOrderProductImage(product),
        };
      }),
    }));

    startTransition(() => {
      setOrders(ordersWithProductDetails);
      setLoading(false);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    const channel = supabase
      .channel("customer-order-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadOrders();
        }
      )
      .subscribe();

    const refreshTimer = window.setInterval(() => {
      void loadOrders();
    }, 15000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />
          <p className="mt-4 font-bold text-[#321817]">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-8 text-[#321817] sm:px-5 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-[#a51c24]">
              ← Home
            </Link>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Your Orders
            </h1>
            <p className="mt-2 break-all text-sm text-[#795c52]">{email}</p>
          </div>

          <Link
            href="/"
            className="rounded-2xl bg-[#a51c24] px-5 py-3 text-center font-black text-white"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#ead8c7] bg-white p-10 text-center shadow-sm">
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
                  className="rounded-3xl border border-[#ead8c7] bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-3 border-b border-[#ead8c7] pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
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

                    <div className="w-fit rounded-full bg-[#f7eadc] px-4 py-2 text-sm font-black text-[#a51c24]">
                      {order.status}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.id}-${item.cartKey || index}`}
                        className="flex min-w-0 gap-3 rounded-2xl border border-[#f0e3d8] bg-[#fffaf4] p-3 sm:gap-4 sm:p-4"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#ead8c7] bg-white sm:h-24 sm:w-24">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName || `Product #${item.id}`}
                              className="h-full w-full object-contain p-1"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl">
                              🎨
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words font-black text-[#321817]">
                            {item.productName || `Product #${item.id}`}
                          </p>

                          {item.variantName && (
                            <p className="mt-1 break-words text-sm font-semibold text-[#795c52]">
                              <span className="font-bold">Variant:</span>{" "}
                              {item.variantName}
                            </p>
                          )}

                          {item.customName && (
                            <p className="mt-1 break-words text-sm text-[#795c52]">
                              <span className="font-bold">Custom:</span>{" "}
                              {item.customName}
                            </p>
                          )}

                          {item.customSize && (
                            <p className="break-words text-sm text-[#795c52]">
                              <span className="font-bold">Size:</span>{" "}
                              {item.customSize}
                            </p>
                          )}

                          {item.instructions && (
                            <p className="break-words text-sm text-[#795c52]">
                              <span className="font-bold">
                                Special Instructions:
                              </span>{" "}
                              {item.instructions}
                            </p>
                          )}

                          <p className="mt-2 text-sm font-bold text-[#795c52]">
                            Qty: {item.quantity}
                            {item.variantPrice != null
                              ? ` • ₹${Number(item.variantPrice).toLocaleString(
                                  "en-IN"
                                )} each`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#ead8c7] pt-5">
                    <span className="font-black">Total</span>
                    <span className="text-xl font-black text-[#a51c24]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-6 overflow-hidden">
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

                    <p className="mt-3 text-center text-xs font-bold text-[#795c52] sm:hidden">
                      {order.status}
                    </p>
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
