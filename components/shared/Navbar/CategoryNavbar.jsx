"use client";

import {
  ChevronDown,
  ChevronRight,
  Flame,
  LayoutGrid,
  Leaf,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CategoryNavbar = () => {
  const { language } = useSelector((state) => state.language);
  const isBangla = language === "bn";

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryDataLoaded, setCategoryDataLoaded] = useState(false);
  const [categoryDataLoading, setCategoryDataLoading] = useState(false);
  const [categoryDataError, setCategoryDataError] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState("");

  useEffect(() => {
    if (categoryDataLoaded) return undefined;

    const controller = new AbortController();
    const fetchCategories = async () => {
      setCategoryDataLoading(true);
      setCategoryDataError("");

      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetch("/api/categories", { signal: controller.signal }),
          fetch("/api/subcategories", { signal: controller.signal }),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error(
            `Failed to load categories (${categoriesResponse.status}).`
          );
        }
        if (!subcategoriesResponse.ok) {
          throw new Error(
            `Failed to load subcategories (${subcategoriesResponse.status}).`
          );
        }

        const [categoryData, subcategoryData] = await Promise.all([
          categoriesResponse.json(),
          subcategoriesResponse.json(),
        ]);

        if (!Array.isArray(categoryData) || !Array.isArray(subcategoryData)) {
          throw new Error("Unexpected category data format.");
        }

        setCategories(categoryData);
        setSubcategories(subcategoryData);
        setCategoryDataLoaded(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load category menu:", error);
          setCategoryDataError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setCategoryDataLoading(false);
      }
    };

    fetchCategories();
    return () => controller.abort();
  }, [categoryDataLoaded]);

  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isDrawerOpen]);

  return (
    <>
      {/* ================= HORIZONTAL CATEGORY BAR ================= */}
      <div className="fixed left-0 right-0 top-[116px] z-[997] h-13 border-b border-primary/15 bg-[#f4faf5]/95 shadow-[0_4px_20px_rgba(12,154,91,0.05)] backdrop-blur-md">
        <div className="wrapper mx-auto flex h-full items-center px-2 sm:px-4">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-controls="product-category-drawer"
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:text-sm"
          >
            <LayoutGrid size={16} />
            <span>
              {isBangla ? "সব ক্যাটাগরি" : "Browse Categories"}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isDrawerOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ================= BACKDROP ================= */}
      <button
        type="button"
        aria-label={isBangla ? "মেনু বন্ধ করুন" : "Close menu"}
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 z-[1100] cursor-default bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 ${
          isDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* ================= SLIDE-OUT CATEGORY DRAWER ================= */}
      <aside
        id="product-category-drawer"
        aria-label={isBangla ? "পণ্য ক্যাটাগরি" : "Product categories"}
        aria-hidden={!isDrawerOpen}
        className={`fixed bottom-0 left-0 top-[116px] z-[1101] flex w-[min(350px,88vw)] flex-col border-r border-[#e4ece5] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-primary/10 bg-green-light/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
              <Leaf size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#1f3b28]">
                {isBangla ? "পণ্য ক্যাটাগরি" : "Shop by Category"}
              </h2>
              <p className="text-[11px] text-black/50">
                {isBangla
                  ? "পছন্দের ক্যাটাগরি নির্বাচন করুন"
                  : "Explore natural care collections"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label={isBangla ? "বন্ধ করুন" : "Close"}
            tabIndex={isDrawerOpen ? 0 : -1}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-dark shadow-2xs transition hover:bg-red/10 hover:text-red"
          >
            <X size={17} />
          </button>
        </div>

        {/* Drawer Body */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {categoryDataLoading && (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="h-11 animate-pulse rounded-xl bg-green-light/50"
                />
              ))}
            </div>
          )}

          {categoryDataError && (
            <div className="m-2 rounded-xl border border-red/20 bg-red/5 p-4 text-center text-xs text-red">
              {isBangla
                ? "ক্যাটাগরি লোড করা যায়নি। আবার চেষ্টা করুন।"
                : categoryDataError}
            </div>
          )}

          <ul className="space-y-1">
            {categories.map((category) => {
              const categoryId = String(category._id);
              const categorySubcategories = subcategories.filter(
                (subcategory) =>
                  String(
                    subcategory.category_id?._id || subcategory.category_id
                  ) === categoryId
              );
              const isExpanded = expandedCategoryId === categoryId;
              const categoryName = isBangla
                ? category.name?.bn || category.name?.en
                : category.name?.en || category.name?.bn;

              return (
                <li
                  key={categoryId}
                  className="overflow-hidden rounded-xl border border-transparent transition hover:border-primary/15"
                >
                  <div
                    className={`flex items-center justify-between rounded-xl transition ${
                      isExpanded
                        ? "bg-green-light/60 text-primary"
                        : "hover:bg-[#f5f9f6]"
                    }`}
                  >
                    <Link
                      href={`/categories/${category.slug || categoryId}`}
                      onClick={() => setIsDrawerOpen(false)}
                      tabIndex={isDrawerOpen ? 0 : -1}
                      className="flex flex-1 items-center gap-3 px-3 py-2.5 text-sm font-semibold text-dark transition hover:text-primary"
                    >
                      {category.image ? (
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-primary/15 bg-white">
                          <Image
                            src={category.image}
                            alt={categoryName || "Category"}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Leaf size={14} />
                        </span>
                      )}
                      <span className="truncate">{categoryName}</span>
                    </Link>

                    {categorySubcategories.length > 0 && (
                      <button
                        type="button"
                        aria-label={
                          isBangla
                            ? `${categoryName} সাবক্যাটাগরি`
                            : `${categoryName} subcategories`
                        }
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedCategoryId(isExpanded ? "" : categoryId)
                        }
                        tabIndex={isDrawerOpen ? 0 : -1}
                        className="mr-1.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-black/50 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories Accordion */}
                  {isExpanded && categorySubcategories.length > 0 && (
                    <ul className="mt-1 space-y-0.5 rounded-xl bg-[#f9fbf9] py-1.5 pl-11 pr-3">
                      {categorySubcategories.map((subcategory) => {
                        const subcategoryName = isBangla
                          ? subcategory.name?.bn || subcategory.name?.en
                          : subcategory.name?.en || subcategory.name?.bn;

                        return (
                          <li key={subcategory._id}>
                            <Link
                              href={`/products?category=${encodeURIComponent(
                                categoryId
                              )}&subCategory=${encodeURIComponent(
                                subcategory._id
                              )}`}
                              onClick={() => setIsDrawerOpen(false)}
                              tabIndex={isDrawerOpen ? 0 : -1}
                              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-dark/75 transition hover:bg-green-light/60 hover:text-primary"
                            >
                              <span>{subcategoryName}</span>
                              <ChevronRight size={13} className=" opacity-50" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Drawer Footer Quick Links */}
        <div className="grid grid-cols-2 gap-2 border-t border-primary/10 bg-[#f9fbf9] p-3">
          <Link
            href="/products"
            onClick={() => setIsDrawerOpen(false)}
            tabIndex={isDrawerOpen ? 0 : -1}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-white py-2.5 text-xs font-semibold text-primary shadow-2xs transition hover:bg-primary hover:text-white"
          >
            <LayoutGrid size={14} />
            <span>{isBangla ? "সব পণ্য" : "All Products"}</span>
          </Link>

          <Link
            href="/products?filter=offers"
            onClick={() => setIsDrawerOpen(false)}
            tabIndex={isDrawerOpen ? 0 : -1}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red/20 bg-red/8 py-2.5 text-xs font-semibold text-red transition hover:bg-red hover:text-white"
          >
            <Flame size={14} />
            <span>{isBangla ? "বিশেষ অফার" : "Hot Offers"}</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default CategoryNavbar;
