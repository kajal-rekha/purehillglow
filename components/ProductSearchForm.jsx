"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ProductSearch = () => {
    const language = useSelector((state) => state.language.language);
    const router = useRouter();
    const [search, setSearch] = useState("");

    const placeholderText = language === "bn" ? "পণ্য অনুসন্ধান করুন..." : "Search products...";
    const ariaLabel = language === "bn" ? "অনুসন্ধান" : "Search";

    useEffect(() => {
        if (router.isReady) {
            setSearch(
                typeof router.query.search === "string" ? router.query.search : ""
            );
        }
    }, [router.isReady, router.query.search]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const query = search.trim();
        router.push({
            pathname: "/products",
            query: query ? { search: query } : {},
        });
    };

    return (
        <div className=" flex items-center mx-auto">
            <form
                onSubmit={handleSubmit}
                className="relative border border-dark/30 focus-within:border-primary/50 rounded-xl min-w-xl eq"
            >
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={placeholderText}
                    className="search-input text-sm bg-transparent rounded-sm focus:outline-none text-dark w-full py-3 pl-4 pr-12 "
                />

                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3.5 rounded-r text-light bg-primary hover:bg-primary/90 eq"
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
