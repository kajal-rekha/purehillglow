"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
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
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Hero data:", data);
        console.log("Is array:", Array.isArray(data));
        console.log("Hero count:", data.length);
        if (Array.isArray(data)) {
          setHeroes(data);
        } else {
          throw new Error(data.error || "Unexpected API response format.");
        }
      } catch (err) {
        setError("Failed to load hero section. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHeroes();
  }, []);

  return (
    <section className="w-full  mt-20 md:mt-32 overflow-hidden">
      {loading ? (
        <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center bg-gray animate-pulse rounded-lg md:h-[calc(100vh-8rem)]">
          <Loading isLoading={loading} />
        </div>
      ) : error ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray/60 rounded-lg text-center p-4">
          <Error />
          <p className="text-red mt-2">{error}</p>
        </div>
      ) : heroes.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center bg-gray rounded-lg">
          <p className="text-dark">No hero images available at the moment...</p>
        </div>
      ) : (
        <Swiper
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          grabCursor={true}
          speed={3000}
          // modules={[Autoplay]}
          className="purehill-hero-swiper"
        >
          {heroes.map((hero, index) => (
            <SwiperSlide key={hero._id}>
              <div className="relative overflow-hidden ">
                {/* ================= BACKGROUND DECORATION ================= */}

                {/* <div className="pointer-events-none absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full bg-primary/2 md:h-[500px] md:w-[500px]" /> */}

                {/* <div className="pointer-events-none absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-primary/20 md:h-[500px] md:w-[500px]" /> */}

                {/* ================= MAIN CONTENT ================= */}

                <div className="wrapper relative mx-auto grid min-h-[430px] items-center gap-4 px-5 py-8 sm:px-6 md:min-h-[500px] md:grid-cols-2 md:gap-28 md:px-8 md:py-10 lg:min-h-[560px] lg:px-10">
                  {/* ================= LEFT CONTENT ================= */}

                  <div className="relative z-10 ">
                    {/* ======= Badge =======*/}

                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-light/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm sm:px-4 sm:py-2">
                      <span className="text-sm">🌿</span>

                      <span>
                        {language === "bn"
                          ? "পাহাড়ের খাঁটি সৌন্দর্য"
                          : "Authentic Beauty From The Hills"}
                      </span>
                    </div>

                    {/*========== Heading ==========*/}

                    <h1 className="max-w-xl font-poppins text-3xl font-bold leading-[1.15] text-dark sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl">
                      {language === "bn"
                        ? hero.title?.bn?.slice(0, 70)
                        : hero.title?.en?.slice(0, 70)}
                    </h1>

                    {/*=========== Description ===========*/}

                    <p className="mt-4 max-w-lg text-sm leading-7 text-dark/65 sm:text-base sm:leading-8 md:mt-5 lg:text-lg line-clamp-2">
                      {language === "bn"
                        ? hero.description?.bn
                        : hero.description?.en}
                    </p>

                    {/*========== Buttons ==========*/}

                    <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                      <Link
                        href="/products"
                        className={`${buttonVariants({
                          variant: "primary",
                        })}px-3 py-2 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 text-[12px]`}
                      >
                        {language === "bn" ? "শপ করুন" : "Shop Now"}
                      </Link>

                      <Link
                        href="/categories"
                        className={`${buttonVariants({
                          variant: "primary",
                        })}  px-3 py-2 text-[12px] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4`}
                      >
                        {language === "bn"
                          ? "কালেকশন দেখুন"
                          : "Explore Collection"}
                      </Link>
                    </div>
                  </div>

                  {/* ================= RIGHT PRODUCT IMAGE ================= */}

                  <div className="relative order-1 flex h-[250px] items-center justify-center sm:h-[300px] md:order-2 md:h-[400px] lg:h-[480px]">
                    {/*========= Product Background Circle ==========*/}

                    <div className="absolute h-[220px] w-[220px] rounded-full bg-light/20 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:h-[280px] sm:w-[280px] md:h-[350px] md:w-[350px] lg:h-[430px] lg:w-[430px]" />

                    {/*=========== Decorative Circle============== */}

                    <div className="absolute h-[240px] w-[240px] rounded-full border border-primary/10 sm:h-[300px] sm:w-[300px] md:h-[380px] md:w-[380px] lg:h-[460px] lg:w-[460px]" />

                    {/*============== Product Image ===============*/}

                    <div className="relative z-10 h-[240px] w-full sm:h-[290px] md:h-[450px] lg:h-[500px] rounded-lg">
                      <Image
                        src={hero.imageURL}
                        alt={
                          language === "bn"
                            ? hero.title?.bn || "Pure Hill Glow"
                            : hero.title?.en || "Pure Hill Glow"
                        }
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 90vw, 50vw"
                        className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] "
                      />
                    </div>

                    {/*============ Floating Authentic Badge============== */}

                    <div className="absolute bottom-2 left-1 z-20 hidden rounded-2xl border border-primary/14 bg-light/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:block md:bottom-5 md:left-0 ">
                      <p className="text-[10px] font-medium tracking-wider text-dark/80">
                        {language === "bn" ? "খাঁটি পণ্য" : "100% Authentic"}
                      </p>
                    </div>

                    {/*============ Floating Natural Badge============== */}

                    <div className="absolute right-1 top-3 z-20 hidden rounded-2xl border border-primary/14 bg-light/80 px-4 py-3 shadow-lg backdrop-blur-sm sm:block md:right-0 md:top-8">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌿</span>

                        <div>
                          <p className="text-[10px] text-dark/80">
                            {language === "bn"
                              ? "প্রাকৃতিক যত্ন"
                              : "Natural Care"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default Hero;
