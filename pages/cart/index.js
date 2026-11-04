"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  ChevronRight,
  Headphones,
  Leaf,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import {
  addToCart,
  clearCart,
  decreaseCart,
  increaseCart,
  removeFromCart,
} from "@/redux/features/cart/cartSlice";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const getAvailableStock = (item) =>
  item.stock == null ? Infinity : Math.max(Number(item.stock) || 0, 0);

const CartPage = () => {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const isBangla = language === "bn";
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsError, setRecommendationsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load products (${response.status}).`);
        }

        const products = await response.json();
        if (!Array.isArray(products)) {
          throw new Error("Unexpected products response format.");
        }

        setRecommendations(products.filter((item) => item.images?.[0]).slice(0, 8));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load cart recommendations:", error);
          setRecommendationsError(true);
        }
      }
    };

    fetchRecommendations();
    return () => controller.abort();
  }, []);

  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

  const totals = useMemo(() => {
    const currentSubtotal = cartItems.reduce(
      (total, item) =>
        total + (Number(item.price) || 0) * (Number(item.cartQuantity) || 0),
      0
    );
    const originalSubtotal = cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      const originalPrice =
        discount > 0 && discount < 100
          ? Math.round(price / (1 - discount / 100))
          : price;
      return total + originalPrice * (Number(item.cartQuantity) || 0);
    }, 0);
    const discount = Math.max(originalSubtotal - currentSubtotal, 0);
    const delivery = cartItems.length === 0 ? 0 : 150;
    const quantity = cartItems.reduce(
      (total, item) => total + (Number(item.cartQuantity) || 0),
      0
    );

    return {
      currentSubtotal,
      originalSubtotal,
      discount,
      delivery,
      total: originalSubtotal - discount + delivery,
      quantity,
    };
  }, [cartItems]);

  const recommendedProducts = recommendations
    .filter((item) => !cartItems.some((cartItem) => cartItem._id === item._id))
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-10 pt-[125px]">
      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
        />
        <div className="wrapper relative mx-auto flex min-h-40 flex-col justify-center px-4 py-7 sm:px-6">
          <nav
            aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
            className="mb-3 flex items-center gap-2 text-[11px] text-white/75"
          >
            <Link href="/" className="hover:text-white">
              {isBangla ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={13} />
            <span>{isBangla ? "কার্ট" : "Cart"}</span>
          </nav>
          <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
            {isBangla ? (
              <>
                আপনার শপিং <span className="text-[#efc477]">কার্ট</span>
              </>
            ) : (
              <>
                Your Shopping <span className="text-[#efc477]">Cart</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-xs text-white/80 sm:text-sm">
            {isBangla
              ? "পণ্যগুলো দেখুন এবং অর্ডার সম্পন্ন করুন"
              : "Review your items and proceed to checkout"}
          </p>
        </div>
      </section>

      <div className="wrapper mx-auto px-4 sm:px-6">
        {cartItems.length === 0 ? (
          <section className="mx-auto my-10 flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-12 text-center shadow-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-[#24452c]">
              <ShoppingBag size={30} />
            </span>
            <h2 className="mt-4 font-playfair text-2xl font-bold text-[#24452c]">
              {isBangla ? "আপনার কার্ট খালি" : "Your cart is empty"}
            </h2>
            <p className="mt-2 text-sm text-dark/65">
              {isBangla
                ? "পছন্দের পণ্য কার্টে যোগ করে এখানে দেখতে পাবেন।"
                : "Add your favorite products and they will appear here."}
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#20452b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17351f]"
            >
              {isBangla ? "কেনাকাটা শুরু করুন" : "Start Shopping"}
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <>
            <section className="relative z-10 -mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(290px,0.82fr)] lg:gap-5">
              <div className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                <header className="flex items-center justify-between border-b border-[#eee8df] px-4 py-3.5 sm:px-5">
                  <h2 className="flex items-center gap-2 font-playfair text-lg font-bold text-[#203c28]">
                    <ShoppingCart size={19} />
                    {isBangla ? "কার্টের পণ্য" : "Cart Items"} (
                    {cartItems.length.toLocaleString(isBangla ? "bn-BD" : "en-BD")})
                  </h2>
                  <button
                    type="button"
                    onClick={() => dispatch(clearCart())}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-dark/60 transition hover:text-red-600 sm:text-xs"
                  >
                    <Trash2 size={14} />
                    {isBangla ? "সব মুছুন" : "Clear Cart"}
                  </button>
                </header>

                <ul className="divide-y divide-[#eee8df] px-4 sm:px-5">
                  {cartItems.map((item) => {
                    const itemName = localized(item.name, language);
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.cartQuantity) || 1;
                    const itemTotal = price * quantity;
                    const stock = getAvailableStock(item);
                    const originalPrice =
                      Number(item.discount) > 0 && Number(item.discount) < 100
                        ? Math.round(price / (1 - Number(item.discount) / 100))
                        : null;

                    return (
                      <li
                        key={item._id}
                        className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                      >
                        <Link
                          href={`/products/${item._id}`}
                          className="relative aspect-square overflow-hidden rounded-xl border border-[#eee8df] bg-[#f2eee4]"
                          aria-label={
                            isBangla
                              ? `${itemName} পণ্যের বিস্তারিত`
                              : `${itemName} product details`
                          }
                        >
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={itemName || "Product"}
                              fill
                              sizes="(max-width: 640px) 76px, 100px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[#315d3b]">
                              <Leaf size={24} />
                            </span>
                          )}
                          {Number(item.discount) > 0 && (
                            <span className="absolute left-1 top-1 rounded-full bg-[#21472b] px-1.5 py-0.5 text-[9px] font-bold text-white">
                              -{item.discount}%
                            </span>
                          )}
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={`/products/${item._id}`}
                            className="line-clamp-1 text-sm font-semibold text-[#253c2b] hover:text-[#43804e]"
                          >
                            {itemName}
                          </Link>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-dark/60">
                            {localized(item.description, language)}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#24452c]">
                              {formatPrice(price)}
                            </span>
                            {originalPrice && (
                              <span className="text-[10px] text-dark/45 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                            {item.unit && (
                              <span className="text-[10px] text-dark/55">
                                · {localized(item.unit, language)}
                              </span>
                            )}
                          </div>
                          <p
                            className={`mt-1 inline-flex items-center gap-1 text-[10px] ${
                              stock > 0 ? "text-[#43804e]" : "text-red-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                stock > 0 ? "bg-[#56a85a]" : "bg-red-500"
                              }`}
                            />
                            {stock > 0
                              ? isBangla
                                ? `${Math.max(stock - quantity, 0).toLocaleString("bn-BD")} টি বাকি`
                                : `${Math.max(stock - quantity, 0).toLocaleString("en-BD")} in stock`
                              : isBangla
                                ? "স্টকে নেই"
                                : "Out of stock"}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-8 items-center rounded-full border border-[#e7dfd2] bg-[#fffdfa]">
                              <button
                                type="button"
                                onClick={() => dispatch(decreaseCart(item))}
                                disabled={quantity <= 1}
                                aria-label={
                                  isBangla ? "পরিমাণ কমান" : "Decrease quantity"
                                }
                                className="flex h-full w-8 items-center justify-center text-[#435244] hover:text-[#1f432b] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="min-w-6 text-center text-xs font-semibold">
                                {quantity.toLocaleString(
                                  isBangla ? "bn-BD" : "en-BD"
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => dispatch(increaseCart(item))}
                                disabled={quantity >= stock}
                                aria-label={
                                  isBangla ? "পরিমাণ বাড়ান" : "Increase quantity"
                                }
                                className="flex h-full w-8 items-center justify-center text-[#435244] hover:text-[#1f432b] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => dispatch(removeFromCart(item._id))}
                              className="inline-flex items-center gap-1 text-[10px] text-dark/55 transition hover:text-red-600"
                            >
                              <Trash2 size={12} />
                              {isBangla ? "মুছুন" : "Remove"}
                            </button>
                          </div>
                        </div>

                        <p className="col-start-2 text-right text-sm font-bold text-[#203c28] sm:col-start-3 sm:row-start-1">
                          {formatPrice(itemTotal)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <aside className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)] lg:sticky lg:top-32">
                <h2 className="flex items-center gap-2 bg-[#183d23] px-4 py-3 font-playfair text-lg font-bold text-white">
                  <PackageCheck size={18} />
                  {isBangla ? "অর্ডারের সারাংশ" : "Order Summary"}
                </h2>
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="flex justify-between gap-3 text-xs text-dark/75">
                    <span>
                      {isBangla ? "সাবটোটাল" : "Subtotal"} (
                      {totals.quantity.toLocaleString(
                        isBangla ? "bn-BD" : "en-BD"
                      )}{" "}
                      {isBangla ? "টি পণ্য" : "items"})
                    </span>
                    <span className="font-medium text-dark">
                      {formatPrice(totals.originalSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs text-dark/75">
                    <span className="inline-flex items-center gap-1">
                      {isBangla ? "ডেলিভারি চার্জ" : "Delivery Charge"}
                      <Truck size={12} />
                    </span>
                    <span className="font-medium text-dark">
                      {totals.delivery === 0
                        ? isBangla
                          ? "ফ্রি"
                          : "Free"
                        : formatPrice(totals.delivery)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs text-[#43804e]">
                    <span>{isBangla ? "ছাড়" : "Discount"}</span>
                    <span className="font-semibold">
                      - {formatPrice(totals.discount)}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-[#ddd7ca] pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-playfair text-base font-bold text-[#203c28]">
                        {isBangla ? "সর্বমোট" : "Grand Total"}
                      </span>
                      <span className="text-xl font-bold text-[#203c28]">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#edbd68] px-4 text-sm font-bold text-[#33240c] shadow-sm transition hover:bg-[#e6ad4f]"
                  >
                    <ShoppingBag size={16} />
                    {isBangla ? "অর্ডার সম্পন্ন করুন" : "Proceed to Checkout"}
                    <ArrowRight size={16} />
                  </Link>
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-[#f0f2e4] px-3 py-2 text-center text-[10px] leading-4 text-[#344b31]">
                    <ShieldCheck size={17} className="shrink-0" />
                    {isBangla
                      ? "আপনার অর্ডার নিরাপদ ও সুরক্ষিত"
                      : "Your order is safe & secure"}
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#f0ebdd] bg-[#f4f2e5] sm:grid-cols-4">
              {[
                {
                  icon: Leaf,
                  title: isBangla ? "১০০% খাঁটি" : "100% Authentic",
                  detail: isBangla ? "বিশ্বস্ত পণ্য" : "Hill Products",
                },
                {
                  icon: ShieldCheck,
                  title: isBangla ? "নিরাপদ পেমেন্ট" : "Secure Payments",
                  detail: isBangla ? "সহজ ও সুরক্ষিত" : "bKash, Nagad & More",
                },
                {
                  icon: Truck,
                  title: isBangla ? "দ্রুত ডেলিভারি" : "Fast Delivery",
                  detail: isBangla ? "সারা বাংলাদেশে" : "Across Bangladesh",
                },
                {
                  icon: Headphones,
                  title: isBangla ? "কাস্টমার সাপোর্ট" : "24/7 Customer Support",
                  detail: isBangla ? "আমরা পাশে আছি" : "We're here to help",
                },
              ].map(({ icon: Icon, title, detail }, index) => (
                <div
                  key={title}
                  className={`flex items-center gap-2 px-3 py-3 sm:px-4 ${
                    index % 2 === 0 ? "border-r border-[#dedbc9]" : ""
                  } ${
                    index < 2 ? "border-b border-[#dedbc9] sm:border-b-0" : ""
                  } ${index === 2 ? "sm:border-l" : ""} ${
                    index === 1 ? "sm:border-r" : ""
                  }`}
                >
                  <Icon size={20} className="shrink-0 text-[#24452c]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#273b2b] sm:text-xs">
                      {title}
                    </p>
                    <p className="text-[9px] text-dark/60 sm:text-[10px]">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {recommendedProducts.length > 0 && (
              <section className="mt-8">
                <div className="mb-4 flex items-center justify-center gap-3">
                  <span className="h-px w-10 bg-[#c4cdb9]" />
                  <h2 className="font-playfair text-xl font-bold text-[#24452c]">
                    {isBangla ? "আপনার পছন্দ হতে পারে" : "You May Also Like"}
                  </h2>
                  <Leaf size={15} className="text-[#315d3b]" />
                  <span className="h-px w-10 bg-[#c4cdb9]" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {recommendedProducts.map((item) => {
                    const itemName = localized(item.name, language);
                    return (
                      <article
                        key={item._id}
                        className="group flex flex-col overflow-hidden rounded-xl border border-[#eee5d6] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Link
                          href={`/products/${item._id}`}
                          className="relative block aspect-square overflow-hidden bg-[#f0eadc]"
                        >
                          <Image
                            src={item.images[0]}
                            alt={itemName || "Product"}
                            fill
                            sizes="(max-width: 640px) 45vw, 23vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {Number(item.discount) > 0 && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#f6e5b7] px-2 py-1 text-[10px] font-semibold text-[#604b2d]">
                              -{item.discount}%
                            </span>
                          )}
                        </Link>
                        <div className="flex flex-1 flex-col p-2.5">
                          <Link
                            href={`/products/${item._id}`}
                            className="line-clamp-1 text-xs font-semibold text-[#263c2b] hover:text-[#43804e]"
                          >
                            {itemName}
                          </Link>
                          <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star key={index} size={10} />
                            ))}
                          </div>
                          <p className="mt-1 text-sm font-bold text-[#24452c]">
                            {formatPrice(item.price)}
                          </p>
                          <button
                            type="button"
                            onClick={() => dispatch(addToCart(item))}
                            disabled={Number(item.stock) <= 0}
                            className="mt-auto inline-flex items-center justify-center gap-1 rounded-lg bg-[#20452b] py-2 text-[10px] font-semibold text-white transition hover:bg-[#17351f] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ShoppingCart size={12} />
                            {isBangla ? "কার্টে যোগ করুন" : "Add to Cart"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
            {recommendationsError && (
              <p className="mt-4 text-center text-xs text-dark/55">
                {isBangla
                  ? "সুপারিশ করা পণ্য লোড করা যায়নি।"
                  : "Recommended products could not be loaded."}
              </p>
            )}
          </>
        )}

        <section className="relative mt-8 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[linear-gradient(105deg,#163d24_0%,#31583a_58%,#81926b_100%)] px-5 py-5 text-white sm:px-8">
          <div className="relative z-10">
            <p className="font-vibes text-2xl sm:text-3xl">
              {isBangla ? "পাহাড় থেকে আপনার ঘরে" : "From the Hills to Your Home"}
            </p>
            <p className="mt-1 text-[11px] text-white/80 sm:text-xs">
              {isBangla
                ? "Pure Hill Glow — প্রাকৃতিক সৌন্দর্য আপনার কাছে"
                : "Pure Hill Glow — Bringing natural beauty closer to you."}
            </p>
          </div>
          <Leaf
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 left-1/2 h-28 w-28 rotate-[-30deg] text-white/10"
          />
          <Link
            href="/"
            className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[#efc477] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#efc477] hover:text-[#203c28]"
          >
            {isBangla ? "কেনাকাটা চালিয়ে যান" : "Continue Shopping"}
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </main>
  );
};

export default CartPage;
