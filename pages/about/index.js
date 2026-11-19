"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    titleEn: "100% Authentic Origin",
    titleBn: "১০০% আসল ও খাঁটি পণ্য",
    descEn:
      "Every Thanaka, sandalwood, and herbal skincare item is sourced directly from verified suppliers—never counterfeit or diluted.",
    descBn:
      "প্রতিটি থানাকা, চন্দন ও হারবাল স্কিনকেয়ার পণ্য সরাসরি বিশ্বস্ত উৎস থেকে সংগ্রহ করা হয়—কোনো নকল বা ভেজালের সুযোগ নেই।",
  },
  {
    icon: MapPin,
    titleEn: "Rooted in Bandarban",
    titleBn: "বান্দরবান থেকে সরাসরি",
    descEn:
      "Born in the hills of Bandarban, we bring traditional Myanmar and Thai botanical skincare rituals straight to your doorstep.",
    descBn:
      "বান্দরবানের পাহাড়ি ঐতিহ্য থেকে অনুপ্রাণিত হয়ে আমরা আসল বার্মিজ ও থাই ভেষজ স্কিনকেয়ার পণ্য সরাসরি আপনার কাছে পৌঁছে দিই।",
  },
  {
    icon: HeartHandshake,
    titleEn: "Quality Checked with Care",
    titleBn: "যত্নসহকারে মান যাচাই",
    descEn:
      "Before every parcel leaves our hands, each item is carefully inspected for authenticity, freshness, and safe protective packaging.",
    descBn:
      "প্রতিটি পার্সেল পাঠানোর আগে পণ্যের অরিজিনালিটি, মেয়াদ ও নিরাপদ প্যাকেজিং নিখুঁতভাবে যাচাই করা হয়।",
  },
  {
    icon: Truck,
    titleEn: "64-District Cash on Delivery",
    titleBn: "৬৪ জেলায় ক্যাশ অন ডেলিভারি",
    descEn:
      "Shop with total peace of mind anywhere in Bangladesh—inspect your parcel and pay conveniently upon delivery.",
    descBn:
      "বাংলাদেশের যেকোনো জেলা থেকে নিশ্চিন্তে অর্ডার করুন—পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধের সুবিধা।",
  },
];

