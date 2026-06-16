"use client";
import { Heart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { setLanguage } from "@/redux/features/language/languageSlice";
import ProductSearch from "../../ProductSearchForm";
import { buttonVariants } from "../../ui/Button";

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { userAndToken } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.language);
    const dispatch = useDispatch();

    return (
        <header className="fixed top-0 left-0 right-0 z-[999] bg-green-light shadow-lg border-b border-primary/20 h-12 md:h-14 flex items-center">
            <nav className="flex justify-between items-center wrapper gap-3 sm:gap-5 md:gap-10 lg:gap-20">
                <div>
                    <Link
                        href="/"
                        className="font-bold text-lg md:text-2xl text-primary hover:text-primary/80 eq"
                    >
                        Purehillglow
                    </Link>
                </div>

                <div className="hidden lg:flex flex-1">
                    <ProductSearch />
                </div>

                <div className="flex items-center gap-1 sm:gap-2 justify-center">
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 hover:bg-primary/15 rounded-lg transition-all text-primary lg:hidden"
                        aria-label={language === "bn" ? "সার্চ টগল করুন" : "Toggle search"}
                        title={language === "bn" ? "সার্চ" : "Search"}
                    >
                        <Search size={22} className="md:w-6 md:h-6" />
                    </button>
                    <div className="hidden sm:flex rounded-full overflow-hidden border-2 border-primary/40 bg-gradient-to-r from-primary/8 to-primary/12 h-9 sm:h-10">
                        {/** Language toggle buttons wired to Redux */}
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
                        <button
                            onClick={() => dispatch(logout())}
                            className={`${buttonVariants({ variant: "primary" })} hidden sm:inline-flex ml-2`}
                        >
                            {language === "bn" ? "লগআউট" : "Logout"}
                        </button>
                    ) : (
                        <Link
                            href="/auth/login"
                            className={`${buttonVariants({ variant: "primary" })} hidden sm:inline-flex ml-2`}
                        >
                            {language === "bn" ? "লগইন" : "Login"}
                        </Link>
                    )}
                    
                    <button
                        className="p-2 md:p-2.5 hover:bg-primary/15 rounded-lg transition-all text-primary hover:scale-110"
                        aria-label={language === "bn" ? "ইচ্ছেতালিকা" : "Wishlist"}
                        title={language === "bn" ? "ইচ্ছেতালিকা" : "Wishlist"}
                    >
                        <Heart
                            size={22}
                            className="md:w-6 md:h-6"
                            fill="none"
                        />
                    </button>

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
                </div>
            </nav>
            {isSearchOpen && (
                <div className="absolute top-full left-0 w-full bg-green-light p-4 shadow-md border-b border-primary/20 lg:hidden">
                    <ProductSearch />
                </div>
            )}
        </header>
    );
};

export default Navbar;
