"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { toggleWishlist } from "@/redux/features/wishlist/wishlistSlice";
import toast from "react-hot-toast";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const toSlug = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getBrand = (product, language) => {
  const brand = localized(product.brand, language);
  if (brand) return brand;

  const brandTag = product.tags?.find((tag) =>
    /^brand:/i.test(String(tag))
  );
  return brandTag ? String(brandTag).replace(/^brand:/i, "").trim() : "";
};

/* ============ In-Memory Catalog Cache ============ */
const catalogCache = {
  hydrated: false,
  products: [],
  categories: [],
  subcategories: [],
};

const ProductsCatalog = () => {
  const router = useRouter();
  const language = useSelector((state) => state.language.language);
  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const dispatch = useDispatch();
  const isBangla = language === "bn";
  const [products, setProducts] = useState(catalogCache.products);
  const [categories, setCategories] = useState(catalogCache.categories);
  const [subcategories, setSubcategories] = useState(catalogCache.subcategories);
  const [subcategoryError, setSubcategoryError] = useState("");
  const [bestSellingIds, setBestSellingIds] = useState([]);
  const [bestSellingLoading, setBestSellingLoading] = useState(false);
  const [bestSellingError, setBestSellingError] = useState("");
  const [loading, setLoading] = useState(!catalogCache.hydrated);
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
    if (!router.isReady) return;

    setShowOffers(router.query.filter === "offers");
    setSearch(
      typeof router.query.search === "string" ? router.query.search : ""
    );

    const rawCategory =
      typeof router.query.category === "string"
        ? router.query.category
        : typeof router.query.slug === "string"
          ? router.query.slug
          : "";

    const querySubcategoryId =
      typeof router.query.subCategory === "string"
        ? router.query.subCategory
        : "";

    setSubcategoryId(querySubcategoryId);

    if (rawCategory) {
      if (categories.length > 0) {
        const found = categories.find(
          (c) =>
            String(c._id) === String(rawCategory) ||
            String(c.slug) === String(rawCategory) ||
            toSlug(c.name?.en) === rawCategory ||
            toSlug(c.name?.bn) === rawCategory
        );
        const resolvedId = found ? found._id : rawCategory;
        setCategoryId(resolvedId);
        setExpandedCategoryId(resolvedId);
      } else {
        setCategoryId(rawCategory);
        setExpandedCategoryId(rawCategory);
      }
    } else {
      setCategoryId("");
      setExpandedCategoryId("");
    }
  }, [
    router.isReady,
    router.query.category,
    router.query.slug,
    router.query.filter,
    router.query.search,
    router.query.subCategory,
    categories,
  ]);

  /* ============ Fetch Catalog Data ============ */
  useEffect(() => {
    if (catalogCache.hydrated) return;

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
        catalogCache.products = productData;
        setProducts(productData);

        if (categoriesResponse.ok) {
          const categoryData = await categoriesResponse.json();
          if (Array.isArray(categoryData)) {
            catalogCache.categories = categoryData;
            setCategories(categoryData);
            const rawCat = router.query.category || router.query.slug;
            if (rawCat && typeof rawCat === "string") {
              const found = categoryData.find(
                (c) =>
                  String(c._id) === String(rawCat) ||
                  String(c.slug) === String(rawCat) ||
                  toSlug(c.name?.en) === rawCat ||
                  toSlug(c.name?.bn) === rawCat
              );
              if (found) {
                setCategoryId(found._id);
                setExpandedCategoryId(found._id);
              }
            }
          }
        }

        if (subcategoriesResponse.ok) {
          const subcategoryData = await subcategoriesResponse.json();
          if (Array.isArray(subcategoryData)) {
            catalogCache.subcategories = subcategoryData;
            setSubcategories(subcategoryData);
          } else {
            throw new Error("Unexpected subcategories response format.");
          }
        } else {
          throw new Error(
            `Failed to load subcategories (${subcategoriesResponse.status}).`
          );
        }

        catalogCache.hydrated = true;
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
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

  const activeCategory = useMemo(() => {
    if (!categoryId) return null;
    return (
      categories.find(
        (c) =>
          String(c._id) === String(categoryId) ||
          String(c.slug) === String(categoryId) ||
          toSlug(c.name?.en) === categoryId ||
          toSlug(c.name?.bn) === categoryId
      ) || null
    );
  }, [categories, categoryId]);

  const activeSubcategory = useMemo(() => {
    if (!subcategoryId) return null;
    return (
      subcategories.find(
        (s) => String(s._id) === String(subcategoryId)
      ) || null
    );
  }, [subcategories, subcategoryId]);

  const activeCategorySubcategories = useMemo(() => {
    if (!activeCategory) return [];
    return subcategories.filter(
      (sub) =>
        String(sub.category_id?._id || sub.category_id) ===
        String(activeCategory._id)
    );
  }, [subcategories, activeCategory]);

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
      width: `${((maxPriceValue - minPriceValue) / maxPriceLimit) * 100
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
      if (categoryId) {
        const prodCatId = String(
          product.category_id?._id || product.category_id || ""
        );
        if (prodCatId !== String(categoryId)) return false;
      }
      if (subcategoryId) {
        const prodSubId = String(
          product.subcategory_id?._id || product.subcategory_id || ""
        );
        if (prodSubId !== String(subcategoryId)) return false;
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
    if (router.pathname !== "/products") {
      router.push("/products");
    } else {
      router.replace("/products", undefined, { shallow: true });
    }
  };

  const hasActiveFilters = Boolean(
    search ||
    categoryId ||
    subcategoryId ||
    showOffers ||
    brand ||
    availability !== "all" ||
    minPrice !== "" ||
    maxPrice !== ""
  );

  useEffect(() => {
    if (filtersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  const renderFilterSections = (isMobile = false) => (
    <div className="divide-y divide-[#efe8da] overflow-hidden rounded-2xl border border-[#e9e0cf] bg-white/95 shadow-[0_10px_30px_rgba(24,52,30,0.04)]">
      {/* ============ Shop by Category ============ */}
      <section className="p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1c3922]">
          <Leaf size={14} className="text-[#3f6b36]" />
          {isBangla ? "ক্যাটাগরি" : "Categories"}
        </h2>
        <button
          type="button"
          onClick={() => {
            clearFilters();
            if (isMobile) setFiltersOpen(false);
          }}
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
          className={`mb-1.5 flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition ${
            !categoryId && !subcategoryId
              ? "bg-[#1e3f25] text-white shadow-xs"
              : "text-[#2c4731] hover:bg-[#f2f5ec]"
          }`}
        >
          <span>{isBangla ? "সব পণ্য দেখুন" : "All Products"}</span>
          <span
            className={`text-[11px] ${
              !categoryId && !subcategoryId ? "text-white/80" : "text-[#7c8576]"
            }`}
          >
            {products.length}
          </span>
        </button>

        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {categories.map((category) => {
            const name = localized(category.name, language);
            const categorySubcategories = subcategories.filter(
              (subcategory) =>
                String(subcategory.category_id?._id || subcategory.category_id) ===
                String(category._id)
            );
            const isCategoryExpanded = expandedCategoryId === category._id;
            const isSelected = categoryId === category._id;

            return (
              <div key={category._id}>
                <div
                  className={`flex items-center rounded-xl transition ${
                    isSelected
                      ? "bg-[#eaf1e3] font-semibold text-[#1b3a21]"
                      : "text-[#4c5548] hover:bg-[#f6f4ec]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId(isSelected ? "" : category._id);
                      setSubcategoryId("");
                      if (!isSelected) setExpandedCategoryId(category._id);
                      if (isMobile) setFiltersOpen(false);
                    }}
                    aria-pressed={isSelected}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px]"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isSelected ? "bg-[#1e3f25]" : "bg-[#b6c2ae]"
                      }`}
                    />
                    <span className="truncate">{name}</span>
                  </button>
                  {categorySubcategories.length > 0 && (
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
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#7c8475] hover:bg-[#dde6d4] hover:text-[#1b3a21]"
                    >
                      {isCategoryExpanded ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </button>
                  )}
                </div>

                {isCategoryExpanded && categorySubcategories.length > 0 && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-[#e3dccb] pl-2.5">
                    {categorySubcategories.map((subcategory) => {
                      const isSubSelected = subcategoryId === subcategory._id;
                      return (
                        <button
                          key={subcategory._id}
                          type="button"
                          onClick={() => {
                            setCategoryId(category._id);
                            setSubcategoryId(
                              isSubSelected ? "" : subcategory._id
                            );
                            if (isMobile) setFiltersOpen(false);
                          }}
                          aria-pressed={isSubSelected}
                          className={`flex w-full cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            isSubSelected
                              ? "bg-[#f3f6ee] font-semibold text-[#1e3f25]"
                              : "text-[#636b5e] hover:bg-[#f7f4ec] hover:text-[#1e3f25]"
                          }`}
                        >
                          <span className="truncate">
                            {localized(subcategory.name, language)}
                          </span>
                        </button>
                      );
                    })}
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

      {/* ============ Filter by Price ============ */}
      <section className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1c3922]">
            <Tag size={13} className="text-[#3f6b36]" />
            {isBangla ? "দাম" : "Price Range"}
          </h2>
          <span className="rounded-full bg-[#f3f6ee] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e3f25]">
            {formatPriceFilterLabel(minPriceValue)} –{" "}
            {formatPriceFilterLabel(maxPriceValue)}
            {maxPriceValue >= maxPriceLimit ? "+" : ""}
          </span>
        </div>

        <div className="px-1 pt-1">
          <div className="relative h-5">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#e3e7dc]" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1e3f25]"
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
          <div className="mt-2 flex justify-between text-[11px] font-medium text-[#70786b]">
            <span>{formatPriceFilterLabel(0)}</span>
            <span>{formatPriceFilterLabel(maxPriceLimit)}+</span>
          </div>
        </div>
      </section>

      {/* ============ Availability ============ */}
      <section className="p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#1c3922]">
          {isBangla ? "স্টক অবস্থা" : "Availability"}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["all", isBangla ? "সব" : "All"],
            ["in-stock", isBangla ? "স্টকে আছে" : "In Stock"],
            ["out-of-stock", isBangla ? "স্টক শেষ" : "Out of Stock"],
          ].map(([value, label]) => {
            const active = availability === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setAvailability(value)}
                aria-pressed={active}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#1e3f25] text-white shadow-xs"
                    : "border border-[#e3dac7] bg-[#faf7f0] text-[#4c5649] hover:border-[#1e3f25]/40 hover:bg-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#faf6ee] pb-14 pt-[124px] md:pt-[132px]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* ============ Editorial Botanical Collection Banner ============ */}
        <section
          className="relative mb-6 overflow-hidden rounded-2xl border border-[#e7ddc9] bg-[#f4efe1] bg-cover bg-center px-5 py-6 shadow-[0_14px_36px_rgba(24,52,30,0.06)] sm:rounded-3xl sm:px-9 sm:py-8 lg:min-h-[230px] lg:py-9"
          style={{
            backgroundImage:
              "linear-gradient(95deg, rgba(250,246,238,0.95) 0%, rgba(250,246,238,0.82) 44%, rgba(250,246,238,0.18) 76%, rgba(250,246,238,0.04) 100%), url('/assets/purebanner.jpg')",
            backgroundPosition: "center, right center",
            backgroundSize: "cover, cover",
          }}
        >
          <div className="relative z-10 flex max-w-2xl flex-col items-start">
            {/* Integrated Editorial Breadcrumb */}
            <nav
              aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
              className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#5e6a59]"
            >
              <Link href="/" className="transition hover:text-[#1e3f25]">
                {isBangla ? "হোম" : "Home"}
              </Link>
              <ChevronRight size={11} className="text-[#9ea596]" />
              <Link
                href="/products"
                onClick={clearFilters}
                className={`transition hover:text-[#1e3f25] ${
                  !activeCategory ? "font-semibold text-[#1e3f25]" : ""
                }`}
              >
                {isBangla ? "সব পণ্য" : "Products"}
              </Link>
              {activeCategory && (
                <>
                  <ChevronRight size={11} className="text-[#9ea596]" />
                  <button
                    type="button"
                    onClick={() => setSubcategoryId("")}
                    className={`cursor-pointer transition hover:text-[#1e3f25] ${
                      !activeSubcategory ? "font-semibold text-[#1e3f25]" : ""
                    }`}
                  >
                    {localized(activeCategory.name, language)}
                  </button>
                </>
              )}
              {activeSubcategory && (
                <>
                  <ChevronRight size={11} className="text-[#9ea596]" />
                  <span className="font-semibold text-[#1e3f25]">
                    {localized(activeSubcategory.name, language)}
                  </span>
                </>
              )}
            </nav>

            {/* Botanical Collection Eyebrow */}
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#24452c]/15 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#24452c] backdrop-blur-sm">
              <Sparkles size={11} className="text-[#b8893b]" />
              {showOffers
                ? isBangla
                  ? "বিশেষ অফার সংগ্রহ"
                  : "Special Offers"
                : isBangla
                  ? "খাঁটি পাহাড়ি স্কিনকেয়ার সংগ্রহ"
                  : "Authentic Botanical Collection"}
            </span>

            {/* Display Title */}
            <h1 className="font-playfair text-2xl font-bold leading-tight tracking-[-0.015em] text-[#152e1b] sm:text-4xl">
              {activeSubcategory
                ? localized(activeSubcategory.name, language)
                : activeCategory
                  ? localized(activeCategory.name, language)
                  : showOffers
                    ? isBangla
                      ? "হট অফার ও ডিসকাউন্ট"
                      : "Hot Offers & Deals"
                    : isBangla
                      ? "আমাদের সব স্কিনকেয়ার পণ্য"
                      : "Our Botanical Collection"}
            </h1>

            {/* Gold Accent Divider */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="h-[2px] w-9 rounded-full bg-[#c49a4c]" />
              <span className="h-1 w-1 rounded-full bg-[#24452c]/40" />
            </div>

            {/* Subtitle */}
            <p className="mt-2.5 max-w-lg text-xs leading-relaxed text-[#465344] sm:text-sm sm:leading-6">
              {activeCategory
                ? isBangla
                  ? `${localized(activeCategory.name, "bn")} ক্যাটাগরির ১০০% আসল ও যত্নসহকারে বাছাইকৃত পাহাড়ি স্কিনকেয়ার পণ্যসমূহ।`
                  : `Carefully curated 100% authentic hill & botanical skincare in ${localized(activeCategory.name, "en")}.`
                : isBangla
                  ? "বান্দরবান, মিয়ানমার ও থাইল্যান্ডের খাঁটি ঐতিহ্যবাহী স্কিনকেয়ার ও ভেষজ পণ্য আবিষ্কার করুন।"
                  : "Discover 100% authentic traditional skincare & botanical essentials from Bandarban, Myanmar & Thailand."}
            </p>

            {/* Authenticity Trust Micro-Pill */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-1.5 text-[11px] font-semibold text-[#1e3f25] shadow-xs backdrop-blur-sm">
              <ShieldCheck size={14} className="text-[#2b6236]" />
              <span>
                {isBangla
                  ? "১০০% অরিজিনাল পণ্য • সরাসরি বান্দরবান থেকে"
                  : "100% Original Products • Direct from Bandarban"}
              </span>
            </div>
          </div>
        </section>

        {/* ============ Subcategory Quick-Filter Pill Strip ============ */}
        {activeCategory && activeCategorySubcategories.length > 0 && (
          <div className="no-scrollbar mb-5 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSubcategoryId("")}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                !subcategoryId
                  ? "bg-[#1e3f25] text-white shadow-xs"
                  : "border border-[#e5dcc9] bg-white text-[#354c37] hover:border-[#1e3f25]/40 hover:bg-[#f4f7f0]"
              }`}
            >
              {isBangla ? "সবগুলো" : `All ${localized(activeCategory.name, "en")}`}
            </button>
            {activeCategorySubcategories.map((sub) => {
              const isSubActive = subcategoryId === sub._id;
              return (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() =>
                    setSubcategoryId(isSubActive ? "" : sub._id)
                  }
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isSubActive
                      ? "bg-[#1e3f25] text-white shadow-xs"
                      : "border border-[#e5dcc9] bg-white text-[#354c37] hover:border-[#1e3f25]/40 hover:bg-[#f4f7f0]"
                  }`}
                >
                  {localized(sub.name, language)}
                </button>
              );
            })}
          </div>
        )}

        {/* ============ Mobile Controls Bar ============ */}
        <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-[#ece3d2] bg-white/90 px-3 py-2.5 shadow-2xs md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#dce3cf] bg-[#f4f7f0] px-3.5 py-1.5 text-xs font-semibold text-[#1e3f25] active:bg-[#e5ecdd]"
          >
            <SlidersHorizontal size={13} />
            <span>{isBangla ? "ফিল্টার" : "Filters"}</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#1e3f25]" />
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-[#646e5f]">
              {loading
                ? "..."
                : isBangla
                  ? `${filteredProducts.length.toLocaleString("bn-BD")}টি পণ্য`
                  : `${filteredProducts.length} items`}
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label={isBangla ? "পণ্য সাজান" : "Sort products"}
                className="appearance-none rounded-full border border-[#e3dac7] bg-[#faf7f0] py-1.5 pl-3 pr-7 text-xs font-semibold text-[#1e3f25] outline-none focus:border-[#1e3f25]"
              >
                <option value="best-selling">
                  {isBangla ? "সেরা বিক্রিত" : "Best selling"}
                </option>
                <option value="newest">{isBangla ? "নতুন" : "Newest"}</option>
                <option value="popular">{isBangla ? "জনপ্রিয়" : "Popular"}</option>
                <option value="price-low">
                  {isBangla ? "দাম: কম-বেশি" : "Price: low to high"}
                </option>
                <option value="price-high">
                  {isBangla ? "দাম: বেশি-কম" : "Price: high to low"}
                </option>
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1e3f25]"
              />
            </div>
          </div>
        </div>

        {/* ============ Mobile Slide-Over Backdrop ============ */}
        <div
          className={`fixed inset-0 z-[1001] bg-black/55 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
            filtersOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => setFiltersOpen(false)}
          aria-hidden={!filtersOpen}
        />

        {/* ============ Mobile Slide-Over Drawer ============ */}
        <aside
          className={`fixed inset-y-0 left-0 z-[1002] flex w-[86%] max-w-xs flex-col bg-[#faf6ee] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            filtersOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={isBangla ? "ফিল্টার প্যানেল" : "Filter panel"}
        >
          <div className="flex items-center justify-between border-b border-[#e9e0cf] bg-white px-4 py-3.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-[#1e3f25]" />
              <h2 className="text-sm font-bold text-[#18311d]">
                {isBangla ? "ফিল্টারসমূহ" : "Filter Products"}
              </h2>
              {hasActiveFilters && (
                <span className="rounded-full bg-[#ebf2e5] px-2 py-0.5 text-[10px] font-bold text-[#1e3f25]">
                  {isBangla ? "সক্রিয়" : "Active"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#667062] hover:bg-[#f2f5ec] hover:text-[#18311d]"
              aria-label={isBangla ? "বন্ধ করুন" : "Close"}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5">
            {renderFilterSections(true)}
          </div>

          <div className="flex gap-2.5 border-t border-[#e9e0cf] bg-white p-3.5">
            <button
              type="button"
              onClick={() => {
                clearFilters();
                setFiltersOpen(false);
              }}
              className="flex-1 cursor-pointer rounded-full border border-[#d6decb] py-2.5 text-xs font-semibold text-[#4c5649] hover:bg-[#f4f6ee]"
            >
              {isBangla ? "রিসেট করুন" : "Reset All"}
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 cursor-pointer rounded-full bg-[#1e3f25] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#142d1a]"
            >
              {isBangla
                ? `পণ্য দেখুন (${filteredProducts.length})`
                : `Show (${filteredProducts.length})`}
            </button>
          </div>
        </aside>

        {/* ============ Main Catalog Grid ============ */}
        <div className="grid items-start gap-5 md:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[264px_minmax(0,1fr)]">
          {/* ============ Desktop Botanical Sidebar ============ */}
          <aside className="hidden space-y-3 md:sticky md:top-36 md:block">
            {renderFilterSections(false)}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#1e3f25]/25 bg-white px-4 py-2.5 text-xs font-semibold text-[#1e3f25] shadow-2xs transition hover:border-[#1e3f25] hover:bg-[#1e3f25] hover:text-white"
              >
                <X size={13} />
                {isBangla ? "সব ফিল্টার মুছুন" : "Clear All Filters"}
              </button>
            )}
          </aside>

          {/* ============ Products Area ============ */}
          <section aria-label={isBangla ? "পণ্য" : "Products"}>
            {/* Unified Desktop Results & Sort Toolbar */}
            <div className="mb-4 hidden items-center justify-between gap-3 rounded-2xl border border-[#ece3d2] bg-white/85 px-4 py-2.5 shadow-2xs backdrop-blur-xs md:flex">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold text-[#4b5648] sm:text-sm">
                  {loading
                    ? isBangla
                      ? "পণ্য লোড হচ্ছে..."
                      : "Loading products..."
                    : isBangla
                      ? `মোট ${filteredProducts.length.toLocaleString("bn-BD")}টি পণ্য`
                      : `Showing ${filteredProducts.length} ${
                          filteredProducts.length === 1 ? "product" : "products"
                        }`}
                </p>

                {categoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId("");
                      setSubcategoryId("");
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#ebf2e5] px-3 py-1 text-xs font-semibold text-[#1e3f25] transition hover:bg-[#dde8d4]"
                  >
                    <span>
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
                    </span>
                    <X size={12} />
                  </button>
                )}

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#f5efe0] px-3 py-1 text-xs font-semibold text-[#7a541a]"
                  >
                    <span>&ldquo;{search}&rdquo;</span>
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-[#6c7567]">
                  {isBangla ? "সাজান:" : "Sort by:"}
                </span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    aria-label={isBangla ? "পণ্য সাজান" : "Sort products"}
                    className="cursor-pointer appearance-none rounded-full border border-[#e3dac7] bg-[#faf7f0] py-1.5 pl-3.5 pr-8 text-xs font-semibold text-[#1e3f25] outline-none transition focus:border-[#1e3f25]"
                  >
                    <option value="best-selling">
                      {isBangla ? "সেরা বিক্রিত" : "Best selling"}
                    </option>
                    <option value="newest">{isBangla ? "নতুন" : "Newest"}</option>
                    <option value="popular">
                      {isBangla ? "জনপ্রিয়" : "Popular"}
                    </option>
                    <option value="price-low">
                      {isBangla ? "দাম: কম থেকে বেশি" : "Price: low to high"}
                    </option>
                    <option value="price-high">
                      {isBangla ? "দাম: বেশি থেকে কম" : "Price: high to low"}
                    </option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1e3f25]"
                  />
                </div>
              </div>
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9d2bf] bg-white/80 px-6 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebf2e5] text-[#1e3f25]">
                  <Leaf size={24} />
                </span>
                <p className="mt-4 font-playfair text-lg font-bold text-[#18311d]">
                  {isBangla ? "কোনো পণ্য পাওয়া যায়নি" : "No Products Found"}
                </p>
                <p className="mt-1 max-w-sm text-xs text-[#667062] sm:text-sm">
                  {isBangla
                    ? "অন্য ক্যাটাগরি বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                    : "Try adjusting or clearing your filters to explore our botanical collection."}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 cursor-pointer rounded-full bg-[#1e3f25] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#142d1a]"
                >
                  {isBangla ? "সব ফিল্টার মুছুন" : "Reset All Filters"}
                </button>
              </div>
            ) : (
              <>
                {/* ============ Gallery Skincare Product Grid ============ */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {paginatedProducts.map((product) => {
                    const name =
                      localized(product.name, language) ||
                      (isBangla ? "পণ্য" : "Product");
                    const unit = localized(product.unit, language);
                    const catName = localized(
                      product.category_id?.name,
                      language
                    );
                    const discount = Number(product.discount) || 0;
                    const originalPrice =
                      discount > 0 && discount < 100
                        ? Math.round(product.price / (1 - discount / 100))
                        : null;
                    const isNew =
                      product.createdAt &&
                      Date.now() - new Date(product.createdAt).getTime() <
                        30 * 24 * 60 * 60 * 1000;

                    const isFavorite = wishlistItems.some(
                      (item) => item._id === product._id
                    );
                    const cartEntry = cartItems.find(
                      (item) => item._id === product._id
                    );
                    const isInCart = Boolean(cartEntry);
                    const isOutOfStock = Number(product.stock) <= 0;

                    return (
                      <article
                        key={product._id}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ebe3d3] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#cad6c1] hover:shadow-[0_18px_38px_rgba(24,52,30,0.09)]"
                      >
                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => dispatch(toggleWishlist(product))}
                          aria-label="Toggle wishlist"
                          aria-pressed={isFavorite}
                          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
                            isFavorite
                              ? "text-[#c0483e]"
                              : "text-[#6d7669] hover:text-[#c0483e]"
                          }`}
                        >
                          <Heart
                            size={15}
                            fill={isFavorite ? "currentColor" : "none"}
                            strokeWidth={2}
                          />
                        </button>

                        {/* Product Image Stage */}
                        <Link
                          href={`/products/${product._id}`}
                          aria-label={
                            isBangla
                              ? `${name} পণ্যের বিস্তারিত দেখুন`
                              : `View details for ${name}`
                          }
                          className="relative block aspect-square w-full overflow-hidden bg-[#f7f3ea]"
                        >
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={name}
                              fill
                              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 22vw"
                              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-dark/50">
                              {isBangla ? "ছবি নেই" : "No image"}
                            </div>
                          )}

                          {/* Single Clean Status Badge */}
                          {(discount > 0 || isNew || product.featured) && (
                            <span
                              className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-xs ${
                                discount > 0
                                  ? "bg-[#a84232] text-white"
                                  : "border border-[#e3dac7] bg-[#fffdf8]/95 text-[#1e3f25]"
                              }`}
                            >
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

                          {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                              <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#2b3028]">
                                {isBangla ? "স্টক শেষ" : "Out of Stock"}
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Product Info Body */}
                        <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                          {/* Micro Metadata (Unit / Category) */}
                          {(unit || catName) && (
                            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7a8675]">
                              {unit || catName}
                            </p>
                          )}

                          {/* Product Name */}
                          <Link
                            href={`/products/${product._id}`}
                            className="mt-1 line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold leading-snug text-[#18311d] transition-colors group-hover:text-[#2a5432] sm:text-sm"
                          >
                            {name}
                          </Link>

                          {/* Clean Price Row (No duplicate OFF badge) */}
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-[15px] font-bold text-[#1e4326] sm:text-base">
                              {formatPrice(product.price)}
                            </span>
                            {originalPrice && (
                              <span className="text-xs text-[#8f958a] line-through">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Tactile Botanical Add-to-Cart Button */}
                          <button
                            type="button"
                            onClick={() => dispatch(addToCart(product))}
                            disabled={isOutOfStock}
                            className={`mt-auto flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#e5e5e5] disabled:bg-[#f5f5f5] disabled:text-[#9a9a9a] sm:mt-3 ${
                              isInCart
                                ? "bg-[#1e3f25] text-white shadow-xs hover:bg-[#142d1a]"
                                : "border border-[#d5e1ce] bg-[#f3f7ef] text-[#1e4025] hover:border-[#1e3f25] hover:bg-[#1e3f25] hover:text-white"
                            }`}
                          >
                            {isInCart ? (
                              <>
                                <Check size={14} className="text-emerald-300" />
                                <span>
                                  {isBangla
                                    ? `কার্টে আছে (${cartEntry.cartQuantity})`
                                    : `In Cart (${cartEntry.cartQuantity})`}
                                </span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} />
                                <span>
                                  {isOutOfStock
                                    ? isBangla
                                      ? "স্টকে নেই"
                                      : "Out of stock"
                                    : isBangla
                                      ? "কার্টে যোগ করুন"
                                      : "Add to Cart"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* ============ Editorial Pagination ============ */}
                {totalPages > 1 && (
                  <nav
                    aria-label={isBangla ? "পণ্য পৃষ্ঠা" : "Product pages"}
                    className="mt-8 flex items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={page === 1}
                      aria-label={isBangla ? "আগের পৃষ্ঠা" : "Previous page"}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e3dac7] bg-white text-[#1e3f25] transition hover:border-[#1e3f25] hover:bg-[#1e3f25] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={15} className="rotate-180" />
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
                          className={`h-9 min-w-9 cursor-pointer rounded-full px-3 text-xs font-bold transition ${
                            page === pageNumber
                              ? "bg-[#1e3f25] text-white shadow-xs"
                              : "border border-[#e3dac7] bg-white text-[#354c37] hover:border-[#1e3f25]/40 hover:bg-[#f4f7f0]"
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
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e3dac7] bg-white text-[#1e3f25] transition hover:border-[#1e3f25] hover:bg-[#1e3f25] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={15} />
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
