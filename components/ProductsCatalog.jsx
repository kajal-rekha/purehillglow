"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Leaf,
  Tag,
  X,
} from "lucide-react";
import { addToCart } from "@/redux/features/cart/cartSlice";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const getBrand = (product, language) => {
  const brand = localized(product.brand, language);
  if (brand) return brand;

  const brandTag = product.tags?.find((tag) =>
    /^brand:/i.test(String(tag))
  );
  return brandTag ? String(brandTag).replace(/^brand:/i, "").trim() : "";
};

const ProductsCatalog = () => {
  const router = useRouter();
  const language = useSelector((state) => state.language.language);
  const dispatch = useDispatch();
  const isBangla = language === "bn";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryError, setSubcategoryError] = useState("");
  const [bestSellingIds, setBestSellingIds] = useState([]);
  const [bestSellingLoading, setBestSellingLoading] = useState(false);
  const [bestSellingError, setBestSellingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [availability, setAvailability] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("best-selling");
  const [showOffers, setShowOffers] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (router.isReady) {
      setShowOffers(router.query.filter === "offers");
      setSearch(
        typeof router.query.search === "string" ? router.query.search : ""
      );
      const queryCategoryId =
        typeof router.query.category === "string" ? router.query.category : "";
      const querySubcategoryId =
        typeof router.query.subCategory === "string"
          ? router.query.subCategory
          : "";
      setCategoryId(queryCategoryId);
      setSubcategoryId(querySubcategoryId);
      setExpandedCategoryId(queryCategoryId);
    }
  }, [
    router.isReady,
    router.query.category,
    router.query.filter,
    router.query.search,
    router.query.subCategory,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCatalogData = async () => {
      try {
        const [
          productsResponse,
          categoriesResponse,
          subcategoriesResponse,
        ] = await Promise.all([
          fetch("/api/products", { signal: controller.signal }),
          fetch("/api/categories", { signal: controller.signal }),
          fetch("/api/subcategories", { signal: controller.signal }),
        ]);

        if (!productsResponse.ok) {
          throw new Error(`Failed to load products (${productsResponse.status}).`);
        }

        const productData = await productsResponse.json();
        if (!Array.isArray(productData)) {
          throw new Error("Unexpected products response format.");
        }
        setProducts(productData);

        if (categoriesResponse.ok) {
          const categoryData = await categoriesResponse.json();
          if (Array.isArray(categoryData)) setCategories(categoryData);
        } else {
          console.error(
            `Failed to load categories (${categoriesResponse.status}).`
          );
        }

        if (subcategoriesResponse.ok) {
          const subcategoryData = await subcategoriesResponse.json();
          if (Array.isArray(subcategoryData)) {
            setSubcategories(subcategoryData);
          } else {
            throw new Error("Unexpected subcategories response format.");
          }
        } else {
          throw new Error(
            `Failed to load subcategories (${subcategoriesResponse.status}).`
          );
        }
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Failed to load product catalog:", fetchError);
          if (fetchError.message.includes("subcategories")) {
            setSubcategoryError(fetchError.message);
          } else {
            setError(fetchError.message);
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCatalogData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (sort !== "best-selling") {
      setBestSellingLoading(false);
      setBestSellingError("");
      return undefined;
    }

    const controller = new AbortController();
    const fetchBestSelling = async () => {
      setBestSellingLoading(true);
      setBestSellingError("");
      try {
        const response = await fetch("/api/products?sort=best-selling", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load best-selling order (${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected best-selling response format.");
        }
        setBestSellingIds(data.map((product) => product._id));
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Failed to load best-selling order:", fetchError);
          setBestSellingError(fetchError.message);
        }
      } finally {
        if (!controller.signal.aborted) setBestSellingLoading(false);
      }
    };

    fetchBestSelling();
    return () => controller.abort();
  }, [sort]);

  const brands = useMemo(
    () =>
      [...new Set(products.map((product) => getBrand(product, language)).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [products, language]
  );
  const maxPriceLimit = useMemo(
    () => {
      const highestProductPrice = products.reduce(
        (highest, product) =>
          Math.max(highest, Number(product.price) || 0),
        0
      );
      return Math.max(2000, Math.ceil(highestProductPrice / 100) * 100);
    },
    [products]
  );
  const minPriceValue = Math.min(Number(minPrice) || 0, maxPriceLimit);
  const maxPriceValue =
    maxPrice === "" ? maxPriceLimit : Math.min(Number(maxPrice), maxPriceLimit);
  const priceRange = maxPriceLimit
    ? {
        left: `${(minPriceValue / maxPriceLimit) * 100}%`,
        width: `${
          ((maxPriceValue - minPriceValue) / maxPriceLimit) * 100
        }%`,
      }
    : { left: "0%", width: "100%" };
  const formatPriceFilterLabel = (value) =>
    `৳${Number(value).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const bestSellingOrder = new Map(
      bestSellingIds.map((id, index) => [id, index])
    );

    const result = products.filter((product) => {
      const name = localized(product.name, language) || "";
      const description = localized(product.description, language) || "";
      const categoryName = localized(product.category_id?.name, language) || "";
      const productTags = Array.isArray(product.tags) ? product.tags.join(" ") : "";
      const searchableText =
        `${name} ${description} ${categoryName} ${productTags} ${getBrand(product, language)}`.toLocaleLowerCase();

      if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
        return false;
      }
      if (categoryId && product.category_id?._id !== categoryId) return false;
      if (
        subcategoryId &&
        product.subcategory_id?._id !== subcategoryId
      ) {
        return false;
      }
      if (brand && getBrand(product, language) !== brand) return false;
      if (availability === "in-stock" && Number(product.stock) <= 0) return false;
      if (availability === "out-of-stock" && Number(product.stock) > 0) return false;
      if (showOffers && Number(product.discount) <= 0) return false;
      if (minPrice !== "" && Number(product.price) < Number(minPrice)) return false;
      if (maxPrice !== "" && Number(product.price) > Number(maxPrice)) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "popular") {
        return Number(b.featured) - Number(a.featured);
      }
      if (sort === "best-selling") {
        const aRank = bestSellingOrder.get(a._id);
        const bRank = bestSellingOrder.get(b._id);
        if (aRank !== undefined || bRank !== undefined) {
          return (aRank ?? Number.MAX_SAFE_INTEGER) - (bRank ?? Number.MAX_SAFE_INTEGER);
        }
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [
    products,
    language,
    search,
    categoryId,
    subcategoryId,
    brand,
    availability,
    showOffers,
    minPrice,
    maxPrice,
    sort,
    bestSellingIds,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    categoryId,
    subcategoryId,
    brand,
    availability,
    minPrice,
    maxPrice,
    showOffers,
    sort,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const formatPrice = (price) =>
    `৳${Number(price).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setSubcategoryId("");
    setExpandedCategoryId("");
    setBrand("");
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setShowOffers(false);
    setSort("best-selling");
    router.replace("/products", undefined, { shallow: true });
  };

  const inputClass =
    "w-full rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2 text-sm text-[#344a31] outline-none transition placeholder:text-[#9b9b8c] focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/10";

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-10 pt-[125px] md:pt-[130px]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <section
          className="relative mb-5 min-h-[190px] overflow-hidden rounded-2xl border border-[#eee5d6] bg-[#f7f3e5] bg-cover bg-center px-5 py-5 sm:min-h-[190px] sm:px-8 sm:py-7"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(247,243,229,0.78) 0%, rgba(247,243,229,0.58) 42%, rgba(247,243,229,0.08) 100%), url('/assets/purebanner.jpg')",
            backgroundPosition: "center, center 58%",
            backgroundSize: "cover, cover",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#71814d]">
              {isBangla ? "পাহাড়ের প্রাকৃতিক যত্ন" : "Natural care from the hills"}
            </p>
            <h1 className="font-playfair text-3xl font-bold text-[#24452c] sm:text-4xl">
              {isBangla ? "আমাদের পণ্য" : "Our Products"}
            </h1>
            <p className="mt-1 max-w-sm text-sm leading-5 text-[#59634e] sm:text-base">
              {isBangla
                ? "আপনার ত্বক ও চুলের যত্নে খুঁজে নিন পছন্দের প্রাকৃতিক পণ্য।"
                : "Discover natural skincare and beauty products made for your everyday routine."}
            </p>
          </div>
        </section>

        <nav
          aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#6d7159]"
        >
          <Link href="/" className="font-semibold text-[#55713e] hover:underline">
            {isBangla ? "হোম" : "Home"}
          </Link>
          <ChevronRight size={12} />
          <span>{isBangla ? "সব পণ্য" : "Products"}</span>
        </nav>

        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-[#6d7159] sm:inline">
              {isBangla ? "সাজান:" : "Sort by:"}
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label={isBangla ? "পণ্য সাজান" : "Sort products"}
                className="appearance-none rounded-lg border border-[#e5dfd1] bg-[#fffdf8] py-2 pl-3 pr-8 text-sm font-semibold text-[#344a31] outline-none focus:border-[#78904f]"
              >
                <option value="newest">{isBangla ? "নতুন" : "Newest"}</option>
                <option value="price-low">
                  {isBangla ? "দাম: কম থেকে বেশি" : "Price: low to high"}
                </option>
                <option value="price-high">
                  {isBangla ? "দাম: বেশি থেকে কম" : "Price: high to low"}
                </option>
                <option value="popular">{isBangla ? "জনপ্রিয়" : "Popular"}</option>
                <option value="best-selling">
                  {isBangla ? "সেরা বিক্রিত" : "Best selling"}
                </option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#55713e]"
              />
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
          <p className="text-sm text-[#6d7159]">
            {loading
              ? isBangla
                ? "পণ্য লোড হচ্ছে..."
                : "Loading products..."
              : isBangla
                ? `${filteredProducts.length.toLocaleString("bn-BD")}টি পণ্য`
                : `${filteredProducts.length} products`}
          </p>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce3cf] bg-white px-3 py-2 text-sm font-semibold text-[#355b3d]"
          >
            <Filter size={14} />
            {isBangla ? "ফিল্টার" : "Filters"}
          </button>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className={`${
              filtersOpen ? "block" : "hidden"
            } space-y-3 md:sticky md:top-36 md:block`}
          >
            <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#344a31]">
                <Leaf size={15} className="text-[#55713e]" />
                {isBangla ? "ক্যাটাগরি অনুযায়ী খুঁজুন" : "Shop by Category"}
              </h2>
              <button
                type="button"
                onClick={clearFilters}
                aria-pressed={
                  !search &&
                  !categoryId &&
                  !subcategoryId &&
                  !showOffers &&
                  !brand &&
                  availability === "all" &&
                  minPrice === "" &&
                  maxPrice === ""
                }
                className="mb-1 w-full rounded-lg px-2 py-2 text-left text-[13px] font-semibold text-[#355b3d] transition hover:bg-[#edf0df]"
              >
                {isBangla ? "সব পণ্য দেখুন" : "All Products"}
              </button>
              <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
                {categories.map((category) => {
                  const name = localized(category.name, language);
                  const categorySubcategories = subcategories.filter(
                    (subcategory) =>
                      String(subcategory.category_id?._id || subcategory.category_id) ===
                      String(category._id)
                  );
                  const isCategoryExpanded =
                    expandedCategoryId === category._id;
                  return (
                    <div key={category._id}>
                      <div
                        className={`flex items-center rounded-lg transition ${
                          categoryId === category._id
                            ? "bg-[#edf0df] font-semibold text-[#355b3d]"
                            : "text-[#55594d] hover:bg-[#f4f3e9]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryId(
                              categoryId === category._id ? "" : category._id
                            );
                            setSubcategoryId("");
                          }}
                          aria-pressed={categoryId === category._id}
                          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-[13px]"
                        >
                          <Leaf size={14} className="shrink-0 text-[#78904f]" />
                          <span className="truncate">{name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCategoryId(
                              isCategoryExpanded ? "" : category._id
                            )
                          }
                          aria-label={
                            isBangla
                              ? `${name} সাবক্যাটাগরি ${
                                  isCategoryExpanded ? "বন্ধ করুন" : "দেখুন"
                                }`
                              : `${
                                  isCategoryExpanded ? "Hide" : "Show"
                                } ${name} subcategories`
                          }
                          aria-expanded={isCategoryExpanded}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#939581] hover:bg-[#e8eddf]"
                        >
                          {isCategoryExpanded ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )}
                        </button>
                      </div>
                      {isCategoryExpanded && (
                        <div className="ml-3 border-l border-[#e5e8d9] pl-2">
                        {categorySubcategories.map((subcategory) => (
                          <button
                            key={subcategory._id}
                            type="button"
                            onClick={() => {
                              setCategoryId(category._id);
                              setSubcategoryId(
                                subcategoryId === subcategory._id
                                  ? ""
                                  : subcategory._id
                              );
                              setFiltersOpen(false);
                            }}
                            aria-pressed={subcategoryId === subcategory._id}
                            className={`flex w-full items-center rounded-lg px-2 py-1.5 text-left text-xs transition ${
                              subcategoryId === subcategory._id
                                ? "font-semibold text-[#355b3d]"
                                : "text-[#66695c] hover:bg-[#f4f3e9]"
                            }`}
                          >
                            <span className="flex-1">
                              {localized(subcategory.name, language)}
                            </span>
                          </button>
                        ))}
                        {categorySubcategories.length === 0 && (
                          <p className="px-2 py-1.5 text-xs text-[#858477]">
                            {isBangla
                              ? "কোনো সাবক্যাটাগরি নেই"
                              : "No subcategories available"}
                          </p>
                        )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {subcategoryError && (
                  <p role="alert" className="px-2 py-1 text-xs text-red">
                    {subcategoryError}
                  </p>
                )}
                {categories.length === 0 && (
                  <p className="text-xs text-[#858477]">
                    {isBangla ? "ক্যাটাগরি পাওয়া যায়নি" : "No categories available"}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#242a22]">
                <Tag size={18} fill="currentColor" className="text-[#24452c]" />
                {isBangla ? "দাম অনুযায়ী ফিল্টার" : "Filter by Price"}
              </h2>
              <div className="px-1">
                <div className="relative h-5">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#d9dfd4]" />
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#24452c]"
                    style={priceRange}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPriceLimit}
                    step="10"
                    value={minPriceValue}
                    onChange={(event) => {
                      const nextValue = Math.min(
                        Number(event.target.value),
                        maxPriceValue - 10
                      );
                      setMinPrice(String(Math.max(0, nextValue)));
                    }}
                    aria-label={isBangla ? "সর্বনিম্ন দাম" : "Minimum price"}
                    className="price-range-input z-20"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPriceLimit}
                    step="10"
                    value={maxPriceValue}
                    onChange={(event) => {
                      const nextValue = Math.max(
                        Number(event.target.value),
                        minPriceValue + 10
                      );
                      setMaxPrice(
                        nextValue >= maxPriceLimit ? "" : String(nextValue)
                      );
                    }}
                    aria-label={isBangla ? "সর্বোচ্চ দাম" : "Maximum price"}
                    className="price-range-input z-10"
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm font-semibold text-[#363a33]">
                  <span>{formatPriceFilterLabel(minPriceValue)}</span>
                  <span>
                    {formatPriceFilterLabel(maxPriceValue)}
                    {maxPriceValue >= maxPriceLimit ? "+" : ""}
                  </span>
                </div>
              </div>
            </section>

            {/* <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-sm">
              <h2 className="mb-2 text-sm font-bold text-[#344a31]">
                {isBangla ? "ব্র্যান্ড" : "Brand"}
              </h2>
              {brands.length > 0 ? (
                <div className="space-y-1.5">
                  {brands.map((brandName) => (
                    <label
                      key={brandName}
                      className="flex cursor-pointer items-center gap-2 text-xs text-[#55594d]"
                    >
                      <input
                        type="radio"
                        name="brand"
                        checked={brand === brandName}
                        onChange={() =>
                          setBrand(brand === brandName ? "" : brandName)
                        }
                        className="accent-[#55713e]"
                      />
                      {brandName}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-5 text-[#858477]">
                  {isBangla
                    ? "পণ্যের তথ্যের সঙ্গে ব্র্যান্ড যোগ করা হলে এখানে দেখাবে।"
                    : "Brand filters will appear when brand details are added to products."}
                </p>
              )}
            </section> */}

            <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-sm">
              <h2 className="mb-2 text-sm font-bold text-[#344a31]">
                {isBangla ? "পণ্যের প্রাপ্যতা" : "Availability"}
              </h2>
              <div className="space-y-1.5">
                {[
                  ["all", isBangla ? "যেকোনো প্রাপ্যতা" : "Any availability"],
                  ["in-stock", isBangla ? "স্টকে আছে" : "In stock"],
                  ["out-of-stock", isBangla ? "স্টকে নেই" : "Out of stock"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-xs text-[#55594d]"
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === value}
                      onChange={() => setAvailability(value)}
                      className="accent-[#55713e]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg border border-[#78947d] bg-transparent px-3 py-2 text-xs font-semibold text-[#355b3d] transition hover:bg-[#355b3d] hover:text-white"
            >
              {isBangla ? "সব ফিল্টার মুছুন" : "Clear All Filters"}
            </button>
          </aside>

          <section aria-label={isBangla ? "পণ্য" : "Products"}>
            <div className="mb-3 hidden items-center justify-between lg:flex">
              <p className="text-sm text-[#6d7159]">
                {loading
                  ? isBangla
                    ? "পণ্য লোড হচ্ছে..."
                    : "Loading products..."
                  : isBangla
                    ? `${filteredProducts.length.toLocaleString("bn-BD")}টি পণ্য`
                    : `${filteredProducts.length} products`}
              </p>
              {categoryId && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId("");
                    setSubcategoryId("");
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#edf0df] px-2.5 py-1 text-xs font-semibold text-[#526c3c]"
                >
                  {localized(
                    categories.find((item) => item._id === categoryId)?.name,
                    language
                  )}
                  {subcategoryId &&
                    ` · ${localized(
                      subcategories.find(
                        (item) => item._id === subcategoryId
                      )?.name,
                      language
                    )}`}
                  <X size={12} />
                </button>
              )}
            </div>

            {loading || (sort === "best-selling" && bestSellingLoading) ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loading />
              </div>
            ) : error ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
                <Error
                  error={
                    isBangla
                      ? "পণ্যগুলো লোড করা যায়নি। আবার চেষ্টা করুন।"
                      : error
                  }
                />
              </div>
            ) : sort === "best-selling" && bestSellingError ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
                <Error
                  error={
                    isBangla
                      ? "বিক্রির তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।"
                      : bestSellingError
                  }
                />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9dfc8] bg-white/60 py-16 text-center">
                <p className="text-sm font-semibold text-[#46543b]">
                  {isBangla ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}
                </p>
                <p className="mt-1 text-sm text-[#81816f]">
                  {isBangla
                    ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                    : "Try changing or clearing your filters."}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm font-semibold text-[#55713e] underline underline-offset-2"
                >
                  {isBangla ? "ফিল্টার মুছুন" : "Clear filters"}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
                  {paginatedProducts.map((product) => {
                    const name =
                      localized(product.name, language) ||
                      (isBangla ? "পণ্য" : "Product");
                    const discount = Number(product.discount) || 0;
                    const originalPrice =
                      discount > 0 && discount < 100
                        ? Math.round(product.price / (1 - discount / 100))
                        : null;
                    const isNew =
                      product.createdAt &&
                      Date.now() - new Date(product.createdAt).getTime() <
                        30 * 24 * 60 * 60 * 1000;

                    return (
                      <article
                        key={product._id}
                        className="flex h-full flex-col overflow-hidden rounded-xl border border-[#eee8df] bg-white p-2 shadow-sm transition-shadow hover:shadow-md sm:p-2.5"
                      >
                        <Link
                          href={`/products/${product._id}`}
                          aria-label={
                            isBangla
                              ? `${name} পণ্যের বিস্তারিত দেখুন`
                              : `View details for ${name}`
                          }
                          className="group"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f0eadc]">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={name}
                                fill
                                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 20vw"
                                className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105 sm:p-2"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-dark/60">
                                {isBangla ? "ছবি নেই" : "No image"}
                              </div>
                            )}
                            {(isNew || product.featured || discount > 0) && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-[#fffdf8]/95 px-2 py-1 text-[11px] font-bold text-[#355b3d] shadow-sm">
                                {discount > 0
                                  ? `-${discount}%`
                                  : isNew
                                    ? isBangla
                                      ? "নতুন"
                                      : "New"
                                    : isBangla
                                      ? "জনপ্রিয়"
                                      : "Popular"}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 line-clamp-2 min-h-8 text-xs font-semibold leading-5 text-[#344a31] sm:text-sm">
                            {name}
                          </p>
                        </Link>

                        <div className="mt-1 flex min-h-6 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="text-sm font-bold text-[#285b35] sm:text-base">
                            {formatPrice(product.price)}
                          </span>
                          {originalPrice && (
                            <>
                              <span className="text-[11px] text-dark/45 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                              <span className="rounded-full bg-[#ffe4df] px-1.5 py-0.5 text-[10px] font-semibold text-[#c4473e]">
                                {discount}% {isBangla ? "ছাড়" : "OFF"}
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => dispatch(addToCart(product))}
                          disabled={Number(product.stock) <= 0}
                          className="mt-auto w-full rounded-md border border-[#78947d] px-1.5 py-1.5 text-xs font-semibold text-[#355b3d] transition hover:bg-[#355b3d] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 sm:mt-2 sm:text-sm"
                        >
                          {Number(product.stock) <= 0
                            ? isBangla
                              ? "স্টকে নেই"
                              : "Out of stock"
                            : isBangla
                              ? "কার্টে যোগ করুন"
                              : "Add to Cart"}
                        </button>
                      </article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label={isBangla ? "পণ্য পৃষ্ঠা" : "Product pages"}
                    className="mt-5 flex items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                      aria-label={isBangla ? "আগের পৃষ্ঠা" : "Previous page"}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5dfd1] bg-white text-[#526c3c] disabled:opacity-40"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .slice(
                        Math.max(0, Math.min(page - 3, totalPages - 5)),
                        Math.max(5, Math.min(page + 2, totalPages))
                      )
                      .map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          aria-current={page === pageNumber ? "page" : undefined}
                          className={`h-8 min-w-8 rounded-full px-2 text-sm font-semibold ${
                            page === pageNumber
                              ? "bg-[#24452c] text-white"
                              : "border border-[#e5dfd1] bg-white text-[#526c3c]"
                          }`}
                        >
                          {pageNumber.toLocaleString(isBangla ? "bn-BD" : "en-BD")}
                        </button>
                      ))}
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={page === totalPages}
                      aria-label={isBangla ? "পরের পৃষ্ঠা" : "Next page"}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5dfd1] bg-white text-[#526c3c] disabled:opacity-40"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductsCatalog;
