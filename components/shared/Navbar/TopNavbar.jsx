import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProductSearch from "../../ProductSearchForm";
import { buttonVariants } from "../../ui/Button";

const Navbar = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-[999] bg-green-light shadow-lg border-b border-primary/20 h-12 md:h-14 flex items-center">
            <nav className="flex justify-between items-center wrapper gap-20">
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

                <div className="flex items-center gap-5 justify-center">
                    <div className="flex rounded-full overflow-hidden border-2 border-primary/40 bg-gradient-to-r from-primary/8 to-primary/12 h-9 sm:h-10">
                        <button className="px-2.5 sm:px-3 md:px-4 py-1 text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all">
                            EN
                        </button>
                        <button className="px-2.5 sm:px-3 md:px-4 py-1 text-xs sm:text-sm font-bold text-primary hover:bg-primary/10 transition-all">
                            BN
                        </button>
                    </div>
                    <Link
                        href="/"
                        className={buttonVariants({
                            variant: "primary",
                        })}
                    >
                        Login
                    </Link>
                    <button className="p-2 md:p-2.5 hover:bg-primary/15 rounded-lg transition-all text-primary hover:scale-110">
                        <Heart
                            size={22}
                            className="md:w-6 md:h-6"
                            fill="none"
                        />
                    </button>

                    <div>
                        <button className="p-2 md:p-2.5 hover:bg-primary/15 rounded-lg transition-all text-primary hover:scale-110 relative">
                            <ShoppingBag size={22} className="md:w-6 md:h-6" />
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red to-orange text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                0
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
