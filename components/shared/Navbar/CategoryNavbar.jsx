"use client";

import { ChevronDown, Flame, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CategoryNavbar = () => {
  const { language } = useSelector((state) => state.language);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryDataLoaded, setCategoryDataLoaded] = useState(false);
  const [categoryDataLoading, setCategoryDataLoading] = useState(false);
  const [categoryDataError, setCategoryDataError] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState("");

  const categoryLinks = [
    {
      href: "/products",
      label: {
        en: "All Products",
        bn: "সব পণ্য",
      },
    },
    {
      href: "/products?filter=offers",
      label: {
        en: "Offers",
        bn: "অফার",
      },
      offer: true,
    },
  ];

  useEffect(() => {
    if (!isDrawerOpen || categoryDataLoaded) return undefined;

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
  }, [isDrawerOpen, categoryDataLoaded]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isDrawerOpen]);

  return (
    <>
      <div
        className="fixed left-0 right-0 top-[116px] z-[998] h-16 border-b border-primary/10 bg-white"
      >
        <div className="wrapper mx-auto flex h-full items-center px-4">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-controls="product-category-drawer"
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#24452c] transition hover:bg-[#eff3e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Menu size={19} />
            <span>
              {language === "bn" ? "ক্যাটাগরি দেখুন" : "Shop by Category"}
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label={language === "bn" ? "মেনু বন্ধ করুন" : "Close menu"}
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 z-[1100] cursor-default bg-black/40 transition-opacity duration-300 ${
          isDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="product-category-drawer"
        aria-label={language === "bn" ? "পণ্য ক্যাটাগরি" : "Product categories"}
        aria-hidden={!isDrawerOpen}
        className={`fixed bottom-0 left-0 top-[116px] z-[1101] w-[min(340px,88vw)] overflow-y-auto border-r border-[#e9e3d8] bg-[#fffdf8] shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">
          <h2 className="text-base font-bold text-[#24452c]">
            {language === "bn" ? "পণ্য ক্যাটাগরি" : "Shop by Category"}
          </h2>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label={language === "bn" ? "বন্ধ করুন" : "Close"}
            tabIndex={isDrawerOpen ? 0 : -1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#24452c] transition hover:bg-[#eff3e9] focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={19} />
          </button>
        </div>
        <nav>
          <ul className="py-2">
            {categoryLinks.slice(0, 1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsDrawerOpen(false)}
                  tabIndex={isDrawerOpen ? 0 : -1}
                  className={`flex min-h-12 items-center justify-between border-b border-[#f1ede5] px-5 py-3 text-base font-medium transition ${
                    link.offer
                      ? "text-red hover:bg-red/5"
                      : "text-[#3e493f] hover:bg-[#eff3e9] hover:text-[#24452c]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.offer && <Flame size={15} />}
                    {language === "bn" ? link.label.bn : link.label.en}
                  </span>
                </Link>
              </li>
            ))}
            {categoryDataLoading && (
              <li className="px-5 py-3 text-sm text-[#6d7159]">
                {language === "bn" ? "ক্যাটাগরি লোড হচ্ছে..." : "Loading categories..."}
              </li>
            )}
            {categoryDataError && (
              <li className="px-5 py-3 text-sm text-red">
                {language === "bn"
                  ? "ক্যাটাগরি লোড করা যায়নি। আবার চেষ্টা করুন।"
                  : categoryDataError}
              </li>
            )}
            {categories.map((category) => {
              const categoryId = String(category._id);
              const categorySubcategories = subcategories.filter(
                (subcategory) =>
                  String(
                    subcategory.category_id?._id || subcategory.category_id
                  ) === categoryId
              );
              const isExpanded = expandedCategoryId === categoryId;
              const categoryName =
                language === "bn"
                  ? category.name?.bn || category.name?.en
                  : category.name?.en || category.name?.bn;

              return (
                <li key={categoryId} className="border-b border-[#f1ede5]">
                  <div className="flex min-h-12 items-center">
                    <Link
                      href={`/products?category=${encodeURIComponent(categoryId)}`}
                      onClick={() => setIsDrawerOpen(false)}
                      tabIndex={isDrawerOpen ? 0 : -1}
                      className="flex min-h-12 flex-1 items-center px-5 py-3 text-base font-medium text-[#3e493f] transition hover:bg-[#eff3e9] hover:text-[#24452c]"
                    >
                      {categoryName}
                    </Link>
                    <button
                      type="button"
                      aria-label={
                        language === "bn"
                          ? `${categoryName} সাবক্যাটাগরি ${
                              isExpanded ? "বন্ধ করুন" : "দেখুন"
                            }`
                          : `${isExpanded ? "Hide" : "Show"} ${categoryName} subcategories`
                      }
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedCategoryId(isExpanded ? "" : categoryId)
                      }
                      tabIndex={isDrawerOpen ? 0 : -1}
                      className="flex h-12 w-12 shrink-0 items-center justify-center text-[#55713e] transition hover:bg-[#eff3e9]"
                    >
                      <ChevronDown
                        size={17}
                        className={`transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {isExpanded && (
                    <ul className="bg-[#f8f6ef] pb-2">
                      {categorySubcategories.length > 0 ? (
                        categorySubcategories.map((subcategory) => {
                          const subcategoryName =
                            language === "bn"
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
                                className="block border-t border-[#eee8df] py-2.5 pl-10 pr-5 text-sm text-[#59634e] transition hover:bg-[#eff3e9] hover:text-[#24452c]"
                              >
                                {subcategoryName}
                              </Link>
                            </li>
                          );
                        })
                      ) : (
                        <li className="px-10 py-2.5 text-sm text-[#8b8d7c]">
                          {language === "bn"
                            ? "কোনো সাবক্যাটাগরি নেই"
                            : "No subcategories yet"}
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
            {categoryLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsDrawerOpen(false)}
                  tabIndex={isDrawerOpen ? 0 : -1}
                  className={`flex min-h-12 items-center justify-between border-b border-[#f1ede5] px-5 py-3 text-base font-medium transition ${
                    link.offer
                      ? "text-red hover:bg-red/5"
                      : "text-[#3e493f] hover:bg-[#eff3e9] hover:text-[#24452c]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.offer && <Flame size={15} />}
                    {language === "bn" ? link.label.bn : link.label.en}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default CategoryNavbar;
