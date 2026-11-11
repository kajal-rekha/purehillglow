"use client";

import { addToCart } from "@/redux/features/cart/cartSlice";
import {
    clearWishlist,
    removeFromWishlist,
} from "@/redux/features/wishlist/wishlistSlice";
import {
    ChevronRight,
    Heart,
    Leaf,
    ShoppingBag,
    ShoppingCart,
    Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

const localized = (value, language) => {
    if (typeof value === "string") return value;
    return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const WishlistPage = () => {
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language?.language);
    const wishlistItems = useSelector(
        (state) => state.wishlist?.wishlistItems || []
    );
    const isBangla = language === "bn";

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

    const handleMoveAllToCart = () => {
        wishlistItems.forEach((product) => {
            if (Number(product.stock) > 0) {
                dispatch(addToCart(product));
            }
        });
    };

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
                        className="mb-2.5 flex items-center gap-2 text-[11px] text-white/75"
                    >
                        <Link href="/" className="hover:text-white">
                            {isBangla ? "হোম" : "Home"}
                        </Link>
                        <ChevronRight size={13} />
                        <span>{isBangla ? "উইশলিস্ট" : "Wishlist"}</span>
                    </nav>
                    <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
                        {isBangla ? (
                            <>
                                আমার{" "}
                                <span className="text-[#efc477]">
                                    উইশলিস্ট
                                </span>
                            </>
                        ) : (
                            <>
                                My{" "}
                                <span className="text-[#efc477]">Wishlist</span>
                            </>
                        )}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {isBangla
                            ? "আপনার পছন্দের তালিকায় সংরক্ষিত সকল অর্গানিক পণ্য"
                            : "All your favorite natural skincare products saved in one place"}
                    </p>
                </div>
            </section>

            <div className="wrapper mx-auto px-4 sm:px-6">
                {wishlistItems.length === 0 ? (
                    <section className="relative z-10 -mt-5 mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-primary">
                            <Heart size={30} />
                        </span>
                        <h2 className="mt-4 text-xl font-bold text-dark">
                            {isBangla
                                ? "আপনার উইশলিস্ট খালি"
                                : "Your Wishlist is Empty"}
                        </h2>
                        <p className="mt-2 max-w-sm text-sm text-black/60">
                            {isBangla
                                ? "যেকোনো পণ্যের ওপর হার্ট (♡) আইকনে ক্লিক করে আপনার পছন্দের তালিকায় সংরক্ষণ করতে পারেন।"
                                : "Tap the heart icon on any product to save your favorite items here for later."}
                        </p>
                        <Link
                            href="/products"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
                        >
                            <ShoppingBag size={17} />
                            <span>
                                {isBangla ? "পণ্য ঘুরে দেখুন" : "Explore Products"}
                            </span>
                        </Link>
                    </section>
                ) : (
                    <div className="relative z-10 -mt-5 space-y-6">
                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee5d6] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                            <p className="text-sm font-semibold text-dark">
                                {isBangla
                                    ? `মোট ${wishlistItems.length.toLocaleString(
                                          "bn-BD"
                                      )} টি পণ্য সংরক্ষিত আছে`
                                    : `${wishlistItems.length} ${
                                          wishlistItems.length === 1
                                              ? "item"
                                              : "items"
                                      } saved in your wishlist`}
                            </p>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleMoveAllToCart}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-secondary eq"
                                >
                                    <ShoppingCart size={15} />
                                    <span>
                                        {isBangla
                                            ? "সব কার্টে যোগ করুন"
                                            : "Add All to Cart"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => dispatch(clearWishlist())}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red/25 bg-red/5 px-3.5 py-2 text-xs font-semibold text-red hover:bg-red/15 eq"
                                >
                                    <Trash2 size={14} />
                                    <span>
                                        {isBangla ? "সব মুছে ফেলুন" : "Clear All"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Wishlist Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                            {wishlistItems.map((product) => {
                                const name =
                                    localized(product.name, language) ||
                                    (isBangla ? "পণ্য" : "Product");
                                const unit = localized(product.unit, language);
                                const discount = Number(product.discount) || 0;
                                const originalPrice =
                                    discount > 0 && discount < 100
                                        ? Math.round(
                                              product.price /
                                                  (1 - discount / 100)
                                          )
                                        : null;
                                const inStock = Number(product.stock) > 0;

                                return (
                                    <article
                                        key={product._id}
                                        className="relative flex flex-col overflow-hidden rounded-2xl border border-[#eee5d6] bg-white p-2.5 shadow-sm transition hover:shadow-md sm:p-3.5"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                dispatch(
                                                    removeFromWishlist(
                                                        product._id
                                                    )
                                                )
                                            }
                                            title={
                                                isBangla
                                                    ? "উইশলিস্ট থেকে সরান"
                                                    : "Remove from wishlist"
                                            }
                                            className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-red shadow-sm transition hover:scale-105 hover:bg-red hover:text-white"
                                        >
                                            <Trash2 size={15} />
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

                                        {unit && (
                                            <p className="mt-0.5 text-[11px] text-black/50">
                                                {unit}
                                            </p>
                                        )}

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
                                            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 px-3 text-xs font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-gray disabled:text-black/45 sm:text-sm"
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
                    </div>
                )}
            </div>
        </main>
    );
};

export default WishlistPage;

