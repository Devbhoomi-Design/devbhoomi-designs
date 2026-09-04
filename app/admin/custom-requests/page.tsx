"use client";

import { useEffect, useState } from "react";
import AdminNav from "../../components/AdminNav";
import { supabase } from "@/app/lib/supabase";

type CustomRequest = {
  id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  product_name: string;
  custom_name: string | null;
  preferred_size: string | null;
  description: string | null;
  reference_image_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const statuses = [
  "New Request",
  "Contacted",
  "Designing",
  "Approved",
  "Completed",
  "Cancelled",
];

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Could not load custom requests: ${error.message}`);
      setRequests([]);
    } else {
      setRequests((data || []) as CustomRequest[]);
    }

    setLoading(false);
  };

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadRequests();
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  const updateRequest = async (
    id: string,
    changes: Partial<CustomRequest>
  ) => {
    setSavingId(id);

    const { data, error } = await supabase
      .from("custom_requests")
      .update({
        ...changes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(`Could not update request: ${error.message}`);
    } else {
      setRequests((current) =>
        current.map((request) => (request.id === id ? data : request))
      );
    }

    setSavingId(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4]">
        <p className="font-bold text-[#321817]">Loading custom requests...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.2em] text-[#a51c24]">
            DEVBHOOMI DESIGNS
          </p>
          <h1 className="mt-2 text-4xl font-black text-[#321817]">
            Custom Requests
          </h1>
          <p className="mt-2 text-[#795c52]">
            View customer ideas, references and manage request progress.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl border border-[#ead8c7] bg-white p-10 text-center">
            <div className="text-5xl">🎨</div>
            <h2 className="mt-4 text-xl font-black">No custom requests yet</h2>
            <p className="mt-2 text-[#795c52]">
              New customer customization requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-sm"
              >
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                  <div>
                    {request.reference_image_url ? (
                      <a
                        href={request.reference_image_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={request.reference_image_url}
                          alt="Customer reference"
                          className="h-52 w-full rounded-2xl object-cover"
                        />
                        <p className="mt-2 text-center text-sm font-bold text-[#a51c24]">
                          Open reference image
                        </p>
                      </a>
                    ) : (
                      <div className="flex h-52 items-center justify-center rounded-2xl bg-[#fff1e5] text-5xl">
                        🎨
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#a51c24]">
                          {request.product_name}
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-[#321817]">
                          {request.custom_name || "Personalised request"}
                        </h2>
                      </div>

                      <select
                        value={request.status}
                        disabled={savingId === request.id}
                        onChange={(e) =>
                          void updateRequest(request.id, {
                            status: e.target.value,
                          })
                        }
                        className="rounded-xl border border-[#dcc8b5] bg-white px-4 py-2 font-bold outline-none focus:border-[#a51c24]"
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#fffaf4] p-4">
                        <p className="text-xs font-bold text-[#795c52]">CUSTOMER</p>
                        <p className="mt-1 font-bold">{request.customer_name || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-[#fffaf4] p-4">
                        <p className="text-xs font-bold text-[#795c52]">EMAIL</p>
                        <p className="mt-1 break-all font-bold">{request.customer_email || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-[#fffaf4] p-4">
                        <p className="text-xs font-bold text-[#795c52]">SIZE</p>
                        <p className="mt-1 font-bold">{request.preferred_size || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-[#fffaf4] p-4">
                        <p className="text-xs font-bold text-[#795c52]">SUBMITTED</p>
                        <p className="mt-1 font-bold">
                          {new Date(request.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#ead8c7] p-4">
                      <p className="text-sm font-bold text-[#795c52]">CUSTOMER IDEA</p>
                      <p className="mt-2 whitespace-pre-wrap leading-7 text-[#321817]">
                        {request.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5">
                      <label className="text-sm font-bold text-[#321817]">
                        Admin Notes
                      </label>
                      <textarea
                        defaultValue={request.admin_notes || ""}
                        onBlur={(e) =>
                          void updateRequest(request.id, {
                            admin_notes: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Add pricing, design or customer follow-up notes..."
                        className="mt-2 w-full rounded-xl border border-[#dcc8b5] px-4 py-3 outline-none focus:border-[#a51c24]"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
