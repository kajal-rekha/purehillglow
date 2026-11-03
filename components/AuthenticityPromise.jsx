"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  BadgeCheck,
  Cannabis,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const promiseItems = {
  en: [
    {
      icon: BadgeCheck,
      title: "100% Authentic",
      description: "Carefully selected original products",
    },
    {
      icon: HeartHandshake,
      title: "Sourced with Care",
      description: "Directly from trusted suppliers",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Tested",
      description: "Quality checked before delivery",
    },
    {
      icon: UsersRound,
      title: "Trusted by Many",
      description: "Thoughtful care for our customers",
    },
  ],
  bn: [
    {
      icon: BadgeCheck,
      title: "১০০% আসল পণ্য",
      description: "যত্নসহকারে বাছাই করা",
    },
    {
      icon: HeartHandshake,
      title: "যত্নে সংগ্রহ",
      description: "বিশ্বস্ত সরবরাহকারীর কাছ থেকে",
    },
    {
      icon: ShieldCheck,
      title: "নিরাপদ ও যাচাইকৃত",
      description: "ডেলিভারির আগে মান যাচাই",
    },
    {
      icon: UsersRound,
      title: "গ্রাহকের আস্থায়",
      description: "গ্রাহকদের জন্য আন্তরিক যত্ন",
    },
  ],
};

const AuthenticityPromise = () => {
  const language = useSelector((state) => state.language.language);
  const items = promiseItems[language] || promiseItems.en;

  return (
    <section
      id="authenticity-promise"
      className="w-full overflow-hidden bg-[#faf6eb] py-7 sm:py-9"
    >
      <div className="wrapper px-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#eee5d6] bg-[#fffdf7]">
          <div className="pointer-events-none absolute -right-4 -top-8 hidden rotate-[-22deg] text-[#8b9b62]/25 sm:block">
            <Leaf size={100} strokeWidth={0.8} />
          </div>

          <div className="relative z-10 px-4 pb-4 pt-5 sm:px-7 sm:pb-5">
            <div className="mb-4 text-center">
              <h2 className="font-playfair !text-lg !font-bold text-[#344a31] sm:!text-xl">
                {language === "bn" ? "আমাদের বিশ্বস্ততার অঙ্গীকার" : "Our Authenticity Promise"}
              </h2>
              <div className="mt-1 flex justify-center text-[#78894f]">
                <Cannabis size={13} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {items.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-center gap-2 rounded-lg px-1 py-1 sm:gap-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf0df] text-[#667c49] sm:h-9 sm:w-9">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="!text-[10px] !font-semibold leading-4 text-[#384a32] sm:!text-[11px]">
                      {title}
                    </h3>
                    <p className="!text-[8px] leading-3 text-[#777768] sm:!text-[9px]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid border-t border-[#eee5d6] md:grid-cols-2">
            <div className="relative min-h-[190px] overflow-hidden sm:min-h-[240px]">
              <Image
                src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85"
                alt={
                  language === "bn"
                    ? "সবুজ পাহাড় ও প্রকৃতি"
                    : "Green hills and natural landscape"
                }
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f3521]/30 to-transparent" />
              <span className="absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-medium text-[#445839] backdrop-blur-sm">
                <Leaf size={12} />
                {language === "bn" ? "প্রকৃতির কাছ থেকে" : "Inspired by nature"}
              </span>
            </div>

            <div className="relative flex min-h-[210px] items-center overflow-hidden bg-gradient-to-br from-[#f7f1df] to-[#e9eddb] px-5 py-6 sm:min-h-[240px] sm:px-8">
              <div className="relative z-10 max-w-[330px]">
                <span className="mb-2 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71814d]">
                  <Cannabis size={12} />
                  {language === "bn" ? "পাহাড়ের প্রেরণা" : "Pure Hill Glow"}
                </span>
                <h3 className="font-playfair !text-xl !font-bold leading-tight text-[#344a31] sm:!text-2xl">
                  {language === "bn" ? "পাহাড় থেকে, ভালোবাসায়" : "From the Hills With Love"}
                </h3>
                <p className="mt-2 max-w-[290px] !text-[10px] leading-5 text-[#666a57] sm:!text-[11px]">
                  {language === "bn"
                    ? "পাহাড়ি প্রকৃতি ও ঐতিহ্য থেকে অনুপ্রাণিত যত্নের পণ্য—আপনার প্রতিদিনের সৌন্দর্যচর্চায়।"
                    : "Inspired by the natural beauty and traditions of the hills, thoughtfully selected for your everyday care."}
                </p>
                <Link
                  href="#best-sellers"
                  className="mt-3 inline-flex items-center rounded-md bg-[#55713e] px-3 py-1.5 text-[9px] font-semibold text-white transition hover:bg-[#405b2e]"
                >
                  {language === "bn" ? "প্রাকৃতিক পণ্য দেখুন" : "Explore Our Collection"}
                </Link>
              </div>

              <div className="pointer-events-none absolute -bottom-5 -right-4 flex h-36 w-36 items-center justify-center rounded-full bg-[#dfe5c9]/70 sm:right-4 sm:h-44 sm:w-44">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#80915a]/25 text-[#80915a]/70 sm:h-36 sm:w-36">
                  <Leaf size={62} strokeWidth={0.8} />
                  <span className="absolute bottom-5 right-4 text-[#9a8b5a]/70">
                    <Cannabis size={26} strokeWidth={1} />
                  </span>
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
