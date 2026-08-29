"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "./ui/Loading";
import {
  Leaf,
  Droplets,
  Sparkles,
  Package,
  FlaskConical,
  CircleDot,
  SprayCan,
  HandHeart,
  Cannabis,
} from "lucide-react";
import { useSelector } from "react-redux";
import Error from "./ui/Error";
const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const language = useSelector((state) => state.language.language);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="w-full  bg-light-gray mt-5 pt-12 pb-14">
      {loading ? (
        <div className="w-full py-8 flex justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="w-full py-8 flex flex-col items-center justify-center text-center">
          <Error />
          <p className="text-red text-sm">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="w-full py-8 flex items-center justify-center">
          <p className="text-dark text-sm">
            No categories available at the moment.
          </p>
        </div>
      ) : (
        <>
          {/* ================= Heading ================= */}
          <div className="mb-5 text-center">
            <h2 className="font-poppins text-xl font-bold uppercase tracking-wide text-dark md:text-2xl">
              Shop By Category
            </h2>

            <div className="mt-1 flex items-center justify-center gap-5">
              <span className="h-[2px] w-24 bg-primary/30" />

              <span className="text-primary text-sm">
                <Cannabis className="w-3 h-3" />
              </span>

              <span className="h-[2px] w-24 bg-primary/30" />
            </div>
          </div>

          {/* ================= Categories ================= */}
          <div className="wrapper px-4 pt-8">
            <div
              className="
            flex items-center justify-center gap-5 pb-2
          "
            >
              {categories.map((category, i) => {
                const icons = [
                  Leaf,
                  Droplets,
                  Sparkles,
                  Package,
                  FlaskConical,
                  CircleDot,
                  SprayCan,
                  HandHeart,
                ];

                const CategoryIcon = icons[i % icons.length];

                return (
                  <Link
                    key={category._id}
                    href={`/categories/${category.slug || category._id}`}
                    className="
        group
         w-[130px]
        overflow-hidden
        rounded-lg  
        border border-gray-100
        bg-[#c1d4b1]
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-md
        md:min-w-0
      "
                  >
                    {/* Category Image */}
                    <div className="relative aspect-square w-full overflow-hidden ">
                      <Image
                        src={category.image}
                        alt={
                          language === "bn"
                            ? category.name?.bn || "Category"
                            : category.name?.en || "Category"
                        }
                        fill
                        sizes="
            (max-width: 768px) 94px,
            (max-width: 1024px) 22vw,
            12vw
          "
                        className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
                      />
                    </div>

                    <div className="relative flex h-11 flex-col items-center justify-center bg-white">
                      <div
                        className="
            -mt-5
            flex h-7 w-7
            items-center justify-center
            rounded-full
            bg-white
            text-primary
            shadow-sm
            transition-transform
            duration-300
            group-hover:scale-110 
          "
                      >
                        <CategoryIcon size={15} strokeWidth={1.8} />
                      </div>

                      <span className="mt-0.5 truncate px-1 text-center text-[10px] font-semibold text-dark md:text-[11px]">
                        {language === "bn"
                          ? category.name?.bn
                          : category.name?.en}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Category;
