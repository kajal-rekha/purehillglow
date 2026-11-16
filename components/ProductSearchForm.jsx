"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ProductSearch = ({ onSearchComplete, className = "" }) => {
  const language = useSelector((state) => state.language.language);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const isBangla = language === "bn";
  const placeholderText = isBangla
    ? "প্রাকৃতিক উপাদান বা পণ্য খুঁজুন..."
    : "Search natural skincare, Thanaka...";
  const ariaLabel = isBangla ? "অনুসন্ধান" : "Search";

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
    if (onSearchComplete) onSearchComplete();
    router.push({
      pathname: "/products",
      query: query ? { search: query } : {},
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-center overflow-hidden rounded-full border border-[#d6dfd3] bg-[#fbfdfa] shadow-xs transition-all duration-200 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15"
      >
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholderText}
          className="search-input w-full bg-transparent py-2 pl-4 pr-11 text-xs text-dark placeholder:text-[#7d8a7c] focus:outline-none sm:py-2.5 sm:text-sm"
        />

        <button
          type="submit"
          className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-xs transition-all hover:bg-secondary active:scale-95 sm:h-8 sm:w-8"
          aria-label={ariaLabel}
          title={ariaLabel}
        >
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </form>
    </div>
  );
};

export default ProductSearch;