"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Product } from "./products";
import { supabase } from "@/app/lib/supabase";

type ProductVariant = {
  id: string;
  name: string;
  price: number;
};

type ProductWithGallery = Product & {
  image_urls?: string[];
  variants?: ProductVariant[];
};

type ProductDetailsProps = {
  product: ProductWithGallery;
  onClose: () => void;
  onAddToCart: (
    id: number,
    customization?: {
      customName?: string;
      customSize?: string;
      instructions?: string;
      referenceImageUrl?: string;
      variantId?: string;
      variantName?: string;
      variantPrice?: number;
      quantity?: number;
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id ?? ""
  );
  const galleryRef = useRef<HTMLDivElement>(null);

  // Use the new gallery when available.
  // Fall back to the existing single product image for older products.
  const galleryImages = Array.from(
    new Set(
      [
        ...(product.image_urls ?? []),
        product.image,
      ].filter(
        (image): image is string =>
          typeof image === "string" && image.trim().length > 0
      )
    )
  );

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery || galleryImages.length <= 1) return;

    const handleScroll = () => {
      const width = gallery.clientWidth;
      if (!width) return;

      const index = Math.round(gallery.scrollLeft / width);
      setSelectedImage(Math.min(index, galleryImages.length - 1));
    };

    gallery.addEventListener("scroll", handleScroll, { passive: true });
    return () => gallery.removeEventListener("scroll", handleScroll);
  }, [galleryImages.length]);

  const scrollToImage = (index: number) => {
    if (!galleryRef.current || galleryImages.length <= 1) {
      setSelectedImage(index);
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
    galleryRef.current.scrollTo({
      left: safeIndex * galleryRef.current.clientWidth,
      behavior: "smooth",
    });
    setSelectedImage(safeIndex);
  };

  const goToPreviousImage = () => {
    if (galleryImages.length <= 1) return;
    scrollToImage(
      selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1
    );
  };

  const goToNextImage = () => {
    if (galleryImages.length <= 1) return;
    scrollToImage(
      selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1
    );
  };

  const selectedVariant =
    product.variants?.find((variant) => variant.id === selectedVariantId) ??
    product.variants?.[0];

  const displayPrice = selectedVariant?.price ?? product.price;

  const increase = () => {
    setQuantity((current) => current + 1);
  };

  const decrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = async () => {
    const customization = product.customizable
      ? {
          customName: customName.trim(),
          customSize,
          instructions: instructions.trim(),
          variantId: selectedVariant?.id,
          variantName: selectedVariant?.name,
          variantPrice: displayPrice,
          quantity,
        }
      : selectedVariant
        ? {
            variantId: selectedVariant.id,
            variantName: selectedVariant.name,
            variantPrice: displayPrice,
            quantity,
          }
        : {
            quantity,
          };

    let referenceImageUrl: string | undefined;

    if (referenceImage) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login before uploading a reference image.");
        return;
      }

      const extension =
        referenceImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
        ? extension
        : "jpg";
      const filePath = `orders/${user.id}/${crypto.randomUUID()}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("custom-requests")
        .upload(filePath, referenceImage, {
          cacheControl: "3600",
          upsert: false,
          contentType: referenceImage.type || "image/jpeg",
        });

      if (uploadError) {
        console.error("Reference image upload error:", uploadError);
        alert(`Could not upload the reference image: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("custom-requests")
        .getPublicUrl(filePath);

      referenceImageUrl = publicUrlData.publicUrl;
    }

    const finalCustomization = referenceImageUrl
      ? { ...customization, referenceImageUrl }
      : customization;

    await onAddToCart(product.id, finalCustomization);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden bg-black/60 p-2 sm:p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl min-w-0 overflow-hidden rounded-2xl bg-[#fffaf4] shadow-2xl sm:rounded-3xl">
        {/* HEADER */}
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#ead8c7] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold tracking-[0.2em] text-[#a51c24] sm:tracking-[0.25em]">
              DEVBHOOMI DESIGNS
            </p>

            <p className="text-sm text-[#795c52]">
              Handmade in Uttarakhand
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="rounded-full border border-[#dcc8b5] bg-white p-3 transition hover:bg-[#f1dfcd]"
          >
            <X size={20} />
          </button>
        </div>

        {/* PRODUCT */}
        <div className="grid min-w-0 md:grid-cols-2">
          {/* IMAGE GALLERY */}
          <div className="min-w-0 bg-[#f7eadc] p-3 sm:p-6 md:p-8">
            <div className="relative overflow-hidden rounded-2xl bg-white">
              <div
                ref={galleryRef}
                className="flex h-[260px] w-full min-w-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] sm:h-[430px] [&::-webkit-scrollbar]:hidden"
                aria-label="Product photo gallery"
              >
                {galleryImages.length > 0 ? (
                  galleryImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="flex h-full w-full min-w-full shrink-0 snap-center items-center justify-center overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${product.name} - photo ${index + 1}`}
                        draggable={false}
                        className="h-full w-full select-none object-contain p-3 sm:p-5"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex h-full w-full min-w-full items-center justify-center bg-[#9e2025]">
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
                )}
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    aria-label="Previous product photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#dcc8b5] bg-white/95 p-2.5 shadow-md active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextImage}
                    aria-label="Next product photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#dcc8b5] bg-white/95 p-2.5 shadow-md active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                    {selectedImage + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {/* THUMBNAILS */}
            {galleryImages.length > 1 && (
              <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4 sm:gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => scrollToImage(index)}
                    aria-label={`View product photo ${index + 1}`}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition sm:h-24 sm:w-24 ${
                      selectedImage === index
                        ? "border-[#a51c24] ring-2 ring-[#a51c24]/20"
                        : "border-[#dcc8b5] hover:border-[#a51c24]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      draggable={false}
                      className="h-full w-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {galleryImages.length > 1 && (
              <p className="mt-2 text-center text-[11px] leading-4 text-[#795c52] sm:text-xs">
                Swipe left/right on your phone • Tap a photo below to jump to it
              </p>
            )}
          </div>

          {/* DETAILS */}
          <div className="min-w-0 overflow-hidden p-5 sm:p-7 md:p-10">
            {product.badge && (
              <span className="inline-block rounded-full bg-[#ffd99c] px-4 py-1 text-xs font-bold text-[#571719]">
                {product.badge}
              </span>
            )}

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#a56c58]">
              {product.category}
            </p>

            <h1 className="mt-2 break-words text-3xl font-black leading-tight md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-3xl font-black">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>

              <span className="text-lg text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="mt-5 break-words leading-7 text-[#63453d]">
              {product.description}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-7 rounded-2xl border border-[#e3c9af] bg-[#f7eadc] p-5">
                <div className="font-bold text-[#a51c24]">Choose Size / Variant</div>

                <div className="mt-4 grid gap-2">
                  {product.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition ${
                        selectedVariantId === variant.id
                          ? "border-[#a51c24] ring-2 ring-[#a51c24]/10"
                          : "border-[#dcc8b5]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <input
                          type="radio"
                          name="product-variant"
                          checked={selectedVariantId === variant.id}
onChange={() => {
  setSelectedVariantId(variant.id);
  setQuantity(1);
}}
/>
                        <span className="break-words font-semibold">{variant.name}</span>
                      </span>

                      <span className="shrink-0 font-black">
                        ₹{Number(variant.price).toLocaleString("en-IN")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {product.customizable && (
              <div className="mt-7 rounded-2xl border border-[#e3c9af] bg-[#f7eadc] p-5">
                <div className="flex items-center gap-2 font-bold text-[#a51c24]">
                  <Sparkles size={18} />
                  Make it yours
                </div>

                <div className="mt-5">
                  <label className="text-sm font-bold">Name / Text</label>

                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Vishal & Family"
                    className="mt-2 block w-full min-w-0 max-w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>

                <div className="mt-5">
                  <label className="text-sm font-bold">Choose Size</label>

                  <select
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="mt-2 block w-full min-w-0 max-w-full rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  >
                    <option value="12 × 18 inch">12 × 18 inch</option>
                    <option value="12 × 24 inch">12 × 24 inch</option>
                    <option value="12 × 32 inch">12 × 32 inch</option>
                    <option value="Custom Size">Custom Size</option>
                  </select>
                </div>

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

                <div className="mt-5">
                  <label className="text-sm font-bold">
                    Special Instructions
                  </label>

                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Tell us anything else you want..."
                    rows={3}
                    className="mt-2 block w-full min-w-0 max-w-full resize-none rounded-xl border border-[#dcc8b5] bg-white px-4 py-3 outline-none focus:border-[#a51c24]"
                  />
                </div>
              </div>
            )}

            <div className="mt-7">
              <p className="text-sm font-bold">Quantity</p>

              <div className="mt-2 flex w-fit items-center rounded-full border border-[#dcc8b5] bg-white">
                <button
                  type="button"
                  onClick={decrease}
                  aria-label="Decrease quantity"
                  className="p-3 transition hover:bg-[#f1dfcd]"
                >
                  <Minus size={17} />
                </button>

                <span className="w-12 text-center font-bold">{quantity}</span>

                <button
                  type="button"
                  onClick={increase}
                  aria-label="Increase quantity"
                  className="p-3 transition hover:bg-[#f1dfcd]"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

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

            <p className="mt-4 text-center text-xs text-[#795c52]">
              Handmade in Uttarakhand • Pan India delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
