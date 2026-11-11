"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const promiseItems = {
  en: [
    {
      icon: BadgeCheck,
      title: "100% Authentic",
      description:
        "Carefully selected original hill skincare & wellness products",
    },
    {
      icon: HeartHandshake,
      title: "Sourced with Care",
      description:
        "Collected directly from trusted local artisans and suppliers",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Tested",
      description:
        "Every item is thoroughly quality-checked before delivery",
    },
    {
      icon: UsersRound,
      title: "Trusted by Many",
      description:
        "Dedicated support and thoughtful care for every customer",
    },
  ],
  bn: [
    {
      icon: BadgeCheck,
      title: "১০০% আসল পণ্য",
      description: "যত্নসহকারে বাছাইকৃত সম্পূর্ণ খাঁটি ও অরিজিনাল পণ্য",
    },
    {
      icon: HeartHandshake,
      title: "যত্নে সংগ্রহ",
      description: "সরাসরি বিশ্বস্ত ও অভিজ্ঞ সরবরাহকারীদের কাছ থেকে সংগৃহীত",
    },
    {
      icon: ShieldCheck,
      title: "নিরাপদ ও যাচাইকৃত",
      description: "প্রতিটি পণ্য ডেলিভারির আগে নিখুঁতভাবে মান যাচাই করা হয়",
    },
    {
      icon: UsersRound,
      title: "গ্রাহকের আস্থায়",
      description: "হাজারো সন্তুষ্ট গ্রাহকের বিশ্বাস ও আন্তরিক সেবা",
    },
  ],
};

const AuthenticityPromise = () => {
  const language = useSelector((state) => state.language.language);
  const isBangla = language === "bn";
  const items = promiseItems[language] || promiseItems.en;

  return (
    <section
      id="authenticity-promise"
      className="w-full overflow-hidden bg-gradient-to-b from-[#fbf8f1] to-[#f3efe2] py-10 sm:py-14"
    >
      <div className="wrapper px-4">
        {/* ================= SECTION HEADER ================= */}
        <div className="mx-auto mb-8 max-w-xl text-center sm:mb-10">
          <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#55713e]/20 bg-[#eef3e3] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#3d5a2b]">
            <Sparkles size={13} />
            <span>
              {isBangla ? "আমাদের অঙ্গীকার" : "Why Choose Pure Hill Glow"}
            </span>
          </span>
          <h2 className="font-playfair !text-2xl !font-bold text-[#233821] sm:!text-3xl">
            {isBangla
              ? "আমাদের বিশ্বস্ততার অঙ্গীকার"
              : "Our Authenticity Promise"}
          </h2>
          <p className="mt-2 !text-xs text-[#646956] sm:!text-sm">
            {isBangla
              ? "পাহাড়ের খাঁটি ও প্রাকৃতিক উপাদান আপনার কাছে পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ"
              : "Bringing the purest botanical traditions of the hills straight to your daily routine"}
          </p>
        </div>

        {/* ================= 4 PROMISE CARDS ================= */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {items.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex items-start gap-4 rounded-2xl border border-[#e6decb] bg-white p-5 shadow-[0_6px_22px_rgba(45,68,36,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#88a36e] hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef3e3] text-[#476634] transition duration-300 group-hover:bg-[#476634] group-hover:text-white">
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="!text-sm !font-bold text-[#253b23] sm:!text-base">
                  {title}
                </h3>
                <p className="mt-1 !text-xs leading-5 text-[#6b705d]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= EDITORIAL STORY BANNER ================= */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-[#e5dcc8] bg-white p-3 shadow-[0_14px_38px_rgba(45,68,36,0.07)] sm:mt-8 sm:p-4">
          <div className="grid items-stretch gap-4 lg:grid-cols-[1.08fr_1fr]">
            {/* Left Framed Landscape Image */}
            <div className="group relative min-h-[240px] overflow-hidden rounded-2xl sm:min-h-[300px]">
              <Image
                src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85"
                alt={
                  isBangla
                    ? "সবুজ পাহাড় ও প্রকৃতি"
                    : "Green hills and natural landscape"
                }
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#162918]/65 via-[#162918]/15 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#2d472b] shadow-sm backdrop-blur-xs">
                  <Leaf size={14} className="text-primary" />
                  <span>
                    {isBangla ? "প্রকৃতির কাছ থেকে" : "Inspired by Nature"}
                  </span>
                </span>

                <span className="rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
                  {isBangla ? "বান্দরবান, বাংলাদেশ" : "Bandarban, Bangladesh"}
                </span>
              </div>
            </div>

            {/* Right Story Content Panel */}
            <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8f4e6] via-[#eff3e3] to-[#e2ecd4] p-6 sm:p-8 lg:p-10">
              <Leaf
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 rotate-[-20deg] text-[#55713e]/10"
              />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#55713e]">
                  <Leaf size={14} />
                  <span>
                    {isBangla ? "পাহাড়ের প্রেরণা" : "Pure Hill Glow"}
                  </span>
                </span>

                <h3 className="mt-2 font-playfair !text-2xl !font-bold leading-tight text-[#233821] sm:!text-3xl lg:!text-4xl">
                  {isBangla
                    ? "পাহাড় থেকে, ভালোবাসায়"
                    : "From the Hills With Love"}
                </h3>

                <p className="mt-3 max-w-md !text-xs leading-6 text-[#575d4b] sm:!text-sm">
                  {isBangla
                    ? "পাহাড়ি প্রকৃতি ও ঐতিহ্য থেকে অনুপ্রাণিত যত্নের পণ্য—আপনার প্রতিদিনের প্রাকৃতিক সৌন্দর্যচর্চায়।"
                    : "Inspired by the natural beauty and botanical traditions of the hills, thoughtfully selected for your everyday skincare."}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#355228]">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-primary" />
                    {isBangla ? "রাসায়নিকমুক্ত যত্ন" : "Gentle Herbal Formula"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-primary" />
                    {isBangla ? "সরাসরি পাহাড় থেকে" : "Authentic Hill Origin"}
                  </span>
                </div>

                <div className="mt-6">
                  <Link
                    href="#best-sellers"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#3d5a2b] px-5 py-3 text-xs font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#2c441e] hover:shadow-lg sm:text-sm"
                  >
                    <span>
                      {isBangla
                        ? "প্রাকৃতিক পণ্য দেখুন"
                        : "Explore Our Collection"}
                    </span>
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthenticityPromise;
