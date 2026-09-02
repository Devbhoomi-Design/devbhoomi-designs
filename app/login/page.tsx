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

  const handleAuth = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (isSignup && !name) {
      setMessage("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Account created successfully! Please check your email if verification is required."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      }
    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] px-5 py-8 text-[#351717]">
      <div className="mx-auto max-w-md">

        {/* Back */}
        <button
          onClick={() => (window.location.href = "/")}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[#795c52]"
        >
          <ArrowLeft size={18} />
          Back to Devbhoomi
        </button>

        {/* Logo */}
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

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-[#ead8c7] bg-white p-6 shadow-lg">

          {isSignup && (
            <div className="mb-5">
              <label className="mb-2 block text-sm font-bold">
                Full Name
              </label>

              <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
                <User size={18} className="text-[#795c52]" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold">
              Email
            </label>

            <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
              <Mail size={18} className="text-[#795c52]" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 py-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-[#d8b9a4] bg-[#fffaf4] px-4">
              <Lock size={18} className="text-[#795c52]" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent px-3 py-3 outline-none"
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-5 rounded-xl bg-[#fff1e5] p-3 text-sm text-[#8f151d]">
              {message}
            </div>
          )}

          {/* Button */}
          <button
            type="button"
            onClick={handleAuth}
            disabled={loading}
            className="w-full rounded-full bg-[#a51c24] px-6 py-4 font-bold text-white transition hover:bg-[#85161d] disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>

          {/* Switch */}
          <div className="mt-6 text-center text-sm text-[#795c52]">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage("");
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