"use client";

import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Error from "./ui/Error";
import Loading from "./ui/Loading";

/* ============ In-Memory Cache for Fast Navigation ============ */
let cachedHeroes = null;

const TRUST_POINTS = [
  { en: "100% Chemical-Free", bn: "কেমিক্যালমুক্ত" },
  { en: "Pure Bandarban Origin", bn: "বান্দরবানের খাঁটি উপাদান" },
  { en: "Gentle for All Skin Types", bn: "সব ধরনের ত্বকে মানানসই" },
];

const Hero = () => {
  const language = useSelector((state) => state.language.language);
  const isBangla = language === "bn";

  const [heroes, setHeroes] = useState(cachedHeroes || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cachedHeroes);

  /* ============ Fetch Hero Banners ============ */
  useEffect(() => {
    if (cachedHeroes) return;

    const controller = new AbortController();
    fetch("/api/heros", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid format");
        cachedHeroes = data;
        setHeroes(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load hero section. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="w-full overflow-hidden pt-[164px]">
      {/* ============ Loading / Error / Empty States ============ */}
      {loading ? (
        <div className="flex h-[460px] w-full animate-pulse items-center justify-center rounded-lg bg-gray md:h-[520px]">
          <Loading isLoading={loading} />
        </div>
      ) : error ? (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray/60 p-4 text-center">
          <Error />
          <p className="mt-2 text-red">{error}</p>
        </div>
      ) : heroes.length === 0 ? (
        <div className="flex h-[400px] w-full items-center justify-center rounded-lg bg-gray">
          <p className="text-dark">No hero images available at the moment...</p>
        </div>
      ) : (
        /* ============ Hero Slider ============ */
        <Swiper
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={heroes.length > 1}
          grabCursor
          speed={900}
          modules={[Autoplay]}
          className="purehill-hero-swiper"
        >
          {heroes.map((hero, index) => {
            const title = (isBangla ? hero.title?.bn : hero.title?.en)?.slice(0, 80);
            const description = isBangla ? hero.description?.bn : hero.description?.en;

            return (
              <SwiperSlide key={hero._id}>
                <div className="relative overflow-hidden bg-gradient-to-b from-[#f6f3eb] via-[#fdfcf9] to-[#f1ede2]">
                  {/* ============ Ambient Botanical Glows ============ */}
                  <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#cfe2c2]/40 blur-3xl" />
                  <div className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-[#e8dfc7]/45 blur-3xl" />
                  <Leaf
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-10 right-[35%] h-56 w-56 rotate-[-20deg] text-[#33562a]/[0.04]"
                  />

                  <div className="wrapper relative mx-auto grid min-h-[460px] items-center gap-6 px-4 py-8 sm:px-6 md:min-h-[520px] md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:py-12 lg:min-h-[580px] lg:px-8">
                    {/* ============ Left Content Column ============ */}
                    <div className="relative z-10 flex flex-col items-start text-left">
                      {/* ============ Subtitle Badge ============ */}
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#406836]/20 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#2f5526] shadow-xs backdrop-blur-md sm:px-4 sm:py-2">
                        <Sparkles size={13} className="text-[#3b662f]" />
                        <span>
                          {isBangla
                            ? "১০০% খাঁটি পাহাড়ি স্কিনকেয়ার ও ভেষজ যত্ন"
                            : "100% Authentic Hill Skincare & Botanical Care"}
                        </span>
                      </div>

                      {/* ============ Main Headline ============ */}
                      <h1 className="max-w-xl font-playfair text-3xl font-extrabold leading-[1.14] text-[#1c361e] sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
                        {title}
                      </h1>

                      {/* ============ Description ============ */}
                      <p className="mt-4 max-w-lg text-xs leading-6 text-[#586050] sm:text-sm sm:leading-7 md:mt-5 md:text-base">
                        {description}
                      </p>

                      {/* ============ Trust Micro-Points ============ */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#32542a]">
                        {TRUST_POINTS.map((pt) => (
                          <span key={pt.en} className="inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-[#32612b]" />
                            {isBangla ? pt.bn : pt.en}
                          </span>
                        ))}
                      </div>

                      {/* ============ Action Buttons ============ */}
                      <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                        <Link
                          href="/products"
                          className="group inline-flex items-center gap-2 rounded-xl bg-[#284a22] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#284a22]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1c3817] hover:shadow-lg sm:px-6 sm:text-sm"
                        >
                          <span>{isBangla ? "পণ্য দেখুন" : "Explore Skincare"}</span>
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>

                        <Link
                          href="#shop-by-category"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#284a22]/25 bg-white/70 px-5 py-3 text-xs font-bold text-[#284a22] shadow-2xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#284a22] hover:bg-white sm:px-6 sm:text-sm"
                        >
                          <span>
                            {isBangla ? "ক্যাটাগরি ব্রাউজ করুন" : "Browse Collections"}
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* ============ Right Product Showcase ============ */}
                    <div className="relative order-1 flex items-center justify-center md:order-2">
                      {/* ============ Soft Aura Glow ============ */}
                      <div className="pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-[#cfe3c0]/40 via-[#e9dec8]/30 to-transparent blur-2xl" />

                      {/* ============ Showcase Image Frame ============ */}
                      <div className="relative z-10 w-full max-w-[480px] sm:max-w-[520px] md:max-w-[540px]">
                        <div className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/40 p-2 shadow-[0_20px_50px_rgba(40,74,34,0.12)] backdrop-blur-xs sm:rounded-[32px] sm:p-2.5">
                          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[20px] bg-[#f2ecdf] sm:rounded-[24px]">
                            <Image
                              src={hero.imageURL}
                              alt={title || "Pure Hill Glow"}
                              fill
                              priority={index === 0}
                              sizes="(max-width: 768px) 95vw, 50vw"
                              className="object-cover object-right transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>

                          {/* ============ Floating Authentic Badge ============ */}
                          <div className="absolute bottom-4 left-4 z-20 hidden rounded-2xl border border-white/90 bg-white/95 px-3.5 py-2 shadow-[0_10px_25px_rgba(40,74,34,0.14)] backdrop-blur-md sm:flex sm:items-center sm:gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf3e2] text-[#2c5224]">
                              <ShieldCheck size={18} />
                            </span>
                            <div>
                              <p className="text-[11px] font-bold text-[#233a1e]">
                                {isBangla ? "১০০% খাঁটি পণ্য" : "100% Authentic"}
                              </p>
                              <p className="text-[9px] text-[#697262]">
                                {isBangla ? "বান্দরবান থেকে সরাসরি" : "Direct From Bandarban"}
                              </p>
                            </div>
                          </div>

                          {/* ============ Floating Glow Badge ============ */}
                          <div className="absolute right-4 top-4 z-20 hidden rounded-2xl border border-white/90 bg-white/95 px-3.5 py-2 shadow-[0_10px_25px_rgba(40,74,34,0.14)] backdrop-blur-md sm:flex sm:items-center sm:gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5efe0] text-[#a06822]">
                              <Sparkles size={16} />
                            </span>
                            <div>
                              <p className="text-[11px] font-bold text-[#233a1e]">
                                {isBangla ? "ন্যাচারাল গ্লো" : "Daily Natural Glow"}
                              </p>
                              <p className="text-[9px] text-[#697262]">
                                {isBangla ? "কোমল উজ্জ্বল ত্বক" : "Gentle Skin Radiance"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
};

export default Hero;