const AboutPage = () => {
  const language = useSelector((state) => state.language?.language);
  const isBangla = language === "bn";

  return (
    <main className="min-h-screen bg-[#faf6ee] pb-16 pt-[116px]">
      {/* ============ Editorial Hero Banner ============ */}
      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-[12%] h-36 w-36 rotate-[-32deg] text-white/10"
        />
        <div className="wrapper relative mx-auto flex min-h-44 flex-col justify-center px-4 py-8 sm:px-6">
          <nav
            aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
            className="mb-3 flex items-center gap-2 text-[11px] text-white/75"
          >
            <Link href="/" className="transition hover:text-white">
              {isBangla ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-[#efc477]">
              {isBangla ? "আমাদের সম্পর্কে" : "About Us"}
            </span>
          </nav>

          <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
            {isBangla ? (
              <>
                আমাদের <span className="text-[#efc477]">গল্প ও অঙ্গীকার</span>
              </>
            ) : (
              <>
                Our Story &{" "}
                <span className="text-[#efc477]">Botanical Heritage</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">
            {isBangla
              ? "বান্দরবান থেকে সারাদেশে ১০০% খাঁটি পাহাড়ি, বার্মিজ ও থাই স্কিনকেয়ার পণ্য পৌঁছে দেওয়ার বিশ্বস্ত ঠিকানা Pure Hill Glow।"
              : "Pure Hill Glow brings authentic Bandarban, Myanmar, and Thai herbal skincare traditions directly to homes across Bangladesh."}
          </p>
        </div>
      </section>

      <div className="wrapper mx-auto px-4 sm:px-6">
        {/* ============ Story Section ============ */}
        <section className="relative z-10 -mt-6 grid gap-6 overflow-hidden rounded-3xl border border-[#e9e0cf] bg-white p-6 shadow-[0_14px_40px_rgba(24,52,30,0.06)] sm:p-9 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24452c]/15 bg-[#f4f8f1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#24452c]">
              <Sparkles size={11} className="text-[#b8893b]" />
              {isBangla ? "পিওর হিল গ্লো" : "Pure Hill Glow"}
            </span>
            <h2 className="mt-3 font-playfair !text-2xl !font-bold leading-snug text-[#162d1b] sm:!text-3xl">
              {isBangla
                ? "খাঁটি ঐতিহ্যবাহী স্কিনকেয়ার এখন আপনার হাতের মুঠোয়"
                : "Authentic Hill & Botanical Skincare, Sourced Honestly"}
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-[2px] w-10 rounded-full bg-[#c49a4c]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#24452c]/40" />
            </div>

            <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-[#4b5749]">
              <p>
                {isBangla
                  ? "বাজারে নকল ও নিম্নমানের কসমেটিকসের ভিড়ে আসল বার্মিজ থানাকা, কাঠ চন্দন, মুলতানি মাটি ও থাই হারবাল সাবান খুঁজে পাওয়া অনেক সময় কঠিন হয়ে পড়ে। সেই সমস্যা সমাধানের লক্ষ্যেই বান্দরবান থেকে Pure Hill Glow-এর যাত্রা শুরু।"
                  : "Finding genuine Burmese Thanaka, authentic sandalwood, natural Multani Mati, and original Thai herbal soaps in a market full of imitations can be difficult. Pure Hill Glow started right in Bandarban with one clear mission: making 100% authentic botanical skincare accessible to everyone."}
              </p>
              <p>
                {isBangla
                  ? "আমরা প্রতিটি পণ্য সরাসরি বিশ্বস্ত সরবরাহকারীদের কাছ থেকে সংগ্রহ করি এবং প্রতিটি অর্ডার যত্নসহকারে প্যাক করে বাংলাদেশের ৬৪ জেলায় ক্যাশ অন ডেলিভারিতে পৌঁছে দিই।"
                  : "We hand-select every product from trusted local and regional suppliers, verify quality before dispatch, and deliver safely to all 64 districts of Bangladesh with Cash on Delivery."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 lg:col-span-5">
            {[
              {
                val: isBangla ? "১০০%" : "100%",
                label: isBangla ? "আসল ও খাঁটি পণ্য" : "Authentic Products",
              },
              {
                val: isBangla ? "৬৪" : "64",
                label: isBangla ? "জেলায় হোম ডেলিভারি" : "Districts Covered",
              },
              {
                val: "COD",
                label: isBangla ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
              },
              {
                val: isBangla ? "৭ দিন" : "7 Days",
                label: isBangla ? "সহজ রিটার্ন সাপোর্ট" : "Easy Return Support",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#ece3d2] bg-[#faf7f0] p-5 text-center"
              >
                <span className="font-playfair text-2xl font-bold text-[#1a3c22] sm:text-3xl">
                  {item.val}
                </span>
                <span className="mt-1 text-xs font-medium text-[#5d685a]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 4 Pillars ============ */}
        <section className="mt-12">
          <div className="mb-7 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24452c]/15 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#24452c]">
              <BadgeCheck size={12} className="text-[#3f6b36]" />
              {isBangla ? "কেন আমাদের বেছে নেবেন" : "Why Choose Us"}
            </span>
            <h2 className="mt-2 font-playfair !text-2xl !font-bold text-[#162d1b] sm:!text-3xl">
              {isBangla ? "আমাদের মূল প্রতিশ্রুতি" : "Our Authenticity Pillars"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, titleEn, titleBn, descEn, descBn }) => (
              <article
                key={titleEn}
                className="flex flex-col rounded-2xl border border-[#e9e0cf] bg-white p-5 shadow-[0_8px_24px_rgba(24,52,30,0.04)] transition hover:-translate-y-1 hover:border-[#c8d5bf]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf3e4] text-[#1e4326]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-playfair !text-base !font-bold text-[#162d1b]">
                  {isBangla ? titleBn : titleEn}
                </h3>
                <p className="mt-2 !text-xs leading-relaxed text-[#576354] sm:!text-[13px]">
                  {isBangla ? descBn : descEn}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ============ Bottom CTA ============ */}
        <section className="relative mt-12 overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#13361e_0%,#1f4d2c_55%,#2f633c_100%)] p-7 text-white shadow-[0_14px_36px_rgba(20,57,31,0.16)] sm:p-10">
          <div className="relative z-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="font-playfair !text-2xl !font-bold text-white sm:!text-3xl">
                {isBangla
                  ? "খাঁটি পাহাড়ি স্কিনকেয়ার ঘুরে দেখুন"
                  : "Ready to Explore Authentic Skincare?"}
              </h2>
              <p className="mt-1.5 max-w-xl !text-xs text-white/80 sm:!text-sm">
                {isBangla
                  ? "আপনার ত্বকের ধরন অনুযায়ী সঠিক থানাকা, সাবান বা হারবাল কেয়ার বেছে নিন অথবা আমাদের সাথে সরাসরি কথা বলুন।"
                  : "Browse our handpicked Thanaka, herbal soaps, and face care collection—or reach out anytime for guidance."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#efc477] px-6 py-3 text-xs font-bold text-[#16311d] shadow-md transition hover:bg-[#f6d38c] sm:text-sm"
              >
                <PackageCheck size={16} />
                <span>{isBangla ? "সব পণ্য দেখুন" : "Explore Products"}</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 sm:text-sm"
              >
                <span>{isBangla ? "যোগাযোগ করুন" : "Contact Us"}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
