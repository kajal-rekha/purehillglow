"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "@/redux/features/auth/authSlice";
import { setLanguage } from "@/redux/features/language/languageSlice";
import ProductSearch from "../../ProductSearchForm";
import { buttonVariants } from "../../ui/Button";

import {
  Heart,
  Search,
  X,
  Menu,
  UserRound,
  Package,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Flame,
  Phone,
  MessageCircle,
  ChevronRight,
  Leaf,
  Home,
  Info,
  HelpCircle,
  Mail,
} from "lucide-react";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const accountDropdownRef = useRef(null);

  const { userAndToken } = useSelector((state) => state.auth);
  const { language } = useSelector((state) => state.language);
  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const dispatch = useDispatch();

  const isBangla = language === "bn";
  const userId = userAndToken?.user?._id;
  const userRole = userAndToken?.user?.role;
  const token = userAndToken?.token;

  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.cartQuantity) || 0),
    0
  );

  // Sync fresh user role
  useEffect(() => {
    if (!userId || !token) return;
    let isMounted = true;

    fetch(`/api/users/${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((freshUser) => {
        if (isMounted && freshUser?._id && freshUser.role !== userRole) {
          dispatch(login({ user: freshUser, token }));
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [userId, userRole, token, dispatch]);

  // Fetch categories for mobile drawer
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.error("Failed to load categories in navbar:", err);
      }
    };
    fetchCats();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const primaryNavLinks = [
    {
      href: "/",
      label: { en: "Home", bn: "হোম" },
      icon: Home,
    },
    {
      href: "/products",
      label: { en: "All Products", bn: "সব পণ্য" },
      icon: Leaf,
    },
    {
      href: "/about",
      label: { en: "About Us", bn: "আমাদের সম্পর্কে" },
      icon: Info,
    },
    {
      href: "/faq",
      label: { en: "FAQ", bn: "সাধারণ জিজ্ঞাসা" },
      icon: HelpCircle,
    },
    {
      href: "/contact",
      label: { en: "Contact Us", bn: "যোগাযোগ" },
      icon: Mail,
    },
    {
      href: "/products?filter=offers",
      label: { en: "Hot Offers", bn: "বিশেষ অফার" },
      icon: Flame,
      highlight: true,
    },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-9 z-[999] h-20 border-b border-[#e7decb] bg-[#fffdf9]/95 shadow-[0_2px_14px_rgba(40,54,24,0.05)] backdrop-blur-md">
        <nav className="wrapper mx-auto flex h-full items-center justify-between gap-1 px-3 sm:gap-4 sm:px-4 md:px-6">
          {/* ============ LEFT (MENU TRIGGER + LOGO) ============ */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ============ Mobile Hamburger Menu Button ============ */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setIsSearchOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 text-primary transition-colors hover:bg-primary/10 active:scale-95 md:hidden"
              aria-label={isBangla ? "মেনু খুলুন" : "Open menu"}
            >
              <Menu size={20} />
            </button>

            {/* ============ Brand Logo ============ */}
            <Link
              href="/"
              className="group relative flex h-11 w-[130px] shrink-0 items-center transition-opacity hover:opacity-95 xs:w-[150px] sm:h-13 sm:w-[175px] md:w-[195px]"
              aria-label="Pure Hill Glow Home"
            >
              <Image
                src="/assets/purehillglowweblogo.png"
                alt="Pure Hill Glow"
                fill
                priority
                sizes="(max-width: 640px) 140px, 195px"
                className="object-contain object-left"
              />
            </Link>
          </div>

          {/* ============ CENTER SEARCH (DESKTOP) ============ */}
          <div className="hidden flex-1 justify-center px-4 md:flex lg:px-8">
            <div className="w-full max-w-lg">
              <ProductSearch />
            </div>
          </div>

          {/* ============ RIGHT (ACTIONS) ============ */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* ============ Mobile Search Toggle ============ */}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-dark transition-colors md:hidden ${isSearchOpen ? "bg-primary text-white" : "hover:bg-primary/10"
                }`}
              aria-label={isBangla ? "অনুসন্ধান" : "Search"}
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* ============ Language Switcher Pill ============ */}
            <div className="flex items-center overflow-hidden rounded-full border border-primary/25 bg-[#eff5ee] p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => dispatch(setLanguage("en"))}
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-all sm:px-2.5 sm:text-xs ${language === "en"
                    ? "bg-[#2d4e35] text-white shadow-xs"
                    : "text-[#2d4e35] hover:bg-primary/10"
                  }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => dispatch(setLanguage("bn"))}
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-all sm:px-2.5 sm:text-xs ${language === "bn"
                    ? "bg-[#2d4e35] text-white shadow-xs"
                    : "text-[#2d4e35] hover:bg-primary/10"
                  }`}
              >
                বাংলা
              </button>
            </div>

            {/* ============ Wishlist Button ============ */}
            <Link
              href="/wishlist"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#344b36] transition-all hover:bg-primary/10 hover:text-primary sm:h-9 sm:w-9"
              aria-label={isBangla ? "পছন্দের তালিকা" : "Wishlist"}
              title={isBangla ? "পছন্দের তালিকা" : "Wishlist"}
            >
              <Heart
                size={19}
                strokeWidth={1.9}
                className={
                  wishlistItems.length > 0 ? "fill-red-500 text-red-500" : ""
                }
              />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* ============ Cart Button ============ */}
            <Link
              href="/cart"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#344b36] transition-all hover:bg-primary/10 hover:text-primary sm:h-9 sm:w-9"
              aria-label={isBangla ? "শপিং কার্ট" : "Shopping cart"}
              title={isBangla ? "শপিং কার্ট" : "Shopping cart"}
            >
              <ShoppingBag size={19} strokeWidth={1.9} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2d4e35] px-1 text-[9px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ============ Account / Login ============ */}
            {userAndToken ? (
              <div className="relative" ref={accountDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 p-1 text-dark shadow-2xs transition-colors hover:bg-primary/10 md:px-2.5 md:py-1"
                  aria-expanded={isAccountOpen}
                  aria-label="User Account"
                >
                  {userAndToken?.user?.image ? (
                    <Image
                      src={userAndToken.user.image}
                      alt={userAndToken?.user?.username || "User"}
                      width={28}
                      height={28}
                      className="h-6 w-6 rounded-full border border-primary/30 object-cover sm:h-7 sm:w-7"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d4e35] text-white sm:h-7 sm:w-7">
                      <UserRound size={14} />
                    </div>
                  )}

                  <span className="hidden max-w-[90px] truncate text-xs font-semibold text-[#1e3423] md:block">
                    {userAndToken?.user?.username || "Account"}
                  </span>

                  <span
                    className={`hidden text-[10px] text-dark/60 transition-transform duration-200 md:block ${isAccountOpen ? "rotate-180" : ""
                      }`}
                  >
                    ▼
                  </span>
                </button>

                {/* ============ Account Dropdown ============ */}
                {isAccountOpen && (
                  <div className="absolute right-0 top-full z-[1001] mt-2 w-56 overflow-hidden rounded-2xl border border-[#e4ded0] bg-white p-1.5 shadow-xl">
                    <div className="border-b border-gray-100 px-3 py-2.5">
                      <p className="truncate text-xs font-bold text-[#1f3724]">
                        {userAndToken?.user?.username || "User"}
                      </p>
                      <p className="truncate text-[11px] text-dark/50">
                        {userAndToken?.user?.email}
                      </p>
                    </div>

                    {userAndToken?.user?.role === "admin" && (
                      <Link
                        href="/adminDashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsAccountOpen(false)}
                        className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard size={15} />
                          <span>
                            {isBangla ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}
                          </span>
                        </span>
                        <span className="text-[10px] opacity-60">↗</span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setIsAccountOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-dark transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <UserRound size={15} />
                      <span>{isBangla ? "আমার প্রোফাইল" : "My Profile"}</span>
                    </Link>

                    <Link
                      href="/my-orders"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-dark transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Package size={15} />
                      <span>{isBangla ? "আমার অর্ডারসমূহ" : "My Orders"}</span>
                    </Link>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        dispatch(logout());
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      <span>{isBangla ? "লগআউট" : "Logout"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#2d4e35] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#1f3825] active:scale-95 sm:px-3.5"
                aria-label={isBangla ? "লগইন" : "Login"}
              >
                <UserRound size={14} />
                <span className="hidden sm:inline">
                  {isBangla ? "লগইন" : "Login"}
                </span>
              </Link>
            )}
          </div>
        </nav>

        {/* ============ MOBILE COLLAPSIBLE SEARCH BAR ============ */}
        {isSearchOpen && (
          <div className="border-b border-[#e6decb] bg-[#fffdfa] px-4 py-3 shadow-md md:hidden">
            <ProductSearch onSearchComplete={() => setIsSearchOpen(false)} />
          </div>
        )}
      </header>

      {/* ============ MOBILE NAVIGATION DRAWER ============ */}
      {/* ============ Backdrop ============ */}
      <div
        className={`fixed inset-0 z-[1199] bg-black/50 backdrop-blur-xs transition-opacity duration-300 md:hidden ${isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* ============ Slide-out Drawer Panel ============ */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-[1200] flex w-[min(340px,86vw)] flex-col bg-[#fffdf9] shadow-2xl transition-transform duration-300 ease-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* ============ Drawer Header ============ */}
        <div className="flex items-center justify-between border-b border-[#ece6d9] bg-[#f8f5ee] px-4 py-3.5">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="relative h-10 w-36"
          >
            <Image
              src="/assets/purehillglowweblogo.png"
              alt="Pure Hill Glow"
              fill
              className="object-contain object-left"
            />
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-dark shadow-2xs hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ============ Drawer Search ============ */}
        <div className="border-b border-[#ece6d9] p-3">
          <ProductSearch onSearchComplete={() => setIsOpen(false)} />
        </div>

        {/* ============ Drawer Scrollable Body ============ */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {/* ============ Main Navigation Links ============ */}
          <div className="mb-3 space-y-1">
            {primaryNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${link.highlight
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "text-[#223926] hover:bg-primary/10 hover:text-primary"
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{isBangla ? link.label.bn : link.label.en}</span>
                  </span>
                  <ChevronRight size={14} className="opacity-40" />
                </Link>
              );
            })}
          </div>

          {/* ============ Dynamic Categories Section ============ */}
          <div className="border-t border-[#ece6d9] pt-3">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#526354]">
              {isBangla ? "পণ্য ক্যাটাগরি" : "Explore Collections"}
            </p>

            <div className="space-y-1">
              {categories.map((cat) => {
                const catName = isBangla
                  ? cat.name?.bn || cat.name?.en
                  : cat.name?.en || cat.name?.bn;
                const catLink = `/products?category=${cat._id}`;

                return (
                  <Link
                    key={cat._id}
                    href={catLink}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-dark/85 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="flex items-center gap-2.5">
                      {cat.image ? (
                        <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border border-primary/20">
                          <Image
                            src={cat.image}
                            alt={catName || "Category"}
                            fill
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <Leaf size={14} className="text-primary" />
                      )}
                      <span className="truncate">{catName}</span>
                    </span>
                    <ChevronRight size={13} className="opacity-40" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ============ Account & Orders Quick Links (Mobile) ============ */}
          <div className="mt-4 border-t border-[#ece6d9] pt-3">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#526354]">
              {isBangla ? "আমার অ্যাকাউন্ট ও অর্ডার" : "Account & Orders"}
            </p>

            <div className="space-y-1">
              {userAndToken?.user?.role === "admin" && (
                <Link
                  href="/adminDashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard size={15} />
                    <span>
                      {isBangla ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}
                    </span>
                  </span>
                  <ChevronRight size={13} className="opacity-50" />
                </Link>
              )}

              <Link
                href="/my-orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-dark/85 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <span className="flex items-center gap-2.5">
                  <Package size={15} className="text-primary" />
                  <span>{isBangla ? "আমার অর্ডারসমূহ" : "My Orders"}</span>
                </span>
                <ChevronRight size={13} className="opacity-40" />
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-dark/85 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <span className="flex items-center gap-2.5">
                  <Heart size={15} className="text-primary" />
                  <span>{isBangla ? "পছন্দের তালিকা" : "Wishlist"}</span>
                </span>
                <ChevronRight size={13} className="opacity-40" />
              </Link>

              {userAndToken && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-dark/85 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <span className="flex items-center gap-2.5">
                    <UserRound size={15} className="text-primary" />
                    <span>{isBangla ? "আমার প্রোফাইল" : "My Profile"}</span>
                  </span>
                  <ChevronRight size={13} className="opacity-40" />
                </Link>
              )}
            </div>
          </div>

          {/* ============ Customer Support & Assistance ============ */}
          <div className="mt-4 border-t border-[#ece6d9] pt-3">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#526354]">
              {isBangla ? "সহযোগিতা ও যোগাযোগ" : "Help & Contact"}
            </p>

            <div className="space-y-1">
              <Link
                href="https://wa.me/8801762144200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-dark transition-colors hover:bg-green-50"
              >
                <MessageCircle size={15} className="text-green-600" />
                <span>{isBangla ? "হোয়াটসঅ্যাপে চ্যাট করুন" : "Chat on WhatsApp"}</span>
              </Link>

              <Link
                href="tel:+8801762144200"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-dark transition-colors hover:bg-green-50"
              >
                <Phone size={15} className="text-primary" />
                <span>01762-144200</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ============ Drawer Footer ============ */}
        <div className="border-t border-[#ece6d9] bg-[#f8f5ee] p-3">
          {userAndToken ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2d4e35] text-white">
                  <UserRound size={14} />
                </div>
                <span className="max-w-[140px] truncate text-xs font-bold text-[#1f3724]">
                  {userAndToken?.user?.username}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  dispatch(logout());
                }}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                {isBangla ? "লগআউট" : "Logout"}
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2d4e35] py-2 text-xs font-semibold text-white shadow-xs"
            >
              <UserRound size={14} />
              <span>{isBangla ? "অ্যাকাউন্টে লগইন করুন" : "Sign In to Account"}</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;