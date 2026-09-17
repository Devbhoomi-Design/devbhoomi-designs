"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabase";

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
  created_at: string;
  updated_at: string;
};

type AddressForm = Omit<Address, "id" | "created_at" | "updated_at">;

const emptyForm: AddressForm = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const [fromCheckout, setFromCheckout] = useState(false);
  const [returnToCart, setReturnToCart] = useState(false);
  const [email, setEmail] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/profile");
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load addresses:", error);
      setMessage(`Could not load saved addresses: ${error.message}`);
      setAddresses([]);
    } else {
      setAddresses((data || []) as Address[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setFromCheckout(params.get("from") === "checkout");
      setReturnToCart(
        params.get("from") === "checkout" && params.get("returnTo") === "cart"
      );
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      is_default: addresses.length === 0,
    });
    setMessage("");
    setFormOpen(true);
  };

  const openEditForm = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setMessage("");
    setFormOpen(true);
  };

  const saveAddress = async () => {
    setMessage("");

    if (!form.full_name.trim()) {
      setMessage("Please enter the recipient's name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!form.address_line.trim()) {
      setMessage("Please enter the address.");
      return;
    }
    if (!form.city.trim()) {
      setMessage("Please enter the city.");
      return;
    }
    if (!form.state.trim()) {
      setMessage("Please enter the state.");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/profile");
        return;
      }

      const payload = {
        label: form.label.trim() || "Other",
        full_name: form.full_name.trim(),
        phone: form.phone,
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
        is_default: form.is_default,
        updated_at: new Date().toISOString(),
      };

      let savedId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from("customer_addresses")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("customer_addresses")
          .insert({
            user_id: user.id,
            ...payload,
            is_default: form.is_default || addresses.length === 0,
          })
          .select("id")
          .single();

        if (error) throw error;
        savedId = data.id;
      }

      if (form.is_default && savedId) {
        const { error: defaultError } = await supabase.rpc(
          "set_default_customer_address",
          { p_address_id: savedId }
        );
        if (defaultError) throw defaultError;
      }

      setFormOpen(false);
      setMessage("Address saved successfully.");
      await loadProfile();
    } catch (error) {
      console.error("Save address error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save this address."
      );
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (addressId: string) => {
    setMessage("");
    const { error } = await supabase.rpc(
      "set_default_customer_address",
      { p_address_id: addressId }
    );

    if (error) {
      console.error("Set default address error:", error);
      setMessage(`Could not set default address: ${error.message}`);
      return;
    }

    await loadProfile();
  };

  const deleteAddress = async (addressId: string) => {
    const confirmed = window.confirm(
      "Delete this saved address? This cannot be undone."
    );
    if (!confirmed) return;

    setMessage("");
    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      console.error("Delete address error:", error);
      setMessage(`Could not delete address: ${error.message}`);
      return;
    }

    await loadProfile();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4] text-[#321817]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ead8c7] border-t-[#a51c24]" />
          <p className="mt-4 font-bold">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-8 text-[#321817] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  fromCheckout
                    ? returnToCart
                      ? "/?openCart=1"
                      : "/checkout"
                    : "/"
                )
              }
              className="text-sm font-bold text-[#a51c24]"
            >
              {fromCheckout
                ? returnToCart
                  ? "← Back to Cart"
                  : "← Back to Checkout"
                : "← Home"}
            </button>
            <h1 className="mt-3 text-4xl font-black">My Profile</h1>
            <p className="mt-2 text-sm text-[#795c52]">{email}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/my-orders"
              className="rounded-2xl border border-[#dcc8b5] bg-white px-5 py-3 text-sm font-black text-[#321817]"
            >
              📦 My Orders
            </Link>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#a51c24] px-5 py-3 text-sm font-black text-white hover:bg-[#85161d]"
            >
              <Plus size={17} />
              Add Address
            </button>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-[#ead8c7] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#f1dfcd] p-3 text-[#a51c24]">
              <MapPin size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Saved Addresses</h2>
              <p className="mt-1 text-sm text-[#795c52]">
                Save multiple addresses and choose the right one when ordering for yourself or someone else.
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-[#fff1e5] px-4 py-3 text-sm font-semibold text-[#8f151d]">
              {message}
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#dcc8b5] bg-[#fffaf4] p-8 text-center">
              <div className="text-5xl">📍</div>
              <h3 className="mt-4 text-xl font-black">No saved addresses yet</h3>
              <p className="mt-2 text-sm text-[#795c52]">
                Add your home address once and checkout will remember it next time.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 rounded-full bg-[#a51c24] px-6 py-3 font-bold text-white"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className={`rounded-3xl border p-5 ${
                    address.is_default
                      ? "border-[#a51c24] bg-[#fff7f2]"
                      : "border-[#ead8c7] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#ffd99c] px-3 py-1 text-xs font-black text-[#571719]">
                          {address.label}
                        </span>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-[#a51c24]">
                            <Star size={13} fill="currentColor" /> Default
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-black">
                        {address.full_name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#795c52]">
                        {address.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditForm(address)}
                      className="rounded-full border border-[#dcc8b5] bg-white p-2 text-[#a51c24]"
                      aria-label={`Edit ${address.label} address`}
                    >
                      <Edit3 size={17} />
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#4e312c]">
                    {address.address_line}
                    <br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => void setDefault(address.id)}
                        className="rounded-full border border-[#a51c24] px-4 py-2 text-xs font-black text-[#a51c24]"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void deleteAddress(address.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 px-4 py-2 text-xs font-black text-red-600"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {formOpen && (
          <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 sm:p-6">
            <div className="mx-auto my-6 max-w-2xl rounded-3xl bg-[#fffaf4] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ead8c7] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-[#a51c24]">
                    DEVBHOOMI DESIGNS
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {editingId ? "Edit Address" : "Add New Address"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full border border-[#dcc8b5] bg-white p-2"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold">Address Label</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Home", "Work", "Family", "Other"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, label }))}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${
                          form.label === label
                            ? "bg-[#a51c24] text-white"
                            : "border border-[#dcc8b5] bg-white text-[#321817]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((current) => ({ ...current, label: e.target.value }))}
                    placeholder="e.g. Mom, Office, Brother"
                    className="mt-3 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Recipient Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((current) => ({ ...current, full_name: e.target.value }))}
                    placeholder="Full name"
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Mobile Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-bold">Address</label>
                  <textarea
                    value={form.address_line}
                    onChange={(e) => setForm((current) => ({ ...current, address_line: e.target.value }))}
                    rows={4}
                    placeholder="House no., street, area, landmark"
                    className="mt-2 w-full resize-none rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                    placeholder="City"
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((current) => ({ ...current, state: e.target.value }))}
                    placeholder="State"
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm((current) => ({ ...current, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    placeholder="110001"
                    maxLength={6}
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ead8c7] bg-white p-4">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm((current) => ({ ...current, is_default: e.target.checked }))}
                    className="h-5 w-5"
                  />
                  <span>
                    <span className="block font-bold">Make this my default address</span>
                    <span className="mt-1 block text-xs text-[#795c52]">
                      It will be preselected at checkout.
                    </span>
                  </span>
                </label>

                {message && (
                  <div className="sm:col-span-2 rounded-xl bg-[#fff1e5] p-3 text-sm font-semibold text-[#8f151d]">
                    {message}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#ead8c7] p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full border border-[#dcc8b5] bg-white px-6 py-3 font-bold text-[#321817]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveAddress()}
                  disabled={saving}
                  className="rounded-full bg-[#a51c24] px-6 py-3 font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
