"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price: number;
  description: string;
  badge: string | null;
  customizable: boolean;
  image: string | null;
  in_stock: boolean;
};

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  original_price: "",
  description: "",
  badge: "",
  customizable: false,
  image: "",
  in_stock: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setAuthorized] = useState(false);

  // CHECK ADMIN ACCESS, THEN LOAD PRODUCTS
  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        window.location.href = "/login?next=/admin/products";
        return;
      }

      const email = user.email.trim().toLowerCase();

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (adminError) {
        console.error("Admin check error:", adminError);
        alert("Could not verify admin access.");
        window.location.href = "/";
        return;
      }

      if (!admin) {
        alert("You are not authorized to access the admin panel.");
        window.location.href = "/";
        return;
      }

      setAuthorized(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error loading products:", error);
        alert("Could not load products.");
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    initializePage();
  }, []);

  // HANDLE INPUT
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // ADD / UPDATE PRODUCT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!form.category.trim()) {
      alert("Please enter category.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      alert("Please enter a valid price.");
      return;
    }

    setSaving(true);

    const productData = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      original_price: Number(form.original_price || form.price),
      description: form.description.trim(),
      badge: form.badge.trim() || null,
      customizable: form.customizable,
      image: form.image.trim() || null,
      in_stock: form.in_stock,
      updated_at: new Date().toISOString(),
    };

    if (editingId !== null) {
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        alert("Could not update product.");
      } else {
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId ? data : product
          )
        );

        alert("Product updated successfully.");
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        alert("Could not add product.");
      } else {
        setProducts((current) => [...current, data]);

        alert("Product added successfully.");
        resetForm();
      }
    }

    setSaving(false);
  };

  // EDIT PRODUCT
  const editProduct = (product: Product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      original_price: String(product.original_price),
      description: product.description || "",
      badge: product.badge || "",
      customizable: product.customizable,
      image: product.image || "",
      in_stock: product.in_stock ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE PRODUCT
  const deleteProduct = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      alert("Could not delete product.");
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );
  };

  // RESET FORM
  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <p className="font-bold text-[#321817]">
          Loading products...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.2em] text-[#a51c24]">
            DEVBHOOMI DESIGNS
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#321817]">
            Product Management
          </h1>

          <p className="mt-2 text-[#795c52]">
            Add, edit and manage your products.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => (window.location.href = "/admin/orders")}
              className="rounded-full border border-[#a51c24] px-5 py-2 font-bold text-[#a51c24]"
            >
              📦 Manage Orders
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="rounded-full bg-[#a51c24] px-5 py-2 font-bold text-white"
            >
              🏠 View Store
            </button>
          </div>
        </div>

        {/* PRODUCT FORM */}
        <section className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#321817]">
              {editingId !== null ? "Edit Product" : "Add New Product"}
            </h2>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[#a51c24] px-5 py-2 font-bold text-[#a51c24]"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            {/* NAME */}
            <div>
              <label className="font-bold text-[#321817]">
                Product Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Aipan Wall Hanging"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="font-bold text-[#321817]">
                Category
              </label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Example: Wall Art"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="font-bold text-[#321817]">
                Selling Price (₹)
              </label>

              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="1999"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* ORIGINAL PRICE */}
            <div>
              <label className="font-bold text-[#321817]">
                Original Price (₹)
              </label>

              <input
                name="original_price"
                type="number"
                value={form.original_price}
                onChange={handleChange}
                placeholder="2499"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* BADGE */}
            <div>
              <label className="font-bold text-[#321817]">
                Badge
              </label>

              <input
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="Bestseller / New / Handmade"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="font-bold text-[#321817]">
                Image Path / URL
              </label>

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="/products/product.jpg"
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="font-bold text-[#321817]">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your product..."
                className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
              />
            </div>

            {/* CUSTOMIZABLE */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="customizable"
                checked={form.customizable}
                onChange={handleChange}
                className="h-5 w-5"
              />

              <span className="font-bold text-[#321817]">
                This product can be customised
              </span>
            </label>

            {/* STOCK STATUS */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="in_stock"
                checked={form.in_stock}
                onChange={handleChange}
                className="h-5 w-5"
              />

              <span className="font-bold text-[#321817]">
                Product is in stock
              </span>
            </label>

            {/* SUBMIT */}
            <div className="flex justify-end md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#a51c24] px-8 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </section>

        {/* PRODUCT LIST */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-black text-[#321817]">
            Products ({products.length})
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-[#ead8c7] bg-white shadow-sm"
              >
                {/* IMAGE */}
                <div className="h-52 bg-[#fffaf4]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🎨
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-[#321817]">
                    {product.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-lg font-black">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    {product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹
                        {Number(product.original_price).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}
                  </div>

                  {product.badge && (
                    <span className="mt-3 inline-block rounded-full bg-[#fff0df] px-3 py-1 text-xs font-bold text-[#a51c24]">
                      {product.badge}
                    </span>
                  )}

                  {product.customizable && (
                    <p className="mt-3 text-sm font-bold text-green-600">
                      ✓ Customisable
                    </p>
                  )}

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#795c52]">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        product.in_stock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.in_stock ? "✓ In Stock" : "✕ Out of Stock"}
                    </span>

                    <button
                      type="button"
                      onClick={async () => {
                        const nextStock = !product.in_stock;

                        const { data, error } = await supabase
                          .from("products")
                          .update({
                            in_stock: nextStock,
                            updated_at: new Date().toISOString(),
                          })
                          .eq("id", product.id)
                          .select()
                          .single();

                        if (error) {
                          console.error("Stock update error:", error);
                          alert(
                            `Could not update stock status: ${error.message}`
                          );
                          return;
                        }

                        setProducts((current) =>
                          current.map((item) =>
                            item.id === product.id ? data : item
                          )
                        );
                      }}
                      className="rounded-full border border-[#dcc8b5] px-4 py-2 text-xs font-bold text-[#321817] hover:bg-[#f7eadc]"
                    >
                      {product.in_stock ? "Mark Out of Stock" : "Mark In Stock"}
                    </button>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="flex-1 rounded-full border border-[#a51c24] px-4 py-2 font-bold text-[#a51c24]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 rounded-full border border-red-200 px-4 py-2 font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}