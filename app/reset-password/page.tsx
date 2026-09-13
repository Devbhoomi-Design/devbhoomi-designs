"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  useEffect(() => {
    let mounted = true;

    const prepareReset = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session) {
          if (mounted) {
            setMessageType("error");
            setMessage(
              "This password reset link is invalid or has expired. Please request a new one."
            );
          }
          return;
        }

        if (mounted) setReady(true);
      } catch (error) {
        console.error("Password reset session error:", error);
        if (mounted) {
          setMessageType("error");
          setMessage(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }
      }
    };

    void prepareReset();

    return () => {
      mounted = false;
    };
  }, []);

  const handleResetPassword = async () => {
    setMessage("");

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessageType("success");
      setMessage("Password changed successfully! Redirecting...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Update password error:", error);
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not change your password. Please request a new reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-8 text-[#351717]">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[#795c52] transition hover:text-[#a51c24]"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <div className="text-center">
          <img
            src="/devbhoomi-logo.jpeg"
            alt="Devbhoomi Designs"
            className="mx-auto h-20 w-32 rounded-2xl object-cover"
          />

          <h1 className="mt-6 text-3xl font-black">Set a new password</h1>
          <p className="mt-2 text-sm text-[#795c52]">
            Choose a new password for your Devbhoomi Designs account.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-lg">
          {!ready && !message && (
            <div className="rounded-xl bg-[#fffaf4] p-4 text-center text-sm font-semibold text-[#795c52]">
              Checking your password reset link...
            </div>
          )}

          {ready && (
            <>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold">New Password</label>
                <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
                  <Lock size={18} className="text-[#795c52]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-3 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold">Confirm Password</label>
                <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
                  <Lock size={18} className="text-[#795c52]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleResetPassword();
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#795c52]">
                  Password must be at least 6 characters.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full rounded-full bg-[#a51c24] px-6 py-4 font-bold text-white transition hover:bg-[#85161d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Changing password..." : "Change Password"}
              </button>
            </>
          )}

          {message && (
            <div
              className={`rounded-xl p-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-[#fff1e5] text-[#8f151d]"
              }`}
            >
              {message}
            </div>
          )}

          {!ready && message && (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 w-full rounded-full border border-[#a51c24] px-6 py-3 font-bold text-[#a51c24] transition hover:bg-[#fff1ed]"
            >
              Request a new reset link
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#795c52]">
          Handmade in Uttarakhand • Delivered across India
        </p>
      </div>
    </main>
  );
}
