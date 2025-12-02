import { Search } from "lucide-react";

const ProductSearch = () => {
    return (
        <div className="hidden md:block mx-auto ">
            <form className="relative border border-dark/20 focus-within:border-primary/50 rounded-full w-full eq">
                <input
                    type="search"
                    placeholder="what are you looking for?"
                    className="search-input text-sm bg-transparent rounded-sm focus:outline-none text-dark w-full py-3 pl-4 pr-12 "
                />

                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 rounded-r text-dark hover:bg-primary hover:text-light eq"
                    aria-label="Search"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ProductSearch;
