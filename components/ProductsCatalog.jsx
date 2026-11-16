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
  Filter,
  Heart,
  Leaf,
  ShoppingBag,
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
    <>
      <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-2xs">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#344a31]">
          <Leaf size={15} className="text-[#55713e]" />
          {isBangla ? "ক্যাটাগরি অনুযায়ী খুঁজুন" : "Shop by Category"}
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
                  className={`flex items-center rounded-lg transition ${categoryId === category._id
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
                      if (isMobile) setFiltersOpen(false);
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
                        ? `${name} সাবক্যাটাগরি ${isCategoryExpanded ? "বন্ধ করুন" : "দেখুন"
                        }`
                        : `${isCategoryExpanded ? "Hide" : "Show"
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
                          if (isMobile) setFiltersOpen(false);
                        }}
                        aria-pressed={subcategoryId === subcategory._id}
                        className={`flex w-full items-center rounded-lg px-2 py-1.5 text-left text-xs transition ${subcategoryId === subcategory._id
                          ? "font-semibold text-[#355b3d]"
                          : "text-[#66695c] hover:bg-[#f4f3e9]"
                          }`}
                      >
                        <span className="truncate">
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

      <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-2xs">
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

      <section className="rounded-xl border border-[#eee5d6] bg-[#fffdf8] p-3 shadow-2xs">
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
                name={`availability-${isMobile ? "mobile" : "desktop"}`}
                checked={availability === value}
                onChange={() => setAvailability(value)}
                className="accent-[#55713e]"
              />
              {label}
            </label>
          ))}
        </div>
      </section>
    </>
  );

  const inputClass =
    "w-full rounded-lg border border-[#e5dfd1] bg-[#fffdf8] px-3 py-2 text-sm text-[#344a31] outline-none transition placeholder:text-[#9b9b8c] focus:border-[#78904f] focus:ring-2 focus:ring-[#78904f]/10";

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-10 pt-[125px] md:pt-[130px]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <section
          className="relative mb-5 min-h-[140px] overflow-hidden rounded-xl border border-[#eee5d6] bg-[#f7f3e5] bg-cover bg-center px-5 py-4 sm:min-h-[180px] sm:px-8 sm:py-6 lg:min-h-[210px]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(247,243,229,0.34) 0%, rgba(247,243,229,0.2) 42%, rgba(247,243,229,0.02) 100%), url('/assets/purebanner.jpg')",
            backgroundPosition: "center, center center",
            backgroundSize: "cover, cover",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <h1 className="font-playfair text-2xl font-bold text-[#162d20] sm:text-3xl">
              {activeCategory
                ? localized(activeCategory.name, language)
                : isBangla
                  ? "আমাদের পণ্য"
                  : "Our Products"}
            </h1>
            <p className="mt-0.5 max-w-sm text-xs leading-4 text-[#344333] sm:text-sm sm:leading-5">
              {activeCategory
                ? isBangla
                  ? `${localized(activeCategory.name, "bn")} ক্যাটাগরির খাঁটি ও প্রাকৃতিক পাহাড়ি স্কিনকেয়ার পণ্যসমূহ`
                  : `Explore 100% authentic hill skincare in ${localized(activeCategory.name, "en")}`
                : isBangla
                  ? "মিয়ানমার ও থাইল্যান্ডের পাহাড়ি অঞ্চলের খাঁটি বিউটি পণ্য আবিষ্কার করুন।"
                  : "Discover authentic beauty products from the hills of Myanmar & Thailand."}
            </p>
          </div>
        </section>

        <nav
          aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
          className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-[#6d7159]"
        >
          <Link href="/" className="font-semibold text-[#55713e] hover:underline">
            {isBangla ? "হোম" : "Home"}
          </Link>
          <ChevronRight size={12} />
          <Link
            href="/products"
            onClick={clearFilters}
            className={`font-semibold hover:underline ${!activeCategory ? "text-[#344a31]" : "text-[#55713e]"
              }`}
          >
            {isBangla ? "সব পণ্য" : "Products"}
          </Link>
          {activeCategory && (
            <>
              <ChevronRight size={12} />
              <button
                type="button"
                onClick={() => setSubcategoryId("")}
                className={`font-semibold transition hover:underline ${!activeSubcategory ? "text-[#344a31]" : "text-[#55713e]"
                  }`}
              >
                {localized(activeCategory.name, language)}
              </button>
            </>
          )}
          {activeSubcategory && (
            <>
              <ChevronRight size={12} />
              <span className="font-semibold text-[#344a31]">
                {localized(activeSubcategory.name, language)}
              </span>
            </>
          )}
        </nav>

        <div className="mb-4 hidden justify-end md:flex">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6d7159]">
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

        {/* ============ Mobile controls bar: Filters button on LEFT, Products count & Sort on RIGHT ============ */}
        <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce3cf] bg-white px-3 py-2 text-xs font-semibold text-[#355b3d] shadow-xs active:bg-[#edf0df]"
          >
            <Filter size={14} />
            <span>{isBangla ? "ফিল্টার" : "Filters"}</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#55713e]" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6d7159]">
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
                className="appearance-none rounded-lg border border-[#e5dfd1] bg-[#fffdf8] py-1.5 pl-2.5 pr-7 text-xs font-semibold text-[#344a31] outline-none focus:border-[#78904f]"
              >
                <option value="newest">{isBangla ? "নতুন" : "Newest"}</option>
                <option value="price-low">
                  {isBangla ? "দাম: কম-বেশি" : "Price: low to high"}
                </option>
                <option value="price-high">
                  {isBangla ? "দাম: বেশি-কম" : "Price: high to low"}
                </option>
                <option value="popular">{isBangla ? "জনপ্রিয়" : "Popular"}</option>
                <option value="best-selling">
                  {isBangla ? "সেরা বিক্রিত" : "Best selling"}
                </option>
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#55713e]"
              />
            </div>
          </div>
        </div>

        {/* ============ Mobile Slide-Over Backdrop ============ */}
        <div
          className={`fixed inset-0 z-[1001] bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden ${filtersOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setFiltersOpen(false)}
          aria-hidden={!filtersOpen}
        />

        {/* ============ Mobile Slide-Over Drawer (slides from left to right) ============ */}
        <aside
          className={`fixed inset-y-0 left-0 z-[1002] flex w-[85%] max-w-xs flex-col bg-[#fffdf8] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${filtersOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
            }`}
          role="dialog"
          aria-modal="true"
          aria-label={isBangla ? "ফিল্টার প্যানেল" : "Filter panel"}
        >
          {/* ============ Drawer Header ============ */}
          <div className="flex items-center justify-between border-b border-[#eee5d6] bg-white px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#355b3d]" />
              <h2 className="text-sm font-bold text-[#344a31]">
                {isBangla ? "ফিল্টারসমূহ" : "Filters"}
              </h2>
              {hasActiveFilters && (
                <span className="rounded-full bg-[#edf0df] px-2 py-0.5 text-[10px] font-bold text-[#355b3d]">
                  {isBangla ? "সক্রিয়" : "Active"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6d7159] hover:bg-[#edf0df] hover:text-[#344a31]"
              aria-label={isBangla ? "বন্ধ করুন" : "Close"}
            >
              <X size={18} />
            </button>
          </div>

          {/* ============ Drawer Scrollable Content ============ */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {renderFilterSections(true)}
          </div>

          {/* ============ Drawer Footer Actions ============ */}
          <div className="flex gap-2 border-t border-[#eee5d6] bg-white p-3">
            <button
              type="button"
              onClick={() => {
                clearFilters();
                setFiltersOpen(false);
              }}
              className="flex-1 rounded-lg border border-[#dce3cf] py-2.5 text-xs font-semibold text-[#55594d] hover:bg-[#f4f3e9]"
            >
              {isBangla ? "রিসেট করুন" : "Reset All"}
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 rounded-lg bg-[#355b3d] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#28452e]"
            >
              {isBangla
                ? `পণ্য দেখুন (${filteredProducts.length})`
                : `Show (${filteredProducts.length})`}
            </button>
          </div>
        </aside>

        <div className="grid items-start gap-4 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden space-y-3 md:sticky md:top-36 md:block">
            {renderFilterSections(false)}
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

                    const isFavorite = wishlistItems.some(
                      (item) => item._id === product._id
                    );
                    const cartEntry = cartItems.find((item) => item._id === product._id);
                    const isInCart = Boolean(cartEntry);

                    return (
                      <article
                        key={product._id}
                        className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#eee8df] bg-white p-2 shadow-sm transition-shadow hover:shadow-md sm:p-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => dispatch(toggleWishlist(product))}
                          aria-label="Toggle wishlist"
                          aria-pressed={isFavorite}
                          className="absolute right-3.5 top-3.5 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#a66d65] shadow-sm transition hover:scale-105"
                        >
                          <Heart
                            size={15}
                            fill={isFavorite ? "currentColor" : "none"}
                            strokeWidth={2}
                          />
                        </button>
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
                          className={`mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 sm:mt-2 sm:text-sm ${isInCart
                            ? "bg-[#1f542c] text-white ring-1 ring-emerald-400/40 hover:bg-[#184623]"
                            : "border border-[#78947d] text-[#355b3d] hover:bg-[#355b3d] hover:text-white"
                            }`}
                        >
                          {isInCart ? (
                            <>
                              <Check size={14} className="text-emerald-300" />
                              <span>
                                {isBangla
                                  ? `কার্টে যোগ হয়েছে (${cartEntry.cartQuantity})`
                                  : `Added to Cart (${cartEntry.cartQuantity})`}
                              </span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              <span>
                                {Number(product.stock) <= 0
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
                          className={`h-8 min-w-8 rounded-full px-2 text-sm font-semibold ${page === pageNumber
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
