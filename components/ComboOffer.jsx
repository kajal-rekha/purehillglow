"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Leaf,
  Sparkles,
  Wallet,
} from "lucide-react";

const ComboOffer = () => {
  const language = useSelector((state) => state.language.language);
  const [products, setProducts] = useState([]);
  const isBangla = language === "bn";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected products response format.");
        }

        setProducts(data.filter((product) => product.images?.[0]).slice(0, 4));
      } catch (error) {
        console.error("Failed to load combo offer products:", error);
      }
    };

    fetchProducts();
  }, []);

  const highlights = isBangla
    ? [
        {
          icon: Leaf,
          title: "মৃদু ও প্রাকৃতিক",
          detail: "সব ধরনের ত্বকের জন্য নিরাপদ ও কার্যকরী যত্ন",
          badge: "১০০% ন্যাচারাল",
        },
        {
          icon: Sparkles,
          title: "ত্বকের উজ্জ্বলতা",
          detail: "প্রাকৃতিকভাবে সতেজ ও প্রাণবন্ত ত্বক",
          badge: "ডেইলি গ্লো",
        },
        {
          icon: Wallet,
          title: "সাশ্রয়ী কম্বো",
          detail: "একসাথে কিনলে পাচ্ছেন বিশেষ মূল্য ছাড়",
          badge: "সেরা ভ্যালু",
        },
      ]
    : [
        {
          icon: Leaf,
          title: "Gentle & Natural",
          detail: "Safe and soothing care for all skin types",
          badge: "100% Natural",
        },
        {
          icon: Sparkles,
          title: "Brighten Skin",
          detail: "Restores your natural, healthy everyday glow",
          badge: "Daily Glow",
        },
        {
          icon: Wallet,
          title: "Save More",
          detail: "Unlock special bundle savings on essentials",
          badge: "Special Price",
        },
      ];

  return (
    <section className="w-full py-7 sm:py-9">
      <div className="wrapper grid items-stretch gap-4 px-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(270px,0.9fr)] lg:gap-5">
        {/* ================= LEFT MAIN COMBO CARD ================= */}
        <div className="relative grid overflow-hidden rounded-3xl border border-[#e7decb] bg-gradient-to-br from-[#fffdf7] via-[#f6f1e1] to-[#e4eed8] shadow-[0_12px_35px_rgba(54,75,44,0.08)] md:grid-cols-[1.1fr_0.95fr]">
          {/* Decorative Background Elements */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#cfe3c0]/35 blur-2xl" />
          <Leaf
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 left-[40%] h-36 w-36 rotate-[-25deg] text-[#55713e]/8"
          />

          {/* Left Text Details */}
          <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#55713e]/20 bg-[#55713e]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3d562a]">
              <Gift size={13} />
              <span>{isBangla ? "বিশেষ কম্বো অফার" : "Special Offer"}</span>
            </span>

            <h2 className="font-playfair !text-2xl !font-bold leading-tight text-[#253b23] sm:!text-3xl lg:!text-4xl">
              {isBangla
                ? "ডেইলি স্কিনকেয়ার কম্বো"
                : "Daily Skincare Combo"}
            </h2>

            <p className="mt-2.5 max-w-md text-xs leading-6 text-[#5c644f] sm:text-sm">
              {isBangla
                ? "প্রতিদিনের যত্নে প্রাকৃতিক স্কিনকেয়ার পণ্যের সুন্দর সমাহার—ল্যাকোশন ও থানাকা ফেসপ্যাক একসাথে।"
                : "A gentle collection of natural essentials for your daily skincare routine, bundled together for complete care."}
            </p>

            {/* Price & Combo Info */}
            <div className="mt-5 flex flex-wrap items-center gap-3.5 rounded-2xl border border-[#dfe5d2] bg-white/80 px-4 py-2.5 shadow-2xs backdrop-blur-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-[#285b35] sm:text-2xl">
                  {isBangla ? "৳৫৯০" : "৳590"}
                </span>
                <span className="text-xs font-medium text-black/40 line-through">
                  {isBangla ? "৳৭৫০" : "৳750"}
                </span>
              </div>
              <span className="h-5 w-px bg-[#dfe5d2]" />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#466333]">
                <CheckCircle2 size={14} className="text-primary" />
                {isBangla ? "৩-ইন-১ গিফট প্যাক" : "3-in-1 Combo Pack"}
              </span>
            </div>

            <Link
              href="#best-sellers"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3d5a2b] px-5 py-3 text-xs font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#2c441e] hover:shadow-lg sm:text-sm"
            >
              <span>
                {isBangla ? "কম্বো দেখুন" : "Shop Combo Now"}
              </span>
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Right Single Featured Combo Image */}
          <div className="relative z-10 flex items-center justify-center p-5 pt-0 sm:p-7 md:pl-2 md:pt-7">
            <div className="group relative aspect-square w-full max-w-[330px] overflow-hidden rounded-2xl border-4 border-white bg-[#eef3e6] shadow-[0_14px_32px_rgba(45,68,36,0.16)]">
              <Image
                src="/assets/combo-offer.jpg"
                alt={
                  isBangla
                    ? "ডেইলি স্কিনকেয়ার কম্বো প্যাক"
                    : "Daily Skincare Combo Pack"
                }
                fill
                sizes="(max-width: 768px) 85vw, 340px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 rounded-full bg-[#c92a2a] px-3 py-1 text-[11px] font-bold text-white shadow-md">
                {isBangla ? "২০% ছাড়" : "SAVE 20%"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT HIGHLIGHTS COLUMN ================= */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {highlights.map(({ icon: Icon, title, detail, badge }) => (
            <div
              key={title}
              className="group flex flex-col justify-center rounded-2xl border border-[#e7decb] bg-[#fffdf8] p-4 shadow-[0_6px_20px_rgba(54,75,44,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#8aa670] hover:shadow-md sm:p-5"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef2df] text-[#55713e] transition group-hover:bg-[#55713e] group-hover:text-white">
                  <Icon size={19} strokeWidth={1.9} />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-[#344a31] sm:text-sm">
                      {title}
                    </span>
                    <span className="rounded-full bg-[#eef2df] px-2 py-0.5 text-[9px] font-semibold text-[#55713e]">
                      {badge}
                    </span>
                  </div>
                  <span className="mt-1 block text-[11px] leading-4 text-[#767a65] sm:text-xs">
                    {detail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComboOffer;
