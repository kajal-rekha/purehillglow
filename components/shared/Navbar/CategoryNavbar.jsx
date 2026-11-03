"use client";

import { Flame, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CategoryNavbar = () => {
  const { language } = useSelector((state) => state.language);
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hasCategoryDrawer = [
    "/products/[id]",
    "/cart",
  ].includes(router.pathname);

  const categoryLinks = [
    {
      href: "/products",
      label: {
        en: "All Products",
        bn: "সব পণ্য",
      },
    },
    {
      href: "/categories/thanaka",
      label: {
        en: "Thanaka",
        bn: "থানাকা",
      },
    },
    {
      href: "/categories/face-care",
      label: {
        en: "Face Care",
        bn: "ফেস কেয়ার",
      },
    },
    {
      href: "/categories/soap-cleansing",
      label: {
        en: "Soap & Cleansing",
        bn: "সাবান ও ক্লিনজিং",
      },
    },
    {
      href: "/categories/lotion-moisturizer",
      label: {
        en: "Lotion & Moisturizer",
        bn: "লোশন ও ময়েশ্চারাইজার",
      },
    },
    {
      href: "/categories/chandan-sandalwood",
      label: {
        en: "Chandan & Sandalwood",
        bn: "চন্দন ও চন্দনজাত",
      },
    },
    {
      href: "/categories/balm-wellness",
      label: {
        en: "Balm & Wellness",
        bn: "বাম ও ওয়েলনেস",
      },
    },
    {
      href: "/categories/combo-packs",
      label: {
        en: "Combo Packs",
        bn: "কম্বো প্যাক",
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
        className={`fixed left-0 right-0 top-[116px] z-[998] h-16 border-b border-primary/10 bg-white ${
          hasCategoryDrawer ? "" : "hidden md:block"
        }`}
      >
        <div className="wrapper mx-auto flex h-full items-center px-4">
          {hasCategoryDrawer ? (
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
          ) : (
            <nav className="flex w-full items-center justify-center">
              <ul className="flex items-center gap-12">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`group relative flex items-center gap-1 py-4 text-[13px] font-medium transition ${
                        link.offer
                          ? "font-semibold text-red"
                          : "text-dark/85 hover:text-primary"
                      }`}
                    >
                      {link.offer && <Flame size={14} />}
                      <span>
                        {language === "bn" ? link.label.bn : link.label.en}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {hasCategoryDrawer && (
        <>
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
              <h2 className="text-sm font-bold text-[#24452c]">
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
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsDrawerOpen(false)}
                      tabIndex={isDrawerOpen ? 0 : -1}
                      className={`flex min-h-12 items-center justify-between border-b border-[#f1ede5] px-5 py-3 text-sm font-medium transition ${
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
      )}
    </>
  );
};

export default CategoryNavbar;
