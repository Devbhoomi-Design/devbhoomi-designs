"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const handleAuth = async () => {
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setMessageType("error");
      setMessage("Please enter your email and password.");
      return;
    }

    if (isSignup && !name.trim()) {
      setMessageType("error");
      setMessage("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setMessageType("success");
          setMessage(
            "Account created successfully! Please check your email to verify your account, then login."
          );
          setIsSignup(false);
          setPassword("");
          return;
        }

        setMessageType("success");
        setMessage("Account created successfully! Redirecting to homepage...");

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Login failed. Please try again.");
      }

      setMessageType("success");
      setMessage("Login successful! Redirecting...");

      const next =
        new URLSearchParams(window.location.search).get("next") || "/";

      setTimeout(() => {
        window.location.href = next;
      }, 500);
    } catch (error) {
      console.error("Authentication error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessageType("error");

      if (errorMessage.toLowerCase().includes("invalid login credentials")) {
        setMessage("Incorrect email or password.");
      } else if (
        errorMessage.toLowerCase().includes("email not confirmed")
      ) {
        setMessage("Please verify your email address before logging in.");
      } else if (
        errorMessage.toLowerCase().includes("user already registered")
      ) {
        setMessage("This email is already registered. Please login instead.");
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-8 text-[#351717]">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[#795c52] transition hover:text-[#a51c24]"
        >
          <ArrowLeft size={18} />
          Back to Devbhoomi
        </button>

        <div className="text-center">
          <img
            src="/devbhoomi-logo.jpeg"
            alt="Devbhoomi Designs"
            className="mx-auto h-20 w-32 rounded-2xl object-cover"
          />

          <h1 className="mt-6 text-3xl font-black">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>

          <p className="mt-2 text-sm text-[#795c52]">
            {isSignup
              ? "Create an account to manage your orders."
              : "Login to continue shopping with Devbhoomi Designs."}
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-lg">
          {isSignup && (
            <div className="mb-5">
              <label className="mb-2 block text-sm font-bold">Full Name</label>

              <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
                <User size={18} className="text-[#795c52]" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold">Email</label>

            <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
              <Mail size={18} className="text-[#795c52]" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-transparent px-3 py-3 outline-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold">Password</label>

            <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
              <Lock size={18} className="text-[#795c52]" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full bg-transparent px-3 py-3 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAuth();
                }}
              />
            </div>

            {isSignup && (
              <p className="mt-2 text-xs text-[#795c52]">
                Password must be at least 6 characters.
              </p>
            )}
          </div>

          {message && (
            <div
              className={`mb-5 rounded-xl p-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-[#fff1e5] text-[#8f151d]"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleAuth}
            disabled={loading}
            className="w-full rounded-full bg-[#a51c24] px-6 py-4 font-bold text-white transition hover:bg-[#85161d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>

          <div className="mt-6 text-center text-sm text-[#795c52]">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage("");
                setPassword("");
              }}
              className="ml-1 font-bold text-[#a51c24] underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#795c52]">
          Handmade in Uttarakhand • Delivered across India
        </p>
      </div>
    </main>
  );
}
