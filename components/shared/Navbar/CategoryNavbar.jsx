"use client";

import { ChevronDown, Flame } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";


const CategoryNavbar = () => {
  const { language } = useSelector((state) => state.language);


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

  return (
    <div className="fixed left-0 right-0 top-[116px] z-[998] hidden h-16 border-b border-primary/10 bg-white md:block">
      <div className="wrapper mx-auto flex h-full items-center px-4">
        <nav className="flex w-full items-center justify-center">
          <ul className="flex items-center gap-12 ">
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
      </div>
    </div>
  );
};

export default CategoryNavbar;
