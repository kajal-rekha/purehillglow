import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProductSearch from "../ProductSearchForm";
import { buttonVariants } from "../ui/Button";

const Navbar = () => {
    return (
        <header className="h-20 fixed top-0 left-0 right-0 z-[99]  flex items-center  shadow-sm">
            <nav className="flex justify-between items-center gap-10 wrapper">
                <div>
                    <Link
                        href="/"
                        className=" font-semibold text-xl font-vibes"
                    >
                        Purehillglow
                        {/* <Image
                        src="https://res.cloudinary.com/dh0ado2ir/image/upload/v1764215598/purehillglow-logo-website_clw2mn.jpg"
                        alt="pure hill glow logo"
                        width={200}
                        height={200}
                        className="w-20 h-20 rounded-full"
                    /> */}
                    </Link>
                </div>

                <div className="w-[30%]">
                    <ProductSearch />
                </div>

                <div className="flex item-center gap-5">
                    <div className="flex  rounded-md overflow-hidden  justify-between h-11">
                        <button
                            className="px-1.5 md:px-2 py-1 text-sm 
                                     bg-primary text-light"
                        >
                            EN
                        </button>
                        <button
                            className="px-1.5 md:px-2 py-1  text-sm 
                                     bg-primary text-light"
                        >
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

                    <div className="relative cursor-pointer mt-3">
                        <ShoppingBag className="text-dark/90 w-6 h-6" />

                        <span className="absolute -top-1 -right-1 bg-red text-light text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow">
                            0
                        </span>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
