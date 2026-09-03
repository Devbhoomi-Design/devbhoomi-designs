"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type OrderStatus =
  | "New Order"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

type OrderItem = {
  id: number;
  quantity: number;
  cartKey?: string;
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
  subtotal: number;
  delivery: number;
  total: number;
  createdAt: string;
  status?: OrderStatus;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [loaded, setLoaded] = useState(false);

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
  const loadOrders = async () => {
    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Not logged in → go to login
      if (!user) {
        router.replace("/login?next=/admin/orders");
        return;
      }

      // Check admin access from Supabase
const userEmail = user.email?.trim().toLowerCase();

console.log("LOGGED IN USER:", userEmail);

const { data: admins, error: adminError } = await supabase
  .from("admins")
  .select("email");

if (adminError) {
  console.error("Error checking admin access:", adminError);
  alert("Could not verify admin access.");
  router.replace("/");
  return;
}

const isAdmin = admins?.some(
  (admin) => admin.email?.trim().toLowerCase() === userEmail
);

console.log("ADMIN ACCESS:", isAdmin);
console.log("ADMIN EMAILS:", admins);

if (!isAdmin) {
  alert(`Not authorized.\nLogged in as: ${userEmail}`);
  router.replace("/");
  return;
}

      // Load orders only after admin verification
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
        return;
      }

      const formattedOrders: Order[] = (data || []).map((row) => ({
        orderId: row.order_id,
        customer: {
          name: row.customer_name,
          phone: row.customer_phone,
          address: row.customer_address,
          city: row.customer_city,
          pincode: row.customer_pincode,
        },
        items: row.items || [],
        subtotal: Number(row.subtotal || 0),
        delivery: Number(row.delivery || 0),
        total: Number(row.total || 0),
        createdAt: row.created_at,
        status: row.status || "New Order",
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Unexpected error:", error);
      setOrders([]);
    } finally {
      setLoaded(true);
    }
  };

  loadOrders();
}, [router]);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      alert("Could not update order status.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderId === orderId
          ? { ...order, status: status }
          : order
      )
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    alert("Something went wrong.");
  }
};

  // =====================================================
  // DELETE ORDER
  // =====================================================

  const deleteOrder = (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) {
      return;
    }

    const updatedOrders = orders.filter(
      (order) => order.orderId !== orderId
    );

    setOrders(updatedOrders);

    localStorage.removeItem("devbhoomi-last-order");
  };

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderId.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.includes(query) ||
        order.customer.city.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" ||
        (order.status || "New Order") === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  const totalOrders = orders.length;

  const totalSales = orders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  const newOrders = orders.filter(
    (order) => (order.status || "New Order") === "New Order"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status: OrderStatus) => {
  switch (status) {
    case "New Order":
      return "bg-yellow-100 text-yellow-700";

    case "Confirmed":
      return "bg-blue-100 text-blue-700";

    case "Processing":
      return "bg-orange-100 text-orange-700";

    case "Shipped":
      return "bg-purple-100 text-purple-700";

    case "Out for Delivery":
      return "bg-indigo-100 text-indigo-700";

    case "Delivered":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

  // =====================================================
  // LOADING
  // =====================================================

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />

          <p className="mt-4 font-bold text-[#321817]">
            Loading Admin Dashboard...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-xs font-bold tracking-[0.25em] text-[#a51c24]">
              DEVBHOOMI DESIGNS
            </p>

            <h1 className="mt-2 text-4xl font-black text-[#321817]">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-[#795c52]">
              Manage your store orders and customers.
            </p>

          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-[#dcc8b5] bg-white px-6 py-3 font-bold text-[#a51c24] transition hover:bg-[#f7eadc]"
          >
            ← Back to Store
          </button>

        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL ORDERS */}

          <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-bold text-[#795c52]">
                Total Orders
              </p>

              <span className="text-2xl">
                📦
              </span>

            </div>

            <p className="mt-4 text-3xl font-black text-[#321817]">
              {totalOrders}
            </p>

          </div>

          {/* TOTAL SALES */}

          <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-bold text-[#795c52]">
                Total Sales
              </p>

              <span className="text-2xl">
                💰
              </span>

            </div>

            <p className="mt-4 text-3xl font-black text-[#a51c24]">
              ₹{totalSales.toLocaleString("en-IN")}
            </p>

          </div>

          {/* NEW ORDERS */}

          <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-bold text-[#795c52]">
                New Orders
              </p>

              <span className="text-2xl">
                🔔
              </span>

            </div>

            <p className="mt-4 text-3xl font-black text-yellow-600">
              {newOrders}
            </p>

          </div>

          {/* DELIVERED */}

          <div className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-sm font-bold text-[#795c52]">
                Delivered
              </p>

              <span className="text-2xl">
                ✅
              </span>

            </div>

            <p className="mt-4 text-3xl font-black text-green-600">
              {deliveredOrders}
            </p>

          </div>

        </div>

        {/* =================================================
            ORDER PIPELINE
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

          <h2 className="text-xl font-black text-[#321817]">
            Order Pipeline
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-700">
                Confirmed
              </p>

              <p className="mt-2 text-2xl font-black text-blue-800">
                {confirmedOrders}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-sm font-bold text-purple-700">
                Shipped
              </p>

              <p className="mt-2 text-2xl font-black text-purple-800">
                {shippedOrders}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm font-bold text-green-700">
                Delivered
              </p>

              <p className="mt-2 text-2xl font-black text-green-800">
                {deliveredOrders}
              </p>
            </div>

          </div>

        </section>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            {/* SEARCH */}

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer, phone or city..."
              className="w-full rounded-2xl border border-[#dcc8b5] bg-[#fffaf4] px-5 py-3 outline-none focus:border-[#a51c24]"
            />

            {/* FILTER */}

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as "All" | OrderStatus
                )
              }
              className="rounded-2xl border border-[#dcc8b5] bg-[#fffaf4] px-5 py-3 font-bold outline-none focus:border-[#a51c24]"
            >
              <option value="All">
                All Orders
              </option>

              <option value="New Order">
  New Order
</option>

<option value="Confirmed">
  Confirmed
</option>

<option value="Processing">
  Processing
</option>

<option value="Shipped">
  Shipped
</option>

<option value="Out for Delivery">
  Out for Delivery
</option>

<option value="Delivered">
  Delivered
</option>
</select>
          </div>

        </section>

        {/* =================================================
            ORDERS
        ================================================= */}

        <section className="mt-6">

          {filteredOrders.length === 0 ? (

            <div className="rounded-3xl border border-[#ead8c7] bg-white p-12 text-center shadow-sm">

              <div className="text-5xl">
                📦
              </div>

              <h2 className="mt-5 text-2xl font-black text-[#321817]">
                No Orders Found
              </h2>

              <p className="mt-2 text-[#795c52]">
                Try changing your search or filter.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {filteredOrders.map((order) => {

                const status =
                  order.status || "New Order";

                return (
                  <article
                    key={order.orderId}
                    className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm"
                  >

                    {/* ORDER TOP */}

                    <div className="flex flex-col gap-4 border-b border-[#ead8c7] pb-5 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-[#a56c58]">
                          Order ID
                        </p>

                        <h2 className="mt-1 text-xl font-black text-[#a51c24]">
                          {order.orderId}
                        </h2>

                        <p className="mt-1 text-sm text-[#795c52]">
                          {new Date(
                            order.createdAt
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>

                      <span
                        className={`w-fit rounded-full px-5 py-2 text-sm font-bold ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-3">

                      {/* CUSTOMER */}

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-[#a56c58]">
                          Customer
                        </p>

                        <p className="mt-2 font-black text-[#321817]">
                          {order.customer.name}
                        </p>

                        <p className="mt-1 text-sm text-[#795c52]">
                          📱 {order.customer.phone}
                        </p>

                        <p className="mt-1 text-sm text-[#795c52]">
                          📍 {order.customer.city},{" "}
                          {order.customer.pincode}
                        </p>

                      </div>

                      {/* PRODUCTS */}

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-[#a56c58]">
                          Products
                        </p>

                        <div className="mt-2 space-y-2">

                          {order.items.map(
                            (item, index) => (
                              <div
                                key={
                                  item.cartKey ??
                                  `${item.id}-${index}`
                                }
                                className="rounded-xl bg-[#fffaf4] p-3"
                              >

                                <p className="font-bold text-[#321817]">
                                  Product #{item.id}
                                </p>

                                <p className="text-sm text-[#795c52]">
                                  Quantity:{" "}
                                  {item.quantity}
                                </p>

                                {item.customName && (
                                  <p className="text-xs text-[#795c52]">
                                    Custom:{" "}
                                    {item.customName}
                                  </p>
                                )}

                                {item.customSize && (
                                  <p className="text-xs text-[#795c52]">
                                    Size:{" "}
                                    {item.customSize}
                                  </p>
                                )}

                              </div>
                            )
                          )}

                        </div>

                      </div>

                      {/* TOTAL */}

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-[#a56c58]">
                          Order Total
                        </p>

                        <p className="mt-2 text-3xl font-black text-[#a51c24]">
                          ₹
                          {order.total.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="mt-1 text-sm text-green-600">
                          Free Delivery
                        </p>

                      </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="mt-6 rounded-2xl bg-[#fffaf4] p-4">

                      <p className="text-xs font-bold uppercase tracking-wider text-[#a56c58]">
                        Delivery Address
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#321817]">
                        {order.customer.address},{" "}
                        {order.customer.city} -{" "}
                        {order.customer.pincode}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-col gap-3 md:flex-row">

                      {/* STATUS */}

                      <select
  value={status}
  onChange={(e) =>
    updateStatus(
      order.orderId,
      e.target.value as OrderStatus
    )
  }
  className="rounded-full border border-[#dcc8b5] bg-white px-5 py-3 font-bold outline-none focus:border-[#a51c24]"
>
  <option value="New Order">
    New Order
  </option>

  <option value="Confirmed">
    Confirmed
  </option>

  <option value="Processing">
    Processing
  </option>

  <option value="Shipped">
    Shipped
  </option>

  <option value="Out for Delivery">
    Out for Delivery
  </option>

  <option value="Delivered">
    Delivered
  </option>
</select>
        


                      {/* WHATSAPP */}

                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://wa.me/91${order.customer.phone}`,
                            "_blank"
                          )
                        }
                        className="rounded-full bg-[#25D366] px-6 py-3 font-bold text-white hover:opacity-90"
                      >
                        💬 WhatsApp Customer
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          deleteOrder(order.orderId)
                        }
                        className="rounded-full border border-red-200 bg-white px-6 py-3 font-bold text-red-600 hover:bg-red-50"
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}