"use client";

import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { toggleWishlist } from "@/redux/features/wishlist/wishlistSlice";
import {
    ChevronRight,
    Heart,
    Leaf,
    Search,
    ShoppingBag,
    ShoppingCart,
    SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

const SLUG_LABELS = {
    thanaka: { en: "Thanaka", bn: "থানাকা" },
    "face-care": { en: "Face Care", bn: "ফেস কেয়ার" },
    "soap-cleansing": { en: "Soap & Cleansing", bn: "সাবান ও ক্লিনজিং" },
    "lotion-moisturizer": {
        en: "Lotion & Moisturizer",
        bn: "লোশন ও ময়েশ্চারাইজার",
    },
    "chandan-sandalwood": {
        en: "Chandan & Sandalwood",
        bn: "চন্দন ও চন্দনজাত",
    },
    "balm-wellness": { en: "Balm & Wellness", bn: "বাম ও ওয়েলনেস" },
    "combo-packs": { en: "Combo Packs", bn: "কম্বো প্যাক" },
};

const CategoryDetailsPage = () => {
    const router = useRouter();
    const { slug } = router.query;
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language?.language);
    const wishlistItems = useSelector(
        (state) => state.wishlist?.wishlistItems || []
    );
    const isBangla = language === "bn";

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSubcategory, setSelectedSubcategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        setSelectedSubcategory("all");
        setSearchQuery("");
    }, [slug]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchAll = async () => {
            setLoading(true);
            setError("");
            try {
                const [catRes, subRes, prodRes] = await Promise.all([
                    fetch("/api/categories", { signal: controller.signal }),
                    fetch("/api/subcategories", { signal: controller.signal }),
                    fetch("/api/products", { signal: controller.signal }),
                ]);

                if (!prodRes.ok) {
                    throw new Error("Failed to load products.");
                }

                const [catData, subData, prodData] = await Promise.all([
                    catRes.ok ? catRes.json() : [],
                    subRes.ok ? subRes.json() : [],
                    prodRes.json(),
                ]);

                setCategories(Array.isArray(catData) ? catData : []);
                setSubcategories(Array.isArray(subData) ? subData : []);
                setProducts(Array.isArray(prodData) ? prodData : []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Failed to load category data.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchAll();
        return () => controller.abort();
    }, []);

    // Match category by _id, slug, or keyword
    const activeCategory = useMemo(() => {
        if (!slug || categories.length === 0) return null;
        const normalizedSlug = String(slug).toLowerCase();

        return (
            categories.find(
                (cat) =>
                    String(cat._id) === String(slug) ||
                    cat.slug?.toLowerCase() === normalizedSlug ||
                    toSlug(cat.name?.en) === normalizedSlug
            ) ||
            categories.find((cat) => {
                const catSlug = toSlug(cat.name?.en);
                const tokens = normalizedSlug.split("-").filter(Boolean);
                return tokens.some(
                    (token) => token.length > 2 && catSlug.includes(token)
                );
            }) ||
            null
        );
    }, [slug, categories]);

    const categorySubcategories = useMemo(() => {
        if (!activeCategory) return [];
        return subcategories.filter(
            (sub) =>
                String(sub.category_id?._id || sub.category_id) ===
                String(activeCategory._id)
        );
    }, [activeCategory, subcategories]);

    const filteredProducts = useMemo(() => {
        if (!slug) return [];
        const normalizedSlug = String(slug).toLowerCase();
        const keywords = normalizedSlug.split("-").filter((w) => w.length > 2);

        const matchesCategory = products.filter((product) => {
            if (activeCategory) {
                const prodCatId = String(
                    product.category_id?._id || product.category_id || ""
                );
                if (prodCatId === String(activeCategory._id)) return true;
            }

            // Fallback keyword match for navbar static slugs
            const haystack = [
                product.name?.en,
                product.name?.bn,
                product.category_id?.name?.en,
                product.category_id?.name?.bn,
                product.subcategory_id?.name?.en,
                ...(Array.isArray(product.tags) ? product.tags : []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return keywords.some((kw) => haystack.includes(kw));
        });

        const matchesSubAndSearch = matchesCategory.filter((product) => {
            if (selectedSubcategory !== "all") {
                const subId = String(
                    product.subcategory_id?._id || product.subcategory_id || ""
                );
                if (subId !== selectedSubcategory) return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const nameEn = (product.name?.en || "").toLowerCase();
                const nameBn = (product.name?.bn || "").toLowerCase();
                if (!nameEn.includes(q) && !nameBn.includes(q)) return false;
            }

            return true;
        });

        return [...matchesSubAndSearch].sort((a, b) => {
            if (sortBy === "price-low") {
                return (Number(a.price) || 0) - (Number(b.price) || 0);
            }
            if (sortBy === "price-high") {
                return (Number(b.price) || 0) - (Number(a.price) || 0);
            }
            if (sortBy === "popular") {
                return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
            }
            return (
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            );
        });
    }, [products, activeCategory, slug, selectedSubcategory, searchQuery, sortBy]);

    const categoryTitle = useMemo(() => {
        if (activeCategory) {
            return localized(activeCategory.name, language);
        }
        const fallback = SLUG_LABELS[String(slug || "").toLowerCase()];
        if (fallback) {
            return isBangla ? fallback.bn : fallback.en;
        }
        return String(slug || "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }, [activeCategory, slug, language, isBangla]);

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

    return (
        <main className="min-h-screen bg-[#fbf8f2] pb-16 pt-[125px]">
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
                <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
                <Leaf
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
                />
                <div className="wrapper relative mx-auto flex min-h-36 flex-col justify-center px-4 py-6 sm:px-6">
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-2.5 flex flex-wrap items-center gap-2 text-[11px] text-white/75"
                    >
                        <Link href="/" className="hover:text-white">
                            {isBangla ? "হোম" : "Home"}
                        </Link>
                        <ChevronRight size={13} />
                        <Link href="/products" className="hover:text-white">
                            {isBangla ? "সব পণ্য" : "Products"}
                        </Link>
                        <ChevronRight size={13} />
                        <span>{categoryTitle}</span>
                    </nav>
                    <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
                        {categoryTitle}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {isBangla
                            ? `${categoryTitle} ক্যাটাগরির খাঁটি ও প্রাকৃতিক পণ্যসমূহ`
                            : `Explore 100% authentic hill products in ${categoryTitle}`}
                    </p>
                </div>
            </section>

            <div className="wrapper mx-auto px-4 sm:px-6">
                {/* Category Switcher Pills */}
                {categories.length > 0 && (
                    <div className="relative z-10 -mt-5 mb-6 flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#eee5d6] bg-white p-3 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <Link
                            href="/products"
                            className="shrink-0 rounded-xl bg-[#f4f7f3] px-3.5 py-2 text-xs font-semibold text-dark transition hover:bg-primary hover:text-white"
                        >
                            {isBangla ? "সব পণ্য" : "All Products"}
                        </Link>
                        {categories.map((cat) => {
                            const isCurrent =
                                activeCategory &&
                                String(cat._id) === String(activeCategory._id);
                            return (
                                <Link
                                    key={cat._id}
                                    href={`/categories/${cat.slug || cat._id}`}
                                    className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                        isCurrent
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-[#f4f7f3] text-dark hover:bg-green-light/70 hover:text-primary"
                                    }`}
                                >
                                    {localized(cat.name, language)}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Subcategories + Search + Sort Bar */}
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.05)] md:flex-row md:items-center md:justify-between">
                    {/* Subcategory Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedSubcategory("all")}
                            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                                selectedSubcategory === "all"
                                    ? "bg-[#24452c] text-white"
                                    : "bg-[#f4f7f3] text-dark hover:bg-green-light"
                            }`}
                        >
                            {isBangla ? "সবগুলো" : "All"} (
                            {filteredProducts.length.toLocaleString(
                                isBangla ? "bn-BD" : "en-BD"
                            )}
                            )
                        </button>
                        {categorySubcategories.map((sub) => (
                            <button
                                key={sub._id}
                                type="button"
                                onClick={() =>
                                    setSelectedSubcategory(String(sub._id))
                                }
                                className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                                    selectedSubcategory === String(sub._id)
                                        ? "bg-[#24452c] text-white"
                                        : "bg-[#f4f7f3] text-dark hover:bg-green-light"
                                }`}
                            >
                                {localized(sub.name, language)}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative flex flex-1 items-center sm:w-56">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 text-black/40"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder={
                                    isBangla
                                        ? "এই ক্যাটাগরিতে খুঁজুন..."
                                        : "Search in category..."
                                }
                                className="w-full rounded-xl border border-[#dce5de] bg-[#f8fbf9] py-2 pl-9 pr-3 text-xs text-dark outline-none focus:border-primary focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 rounded-xl border border-[#dce5de] bg-[#f8fbf9] px-3 py-1.5">
                            <SlidersHorizontal
                                size={14}
                                className="text-primary"
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs font-medium text-dark outline-none"
                            >
                                <option value="newest">
                                    {isBangla ? "নতুন পণ্য" : "Newest First"}
                                </option>
                                <option value="popular">
                                    {isBangla ? "জনপ্রিয়" : "Most Popular"}
                                </option>
                                <option value="price-low">
                                    {isBangla
                                        ? "দাম: কম থেকে বেশি"
                                        : "Price: Low to High"}
                                </option>
                                <option value="price-high">
                                    {isBangla
                                        ? "দাম: বেশি থেকে কম"
                                        : "Price: High to Low"}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Area */}
                {loading ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <Loading />
                    </div>
                ) : error ? (
                    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                        <Error error={error} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <section className="mx-auto my-8 flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(54,58,39,0.05)]">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-primary">
                            <ShoppingBag size={30} />
                        </span>
                        <h2 className="mt-4 text-lg font-bold text-dark">
                            {isBangla
                                ? "এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি"
                                : "No Products Found in This Category"}
                        </h2>
                        <p className="mt-1.5 text-sm text-black/60">
                            {isBangla
                                ? "অন্য ক্যাটাগরি নির্বাচন করুন অথবা আমাদের সকল পণ্যের তালিকা দেখুন।"
                                : "Try clearing your search filter or browse our full product catalog."}
                        </p>
                        <Link
                            href="/products"
                            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary eq"
                        >
                            {isBangla ? "সব পণ্য দেখুন" : "View All Products"}
                        </Link>
                    </section>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const name =
                                localized(product.name, language) ||
                                (isBangla ? "পণ্য" : "Product");
                            const discount = Number(product.discount) || 0;
                            const originalPrice =
                                discount > 0 && discount < 100
                                    ? Math.round(
                                          product.price / (1 - discount / 100)
                                      )
                                    : null;
                            const isFavorite = wishlistItems.some(
                                (item) => item._id === product._id
                            );
                            const inStock = Number(product.stock) > 0;

                            return (
                                <article
                                    key={product._id}
                                    className="relative flex flex-col overflow-hidden rounded-2xl border border-[#eee5d6] bg-white p-2.5 shadow-sm transition hover:shadow-md sm:p-3.5"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch(toggleWishlist(product))
                                        }
                                        aria-label="Toggle wishlist"
                                        aria-pressed={isFavorite}
                                        className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#a66d65] shadow-sm transition hover:scale-105"
                                    >
                                        <Heart
                                            size={15}
                                            fill={
                                                isFavorite
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                            strokeWidth={2}
                                        />
                                    </button>

                                    <Link
                                        href={`/products/${product._id}`}
                                        className="group"
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f0eadc]">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={name}
                                                    fill
                                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 22vw"
                                                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-dark/60">
                                                    {isBangla
                                                        ? "ছবি নেই"
                                                        : "No image"}
                                                </div>
                                            )}

                                            {discount > 0 && (
                                                <span className="absolute left-2 top-2 rounded-full bg-[#fffdf8]/95 px-2.5 py-0.5 text-[11px] font-bold text-[#355b3d] shadow-sm">
                                                    -{discount}%
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="mt-3 line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-[#344a31] group-hover:text-primary sm:text-sm">
                                            {name}
                                        </h3>
                                    </Link>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                        <span className="text-sm font-bold text-[#285b35] sm:text-base">
                                            {formatPrice(product.price)}
                                        </span>
                                        {originalPrice && (
                                            <span className="text-xs text-dark/45 line-through">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch(addToCart(product))
                                        }
                                        disabled={!inStock}
                                        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#78947d] py-2 px-3 text-xs font-semibold text-[#355b3d] transition hover:bg-[#355b3d] hover:text-white disabled:cursor-not-allowed disabled:border-gray disabled:bg-gray disabled:text-black/45 sm:text-sm"
                                    >
                                        <ShoppingCart size={15} />
                                        <span>
                                            {!inStock
                                                ? isBangla
                                                    ? "স্টকে নেই"
                                                    : "Out of Stock"
                                                : isBangla
                                                ? "কার্টে যোগ করুন"
                                                : "Add to Cart"}
                                        </span>
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};

export default CategoryDetailsPage;

