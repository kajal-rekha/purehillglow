"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { toggleWishlist } from "@/redux/features/wishlist/wishlistSlice";
import Error from "./ui/Error";
import Loading from "./ui/Loading";
import "swiper/css";

/* ============ In-Memory Cache for Instant Navigation ============ */
let cachedBestSellers = null;

const BestSeller = () => {
  const language = useSelector((state) => state.language.language);
  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const dispatch = useDispatch();
  const swiperRef = useRef(null);
  const [products, setProducts] = useState(cachedBestSellers || []);
  const [loading, setLoading] = useState(!cachedBestSellers);
  const [error, setError] = useState(null);

  const isBangla = language === "bn";

  /* ============ Fetch Best-Selling Products ============ */
  useEffect(() => {
    if (cachedBestSellers) return;

    const controller = new AbortController();
    fetch("/api/products?sort=bestseller", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid format");
        cachedBestSellers = data;
        setProducts(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const formatPrice = (price) => {
    const formattedPrice = Number(price || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD"
    );
    return `৳${formattedPrice}`;
  };

  return (
    <section id="best-sellers" className="relative w-full scroll-mt-24 py-10 sm:py-14">
      {/* ============ Editorial Skincare Header ============ */}
      <div className="mb-8 px-4 text-center sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#55713e]/20 bg-[#55713e]/10 px-3.5 py-1 text-xs font-semibold text-[#3d562a]">
          <Sparkles className="h-3.5 w-3.5 text-[#55713e]" />
          <span>{isBangla ? "সেরা পছন্দ ও প্রমাণিত ফলাফল" : "Most Loved Formulations"}</span>
        </div>

        <h2 className="mt-2.5 font-playfair text-2xl font-bold tracking-tight text-[#1e2f22] sm:text-3xl lg:text-4xl">
          {isBangla ? "আমাদের সেরা বিক্রিত পণ্যসমূহ" : "Best-Selling Natural Essentials"}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-xs text-[#526354] sm:text-sm">
          {isBangla
            ? "খাঁটি পাহাড়ি থানাকা ও ভেষজ উপাদানে তৈরি প্রাকৃতিক রূপচর্চা পণ্য, যা গ্রাহকদের সর্বাধিক প্রিয়"
            : "Handcrafted hill Thanaka & botanical remedies trusted for clear, radiant, chemical-free skincare"}
        </p>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="h-px w-10 bg-[#55713e]/30" />
          <Leaf className="h-3.5 w-3.5 text-[#55713e]" />
          <span className="h-px w-10 bg-[#55713e]/30" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loading />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Error />
          <p className="mt-2 text-sm text-red">
            {isBangla
              ? "সেরা পণ্যগুলো লোড করা যায়নি।"
              : "Failed to load best sellers."}
          </p>
        </div>
      ) : products.length === 0 ? (
        <p className="py-10 text-center text-sm text-dark/70">
          {isBangla
            ? "এখনো কোনো সেরা পণ্য যোগ করা হয়নি।"
            : "No best sellers available at the moment."}
        </p>
      ) : (
        <div className="wrapper relative px-3 sm:px-8 md:px-12">
          {/* ============ Navigation Arrows ============ */}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label={isBangla ? "পূর্ববর্তী পণ্য" : "Previous products"}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2dcce] bg-white/95 text-[#243e2a] shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-[#2d4e35] hover:text-white md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label={isBangla ? "পরবর্তী পণ্য" : "Next products"}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2dcce] bg-white/95 text-[#243e2a] shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-[#2d4e35] hover:text-white md:flex"
          >
            <ChevronRight size={20} />
          </button>

          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={14}
            slidesPerView={2}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 10 },
              640: { slidesPerView: 2.5, spaceBetween: 14 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 18 },
              1280: { slidesPerView: 5, spaceBetween: 20 },
            }}
          >
            {products.map((product) => {
              const name =
                isBangla
                  ? product.name?.bn || product.name?.en
                  : product.name?.en || product.name?.bn;
              const unit =
                isBangla
                  ? product.unit?.bn || product.unit?.en
                  : product.unit?.en || product.unit?.bn;
              const origin =
                isBangla
                  ? product.origin?.bn || product.origin?.en
                  : product.origin?.en || product.origin?.bn;

              const isFavorite = wishlistItems.some(
                (item) => item._id === product._id
              );

              const discount = Number(product.discount) || 0;
              const originalPrice =
                discount > 0 && discount < 100
                  ? Math.round(Number(product.price) / (1 - discount / 100))
                  : null;

              const isOutOfStock = Number(product.stock) <= 0;
              const cartEntry = cartItems.find((item) => item._id === product._id);
              const isInCart = Boolean(cartEntry);

              return (
                <SwiperSlide key={product._id} className="h-auto pb-2">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ede7dc] bg-white p-2.5 shadow-[0_4px_16px_rgba(40,54,24,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ccd9c2] hover:shadow-[0_12px_28px_rgba(45,78,53,0.12)] sm:p-3">
                    {/* ============ Clickable Card Link for Details ============ */}
                    <Link
                      href={`/products/${product._id}`}
                      aria-label={
                        isBangla
                          ? `${name} পণ্যের বিস্তারিত দেখুন`
                          : `View details for ${name}`
                      }
                      className="absolute inset-0 z-1 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    />

                    {/* ============ Image Container with Badges ============ */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-linear-to-b from-[#f9f7f2] via-[#f4efe5] to-[#ece5d8]">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={name || "Product"}
                          fill
                          sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 22vw, 18vw"
                          className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-108 sm:p-3"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-dark/50">
                          {isBangla ? "ছবি নেই" : "No image"}
                        </div>
                      )}

                      {/* ============ Top Badges ============ */}
                      <div className="absolute left-2 top-2 z-2 flex flex-col items-start gap-1">
                        {discount > 0 ? (
                          <span className="rounded-full bg-[#a33d30] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm sm:text-[10px]">
                            -{discount}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#2d4e35]/90 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm backdrop-blur-xs sm:text-[10px]">
                            <Sparkles size={10} className="text-[#a2cf95]" />
                            {isBangla ? "সেরা বিক্রিত" : "Best Seller"}
                          </span>
                        )}

                        {origin && (
                          <span className="hidden rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-[#415542] shadow-xs backdrop-blur-xs sm:inline-block">
                            {origin}
                          </span>
                        )}
                      </div>

                      {/* ============ Wishlist Button (Single, top-right floating) ============ */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(toggleWishlist(product));
                        }}
                        aria-label={
                          isFavorite
                            ? isBangla
                              ? "পছন্দের তালিকা থেকে সরান"
                              : "Remove from favorites"
                            : isBangla
                              ? "পছন্দের তালিকায় যোগ করুন"
                              : "Add to favorites"
                        }
                        aria-pressed={isFavorite}
                        className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8 ${
                          isFavorite
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-white/90 text-dark/60 backdrop-blur-xs hover:bg-white hover:text-red-500"
                        }`}
                      >
                        <Heart
                          size={15}
                          fill={isFavorite ? "currentColor" : "none"}
                          strokeWidth={2}
                        />
                      </button>

                      {/* ============ Out of Stock Overlay if applicable ============ */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 z-3 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                          <span className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold text-red-600 shadow-md">
                            {isBangla ? "স্টক শেষ" : "Out of Stock"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ============ Product Information ============ */}
                    <div className="flex flex-1 flex-col pt-2.5">
                      {/* ============ Rating & Unit ============ */}
                      <div className="flex items-center justify-between text-[11px]">
                        <div
                          className="flex items-center gap-1 text-amber-500"
                          aria-label={isBangla ? "৫ তারকার রেটিং" : "5 star rating"}
                        >
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                size={11}
                                className="fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-dark/70">5.0</span>
                        </div>

                        {unit && (
                          <span className="rounded-sm bg-[#f2efe8] px-1.5 py-0.5 text-[9px] font-medium text-[#5f6c5f]">
                            {unit}
                          </span>
                        )}
                      </div>

                      {/* ============ Product Name ============ */}
                      <h3 className="mt-1.5 line-clamp-2 min-h-[2.2rem] text-xs font-semibold leading-tight text-[#1b2b1d] transition-colors group-hover:text-[#2d4e35] sm:min-h-9.5 sm:text-[13px]">
                        {name}
                      </h3>

                      {/* ============ Pricing ============ */}
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#274f2f] sm:text-base">
                          {formatPrice(product.price)}
                        </span>
                        {originalPrice && (
                          <span className="text-[11px] text-[#8c948c] line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* ============ Add to Cart Button ============ */}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(addToCart(product));
                          }}
                          disabled={isOutOfStock}
                          className={`relative z-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none ${
                            isInCart
                              ? "bg-[#1f542c] text-white ring-1 ring-emerald-400/40 hover:bg-[#184623]"
                              : "bg-[#2d4e35] text-white hover:bg-[#203a27] hover:shadow-md"
                          }`}
                        >
                          {isInCart ? (
                            <>
                              <Check size={13} className="text-emerald-300" />
                              <span>
                                {isBangla
                                  ? `কার্টে যোগ হয়েছে (${cartEntry.cartQuantity})`
                                  : `Added to Cart (${cartEntry.cartQuantity})`}
                              </span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              <span>
                                {isOutOfStock
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
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </section>
  );
};

export default BestSeller;