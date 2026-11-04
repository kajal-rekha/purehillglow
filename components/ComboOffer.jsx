"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ArrowRight, Leaf, Sparkles, Wallet } from "lucide-react";

const ComboOffer = () => {
  const language = useSelector((state) => state.language.language);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected products response format.");
        }

        setProducts(data.filter((product) => product.images?.[0]).slice(0, 4));
      } catch (error) {
        console.error("Failed to load combo offer products:", error);
      }
    };

    fetchProducts();
  }, []);

  const highlights =
    language === "bn"
      ? [
          { icon: Leaf, title: "মৃদু ও প্রাকৃতিক", detail: "সব ধরনের ত্বকের জন্য" },
          { icon: Sparkles, title: "ত্বকের উজ্জ্বলতা", detail: "প্রাকৃতিকভাবে সতেজ ত্বক" },
          { icon: Wallet, title: "সাশ্রয়ী", detail: "বিশেষ কম্বো অফার" },
        ]
      : [
          { icon: Leaf, title: "Gentle & Natural", detail: "For all skin types" },
          { icon: Sparkles, title: "Brighten Skin", detail: "Natural healthy glow" },
          { icon: Wallet, title: "Save More", detail: "Special combo price" },
        ];

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="wrapper grid gap-3 px-4 md:grid-cols-[minmax(0,2.1fr)_minmax(220px,0.9fr)]">
        <div className="relative grid min-h-[220px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-2xl border border-[#eee5d6] bg-gradient-to-br from-[#fffaf0] via-[#f6f1df] to-[#e9efdb] shadow-sm sm:min-h-[240px] sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col items-start justify-center p-5 sm:p-7">
            <span className="mb-2 rounded-full bg-[#66804c]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#526c3c]">
              {language === "bn" ? "বিশেষ অফার" : "Special offer"}
            </span>
            <h2 className="max-w-[220px] font-playfair !text-xl !font-bold leading-tight text-[#344a31] sm:!text-2xl">
              {language === "bn" ? "ডেইলি স্কিনকেয়ার কম্বো" : "Daily Skincare Combo"}
            </h2>
            <span className="mt-1.5 block max-w-[230px] text-xs leading-5 text-[#6d7159]">
              {language === "bn"
                ? "প্রতিদিনের যত্নে প্রাকৃতিক স্কিনকেয়ার পণ্যের সুন্দর সমাহার"
                : "A gentle collection of natural essentials for your daily skincare routine."}
            </span>
            <span className="mt-2 text-base font-bold text-[#344a31]">
              {language === "bn" ? "কম্বো মূল্য ৳৫৯০" : "৳590"}
            </span>
            <Link
              href="#best-sellers"
              className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#55713e] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#405b2e]"
            >
              {language === "bn" ? "কম্বো দেখুন" : "Shop Combo Now"}
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="pointer-events-none relative flex min-h-[220px] items-end justify-center sm:min-h-[240px]">
            <div className="absolute bottom-[-68px] right-[8%] h-52 w-52 rounded-full bg-white/50 sm:bottom-[-55px] sm:right-[10%] sm:h-64 sm:w-64" />
            <div className="relative z-10 flex h-full w-full items-end justify-center gap-0 px-2 sm:px-4">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className={`relative h-[70%] w-[25%] max-w-[96px] ${
                    index > 0 ? "-ml-2 sm:-ml-3" : ""
                  } ${index % 2 === 1 ? "h-[58%]" : ""}`}
                  style={{
                    zIndex: index + 1,
                  }}
                >
                  <Image
                    src={product.images[0]}
                    alt={
                      language === "bn"
                        ? product.name?.bn || "স্কিনকেয়ার পণ্য"
                        : product.name?.en || "Skincare product"
                    }
                    fill
                    sizes="(max-width: 640px) 18vw, 9vw"
                    className="object-contain drop-shadow-[0_8px_8px_rgba(70,70,40,0.16)]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#eee5d6] bg-[#fffdf8] p-3 sm:grid-cols-1 sm:gap-3 sm:p-4">
          {highlights.map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:justify-start sm:gap-3 sm:text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef0dc] text-[#72834c] sm:h-9 sm:w-9">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <div>
                <span className="block text-[9px] font-semibold leading-4 text-[#46543b] sm:text-xs">
                  {title}
                </span>
                <span className="block text-[8px] leading-3 text-[#81816f] sm:text-[10px]">
                  {detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComboOffer;
