"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Leaf,
  MessageCircle,
} from "lucide-react";

const FAQ_CATEGORIES = [
  { key: "all", en: "All Questions", bn: "সব প্রশ্ন" },
  { key: "products", en: "Products & Authenticity", bn: "পণ্য ও অরিজিনালিটি" },
  { key: "delivery", en: "Orders & Delivery", bn: "অর্ডার ও ডেলিভারি" },
  { key: "returns", en: "Returns & Support", bn: "রিটার্ন ও সাপোর্ট" },
];

const FAQ_ITEMS = [
  {
    category: "products",
    qEn: "Are all Pure Hill Glow products 100% authentic?",
    qBn: "Pure Hill Glow-এর সব পণ্য কি ১০০% আসল?",
    aEn: "Yes. Every Thanaka, Burmese Multani Mati, sandalwood, pearl cream, and Thai herbal soap is sourced directly from trusted regional suppliers in Bandarban and verified before shipping.",
    aBn: "হ্যাঁ। আমাদের প্রতিটি থানাকা, বার্মিজ মুলতানি মাটি, চন্দন, পার্ল ক্রিম এবং থাই হারবাল সাবান সরাসরি বান্দরবানের বিশ্বস্ত সরবরাহকারীদের কাছ থেকে সংগ্রহ করে মান যাচাইয়ের পর পাঠানো হয়।",
  },
  {
    category: "products",
    qEn: "How do I use Thanaka Cake or Burmese Multani Mati Bar?",
    qBn: "থানাকা কেক বা বার্মিজ মুলতানি মাটির বার কীভাবে ব্যবহার করবো?",
    aEn: "Take a small piece or rub gently with clean water (or rose water) to create a smooth paste. Apply evenly to your clean face, let it dry for 15–20 minutes, and rinse off with lukewarm or normal water.",
    aBn: "অল্প পরিমাণে পরিষ্কার পানি বা গোলাপজলের সাথে মিশিয়ে মসৃণ পেস্ট তৈরি করুন। পরিষ্কার মুখে আলতোভাবে লাগিয়ে ১৫–২০ মিনিট শুকাতে দিন এবং এরপর সাধারণ পানি দিয়ে ধুয়ে ফেলুন।",
  },
  {
    category: "products",
    qEn: "Are these skincare products suitable for sensitive or acne-prone skin?",
    qBn: "এই পণ্যগুলো কি সেনসিটিভ বা ব্রণপ্রবণ ত্বকের জন্য উপযোগী?",
    aEn: "Most of our herbal products (like Natural Thanaka and Multani Mati) are gentle and traditionally used to calm oil and acne. However, we always recommend doing a quick patch test on your wrist or jawline before first use.",
    aBn: "আমাদের অধিকাংশ ভেষজ পণ্য (যেমন ন্যাচারাল থানাকা ও মুলতানি মাটি) তেল ও ব্রণ নিয়ন্ত্রণে খুবই উপকারী। তবে যেকোনো নতুন স্কিনকেয়ার প্রথমবার ব্যবহারের আগে হাতে বা কানের পাশে ছোট্ট প্যাচ টেস্ট করে নেওয়া উত্তম।",
  },
  {
    category: "delivery",
    qEn: "Do you offer Cash on Delivery across Bangladesh?",
    qBn: "আপনারা কি সারাদেশে ক্যাশ অন ডেলিভারি দেন?",
    aEn: "Yes! We deliver to all 64 districts of Bangladesh with Cash on Delivery (COD). You can inspect your parcel when it arrives and pay the delivery rider.",
    aBn: "হ্যাঁ! আমরা বাংলাদেশের ৬৪ জেলাতেই ক্যাশ অন ডেলিভারি (COD) সুবিধা দিই। পণ্য হাতে পেয়ে তারপর ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করতে পারবেন।",
  },
  {
    category: "delivery",
    qEn: "How long does delivery take and what is the delivery charge?",
    qBn: "ডেলিভারি পেতে কতদিন সময় লাগে এবং ডেলিভারি চার্জ কত?",
    aEn: "Standard delivery takes 2–5 business days nationwide depending on your district. The flat nationwide delivery charge is ৳150.",
    aBn: "আপনার এলাকা অনুযায়ী সারাদেশে সাধারণত ২ থেকে ৫ কর্মদিবসের মধ্যে ডেলিভারি পৌঁছে যায়। সারাদেশে ডেলিভারি চার্জ ১৫০ টাকা।",
  },
  {
    category: "delivery",
    qEn: "How can I check or track my order status?",
    qBn: "আমি আমার অর্ডারের বর্তমান অবস্থা কীভাবে দেখবো?",
    aEn: "Sign in to your account and visit the 'My Orders' page from the top account menu. You will see your Order ID, items, and live status (Pending, Processing, or Delivered).",
    aBn: "আপনার অ্যাকাউন্টে লগইন করে উপরের প্রোফাইল মেনু থেকে 'My Orders' পেজে গেলেই আপনার অর্ডার আইডি ও লাইভ স্ট্যাটাস (Pending, Processing বা Delivered) দেখতে পারবেন।",
  },
  {
    category: "returns",
    qEn: "What if I receive a damaged or wrong product?",
    qBn: "ভুল বা ক্ষতিগ্রস্ত পণ্য পেলে কী করবো?",
    aEn: "We offer a 7-day easy return & replacement policy for any damaged, leaked, or wrong item. Just message us on WhatsApp at 01762-144200 with a quick photo of the parcel and we will resolve it promptly.",
    aBn: "ভুল বা ক্ষতিগ্রস্ত পণ্য পেলে ৭ দিনের মধ্যে সহজ রিটার্ন ও রিপ্লেসমেন্ট সুবিধা রয়েছে। শুধু পার্সেলের একটি ছবিসহ আমাদের WhatsApp (০১৭৬২-১৪৪২০০) নম্বরে মেসেজ দিন, আমরা দ্রুত সমাধান করে দেবো।",
  },
  {
    category: "returns",
    qEn: "Can I order directly on WhatsApp?",
    qBn: "আমি কি সরাসরি WhatsApp-এ অর্ডার করতে পারবো?",
    aEn: "Yes! You can place an order directly through our website checkout or tap the 'Order Now via WhatsApp' button on any product page.",
    aBn: "হ্যাঁ! ওয়েবসাইট চেকআউটের পাশাপাশি যেকোনো প্রোডাক্ট পেজে থাকা 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন' বাটনে ক্লিক করেও সহজেই অর্ডার করতে পারবেন।",
  },
];

