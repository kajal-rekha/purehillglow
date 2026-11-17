"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Headphones,
  Heart,
  Leaf,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import {
  addToCart,
  decreaseCart,
  increaseCart,
} from "@/redux/features/cart/cartSlice";
import { toggleWishlist } from "@/redux/features/wishlist/wishlistSlice";
import Loading from "@/components/ui/Loading";
import toast from "react-hot-toast";

const localized = (value, language) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const toList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    const sep = /\r?\n/.test(val) ? /\r?\n/ : /[,;]+/;
    return val
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const ProductDetailsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const isBangla = language === "bn";

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeInfoTab, setActiveInfoTab] = useState("all");

  const isFavorite = wishlistItems.some((item) => item._id === product?._id);

  useEffect(() => {
    if (!router.isReady || typeof router.query.id !== "string") return;

    const controller = new AbortController();
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/products/${router.query.id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : `Failed to load product (${response.status}).`
          );
        }

        const data = await response.json();
        setProduct(data);
        setSelectedImage(0);
        setQuantity(1);

        try {
          const relatedResponse = await fetch("/api/products", {
            signal: controller.signal,
          });
          if (relatedResponse.ok) {
            const products = await relatedResponse.json();
            if (Array.isArray(products)) {
              setRelatedProducts(
                products
                  .filter(
                    (item) =>
                      item._id !== data._id &&
                      item.images?.[0] &&
                      (!data.category_id?._id ||
                        item.category_id?._id === data.category_id._id)
                  )
                  .slice(0, 4)
              );
            }
          }
        } catch (relatedError) {
          if (relatedError.name !== "AbortError") {
            console.error("Failed to load related products:", relatedError);
          }
        }
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Failed to load product details:", fetchError);
          setError(fetchError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [router.isReady, router.query.id]);

  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

  const name = localized(product?.name, language);
  const categoryName = localized(product?.category_id?.name, language);
  const subcategoryName = localized(product?.subcategory_id?.name, language);
  const discount = Number(product?.discount) || 0;
  const originalPrice =
    discount > 0 && discount < 100
      ? Math.round(Number(product?.price) / (1 - discount / 100))
      : null;
  const description = localized(product?.description, language);
  const rawIngredients = localized(product?.ingredients, language);
  const ingredientsList = toList(rawIngredients);
  const rawUsage = localized(product?.usage, language);
  const usageList = toList(rawUsage);
  const rawBenefits = localized(product?.benefits, language);
  const benefitsList = toList(rawBenefits);
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const stockCount = Number(product?.stock) || 0;
  const remainingStock = Math.max(stockCount - quantity, 0);
  const totalPrice = Number(product?.price || 0) * quantity;
  const totalOriginalPrice = originalPrice ? originalPrice * quantity : null;
  const origin = localized(product?.origin, language);
  const unit = localized(product?.unit, language);

  const mainCartEntry = cartItems.find((c) => c._id === product?._id);
  const isMainInCart = Boolean(mainCartEntry);

  const addProductToCart = (item = product, itemQuantity = quantity) => {
    dispatch(addToCart({ ...item, cartQuantity: itemQuantity }));
  };

  const displayQty = isMainInCart ? mainCartEntry.cartQuantity : quantity;

  const handleIncreaseQuantity = () => {
    if (stockCount > 0 && displayQty >= stockCount) {
      toast.error(
        isBangla
          ? `দুঃখিত, স্টকে আর অতিরিক্ত পণ্য নেই (${stockCount}টি উপলব্ধ)`
          : `Sorry, maximum stock reached (${stockCount} available)`
      );
      return;
    }
    if (isMainInCart) {
      dispatch(increaseCart(product));
    } else {
      const next = quantity + 1;
      setQuantity(next);
      toast.success(
        isBangla
          ? `পরিমাণ বাড়ানো হয়েছে (${next}টি)`
          : `Quantity increased (${next})`
      );
    }
  };

  const handleDecreaseQuantity = () => {
    if (displayQty <= 1) {
      toast.error(
        isBangla ? "সর্বনিম্ন পরিমাণ ১টি" : "Minimum quantity is 1"
      );
      return;
    }
    if (isMainInCart) {
      dispatch(decreaseCart(product));
    } else {
      const next = Math.max(1, quantity - 1);
      setQuantity(next);
      toast.error(
        isBangla
          ? `পরিমাণ কমানো হয়েছে (${next}টি)`
          : `Quantity decreased (${next})`
      );
    }
  };

  const whatsappUrl = `https://wa.me/8801762144200?text=${encodeURIComponent(
    isBangla
      ? `হ্যালো Pure Hill Glow, আমি "${name}" (${formatPrice(
        product?.price
      )} x ${quantity} = ${formatPrice(
        totalPrice
      )}) অর্ডার করতে চাই। বিস্তারিত জানালে উপকৃত হব।`
      : `Hello Pure Hill Glow, I would like to order "${name}" (${formatPrice(
        product?.price
      )} x ${quantity} = ${formatPrice(totalPrice)}).`
  )}`;

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#fcfaf6] pt-32">
        <Loading />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#fcfaf6] px-4 pt-32 text-center">
        <p className="font-playfair text-2xl font-bold text-[#24452c] sm:text-3xl">
          {isBangla ? "পণ্যটি পাওয়া যায়নি" : "Product Unavailable"}
        </p>
        <p className="mt-2 text-sm text-dark/70">
          {isBangla
            ? "পণ্যটি খুঁজে পাওয়া যায়নি বা লোড করা সম্ভব হয়নি।"
            : error || "This product could not be found."}
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#24452c] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#183620]"
        >
          {isBangla ? "হোম পেজে ফিরে যান" : "Back to Home"}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-16 pt-[116px]">
      {/* ============ TOP HERO BANNER (Matches other store pages) ============ */}
      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
        />
        <div className="mx-auto max-w-[1300px] relative flex min-h-32 flex-col justify-center px-4 py-5 sm:px-6">
          <nav
            aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
            className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-white/75"
          >
            <Link href="/" className="hover:text-white transition">
              {isBangla ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={12} className="text-white/45" />
            <Link href="/products" className="hover:text-white transition">
              {isBangla ? "সব পণ্য" : "Products"}
            </Link>
            {categoryName && (
              <>
                <ChevronRight size={12} className="text-white/45" />
                <Link
                  href={`/products?category=${product.category_id?._id || product.category_id || ""
                    }`}
                  className="hover:text-white transition"
                >
                  {categoryName}
                </Link>
              </>
            )}
            {subcategoryName && (
              <>
                <ChevronRight size={12} className="text-white/45" />
                <span className="text-white/70">{subcategoryName}</span>
              </>
            )}
            <ChevronRight size={12} className="text-white/45" />
            <span className="font-semibold text-[#efc477] line-clamp-1 max-w-[220px] sm:max-w-none">
              {name}
            </span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-playfair text-2xl font-bold sm:text-3xl text-white">
                {name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-white/80">
                {categoryName && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#efc477]">
                    <Sparkles size={12} />
                    {categoryName}
                  </span>
                )}
                <span className="text-white/40">•</span>
                <span>
                  {isBangla
                    ? "১০০% খাঁটি ও প্রাকৃতিক পাহাড়ি স্কিনকেয়ার"
                    : "100% Authentic Hill Skincare"}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs">
              <Leaf size={14} className="text-[#a2cf95]" />
              <span>{isBangla ? "বান্দরবান অরিজিন" : "Pure Bandarban"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1300px] px-4 pt-6 sm:px-6">
        {/* ============ MAIN PRODUCT HERO GRID ============ */}
        <section className="grid items-start gap-8 rounded-3xl border border-[#ede7dc] bg-white p-4 shadow-[0_4px_24px_rgba(40,54,24,0.04)] sm:p-7 lg:grid-cols-2 lg:gap-10">
          {/* ============ LEFT GALLERY (Main Image + Bottom Thumbnails) ============ */}
          <div className="flex flex-col gap-3">
            {/* ============ Primary Main Image Stage (No Extra Gap) ============ */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#ede7dc] bg-[#f8f5ee]">
              {product.images?.[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={name || "Product"}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  className="object-cover transition-transform duration-500 ease-out hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-dark/50">
                  {isBangla ? "ছবি নেই" : "No image available"}
                </div>
              )}

              {/* ============ Floating Badges ============ */}
              <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
                {discount > 0 && (
                  <span className="rounded-full bg-[#a33d30] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                    -{discount}% {isBangla ? "ছাড়" : "OFF"}
                  </span>
                )}
                {product.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2d4e35] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                    <Sparkles size={11} className="text-[#a2cf95]" />
                    {isBangla ? "জনপ্রিয় পছন্দ" : "Best Seller"}
                  </span>
                )}
                {origin && (
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-[#3b4e3d] shadow-2xs backdrop-blur-xs">
                    {origin}
                  </span>
                )}
              </div>

              {/* ============ Wishlist Button ============ */}
              <button
                type="button"
                onClick={() => dispatch(toggleWishlist(product))}
                aria-label={
                  isFavorite
                    ? isBangla
                      ? "পছন্দের তালিকা থেকে সরান"
                      : "Remove from favorites"
                    : isBangla
                      ? "পছন্দের তালিকায় যোগ করুন"
                      : "Add to favorites"
                }
                className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isFavorite
                    ? "border border-red-200 bg-red-50 text-red-600"
                    : "bg-white/90 text-dark/60 backdrop-blur-xs hover:bg-white hover:text-red-500"
                }`}
              >
                <Heart
                  size={19}
                  fill={isFavorite ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* ============ Extra Product Thumbnails Below Main Image ============ */}
            {product.images?.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`relative h-18 w-18 shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-[#f9f7f2] transition-all sm:h-20 sm:w-20 ${
                      selectedImage === index
                        ? "border-[#2d4e35] ring-2 ring-[#2d4e35]/25 shadow-xs"
                        : "border-[#e5ded1] opacity-80 hover:border-[#2d4e35]/50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${name} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============ RIGHT BUY BOX & OVERVIEW ============ */}
          <div className="flex flex-col justify-center">
            {/* ============ Category Pill & Origin ============ */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="rounded-full border border-[#55713e]/20 bg-[#55713e]/10 px-3 py-1 text-[11px] font-bold text-[#355227]">
                  {categoryName}
                </span>
              )}
              {unit && (
                <span className="rounded-full bg-[#f2efe8] px-2.5 py-0.5 text-[11px] font-semibold text-[#5a6759]">
                  {unit}
                </span>
              )}
            </div>

            {/* ============ Product Title ============ */}
            <h1 className="mt-2.5 font-playfair text-2xl font-bold tracking-tight text-[#162a1a] sm:text-3xl lg:text-4xl">
              {name}
            </h1>

            {/* ============ Rating & Trust Stat ============ */}
            <div className="mt-2.5 flex items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="font-bold text-dark/80">5.0</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-[#566858]">
                {isBangla
                  ? "১০০% খাঁটি ও পরীক্ষিত উপাদান"
                  : "100% Certified Hill Botanical"}
              </span>
            </div>

            {/* ============ Price Box ============ */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3 rounded-2xl bg-[#f7f5ed] p-3.5 sm:p-4">
              <span className="font-mono text-3xl font-extrabold text-[#234d2c] sm:text-4xl">
                {formatPrice(totalPrice)}
              </span>

              {totalOriginalPrice && (
                <>
                  <span className="text-sm text-slate-400 line-through sm:text-base">
                    {formatPrice(totalOriginalPrice)}
                  </span>
                  <span className="rounded-full bg-[#96372d] px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                    {discount}% {isBangla ? "ছাড়" : "OFF"}
                  </span>
                </>
              )}

              {quantity > 1 && (
                <span className="text-xs font-medium text-slate-500">
                  ({formatPrice(product.price)} / {unit || (isBangla ? "প্রতি পিস" : "piece")})
                </span>
              )}
            </div>

            {/* ============ Live Stock Status ============ */}
            <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold sm:text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${stockCount > 0
                  ? "bg-[#2d4e35] animate-pulse"
                  : "bg-red-500"
                  }`}
              />
              <span
                className={
                  stockCount > 0 ? "text-[#2d4e35]" : "text-red-600"
                }
              >
                {stockCount > 0
                  ? isBangla
                    ? `স্টকে রয়েছে (${remainingStock.toLocaleString("bn-BD")} টি অবশিষ্ট)`
                    : `In Stock (${remainingStock.toLocaleString("en-BD")} available)`
                  : isBangla
                    ? "স্টকে শেষ"
                    : "Currently Out of Stock"}
              </span>
            </div>

            {/* ============ Short Description ============ */}
            {description && (
              <p className="mt-3 text-xs leading-relaxed text-[#455447] sm:text-sm">
                {description}
              </p>
            )}

            {/* ============ Quantity Selector & Add to Cart Action ============ */}
            <div className="mt-5 flex items-center gap-2.5">
              {/* ============ Quantity Counter ============ */}
              <div className="flex h-12 w-28 shrink-0 items-center justify-between rounded-xl border border-[#d8cfbe] bg-white px-2 shadow-2xs sm:w-32">
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  disabled={displayQty <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#324534] transition hover:bg-[#f4efe5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-7 text-center font-mono text-sm font-bold text-[#1f3322]">
                  {displayQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  disabled={stockCount <= 0 || displayQty >= stockCount}
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#324534] transition hover:bg-[#f4efe5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* ============ Add to Cart Button ============ */}
              <button
                type="button"
                onClick={() => addProductToCart()}
                disabled={stockCount <= 0}
                className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400 sm:text-sm ${
                  isMainInCart
                    ? "bg-[#1f542c] ring-2 ring-emerald-400/40 hover:bg-[#184623]"
                    : "bg-[#234d2c] hover:bg-[#183920] hover:shadow-md"
                }`}
              >
                {isMainInCart ? (
                  <>
                    <Check size={17} className="shrink-0 text-emerald-300" />
                    <span className="truncate">
                      {isBangla
                        ? `কার্টে যোগ হয়েছে (${mainCartEntry.cartQuantity})`
                        : `Added to Cart (${mainCartEntry.cartQuantity})`}
                    </span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={17} className="shrink-0" />
                    <span className="truncate">
                      {stockCount <= 0
                        ? isBangla
                          ? "স্টকে নেই"
                          : "Out of Stock"
                        : isBangla
                          ? "কার্টে যোগ করুন"
                          : "Add to Cart"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* ============ Direct WhatsApp Order CTA ============ */}
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#2d4e35]/30 bg-[#f3f9f3] px-4 text-xs font-bold text-[#234d2c] transition-all hover:bg-[#2d4e35] hover:text-white active:scale-[0.98] sm:text-sm"
            >
              <Zap size={16} className="fill-current text-[#22c55e]" />
              <span>
                {isBangla
                  ? "সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন"
                  : "Order Now via WhatsApp"}
              </span>
            </Link>

            {/* ============ Trust Assurance Strip ============ */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-[#ede7dc] pt-4 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl bg-[#fbf9f5] p-2">
                <Truck size={17} className="shrink-0 text-[#2d4e35]" />
                <div>
                  <p className="text-[11px] font-bold text-[#1f3322]">
                    {isBangla ? "দ্রুত ডেলিভারি" : "Fast Delivery"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isBangla ? "২-৫ কর্মদিবস" : "2-5 Days across BD"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#fbf9f5] p-2">
                <PackageCheck size={17} className="shrink-0 text-[#2d4e35]" />
                <div>
                  <p className="text-[11px] font-bold text-[#1f3322]">
                    {isBangla ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isBangla ? "সারাদেশে উপলব্ধ" : "Nationwide Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#fbf9f5] p-2">
                <ShieldCheck size={17} className="shrink-0 text-[#2d4e35]" />
                <div>
                  <p className="text-[11px] font-bold text-[#1f3322]">
                    {isBangla ? "১০০% আসল পণ্য" : "100% Authentic"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isBangla ? "বান্দরবান অরিজিন" : "Pure Bandarban"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#fbf9f5] p-2">
                <Headphones size={17} className="shrink-0 text-[#2d4e35]" />
                <div>
                  <p className="text-[11px] font-bold text-[#1f3322]">
                    {isBangla ? "সাপোর্ট হেল্পলাইন" : "Direct Support"}
                  </p>
                  <p className="text-[10px] text-slate-500">01762-144200</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRODUCT INFORMATION SHOWCASE — DIRECT DISPLAY (NO DROPDOWNS)
        ========================================================= */}
        <section className="mt-10">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#55713e]/20 bg-[#55713e]/10 px-3.5 py-1 text-xs font-semibold text-[#3d562a]">
              <Leaf className="h-3.5 w-3.5 text-[#55713e]" />
              <span>{isBangla ? "সম্পূর্ণ বিস্তারিত তথ্য" : "Comprehensive Product Information"}</span>
            </div>

            <h2 className="mt-2 font-playfair text-2xl font-bold tracking-tight text-[#162a1a] sm:text-3xl">
              {isBangla ? "পণ্যের বিবরণ ও উপাদানসমূহ" : "Everything You Need to Know"}
            </h2>
          </div>

          {/* ============ Direct Visual Information Grid ============ */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* ============ Card 1: About the Product ============ */}
            <div className="flex flex-col rounded-2xl border border-[#ede7dc] bg-white p-5 shadow-xs transition hover:border-[#ccd9c2] hover:shadow-md">
              <div className="flex items-center gap-2.5 border-b border-[#f2ece1] pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4eb] text-[#2d4e35]">
                  <Leaf size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1b2f1f]">
                    {isBangla ? "পণ্য সম্পর্কে বিস্তারিত" : "About the Product"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBangla ? "উৎপাদন ও ত্বকের উপকারিতা" : "Natural origins & purpose"}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex-1 text-xs leading-relaxed text-[#415143] sm:text-[13px]">
                <p>{description || (isBangla ? "কোনো বিবরণ দেওয়া নেই।" : "No detailed description provided.")}</p>

                {origin && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#f6fbf6] px-2.5 py-1 text-xs font-semibold text-[#2d4e35]">
                    <Sparkles size={13} />
                    <span>{isBangla ? `উৎস: ${origin}` : `Origin: ${origin}`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ============ Card 2: Key Benefits (প্রধান উপকারিতা) ============ */}
            {benefitsList.length > 0 && (
              <div className="flex flex-col rounded-2xl border border-[#ede7dc] bg-white p-5 shadow-xs transition hover:border-[#ccd9c2] hover:shadow-md">
                <div className="flex items-center gap-2.5 border-b border-[#f2ece1] pb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4eb] text-[#2d4e35]">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1b2f1f]">
                      {isBangla ? "প্রধান উপকারিতা" : "Key Benefits"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isBangla ? "নিয়মিত ব্যবহারের ফলাফল" : "Visible skincare results"}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex-1">
                  <ul className="space-y-2 text-xs leading-relaxed text-[#2d4530] sm:text-[13px]">
                    {benefitsList.map((benefit, index) => (
                      <li
                        key={`${benefit}-${index}`}
                        className="flex items-start gap-2"
                      >
                        <Check size={14} className="mt-0.5 shrink-0 text-[#3d6e42]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ============ Card 3: Ingredients ============ */}
            <div className="flex flex-col rounded-2xl border border-[#ede7dc] bg-white p-5 shadow-xs transition hover:border-[#ccd9c2] hover:shadow-md">
              <div className="flex items-center gap-2.5 border-b border-[#f2ece1] pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4eb] text-[#2d4e35]">
                  <Droplets size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1b2f1f]">
                    {isBangla ? "উপাদানসমূহ" : "Natural Ingredients"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBangla ? "সম্পূর্ণ রাসায়নিকমুক্ত" : "100% Pure & Active Elements"}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex-1">
                {ingredientsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ingredientsList.map((item, idx) => (
                      <span
                        key={`${item}-${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#d9e6d4] bg-[#f8fbf7] px-3 py-1.5 text-xs font-medium text-[#2d4e35]"
                      >
                        <Leaf size={11} className="text-[#55713e]" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    {isBangla
                      ? "প্রাকৃতিক ভেষজ উপাদানসমূহ যুক্ত।"
                      : "Handpicked hill herbs and natural ingredients."}
                  </p>
                )}
              </div>
            </div>

            {/* ============ Card 4: How to Use ============ */}
            <div className="flex flex-col rounded-2xl border border-[#ede7dc] bg-white p-5 shadow-xs transition hover:border-[#ccd9c2] hover:shadow-md">
              <div className="flex items-center gap-2.5 border-b border-[#f2ece1] pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4eb] text-[#2d4e35]">
                  <Clock size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1b2f1f]">
                    {isBangla ? "ব্যবহারের সঠিক নিয়ম" : "How to Use"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBangla ? "সেরা ফলাফলের জন্য নির্দেশনা" : "Step-by-step application guide"}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex-1 text-xs leading-relaxed text-[#415143] sm:text-[13px]">
                {usageList.length > 0 ? (
                  <ul className="space-y-2">
                    {usageList.map((step, idx) => (
                      <li key={`${step}-${idx}`} className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2d4e35] text-[10px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">
                    {isBangla
                      ? "প্রতিদিন পরিমিত পরিমাণে ত্বকে হালকা ম্যাসাজ করে ব্যবহার করুন।"
                      : "Apply gently on clean skin as needed."}
                  </p>
                )}
              </div>
            </div>

            {/* ============ Card 5: Product Specifications Table ============ */}
            <div className={`flex flex-col rounded-2xl border border-[#ede7dc] bg-white p-5 shadow-xs transition hover:border-[#ccd9c2] hover:shadow-md ${benefitsList.length > 0 ? "" : "md:col-span-2 lg:col-span-2"}`}>
              <div className="flex items-center gap-2.5 border-b border-[#f2ece1] pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4eb] text-[#2d4e35]">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1b2f1f]">
                    {isBangla ? "পণ্যের বিবরণ ও বৈশিষ্ট্য" : "Product Specifications"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBangla ? "ক্যাটাগরি, সাইজ ও অন্যান্য তথ্য" : "Essential specifications"}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 text-xs">
                {categoryName && (
                  <div className="flex items-center justify-between rounded-xl bg-[#f9f7f2] px-3.5 py-2">
                    <span className="font-medium text-slate-500">{isBangla ? "ক্যাটাগরি" : "Category"}</span>
                    <span className="font-bold text-[#1f3322]">{categoryName}</span>
                  </div>
                )}
                {subcategoryName && (
                  <div className="flex items-center justify-between rounded-xl bg-[#f9f7f2] px-3.5 py-2">
                    <span className="font-medium text-slate-500">{isBangla ? "সাব-ক্যাটাগরি" : "Subcategory"}</span>
                    <span className="font-bold text-[#1f3322]">{subcategoryName}</span>
                  </div>
                )}
                {origin && (
                  <div className="flex items-center justify-between rounded-xl bg-[#f9f7f2] px-3.5 py-2">
                    <span className="font-medium text-slate-500">{isBangla ? "উৎপত্তিস্থল" : "Origin"}</span>
                    <span className="font-bold text-[#1f3322]">{origin}</span>
                  </div>
                )}
                {unit && (
                  <div className="flex items-center justify-between rounded-xl bg-[#f9f7f2] px-3.5 py-2">
                    <span className="font-medium text-slate-500">{isBangla ? "নেট পরিমাণ / সাইজ" : "Net Weight / Volume"}</span>
                    <span className="font-bold text-[#1f3322]">{unit}</span>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-xl bg-[#f9f7f2] px-3.5 py-2">
                  <span className="font-medium text-slate-500">{isBangla ? "ত্বকের ধরন" : "Skin Suitability"}</span>
                  <span className="font-bold text-[#2d4e35]">{isBangla ? "সব ধরনের ত্বকের জন্য উপযোগী" : "Suitable for All Skin Types"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f9f7f2] px-3.5 py-2">
                  <span className="font-medium text-slate-500">{isBangla ? "স্টক স্ট্যাটাস" : "Stock Status"}</span>
                  <span className="font-bold text-[#2d4e35]">
                    {stockCount > 0 ? (isBangla ? "রেডি স্টক" : "Ready in Stock") : (isBangla ? "স্টক শেষ" : "Out of Stock")}
                  </span>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-[#f2ece1] pt-3">
                  <span className="text-[11px] font-bold text-slate-400">{isBangla ? "ট্যাগসমূহ:" : "Tags:"}</span>
                  {tags.map((t) => (
                    <span key={t} className="rounded-md bg-[#edf4eb] px-2 py-0.5 text-[10px] font-medium text-[#355227]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ============ Card 5: Shipping, Cash on Delivery & Returns ============ */}
            <div className="flex flex-col rounded-2xl border border-[#ede7dc] bg-white p-5 shadow-xs transition hover:border-[#ccd9c2] hover:shadow-md">
              <div className="flex items-center gap-2.5 border-b border-[#f2ece1] pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4eb] text-[#2d4e35]">
                  <RotateCcw size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1b2f1f]">
                    {isBangla ? "শিপিং ও রিটার্ন পলিসি" : "Shipping & Returns"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBangla ? "নিরাপদ প্যাকেজিং ও সহজ রিটার্ন" : "Easy 7-day return policy"}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs text-[#415143]">
                <div className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0 text-[#2d4e35]" />
                  <span>
                    {isBangla
                      ? "সারাদেশে বিশ্বস্ত কুরিয়ারে দ্রুত ডেলিভারি (২–৫ কর্মদিবস)।"
                      : "Fast delivery nationwide via trusted couriers (2–5 business days)."}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0 text-[#2d4e35]" />
                  <span>
                    {isBangla
                      ? "পণ্য হাতে পেয়ে মূল্য পরিশোধ (ক্যাশ অন ডেলিভারি) সুবিধা।"
                      : "Cash on delivery available all across Bangladesh."}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0 text-[#2d4e35]" />
                  <span>
                    {isBangla
                      ? "পণ্য প্রাপ্তির ৭ দিনের মধ্যে সহজ রিটার্ন ও এক্সচেঞ্জ সাপোর্ট।"
                      : "7 days easy return & replacement for defective or wrong items."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ RELATED PRODUCTS ============ */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#55713e]/20 bg-[#55713e]/10 px-3.5 py-1 text-xs font-semibold text-[#3d562a]">
                <Sparkles size={13} className="text-[#55713e]" />
                <span>{isBangla ? "আপনার পছন্দের হতে পারে" : "You May Also Like"}</span>
              </div>
              <h2 className="mt-2 font-playfair text-2xl font-bold tracking-tight text-[#162a1a] sm:text-3xl">
                {isBangla ? "সম্পর্কিত অন্যান্য পণ্য" : "Related Hill Skincare"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {relatedProducts.map((item) => {
                const itemName = localized(item.name, language);
                const itemUnit = localized(item.unit, language);
                const itemDiscount = Number(item.discount) || 0;
                const itemOriginalPrice =
                  itemDiscount > 0 && itemDiscount < 100
                    ? Math.round(Number(item.price) / (1 - itemDiscount / 100))
                    : null;
                const itemIsFavorite = wishlistItems.some(
                  (w) => w._id === item._id
                );
                const itemCartEntry = cartItems.find((c) => c._id === item._id);
                const isItemInCart = Boolean(itemCartEntry);

                return (
                  <article
                    key={item._id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ede7dc] bg-white p-2.5 shadow-[0_4px_16px_rgba(40,54,24,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ccd9c2] hover:shadow-[0_12px_28px_rgba(45,78,53,0.12)] sm:p-3"
                  >
                    <Link
                      href={`/products/${item._id}`}
                      className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      aria-label={`View details for ${itemName}`}
                    />

                    {/* ============ Image Stage ============ */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#f9f7f2] via-[#f4efe5] to-[#ece5d8]">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={itemName || "Product"}
                          fill
                          sizes="(max-width: 640px) 45vw, 25vw"
                          className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-108 sm:p-3"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-dark/50">
                          {isBangla ? "ছবি নেই" : "No image"}
                        </div>
                      )}

                      {/* ============ Top Badges ============ */}
                      <div className="absolute left-2 top-2 z-[2] flex flex-col items-start gap-1">
                        {itemDiscount > 0 ? (
                          <span className="rounded-full bg-[#a33d30] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm sm:text-[10px]">
                            -{itemDiscount}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#2d4e35]/90 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                            <Leaf size={10} className="text-[#a2cf95]" />
                            {isBangla ? "আসল পণ্য" : "Authentic"}
                          </span>
                        )}
                      </div>

                      {/* ============ Wishlist Heart Button ============ */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(toggleWishlist(item));
                        }}
                        aria-label="Wishlist"
                        className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8 ${itemIsFavorite
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-white/90 text-dark/60 backdrop-blur-xs hover:bg-white hover:text-red-500"
                          }`}
                      >
                        <Heart
                          size={14}
                          fill={itemIsFavorite ? "currentColor" : "none"}
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    {/* ============ Content ============ */}
                    <div className="flex flex-1 flex-col pt-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-amber-500">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                size={10}
                                className="fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-dark/70">5.0</span>
                        </div>
                        {itemUnit && (
                          <span className="rounded-xs bg-[#f2efe8] px-1.5 py-0.5 text-[9px] font-medium text-[#5f6c5f]">
                            {itemUnit}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 line-clamp-2 min-h-[2.2rem] text-xs font-semibold leading-tight text-[#1b2b1d] transition-colors group-hover:text-[#2d4e35] sm:min-h-[2.4rem] sm:text-[13px]">
                        {itemName}
                      </h3>

                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#274f2f] sm:text-base">
                          {formatPrice(item.price)}
                        </span>
                        {itemOriginalPrice && (
                          <span className="text-[11px] text-[#8c948c] line-through">
                            {formatPrice(itemOriginalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addProductToCart(item, 1);
                          }}
                          disabled={item.stock <= 0}
                          className={`relative z-[2] flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${isItemInCart
                            ? "bg-[#1f542c] text-white ring-1 ring-emerald-400/40 hover:bg-[#184623]"
                            : "bg-[#2d4e35] text-white hover:bg-[#1f3825]"
                            }`}
                        >
                          {isItemInCart ? (
                            <>
                              <Check size={13} className="text-emerald-300" />
                              <span>
                                {isBangla
                                  ? `কার্টে যোগ হয়েছে (${itemCartEntry.cartQuantity})`
                                  : `Added to Cart (${itemCartEntry.cartQuantity})`}
                              </span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              <span>
                                {item.stock <= 0
                                  ? isBangla
                                    ? "স্টকে নেই"
                                    : "Out of Stock"
                                  : isBangla
                                    ? "কার্টে যোগ করুন"
                                    : "Add to Cart"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailsPage;