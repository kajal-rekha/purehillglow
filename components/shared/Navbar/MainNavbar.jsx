"use client";
import { Heart, Search, ShoppingBag, X, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { setLanguage } from "@/redux/features/language/languageSlice";
import ProductSearch from "../../ProductSearchForm";
import { buttonVariants } from "../../ui/Button";
import Image from "next/image";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { userAndToken } = useSelector((state) => state.auth);
  const { language } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: { en: "Home", bn: "হোম" } },
    {
      href: "/products",
      label: { en: "Products", bn: "প্রোডাক্টস" },
    },
    {
      href: "/categories",
      label: { en: "Categories", bn: "বিভাগসমূহ" },
    },
    {
      href: "/about-us",
      label: { en: "About Us", bn: "আমাদের সম্পর্কে" },
    },
    {
      href: "/contact",
      label: { en: "Contact", bn: "যোগাযোগ" },
    },
  ];

  return (
    <header className="fixed top-0 md:top-9 left-0 right-0 z-[999] bg-green-light shadow-lg border-b border-primary/20 h-14 md:h-16 flex items-center">
      <nav className="flex justify-between items-center wrapper gap-3 sm:gap-5 md:gap-10 lg:gap-20 w-full">
        {/* <div className="w-[160px] h-[45px] flex items-center justify-center">
          <Link href="/">
            <Image
              src="/assets/purehillglowweblogo .png"
              alt="Pure Hill Glow"
              width={180}
              height={60}
              className="w-full h-full object-contain"
              priority
            />
          </Link>
        </div> */}

        <div className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] h-14 relative">
          <Link href="/" className="block w-full h-full">
            <Image
              src="/assets/purehillglowweblogo.png"
              alt="Pure Hill Glow"
              fill
              priority
              className="object-contain"
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex justify-between gap-5 flex-nowrap whitespace-nowrap">
            {navLinks.map((link) => (
              <li
                key={link.href}
                className="border-b-2 border-transparent hover:border-primary text-[15px] font-semibold text-dark/90 eq"
              >
                <Link href={link.href} className="inline-flex items-center">
                  {language === "bn" ? link.label.bn : link.label.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 sm:gap-2 justify-end flex-1">
          <div className="hidden lg:flex flex-1">
            <ProductSearch />
          </div>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-primary/15 rounded-lg text-primary md:hidden"
            aria-label={language === "bn" ? "সার্চ টগল করুন" : "Toggle search"}
            title={language === "bn" ? "সার্চ" : "Search"}
          >
            <Search size={22} className="md:w-6 md:h-6" />
          </button>

          <div className="hidden sm:flex rounded-full overflow-hidden border-2 border-primary/40 bg-gradient-to-r from-primary/8 to-primary/12 h-9 sm:h-10">
            <button
              onClick={() => dispatch(setLanguage("en"))}
              aria-pressed={language === "en"}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold transition-all ${
                language === "en"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => dispatch(setLanguage("bn"))}
              aria-pressed={language === "bn"}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold transition-all ${
                language === "bn"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              BN
            </button>
          </div>

          {userAndToken ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline-block ml-2">
                <Image
                  src={userAndToken?.user?.image}
                  alt={userAndToken?.user?.username || "user"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/40"
                />
              </Link>
              <button
                onClick={() => dispatch(logout())}
                className={`${buttonVariants({ variant: "primary" })} hidden sm:inline-flex ml-2`}
              >
                {language === "bn" ? "লগআউট" : "Logout"}
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className={`${buttonVariants({ variant: "primary" })} hidden sm:inline-flex ml-2`}
            >
              {language === "bn" ? "লগইন" : "Login"}
            </Link>
          )}

          <div>
            <button
              className="p-2 md:p-2.5 hover:bg-primary/15 rounded-lg transition-all text-primary hover:scale-110 relative"
              aria-label={language === "bn" ? "শপিং ব্যাগ" : "Cart"}
              title={language === "bn" ? "শপিং ব্যাগ" : "Cart"}
            >
              <ShoppingBag size={22} className="md:w-6 md:h-6" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red to-orange text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                0
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-primary/15 rounded-lg transition text-primary md:hidden"
            aria-label={language === "bn" ? "মেনু টগল করুন" : "Toggle menu"}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[97] md:hidden bg-green-light shadow-lg border-b border-primary/20 pb-5 pt-2">
          <ul className="flex flex-col gap-0 py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-3 text-sm font-semibold text-dark hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  {language === "bn" ? link.label.bn : link.label.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-green-light p-4 shadow-md border-b border-primary/20 md:hidden">
          <ProductSearch />
        </div>
      )}
    </header>
  );
};

export default Navbar;
