"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "./ui/Loading";
import {
  Leaf,
  Droplets,
  Sparkles,
  Package,
  FlaskConical,
  CircleDot,
  SprayCan,
  HandHeart,
  ArrowRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import Error from "./ui/Error";

/* ============ In-Memory Cache for Instant Navigation ============ */
let cachedCategories = null;

const CATEGORY_ICONS = [
  Leaf,
  Droplets,
  Sparkles,
  Package,
  FlaskConical,
  CircleDot,
  SprayCan,
  HandHeart,
];

const localized = (value, language) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return language === "bn" ? value.bn || value.en : value.en || value.bn;
};

const Category = () => {
  const [categories, setCategories] = useState(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState(null);
  const language = useSelector((state) => state.language.language);
  const isBangla = language === "bn";

  /* ============ Fetch Categories ============ */
  useEffect(() => {
    if (cachedCategories) return;

    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          cachedCategories = data;
          setCategories(data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load categories.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section
      id="shop-by-category"
      className="w-full scroll-mt-28 py-10 sm:py-14"
    >
      {loading ? (
        <div className="flex w-full justify-center py-10">
          <Loading />
        </div>
      ) : error ? (
        <div className="flex w-full flex-col items-center justify-center py-10 text-center">
          <Error />
          <p className="mt-2 text-sm text-red">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex w-full items-center justify-center py-10">
          <p className="text-sm text-[#555d4d]">
            {isBangla
              ? "বর্তমানে কোনো ক্যাটাগরি পাওয়া যায়নি।"
              : "No categories available at the moment."}
          </p>
        </div>
      ) : (
        <div className="wrapper px-4">
          {/* ============ SECTION HEADER ============ */}
          <div className="mb-7 text-center sm:mb-9">
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#406836]/20 bg-[#eef3e3] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#325b29]">
              <Leaf size={13} />
              <span>
                {isBangla ? "প্রাকৃতিক কালেকশন" : "Botanical Collections"}
              </span>
            </span>

            <h2 className="font-playfair !text-2xl !font-bold text-[#1f3823] sm:!text-3xl">
              {isBangla ? "ক্যাটাগরি অনুযায়ী শপ করুন" : "Shop by Category"}
            </h2>

            <p className="mx-auto mt-2 max-w-md !text-xs text-[#636c5b] sm:!text-sm">
              {isBangla
                ? "পাহাড়ি ভেষজ, থানাকা ও প্রাকৃতিক উপাদানে তৈরি প্রতিদিনের স্কিনকেয়ার যত্ন"
                : "Pure Thanaka, herbal care & botanical essentials sourced from Bandarban"}
            </p>
          </div>

          {/* ============ CATEGORIES RESPONSIVE GRID ============ */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
            {categories.map((category, i) => {
              const icons = [
                Leaf,
                Droplets,
                Sparkles,
                Package,
                FlaskConical,
                CircleDot,
                SprayCan,
                HandHeart,
              ];
              const CategoryIcon = icons[i % icons.length];
              const catName = localized(category.name, language);

              return (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e6decb] bg-white p-2.5 shadow-[0_4px_16px_rgba(33,59,28,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#678f56] hover:shadow-[0_12px_28px_rgba(33,59,28,0.12)] sm:p-3"
                >
                  {/* ============ Category Thumbnail Container ============ */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#f5f8f1] to-[#e8efe0]">
                    <Image
                      src={category.image}
                      alt={catName || "Category"}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-108"
                    />

                    {/* ============ Corner Icon Badge ============ */}
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#2c5224] shadow-xs backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                      <CategoryIcon size={14} strokeWidth={2} />
                    </span>
                  </div>

                  {/* ============ Category Title & Action ============ */}
                  <div className="mt-3 flex flex-1 flex-col justify-between text-center">
                    <h3 className="line-clamp-1 !text-xs !font-bold text-[#1f3823] transition-colors group-hover:text-[#285a21] sm:!text-[13px]">
                      {catName}
                    </h3>

                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-[#66725e] transition group-hover:text-[#285a21]">
                      <span>{isBangla ? "কালেকশন দেখুন" : "Explore"}</span>
                      <ArrowRight
                        size={11}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Category;
