"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

const links = [
  { href: "/", label: "🏠 Home" },
  { href: "/admin/products", label: "📦 Products" },
  { href: "/admin/orders", label: "🛒 Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="mb-8 rounded-2xl border border-[#ead8c7] bg-white p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto px-3 py-2 text-sm font-black text-[#321817]">
          🏔️ Devbhoomi Admin
        </div>

        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-[#a51c24] text-white"
                  : "text-[#321817] hover:bg-[#f7eadc]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl border border-[#dcc8b5] px-4 py-2 text-sm font-bold text-[#a51c24] transition hover:bg-[#f7eadc]"
        >
          🚪 Sign Out
        </button>
      </div>
    </nav>
  );
}
