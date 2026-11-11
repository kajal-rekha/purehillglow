"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ChevronRight,
  Heart,
  Headphones,
  Leaf,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { addToCart } from "@/redux/features/cart/cartSlice";
import { toggleWishlist } from "@/redux/features/wishlist/wishlistSlice";
import Loading from "@/components/ui/Loading";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const ProductDetailsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );
  const isBangla = language === "bn";
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isFavorite = wishlistItems.some((item) => item._id === product?._id);

  useEffect(() => {
    if (!router.isReady || typeof router.query.id !== "string") return;

    const controller = new AbortController();
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/products/${router.query.id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : `Failed to load product (${response.status}).`
          );
        }

        const data = await response.json();
        setProduct(data);
        setSelectedImage(0);
        setQuantity(1);

        try {
          const relatedResponse = await fetch("/api/products", {
            signal: controller.signal,
          });
          if (!relatedResponse.ok) {
            throw new Error(`HTTP error! status: ${relatedResponse.status}`);
          }

          const products = await relatedResponse.json();
          if (!Array.isArray(products)) {
            throw new Error("Unexpected products response format.");
          }

          setRelatedProducts(
            products
              .filter(
                (item) =>
                  item._id !== data._id &&
                  item.images?.[0] &&
                  (!data.category_id?._id ||
                    item.category_id?._id === data.category_id._id)
              )
              .slice(0, 4)
          );
        } catch (relatedError) {
          if (relatedError.name !== "AbortError") {
            console.error("Failed to load related products:", relatedError);
          }
        }
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Failed to load product details:", fetchError);
          setError(fetchError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [router.isReady, router.query.id]);

  const formatPrice = (price) =>
    `৳${Number(price).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

  const name = localized(product?.name, language);
  const categoryName = localized(product?.category_id?.name, language);
  const subcategoryName = localized(product?.subcategory_id?.name, language);
  const discount = Number(product?.discount) || 0;
  const originalPrice =
    discount > 0 && discount < 100
      ? Math.round(product.price / (1 - discount / 100))
      : null;
  const description = localized(product?.description, language);
  const ingredients = localized(product?.ingredients, language) || [];
  const usage = localized(product?.usage, language) || [];
  const benefits = localized(product?.benefits, language) || [];
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const stockCount = Number(product?.stock) || 0;
  const remainingStock = Math.max(stockCount - quantity, 0);
  const totalPrice = Number(product?.price || 0) * quantity;
  const totalOriginalPrice = originalPrice ? originalPrice * quantity : null;

  const addProductToCart = (item = product, itemQuantity = quantity) => {
    dispatch(addToCart({ ...item, cartQuantity: itemQuantity }));
    if (item?._id === product?._id) setAddedToCart(true);
  };

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#fbf8f2] pt-32">
        <Loading />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#fbf8f2] px-4 pt-32 text-center">
        <p className="font-playfair text-2xl font-semibold text-[#24452c]">
          {isBangla ? "পণ্যটি পাওয়া যায়নি" : "Product unavailable"}
        </p>
        <p className="mt-2 text-sm text-dark/70">
          {isBangla
            ? "পণ্যটি লোড করা যায়নি। আবার চেষ্টা করুন।"
            : error || "This product could not be found."}
        </p>
        <Link
          href="/"
          className="mt-5 rounded-lg bg-[#24452c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#17351f]"
        >
          {isBangla ? "হোম পেজে ফিরুন" : "Back to home"}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-12 pt-[130px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <nav
          aria-label={isBangla ? "ব্রেডক্রাম্ব" : "Breadcrumb"}
          className="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-[#5f685d] sm:text-xs"
        >
          <Link href="/" className="font-semibold text-[#24452c] hover:underline">
            {isBangla ? "হোম" : "Home"}
          </Link>
          <ChevronRight size={13} />
          <span>{categoryName || (isBangla ? "পণ্য" : "Products")}</span>
          {subcategoryName && (
            <>
              <ChevronRight size={13} />
              <span>{subcategoryName}</span>
            </>
          )}
          <ChevronRight size={13} />
          <span className="line-clamp-1 text-dark">{name}</span>
        </nav>

        <section className="grid gap-7 lg:grid-cols-2 lg:gap-10">
          <div className="grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)]">
            {product.images?.length > 1 && (
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:col-start-1 sm:flex-col">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={
                      isBangla
                        ? `ছবি ${index + 1} দেখুন`
                        : `View image ${index + 1}`
                    }
                    aria-pressed={selectedImage === index}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white sm:h-[76px] sm:w-[76px] ${
                      selectedImage === index
                        ? "border-[#24452c] ring-1 ring-[#24452c]"
                        : "border-[#e8dfd1]"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${name} ${index + 1}`}
                      fill
                      sizes="76px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative order-1 aspect-square overflow-hidden rounded-xl border border-[#eee6d9] bg-[#f0eadc] sm:order-2 sm:col-start-2">
              {product.images?.[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={name || "Product"}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 600px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-dark/60">
                  {isBangla ? "ছবি নেই" : "No image available"}
                </div>
              )}
              {product.featured && (
                <span className="absolute left-3 top-3 rounded-full bg-[#d6e5ad] px-3 py-1 text-[11px] font-semibold text-[#24452c]">
                  {isBangla ? "জনপ্রিয়" : "Best Seller"}
                </span>
              )}
              <button
                type="button"
                onClick={() => dispatch(toggleWishlist(product))}
                aria-label={
                  isFavorite
                    ? isBangla
                      ? "পছন্দের তালিকা থেকে সরান"
                      : "Remove from favorites"
                    : isBangla
                      ? "পছন্দের তালিকায় যোগ করুন"
                      : "Add to favorites"
                }
                aria-pressed={isFavorite}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#24452c] shadow transition hover:scale-105"
              >
                <Heart
                  size={19}
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            {categoryName && (
              <span className="mb-2 w-fit rounded-full bg-[#e6ead8] px-3 py-1 text-[11px] font-semibold text-[#435a3b]">
                {categoryName}
              </span>
            )}
            <h1 className="font-playfair text-3xl font-bold leading-tight text-[#1f432b] sm:text-4xl">
              {name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-[#756b58]">
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={15} />
                ))}
              </span>
              <span>{isBangla ? "এখনো কোনো রিভিউ নেই" : "No reviews yet"}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-[#24452c]">
                {formatPrice(totalPrice)}
              </span>
              {totalOriginalPrice && (
                <>
                  <span className="text-sm text-dark/50 line-through">
                    {formatPrice(totalOriginalPrice)}
                  </span>
                  <span className="rounded-full bg-[#ffe4df] px-2.5 py-1 text-xs font-semibold text-[#c4473e]">
                    {discount}% {isBangla ? "ছাড়" : "OFF"}
                  </span>
                </>
              )}
            </div>
            {quantity > 1 && (
              <p className="mt-1 text-xs text-dark/65">
                {formatPrice(product.price)} ×{" "}
                {quantity.toLocaleString(isBangla ? "bn-BD" : "en-BD")}
              </p>
            )}

            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#335c39]">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  stockCount > 0 ? "bg-[#56a85a]" : "bg-red-500"
                }`}
              />
              {stockCount > 0
                ? isBangla
                  ? `স্টকে আছে (নির্বাচিত পণ্যের পর ${remainingStock.toLocaleString("bn-BD")} টি বাকি)`
                  : `In Stock (${remainingStock.toLocaleString("en-BD")} remaining after selection)`
                : isBangla
                  ? "স্টকে নেই"
                  : "Out of stock"}
            </p>

            <p className="mt-3 text-sm leading-6 text-[#4f5149]">
              {description}
            </p>
            {benefits.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {benefits.map((benefit, index) => (
                  <li
                    key={`${benefit}-${index}`}
                    className="flex items-start gap-2 text-xs text-[#4f5149]"
                  >
                    <Check size={15} className="mt-0.5 shrink-0 text-[#4b7a4d]" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
            {tags.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-[#38483a]">
                  {isBangla ? "ট্যাগ" : "Tags"}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-[#dce4d3] bg-white px-3 py-1 text-[11px] text-[#435a3b]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="flex h-10 items-center rounded-lg border border-[#e7dfd2] bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setAddedToCart(false);
                    setQuantity((value) => Math.max(1, value - 1));
                  }}
                  aria-label={isBangla ? "পরিমাণ কমান" : "Decrease quantity"}
                  className="flex h-full w-9 items-center justify-center text-[#435244] hover:text-[#1f432b]"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAddedToCart(false);
                    setQuantity((value) =>
                      stockCount > 0
                        ? Math.min(stockCount, value + 1)
                        : value + 1
                    );
                  }}
                  aria-label={isBangla ? "পরিমাণ বাড়ান" : "Increase quantity"}
                  disabled={stockCount <= 0 || quantity >= stockCount}
                  className="flex h-full w-9 items-center justify-center text-[#435244] hover:text-[#1f432b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => addProductToCart()}
                disabled={stockCount <= 0}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#20452b] px-5 text-sm font-semibold text-white transition hover:bg-[#17351f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addedToCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                {addedToCart
                  ? isBangla
                    ? "কার্টে যোগ হয়েছে"
                    : "Added to Cart"
                  : isBangla
                    ? "কার্টে যোগ করুন"
                    : "Add to Cart"}
              </button>
            </div>
            <Link
              href="https://wa.me/8801762144200"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#78947d] text-sm font-semibold text-[#24452c] transition hover:bg-[#eef3e8]"
            >
              <Zap size={16} fill="currentColor" />
              {isBangla ? "অর্ডার করতে যোগাযোগ করুন" : "Order Now"}
            </Link>

            <div className="mt-5 grid grid-cols-6 border-y border-[#ece5d9] py-3">
              {[
                {
                  icon: Truck,
                  title: isBangla ? "দ্রুত ডেলিভারি" : "Estimated Delivery",
                  detail: isBangla
                    ? "২–৫ কর্মদিবস (বাংলাদেশের ভেতরে)"
                    : "2–5 Business Days (Inside Bangladesh)",
                },
                {
                  icon: PackageCheck,
                  title: isBangla ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
                  detail: isBangla ? "সারা বাংলাদেশে পাওয়া যায়" : "Available",
                },
                {
                  icon: Leaf,
                  title: isBangla ? "১০০% খাঁটি" : "100% Authentic",
                  detail: isBangla ? "বিশ্বস্ত পণ্য" : "Hill Products",
                },
                {
                  icon: ShieldCheck,
                  title: isBangla ? "নিরাপদ পেমেন্ট" : "Secure Checkout",
                  detail: isBangla ? "নিরাপদ ও সহজ" : "& Payment",
                },
                {
                  icon: Headphones,
                  title: isBangla
                    ? "ডেডিকেটেড কাস্টমার সাপোর্ট"
                    : "Dedicated Customer Support",
                },
              ].map(({ icon: Icon, title, detail }, index) => (
                <div
                  key={title}
                  className={`${
                    index < 2 ? "col-span-3" : "col-span-2"
                  } flex items-center gap-2 border-[#ece5d9] ${
                    index < 2
                      ? index === 0
                        ? "border-r pr-2"
                        : "pl-2"
                      : `border-t pt-3 ${
                          index === 2
                            ? "border-r pr-2"
                            : index === 3
                              ? "border-r px-2"
                              : "pl-2"
                        }`
                  }`}
                >
                  <Icon size={19} className="shrink-0 text-[#315d3b]" />
                  <div>
                    <p className="text-[10px] font-semibold text-[#38483a] sm:text-xs">
                      {title}
                    </p>
                    {detail && (
                      <p className="text-[10px] text-dark/65">{detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-[#eee5d6] bg-white/70">
          {[
            {
              title: isBangla ? "পণ্য সম্পর্কে" : "About the Product",
              preview: description,
              content: description,
            },
            {
              title: isBangla ? "উপাদান" : "Ingredients",
              preview: ingredients.join(", "),
              content: ingredients.join(", "),
            },
            {
              title: isBangla ? "ব্যবহারের নিয়ম" : "How to Use",
              preview: usage.join(" "),
              content: usage.join(" "),
            },
            {
              title: isBangla ? "পণ্যের বিবরণ" : "Product Details",
              preview: [
                categoryName,
                subcategoryName,
                product.origin && localized(product.origin, language),
                product.unit && localized(product.unit, language),
              ]
                .filter(Boolean)
                .join(" · "),
              content: [
                categoryName &&
                  `${isBangla ? "ক্যাটাগরি" : "Category"}: ${categoryName}`,
                subcategoryName &&
                  `${isBangla ? "সাবক্যাটাগরি" : "Subcategory"}: ${subcategoryName}`,
                product.origin &&
                  `${isBangla ? "উৎপত্তি" : "Origin"}: ${localized(
                    product.origin,
                    language
                  )}`,
                product.unit &&
                  `${isBangla ? "পরিমাণ" : "Unit"}: ${localized(
                    product.unit,
                    language
                  )}`,
                `${isBangla ? "স্টক" : "Stock"}: ${stockCount.toLocaleString(
                  isBangla ? "bn-BD" : "en-BD"
                )}`,
                product.featured
                  ? isBangla
                    ? "জনপ্রিয় পণ্য"
                    : "Featured product"
                  : isBangla
                    ? "সাধারণ পণ্য"
                    : "Regular product",
                tags.length > 0 &&
                  `${isBangla ? "ট্যাগ" : "Tags"}: ${tags.join(", ")}`,
              ]
                .filter(Boolean)
                .join(" · "),
            },
            {
              title: isBangla ? "শিপিং ও রিটার্ন" : "Shipping & Returns",
              preview: isBangla
                ? "সারা বাংলাদেশে ডেলিভারি, সহজ রিটার্ন নীতি।"
                : "Fast delivery across Bangladesh. Easy returns within 7 days.",
              content: isBangla
                ? "সারা বাংলাদেশে ডেলিভারি দেওয়া হয়। পণ্য গ্রহণের ৭ দিনের মধ্যে রিটার্নের জন্য যোগাযোগ করুন।"
                : "We offer delivery across Bangladesh. Contact us within 7 days of receiving your order for return support.",
            },
          ].map(({ title, preview, content }, index) => (
            <details
              key={title}
              className="group border-b border-[#eee8df] last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <Leaf size={17} className="shrink-0 text-[#315d3b]" />
                <span className="w-36 shrink-0 text-xs font-semibold text-[#253c2b] sm:w-48 sm:text-sm">
                  {title}
                </span>
                <span className="hidden flex-1 truncate text-[11px] text-dark/70 sm:block">
                  {preview || (isBangla ? "তথ্য পাওয়া যায়নি" : "Details unavailable")}
                </span>
                <ChevronRight
                  size={17}
                  className="ml-auto shrink-0 transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="px-4 pb-4 pl-12 text-xs leading-5 text-dark/75 sm:pl-[13.5rem]">
                {content || (isBangla ? "তথ্য পাওয়া যায়নি" : "Details unavailable")}
              </p>
            </details>
          ))}
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[#b8c5ae]" />
              <h2 className="font-playfair text-xl font-bold text-[#24452c] sm:text-2xl">
                {isBangla ? "সম্পর্কিত পণ্য" : "Related Products"}
              </h2>
              <span className="h-px w-12 bg-[#b8c5ae]" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {relatedProducts.map((item) => {
                const itemName = localized(item.name, language);
                return (
                  <article
                    key={item._id}
                    className="group overflow-hidden rounded-xl border border-[#eee5d6] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Link
                      href={`/products/${item._id}`}
                      className="block"
                      aria-label={
                        isBangla
                          ? `${itemName} পণ্যের বিস্তারিত দেখুন`
                          : `View details for ${itemName}`
                      }
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#f0eadc]">
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
                      </div>
                      <div className="p-2.5">
                        <h3 className="line-clamp-2 min-h-9 text-xs font-semibold text-[#263c2b]">
                          {itemName}
                        </h3>
                        <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star key={index} size={11} />
                          ))}
                          <span className="ml-1 text-[9px] text-dark/60">
                            {isBangla ? "রিভিউ নেই" : "No reviews"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-[#24452c]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => addProductToCart(item, 1)}
                      disabled={item.stock <= 0}
                      className="mx-2.5 mb-2.5 flex w-[calc(100%-1.25rem)] items-center justify-center gap-1 rounded-lg bg-[#20452b] py-2 text-[11px] font-semibold text-white transition hover:bg-[#17351f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingCart size={13} />
                      {isBangla ? "কার্টে যোগ করুন" : "Add to Cart"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailsPage;
