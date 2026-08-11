"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "./ui/Loading";
import Error from "./ui/Error";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/Button";

const Hero = () => {
  const language = useSelector((state) => state.language.language);
  const [heroes, setHeroes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const res = await fetch("/api/heros");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${res.status}`,
          );
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setHeroes(data);
        } else {
          throw new Error(data.error || "Unexpected API response format.");
        }
      } catch (err) {
        console.error("Failed to fetch hero data:", err);
        setError("Failed to load hero section. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHeroes();
  }, []);

  if (loading) {
    return (
      <div className="mt-28 md:mt-32 h-[50vh] w-full flex items-center justify-center bg-gray animate-pulse rounded-lg">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-28 md:mt-32 h-[50vh] w-full flex items-center justify-center bg-gray/60 rounded-lg text-center p-4">
        <Error />
        <p className="text-red mt-2">{error}</p>
      </div>
    );
  }

  if (heroes.length === 0) {
    return (
      <div className="mt-28 md:mt-32 h-[50vh] w-full flex items-center justify-center bg-gray rounded-lg">
        <p className="text-dark">No hero images available at the moment...</p>
      </div>
    );
  }

  return (
    <section className="w-full h-[calc(100vh-3rem)] mt-14">
      <Swiper
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        grabCursor={true}
        speed={500}
        modules={[Navigation, Pagination, Autoplay]}
        className="mySwiper h-full w-full"
      >
        {heroes.map((hero) => (
          <SwiperSlide key={hero._id}>
            <div className="relative h-full w-full">
              {/*============= Background Image =============*/}
              <Image
                src={hero.imageURL}
                alt={hero.title.en}
                fill
                priority
                className="object-cover object-center"
              />

              {/*=============== Overlay ===============*/}
              <div className="absolute inset-0 bg-gradient-to-r from-dark/70 via-dark/35 to-transparent" />

              {/*=============== Content ===============*/}
              <div className="absolute inset-0 flex items-center pt-8">
                <div className="wrapper mx-auto px-6 lg:px-12">
                  <div className="max-w-2xl text-light">
                    <span className="inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-medium font-mono">
                      🌿 100% Authentic Products From Bandarban
                    </span>

                    <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight font-poppins">
                      {language === "bn"
                        ? hero.title.bn.slice(0, 50)
                        : hero.title.en.slice(0, 50)}
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-gray/95 line-clamp-3 max-w-xl">
                      {language === "bn"
                        ? hero.description?.bn
                        : hero.description?.en}
                    </p>

                    <div className="mt-8 flex gap-4">
                      <Link
                        href="/products"
                        className={`${buttonVariants({ variant: "primary" })} `}
                      >
                        Shop Now
                      </Link>

                      <Link
                        href="/categories"
                        className={`${buttonVariants({ variant: "secondary" })}  hover:bg-primary outline-none focus:outline-none`}
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
