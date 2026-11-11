"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Cannabis, ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { toggleWishlist } from "@/redux/features/wishlist/wishlistSlice";
import Error from "./ui/Error";
import Loading from "./ui/Loading";
import "swiper/css";

const NewArrivals = () => {
  const language = useSelector((state) => state.language.language);
  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );
  const dispatch = useDispatch();
  const swiperRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchNewArrivals = async () => {
      try {
        const response = await fetch("/api/products?sort=newest", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected products response format.");
        }

        setProducts(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Failed to fetch new arrivals:", fetchError);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchNewArrivals();
    return () => controller.abort();
  }, []);

  const formatPrice = (price) =>
    `৳${Number(price).toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}`;

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="mb-5 text-center">
        <h2 className="font-poppins text-xl font-bold text-dark md:text-2xl">
          {language === "bn" ? "নতুন পণ্য" : "New Arrivals"}
        </h2>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="h-[2px] w-8 bg-primary/30" />
          <Cannabis className="h-3 w-3 text-primary" />
          <span className="h-[2px] w-8 bg-primary/30" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loading />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Error />
          <p className="mt-2 text-sm text-red">
            {language === "bn"
              ? "নতুন পণ্যগুলো লোড করা যায়নি।"
              : "Failed to load new arrivals."}
          </p>
        </div>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-dark/70">
          {language === "bn"
            ? "এখনো কোনো নতুন পণ্য যোগ করা হয়নি।"
            : "No new arrivals available at the moment."}
        </p>
      ) : (
        <div className="wrapper relative px-10 sm:px-12">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label={language === "bn" ? "আগের পণ্য" : "Previous products"}
            className="absolute left-1 top-1/3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-primary/10 bg-white text-dark shadow-sm transition hover:bg-primary hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              220: { slidesPerView: 1, spaceBetween: 12 },
              480: { slidesPerView: 2, spaceBetween: 12 },
              768: { slidesPerView: 3, spaceBetween: 14 },
              1024: { slidesPerView: 4, spaceBetween: 16 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
          >
            {products.map((product) => {
              const name =
                language === "bn"
                  ? product.name?.bn || product.name?.en
                  : product.name?.en || product.name?.bn;
              const isFavorite = wishlistItems.some(
                (item) => item._id === product._id
              );

              return (
                <SwiperSlide key={product._id} className="h-auto">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#eee8df] bg-primary/10 p-2 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-2.5">
                    <Link
                      href={`/products/${product._id}`}
                      aria-label={
                        language === "bn"
                          ? `${name} পণ্যের বিস্তারিত দেখুন`
                          : `View details for ${name}`
                      }
                      className="absolute inset-0 z-[1] rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    />
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-primary/12">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={name || "Product"}
                          fill
                          sizes="(max-width: 480px) 42vw, (max-width: 768px) 28vw, 16vw"
                          className="object-contain p-1 transition-transform duration-300 group-hover:scale-105 sm:p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-dark/60">
                          {language === "bn" ? "ছবি নেই" : "No image"}
                        </div>
                      )}
                      <span className="absolute left-2 top-2 z-[2] rounded-full bg-[#d6e5ad] px-2 py-1 text-[9px] font-semibold text-[#24452c]">
                        {language === "bn" ? "নতুন" : "New"}
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch(toggleWishlist(product))}
                        aria-label="Toggle wishlist"
                        aria-pressed={isFavorite}
                        className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#a66d65] shadow-sm transition hover:scale-105 sm:right-2 sm:top-2"
                      >
                        <Heart
                          size={15}
                          fill={isFavorite ? "currentColor" : "none"}
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    <h3 className="mt-2 line-clamp-2 min-h-8 text-left text-[10px] font-semibold leading-4 text-dark sm:text-xs">
                      {name}
                    </h3>

                    <div
                      className="my-1 flex min-h-4 items-center gap-0.5 text-amber-500"
                      aria-label={language === "bn" ? "রেটিং নেই" : "No ratings yet"}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={10}
                          fill="none"
                          strokeWidth={1.8}
                        />
                      ))}
                    </div>

                    <p className="mb-2 text-left text-xs font-bold text-[#285b35] sm:text-sm">
                      {formatPrice(product.price)}
                    </p>

                    <button
                      type="button"
                      onClick={() => dispatch(addToCart(product))}
                      disabled={Number(product.stock) <= 0}
                      className="relative z-[2] mt-auto w-full rounded-md border border-[#78947d] px-1 py-1 text-[12px] font-semibold text-[#355b3d] transition hover:bg-[#355b3d] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 sm:px-2"
                    >
                      {Number(product.stock) <= 0
                        ? language === "bn"
                          ? "স্টকে নেই"
                          : "Out of stock"
                        : language === "bn"
                          ? "কার্টে যোগ করুন"
                          : "Add to Cart"}
                    </button>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label={language === "bn" ? "পরের পণ্য" : "Next products"}
            className="absolute right-1 top-1/3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-primary/10 bg-white text-dark shadow-sm transition hover:bg-primary hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
