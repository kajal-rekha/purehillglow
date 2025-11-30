import { Search } from "lucide-react";

const ProductSearch = () => {
    return (
        <div className="hidden md:block w-full mx-auto ">
            <form className="relative w-full">
                <input
                    type="search"
                    placeholder="search placeholder"
                    value=""
                    className="text-sm bg-light rounded-sm focus:outline-none text-dark w-full py-3 pl-4 pr-12"
                />
                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-4 text-dark hover:bg-primary hover:text-light eq"
                    aria-label="Search"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ProductSearch;
