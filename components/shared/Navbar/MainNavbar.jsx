"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { setLanguage } from "@/redux/features/language/languageSlice";
import ProductSearch from "../../ProductSearchForm";
import { buttonVariants } from "../../ui/Button";

import {
  Heart,
  Search,
  ShoppingBag,
  X,
  Menu,
  UserRound,
  Package,
  LogOut,
  DoorOpenIcon,
} from "lucide-react";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { userAndToken } = useSelector((state) => state.auth);
  const { language } = useSelector((state) => state.language);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dispatch = useDispatch();

  const categoryLinks = [
    { href: "/products", label: { en: "All Products", bn: "সব পণ্য" } },
    { href: "/categories/thanaka", label: { en: "Thanaka", bn: "থানাকা" } },
    {
      href: "/categories/face-care",
      label: { en: "Face Care", bn: "ফেস কেয়ার" },
    },
    {
      href: "/categories/soap-cleansing",
      label: { en: "Soap & Cleansing", bn: "সাবান ও ক্লিনজিং" },
    },
    {
      href: "/categories/lotion-moisturizer",
      label: { en: "Lotion & Moisturizer", bn: "লোশন ও ময়েশ্চারাইজার" },
    },
    {
      href: "/categories/chandan-sandalwood",
      label: { en: "Chandan & Sandalwood", bn: "চন্দন ও চন্দনজাত" },
    },
    {
      href: "/categories/balm-wellness",
      label: { en: "Balm & Wellness", bn: "বাম ও ওয়েলনেস" },
    },

    {
      href: "/categories/combo-packs",
      label: { en: "Combo Packs", bn: "কম্বো প্যাক" },
    },

    {
      href: "/products?filter=offers",
      label: { en: "Offers", bn: "অফার" },
      offer: true,
    },
  ];

  return (
    <header className="fixed left-0 right-0 top-9 z-[999] h-20 border-b border-primary/10 bg-green-light/95 backdrop-blur-md">
      <nav className="wrapper mx-auto flex h-full w-full items-center gap-5 px-4">
        <div className="relative h-14 w-[100px] shrink-0 sm:w-[170px] md:w-[190px]">
          <Link href="/" className="block h-full w-full">
            <Image
              src="/assets/purehillglowweblogo.png"
              alt="Pure Hill Glow"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>
        </div>

        <div className="hidden flex-1 lg:flex">
          <ProductSearch />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsOpen(false);
            }}
            className="rounded-full p-2 text-primary hover:bg-primary/10 lg:hidden eq"
            aria-label="Search"
          >
            {isSearchOpen ? <X size={21} /> : <Search size={21} />}
          </button>

          <div className="hidden overflow-hidden rounded-md border border-primary/30 bg-primary/20 sm:flex">
            <button
              onClick={() => dispatch(setLanguage("en"))}
              className={`px-2 py-1.5 text-xs font-semibold eq ${
                language === "en"
                  ? "bg-primary text-light"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              EN
            </button>

            <button
              onClick={() => dispatch(setLanguage("bn"))}
              className={`px-2 py-1.5 text-xs font-semibold eq ${
                language === "bn"
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              BN
            </button>
          </div>

          {/* ================= ACCOUNT ================= */}
          {userAndToken ? (
            <div className="relative">
              {/*=========== User Button =========== */}
              <button
                type="button"
                onClick={() => setIsAccountOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-dark eq hover:bg-primary/10 cursor-pointer"
              >
                {/* =============== User Image ==============*/}
                {userAndToken?.user?.image ? (
                  <Image
                    src={userAndToken.user.image}
                    alt={userAndToken?.user?.username || "User"}
                    width={34}
                    height={34}
                    className="h-6 w-6 md:h-8 md:w-8 rounded-full border border-primary/30 object-cover "
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound size={18} />
                  </div>
                )}

                {/* ============ Username ============*/}
                <span className="hidden max-w-[100px] truncate text-sm font-medium md:block">
                  {userAndToken?.user?.username || "Account"}
                </span>

                {/* ============ dropdown icon ===========*/}
                <span
                  className={`hidden text-xs transition-transform duration-200 md:block ${
                    isAccountOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* ================= ACCOUNT DROPDOWN ================= */}
              {isAccountOpen && (
                <div className="absolute right-0 top-full z-[1000] mt-2 w-56 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-xl">
                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-dark eq hover:bg-primary/10 hover:text-primary"
                  >
                    <UserRound size={18} />

                    <span>{language === "bn" ? "প্রোফাইল" : "Profile"}</span>
                  </Link>

                  {/*================ My Orders ==============*/}
                  <Link
                    href="/my-orders"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-dark eq hover:bg-primary/10 hover:text-primary"
                  >
                    <Package size={18} />

                    <span>
                      {language === "bn" ? "আমার অর্ডার" : "My Orders"}
                    </span>
                  </Link>

                  <div className="border-t border-gray-100" />

                  {/*========== Logout ===========*/}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountOpen(false);
                      dispatch(logout());
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red eq hover:bg-red/10"
                  >
                    <LogOut size={18} />

                    <span>{language === "bn" ? "লগআউট" : "Logout"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================= LOGIN ================= */
            <Link
              href="/auth/login"
              className={`${buttonVariants({
                variant: "primary",
              })} ml-2 hidden items-center gap-2 sm:inline-flex`}
            >
              <UserRound size={17} />

              {language === "bn" ? "লগইন" : "Login"}
            </Link>
          )}

          {/*========== Wishlist ==========*/}
          <Link
            href="/wishlist"
            className="relative hidden rounded-full p-2 text-dark eq hover:bg-primary/10 hover:text-primary md:block "
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={21} strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 hidden min-w-4 rounded-full bg-primary px-1 text-center text-[9px] font-bold text-light">
              0
            </span>
          </Link>
          {/*================ cart============= */}
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-dark eq hover:bg-primary/10 hover:text-primary"
            aria-label="Cart"
            title="Cart"
          >
            <ShoppingBag size={21} strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red px-1 text-center text-[9px] font-bold text-white">
              0
            </span>
          </Link>

          {/*========== Mobile Menu Button ===========*/}
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setIsSearchOpen(false);
            }}
            className="rounded-full p-2 text-primary eq hover:bg-primary/10 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {/*============= search form ===============*/}
      {isSearchOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-primary/10 bg-green-light p-4 shadow-md lg:hidden">
          <ProductSearch />
        </div>
      )}

      <div
        className={`fixed inset-0 z-[998] bg-black/20 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed left-0 top-20 z-[999] h-[calc(100vh-5rem)] w-[82%] max-w-xs border-r border-primary/10 bg-green-light shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Menu
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-primary transition hover:bg-primary/10"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pb-1">
          <ul className="flex flex-col py-3">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block border-b border-primary/5 px-6 py-3 text-base font-medium transition ${
                    link.offer
                      ? "text-red hover:bg-red/5 hover:text-red"
                      : "text-dark hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {language === "bn" ? link.label.bn : link.label.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
