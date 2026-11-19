"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Error from "./ui/Error";

/* ============ In-Memory Cache for Fast Navigation ============ */
let cachedHeroes = null;

const TRUST_STATS = [
  {
    valueEn: "100%",
    valueBn: "১০০%",
    labelEn: "Authentic Products",
    labelBn: "আসল ও খাঁটি পণ্য",
  },
  {
    valueEn: "64",
    valueBn: "৬৪",
    labelEn: "Districts Delivery",
    labelBn: "জেলায় হোম ডেলিভারি",
  },
  {
    valueEn: "COD",
    valueBn: "COD",
    labelEn: "Cash on Delivery",
    labelBn: "ক্যাশ অন ডেলিভারি",
  },
];

const Hero = () => {
  const language = useSelector((state) => state.language.language);
  const isBangla = language === "bn";

  const [heroes, setHeroes] = useState(cachedHeroes || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cachedHeroes);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

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
          setError(
            isBangla
              ? "হিরো ব্যানার লোড করা যায়নি। আবার চেষ্টা করুন।"
              : "Failed to load hero section. Please try again."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isBangla]);

  const formatSlideNumber = (num) => String(num + 1).padStart(2, "0");

  return (
    <section className="relative w-full overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_#f1f5ea_0%,_#faf6ee_48%,_#f1e9da_100%)] pt-[116px] md:pt-[172px]">
      {/* ============ Ambient Botanical Background Layer ============ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#cfe1c5]/40 blur-3xl" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-[#e6d5b3]/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#dce8d4]/30 blur-3xl" />
        <Leaf
          aria-hidden="true"
          className="absolute -bottom-12 right-[38%] h-64 w-64 rotate-[-22deg] text-[#24452c]/[0.035]"
        />
      </div>

      {/* ============ Loading / Error / Empty States ============ */}
      {loading ? (
        <div className="wrapper relative mx-auto px-4 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-12 lg:px-8">
          <div className="grid min-h-[440px] items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-5 lg:col-span-6">
              <div className="h-7 w-56 animate-pulse rounded-full bg-[#e5dfd0]" />
              <div className="space-y-3">
                <div className="h-11 w-4/5 animate-pulse rounded-xl bg-[#e5dfd0]" />
                <div className="h-11 w-3/5 animate-pulse rounded-xl bg-[#e5dfd0]" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full max-w-md animate-pulse rounded bg-[#eae4d6]" />
                <div className="h-4 w-5/6 max-w-md animate-pulse rounded bg-[#eae4d6]" />
              </div>
              <div className="flex gap-3 pt-3">
                <div className="h-12 w-40 animate-pulse rounded-full bg-[#d8d3c4]" />
                <div className="h-12 w-36 animate-pulse rounded-full bg-[#e5dfd0]" />
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[16/11] w-full animate-pulse rounded-tl-[72px] rounded-tr-[24px] rounded-br-[72px] rounded-bl-[24px] bg-[#e5dfd0]" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="wrapper relative mx-auto flex min-h-[380px] flex-col items-center justify-center px-4 py-12 text-center">
          <Error />
          <p className="mt-2 text-sm text-red">{error}</p>
        </div>
      ) : heroes.length === 0 ? (
        <div className="wrapper relative mx-auto flex min-h-[380px] items-center justify-center px-4 py-12">
          <p className="text-sm text-dark/70">
            {isBangla
              ? "এই মুহূর্তে কোনো হিরো ব্যানার পাওয়া যায়নি।"
              : "No hero banners available at the moment."}
          </p>
        </div>
      ) : (
        /* ============ Editorial Botanical Hero Slider ============ */
        <div className="relative z-10 pb-14 sm:pb-16 lg:pb-20">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
            }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{
              delay: 5500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={heroes.length > 1}
            speed={850}
            modules={[Autoplay, EffectFade]}
            className="purehill-hero-swiper"
          >
            {heroes.map((hero, index) => {
              const title = (isBangla ? hero.title?.bn : hero.title?.en)
                ?.trim()
                ?.slice(0, 85);
              const description = (
                isBangla ? hero.description?.bn : hero.description?.en
              )?.trim();
              const isActive = activeIndex === index;

              return (
                <SwiperSlide key={hero._id}>
                  <div className="wrapper relative mx-auto px-4 pt-6 sm:px-6 md:pt-10 lg:px-8 lg:pt-12">
                    <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-12 lg:gap-12">
                      {/* ============ Left Editorial Content ============ */}
                      <div className="order-2 flex flex-col items-start text-left lg:order-1 lg:col-span-6">
                        {/*============ Luxury Botanical Eyebrow ===========*/}
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#24452c]/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#24452c] shadow-[0_2px_12px_rgba(36,69,44,0.06)] backdrop-blur-md">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e9f2e3] text-[#2d5834]">
                            <Sparkles size={10} />
                          </span>
                          <span>
                            {isBangla
                              ? "খাঁটি পাহাড়ি ও ভেষজ স্কিনকেয়ার"
                              : "Authentic Hill & Botanical Skincare"}
                          </span>
                        </div>

                        {/*=========== Editorial Serif Headline =============*/}
                        <h1 className="max-w-xl font-playfair text-[2rem] font-bold leading-[1.12] tracking-[-0.02em] text-[#16301c] sm:text-[2.65rem] lg:text-[3.2rem] xl:text-[3.5rem]">
                          {title}
                        </h1>

                        {/* =========Delicate Gold Botanical Divider ==========*/}
                        <div className="mt-4 flex items-center gap-2.5">
                          <span className="h-[2px] w-10 rounded-full bg-[#c49a4c]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#24452c]/40" />
                        </div>

                        {/*============ Clean Breathable Description ============*/}
                        <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-relaxed text-[#4f5a4d] sm:text-[15px] sm:leading-7">
                          {description}
                        </p>

                        {/*============= Action Buttons ============*/}
                        <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
                          <Link
                            href="/products"
                            className="group inline-flex items-center gap-2.5 rounded-full bg-[#1e3f25] py-2.5 pl-6 pr-2.5 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(30,63,37,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#142d1a] hover:shadow-[0_16px_32px_rgba(30,63,37,0.28)] sm:text-sm"
                          >
                            <span>
                              {isBangla ? "পণ্য সংগ্রহ দেখুন" : "Explore Skincare"}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:bg-white/25">
                              <ArrowRight size={15} />
                            </span>
                          </Link>

                          <Link
                            href="#best-sellers"
                            className="inline-flex items-center gap-2 rounded-full border border-[#1e3f25]/20 bg-white/75 px-5 py-3 text-xs font-semibold text-[#1e3f25] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1e3f25] hover:bg-white sm:px-6 sm:text-sm"
                          >
                            <span>
                              {isBangla ? "বেস্ট সেলার দেখুন" : "Best Sellers"}
                            </span>
                          </Link>
                        </div>

                        {/*=========== Authentic Trust & Proof Strip============ */}
                        <div className="mt-7 grid w-full max-w-md grid-cols-3 gap-3 border-t border-[#e3dac7] pt-5 sm:mt-8">
                          {TRUST_STATS.map((stat) => (
                            <div key={stat.labelEn} className="flex flex-col">
                              <div className="flex items-center gap-1 font-playfair text-lg font-bold text-[#19351f] sm:text-xl">
                                <span>
                                  {isBangla ? stat.valueBn : stat.valueEn}
                                </span>
                              </div>
                              <span className="mt-0.5 text-[11px] font-medium text-[#606b5d] sm:text-xs">
                                {isBangla ? stat.labelBn : stat.labelEn}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ============ Right Architectural Product Showcase ============ */}
                      <div className="relative order-1 flex items-center justify-center lg:order-2 lg:col-span-6">
                        <div className="relative w-full max-w-[540px]">
                          {/*============= Offset Decorative Gold Botanical Outline ============*/}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-3 -right-3 top-3 left-3 hidden rounded-tl-[76px] rounded-tr-[24px] rounded-br-[76px] rounded-bl-[24px] border border-[#c49a4c]/35 sm:block"
                          />

                          {/*========= Sculpted Gallery Frame ============*/}
                          <div className="group relative overflow-hidden rounded-tl-[56px] rounded-tr-[20px] rounded-br-[56px] rounded-bl-[20px] border border-white/90 bg-white/75 p-2 shadow-[0_24px_60px_rgba(24,52,30,0.12)] backdrop-blur-sm sm:rounded-tl-[76px] sm:rounded-tr-[24px] sm:rounded-br-[76px] sm:rounded-bl-[24px] sm:p-2.5">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-tl-[48px] rounded-tr-[14px] rounded-br-[48px] rounded-bl-[14px] bg-[#efe8da] sm:aspect-[16/11] sm:rounded-tl-[66px] sm:rounded-tr-[18px] sm:rounded-br-[66px] sm:rounded-bl-[18px]">
                              <Image
                                src={hero.imageURL}
                                alt={title || "Pure Hill Glow Authentic Skincare"}
                                fill
                                priority={index === 0}
                                sizes="(max-width: 1024px) 95vw, 48vw"
                                className={`object-cover object-center transition-transform duration-[4500ms] ease-out ${isActive ? "scale-[1.04]" : "scale-100"
                                  }`}
                              />
                              {/*=========== Soft Bottom Vignette for Polish =============*/}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#162b1a]/25 via-transparent to-transparent" />
                            </div>
                          </div>

                          {/*============= Single Unobtrusive Verified Authenticity Seal =============*/}
                          <div className="absolute -bottom-3 left-3 z-20 flex items-center gap-2.5 rounded-2xl border border-[#e7decb] bg-[#fffdf8]/95 px-3.5 py-2.5 shadow-[0_12px_28px_rgba(24,52,30,0.12)] backdrop-blur-md sm:-bottom-4 sm:left-5 sm:px-4">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e4] text-[#1f4727]">
                              <ShieldCheck size={19} />
                            </span>
                            <div className="leading-tight">
                              <p className="text-[11px] font-bold text-[#18331e] sm:text-xs">
                                {isBangla
                                  ? "যাচাইকৃত অরিজিনাল"
                                  : "Verified Authentic"}
                              </p>
                              <p className="mt-0.5 text-[10px] text-[#616d5e]">
                                {isBangla
                                  ? "বান্দরবান • বার্মিজ • থাই"
                                  : "Bandarban • Myanmar • Thai"}
                              </p>
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

          {/* ============ Editorial Slider Controls Bar ============ */}
          {heroes.length > 1 && (
            <div className="wrapper relative z-20 mx-auto mt-7 flex items-center justify-between px-4 sm:mt-8 sm:px-6 lg:px-8">
              {/* ===========Slide Counter & Interactive Pill Dots ==============*/}
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs font-semibold tracking-wider text-[#1e3f25]">
                  <span>{formatSlideNumber(activeIndex)}</span>
                  <span className="mx-1.5 text-[#a9a08d]">/</span>
                  <span className="text-[#7c8475]">
                    {formatSlideNumber(heroes.length - 1)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {heroes.map((hero, idx) => {
                    const active = idx === activeIndex;
                    return (
                      <button
                        key={hero._id}
                        type="button"
                        onClick={() => swiperRef.current?.slideToLoop(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${active
                          ? "w-8 bg-[#1e3f25]"
                          : "w-2 bg-[#cbc2af] hover:bg-[#7d9478]"
                          }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/*========== Prev / Next Navigation Buttons=========== */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Previous slide"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#24452c]/20 bg-white/80 text-[#1e3f25] shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-[#1e3f25] hover:bg-[#1e3f25] hover:text-white"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Next slide"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#24452c]/20 bg-white/80 text-[#1e3f25] shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-[#1e3f25] hover:bg-[#1e3f25] hover:text-white"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Hero;
