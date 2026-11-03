import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/features/cart/cartSlice";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const localized = (value, language) => {
  if (typeof value === "string") return value;
  return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const ProductsPage = () => {
  const language = useSelector((state) => state.language.language);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load products (${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected products response format.");
        }

        setProducts(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Failed to load products:", fetchError);
          setError(fetchError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, []);

  const formatPrice = (price) =>
    `৳${Number(price).toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}`;

  return (
    <main className="min-h-screen bg-[#fbf8f2] pb-12 pt-[130px] md:pt-[178px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <header className="mb-6 text-center">
          <h1 className="font-playfair text-2xl font-bold text-[#24452c] sm:text-3xl">
            {language === "bn" ? "সব পণ্য" : "All Products"}
          </h1>
          {!loading && !error && (
            <p className="mt-1 text-sm text-dark/65">
              {language === "bn"
                ? `${products.length.toLocaleString("bn-BD")}টি পণ্য`
                : `${products.length} products`}
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loading isLoading={loading} />
          </div>
        ) : error ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
            <Error
              error={
                language === "bn"
                  ? "পণ্যগুলো লোড করা যায়নি। আবার চেষ্টা করুন।"
                  : error
              }
            />
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-sm text-dark/70">
            {language === "bn"
              ? "এখনো কোনো পণ্য যোগ করা হয়নি।"
              : "No products are available at the moment."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const name =
                localized(product.name, language) ||
                (language === "bn" ? "পণ্য" : "Product");
              const categoryName = localized(product.category_id?.name, language);
              const discount = Number(product.discount) || 0;
              const originalPrice =
                discount > 0 && discount < 100
                  ? Math.round(product.price / (1 - discount / 100))
                  : null;

              return (
                <article
                  key={product._id}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-[#eee8df] bg-white p-2 shadow-sm transition-shadow hover:shadow-md sm:p-3"
                >
                  <Link
                    href={`/products/${product._id}`}
                    className="group"
                    aria-label={
                      language === "bn"
                        ? `${name} পণ্যের বিস্তারিত দেখুন`
                        : `View details for ${name}`
                    }
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f0eadc]">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={name}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 sm:p-3"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-dark/60">
                          {language === "bn" ? "ছবি নেই" : "No image"}
                        </div>
                      )}
                      {product.featured && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#d6e5ad] px-2 py-1 text-[10px] font-semibold text-[#24452c]">
                          {language === "bn" ? "জনপ্রিয়" : "Featured"}
                        </span>
                      )}
                    </div>
                    {categoryName && (
                      <p className="mt-2 truncate text-[10px] text-dark/60 sm:text-xs">
                        {categoryName}
                      </p>
                    )}
                    <h2 className="mt-1 line-clamp-2 min-h-9 text-sm font-semibold leading-5 text-dark sm:text-base">
                      {name}
                    </h2>
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-bold text-[#285b35] sm:text-base">
                      {formatPrice(product.price)}
                    </span>
                    {originalPrice && (
                      <>
                        <span className="text-xs text-dark/45 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="rounded-full bg-[#ffe4df] px-1.5 py-0.5 text-[10px] font-semibold text-[#c4473e]">
                          {discount}% {language === "bn" ? "ছাড়" : "OFF"}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dispatch(addToCart(product))}
                    disabled={Number(product.stock) <= 0}
                    className="mt-auto w-full rounded-md border border-[#78947d] px-2 py-2 text-xs font-semibold text-[#355b3d] transition hover:bg-[#355b3d] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 sm:mt-3 sm:text-sm"
                  >
                    {Number(product.stock) <= 0
                      ? language === "bn"
                        ? "স্টকে নেই"
                        : "Out of stock"
                      : language === "bn"
                        ? "কার্টে যোগ করুন"
                        : "Add to Cart"}
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

export default ProductsPage;