const FaqPage = () => {
  const language = useSelector((state) => state.language?.language);
  const isBangla = language === "bn";
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(0);

  const visibleFaqs =
    activeCategory === "all"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

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
              {isBangla ? "সাধারণ জিজ্ঞাসা (FAQ)" : "FAQ"}
            </span>
          </nav>

          <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
            {isBangla ? (
              <>
                সাধারণ <span className="text-[#efc477]">প্রশ্ন ও উত্তর</span>
              </>
            ) : (
              <>
                Frequently Asked{" "}
                <span className="text-[#efc477]">Questions</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">
            {isBangla
              ? "পণ্য, ডেলিভারি, ক্যাশ অন ডেলিভারি ও রিটার্ন সম্পর্কিত আপনার সকল প্রশ্নের উত্তর এখানে পাবেন।"
              : "Everything you need to know about our authentic skincare products, delivery, and returns."}
          </p>
        </div>
      </section>

      <div className="wrapper mx-auto max-w-4xl px-4 sm:px-6">
        {/* ============ Category Filter Pills ============ */}
        <div className="relative z-10 -mt-5 mb-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#e9e0cf] bg-white p-3 shadow-[0_10px_28px_rgba(24,52,30,0.06)]">
          {FAQ_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key);
                  setOpenIndex(0);
                }}
                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-[#1e3f25] text-white shadow-xs"
                    : "bg-[#faf7f0] text-[#354c37] hover:bg-[#edf3e8]"
                }`}
              >
                {isBangla ? cat.bn : cat.en}
              </button>
            );
          })}
        </div>

        {/* ============ FAQ Accordion ============ */}
        <div className="space-y-3">
          {visibleFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.qEn}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? "border-[#24452c]/35 shadow-[0_10px_28px_rgba(24,52,30,0.06)]"
                    : "border-[#e9e0cf] hover:border-[#cdd8c3]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="flex items-center gap-3 text-sm font-bold text-[#162d1b] sm:text-[15px]">
                    <HelpCircle
                      size={17}
                      className="shrink-0 text-[#3e6b36]"
                    />
                    {isBangla ? item.qBn : item.qEn}
                  </span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-[#1e3f25] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[#f0e9db] bg-[#fcfaf5] px-5 py-4 pl-12 text-xs leading-relaxed text-[#4d594b] sm:px-6 sm:pl-14 sm:text-sm">
                    {isBangla ? item.aBn : item.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ============ Still Have Questions CTA ============ */}
        <section className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[#dce6d5] bg-[#f4f8f1] p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div>
            <h2 className="font-playfair !text-xl !font-bold text-[#162d1b]">
              {isBangla
                ? "আপনার প্রশ্নটির উত্তর কি এখানে নেই?"
                : "Still Have a Question?"}
            </h2>
            <p className="mt-1 !text-xs text-[#556353] sm:!text-sm">
              {isBangla
                ? "আমাদের সাথে সরাসরি WhatsApp বা Contact পেজে যোগাযোগ করুন—আমরা দ্রুত উত্তর দেবো।"
                : "Message us directly on WhatsApp or via our Contact page—we are happy to help."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Link
              href="https://wa.me/8801762144200"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1e3f25] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#142d1a]"
            >
              <MessageCircle size={15} />
              <span>{isBangla ? "WhatsApp মেসেজ" : "Chat on WhatsApp"}</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#1e3f25]/25 bg-white px-5 py-2.5 text-xs font-semibold text-[#1e3f25] transition hover:border-[#1e3f25]"
            >
              <span>{isBangla ? "যোগাযোগ পেজ" : "Contact Page"}</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FaqPage;
