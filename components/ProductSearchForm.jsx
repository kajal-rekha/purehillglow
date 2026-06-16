import { Search } from "lucide-react";
import { useSelector } from "react-redux";

const ProductSearch = () => {
    const language = useSelector((state) => state.language.language);

    const placeholderText = language === "bn" ? "আপনি কি খুঁজছেন?" : "what are you looking for?";
    const ariaLabel = language === "bn" ? "অনুসন্ধান" : "Search";

    return (
        <div className=" flex items-center mx-auto">
            <form className="relative border border-dark/20 focus-within:border-primary/50 rounded-full w-full hidden md:block eq">
                <input
                    type="search"
                    placeholder={placeholderText}
                    className="search-input text-sm bg-transparent rounded-sm focus:outline-none text-dark w-full py-3 pl-4 pr-12 "
                />

                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 rounded-r text-dark hover:bg-primary hover:text-light eq"
                    aria-label={ariaLabel}
                    title={ariaLabel}
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ProductSearch;
