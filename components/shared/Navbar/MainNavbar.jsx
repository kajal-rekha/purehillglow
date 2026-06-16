"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";

const MainNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const language = useSelector((state) => state.language.language);

    const navLinks = [
        { href: "/", label: { en: "Home", bn: "হোম" } },
        {
            href: "/beauty-skincare",
            label: { en: "Beauty & Skincare", bn: "বিউটি ও স্কিনকেয়ার" },
        },
        {
            href: "/pickels",
            label: { en: "Organic Hill Pickles", bn: "অর্গানিক হিল পিকেল" },
        },
        {
            href: "/hill-accessories",
            label: { en: "Hill Accessories", bn: "হিল এক্সেসরিজ" },
        },
        {
            href: "/hill-clothes",
            label: { en: "Traditional Hill Clothes", bn: "ঐতিহ্যবাহী হিল পোশাক" },
        },
        { href: "/combo-offer", label: { en: "Combo Offer", bn: "কম্বো অফার" } },
        { href: "/new-arrivals", label: { en: "New Arrivals", bn: "নতুন প্রোডাক্ট" } },
    ];

    return (
        <>
             {/*======== Desktop Navigation  ==========*/}
            <div className="h-14 lg:h-16 fixed top-12 md:top-14 left-0 right-0 z-[98] hidden lg:flex items-center shadow-sm bg-gradient-to-r from-blue via-blue to-blue text-light border-primary/50">
                <ul className="flex justify-start gap-4 lg:gap-6 xl:gap-12 wrapper flex-wrap">
                    {navLinks.map((link) => (
                        <li
                            key={link.href}
                            className="text-[0.85rem] xl:text-[0.95rem] font-semibold"
                        >
                            <Link
                                href={link.href}
                                className="!text-light hover:!text-light/80 no-underline hover:no-underline transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-light/80"
                            >
                                {language === "bn" ? link.label.bn : link.label.en}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/*========= Mobile Navigation Toggle =========*/}
            <div className="h-14 fixed top-12 md:top-14 left-0 right-0 z-[98] lg:hidden flex items-center shadow-sm bg-gradient-to-r from-blue to-blue text-light border-b-2 border-primary/50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="ml-4 p-2 hover:bg-primary/20 rounded-lg transition"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="ml-4 font-semibold text-sm">
                    {language === "bn" ? "ক্যাটাগরিস" : "Categories"}
                </span>
            </div>

            {/*========== Mobile Menu =========*/}
            {isOpen && (
                <div className="fixed top-[6.5rem] md:top-[7rem] left-0 right-0 z-[97] lg:hidden bg-gradient-to-b from-blue to-blue/95 text-light shadow-lg border-b-2 border-primary/50 pb-5 pt-2 min-h-screen">
                    <ul className="flex flex-col gap-0 py-2">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-6 py-3 text-sm font-semibold !text-light hover:!text-light/80 no-underline hover:no-underline hover:bg-primary/30 border-l-4 border-transparent hover:border-primary transition-all duration-300"
                                >
                                    {language === "bn" ? link.label.bn : link.label.en}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default MainNavbar;
