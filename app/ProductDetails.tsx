"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Upload,
} from "lucide-react";

import { Product } from "./products";

type ProductDetailsProps = {
  product: Product;
  onClose: () => void;
  onAddToCart: (
    id: number,
    customization?: {
      customName?: string;
      customSize?: string;
      instructions?: string;
    }
  ) => void;
};

export default function ProductDetails({
  product,
  onClose,
  onAddToCart,
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customSize, setCustomSize] = useState("12 × 18 inch");
  const [instructions, setInstructions] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  // Increase quantity
  const increase = () => {
    setQuantity((current) => current + 1);
  };

  // Decrease quantity
  const decrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  // Add product to cart
  const handleAddToCart = () => {
    const customization = product.customizable
      ? {
          customName: customName.trim(),
          customSize,
          instructions: instructions.trim(),
        }
      : undefined;

    // Add the selected quantity
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product.id, customization);
    }

    // Close product details
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 p-4 md:p-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#fffaf4] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#ead8c7] px-5 py-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-[#a51c24]">
              DEVBHOOMI DESIGNS
            </p>

            <p className="text-sm text-[#795c52]">
              Handmade in Uttarakhand
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#dcc8b5] bg-white p-3 transition hover:bg-[#f1dfcd]"
          >
            <X size={20} />
          </button>
        </div>

        {/* PRODUCT */}
        <div className="grid md:grid-cols-2">
          {/* IMAGE / ART AREA */}
          <div className="flex min-h-[420px] items-center justify-center bg-[#9e2025] p-10">
            <div className="relative flex h-[330px] w-[330px] items-center justify-center rounded-full border-4 border-[#ffd99c]">
              <div className="absolute inset-7 rounded-full border border-[#ffd99c]/50" />

              <div className="text-center">
                <div className="text-8xl text-[#ffd99c]">
                  {product.category === "Pooja Collection"
                    ? "ॐ"
                    : product.category === "Mandala Art"
                      ? "✹"
                      : "✺"}
                </div>

                <p className="mt-6 text-xs font-bold tracking-[0.35em] text-white">
                  DEVBHOOMI
                </p>

                <p className="mt-2 text-xs tracking-[0.2em] text-[#ffd99c]">
                  AIPAN • HANDMADE
                </p>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="p-7 md:p-10">
            {/* BADGE */}
            {product.badge && (
              <span className="inline-block rounded-full bg-[#ffd99c] px-4 py-1 text-xs font-bold text-[#571719]">
                {product.badge}
              </span>
            )}

            {/* CATEGORY */}
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#a56c58]">
              {product.category}
            </p>

            {/* PRODUCT NAME */}
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-black">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              <span className="text-lg text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="mt-5 leading-7 text-[#63453d]">
              {product.description}
            </p>

            {/* CUSTOMISATION */}
            {product.customizable && (
              <div className="mt-7 rounded-2xl border border-[#e3c9af] bg-[#f7eadc] p-5">
                {/* TITLE */}
                <div className="flex items-center gap-2 font-bold text-[#a51c24]">
                  <Sparkles size={18} />
                  Make it yours
                </div>

                {/* NAME */}
                <div className="mt-5">
                  <label className="text-sm font-bold">
                    Name / Text
                  </label>

                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Vishal & Family"
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                {/* SIZE */}
                <div className="mt-5">
                  <label className="text-sm font-bold">
                    Choose Size
                  </label>

                  <select
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  >
                    <option value="12 × 18 inch">
                      12 × 18 inch
                    </option>

                    <option value="12 × 24 inch">
                      12 × 24 inch
                    </option>

                    <option value="12 × 32 inch">
                      12 × 32 inch
                    </option>

                    <option value="Custom Size">
                      Custom Size
                    </option>
                  </select>
                </div>

                {/* REFERENCE IMAGE */}
                <div className="mt-5">
                  <label className="text-sm font-bold">
                    Reference Image
                  </label>

                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d5b79b] bg-white px-4 py-5 text-sm font-semibold text-[#795c52] transition hover:border-[#a51c24]">
                    <Upload size={18} />

                    {referenceImage
                      ? referenceImage.name
                      : "Upload Reference"}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setReferenceImage(file);
                      }}
                    />
                  </label>
                </div>

                {/* INSTRUCTIONS */}
                <div className="mt-5">
                  <label className="text-sm font-bold">
                    Special Instructions
                  </label>

                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Tell us anything else you want..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="mt-7">
              <p className="text-sm font-bold">
                Quantity
              </p>

              <div className="mt-2 flex w-fit items-center rounded-full border border-[#dcc8b5] bg-white">
                {/* MINUS */}
                <button
                  type="button"
                  onClick={decrease}
                  className="p-3 transition hover:bg-[#f1dfcd]"
                >
                  <Minus size={17} />
                </button>

                {/* NUMBER */}
                <span className="w-12 text-center font-bold">
                  {quantity}
                </span>

                {/* PLUS */}
                <button
                  type="button"
                  onClick={increase}
                  className="p-3 transition hover:bg-[#f1dfcd]"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* ADD TO CART / CUSTOM REQUEST */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#a51c24] px-6 py-4 font-bold text-white transition hover:bg-[#85161d]"
            >
              <ShoppingBag size={20} />

              {product.customizable
                ? "Send Custom Request"
                : `Add ${quantity} to Cart`}
            </button>

            {/* FOOTER */}
            <p className="mt-4 text-center text-xs text-[#795c52]">
              Handmade in Uttarakhand • Pan India delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}