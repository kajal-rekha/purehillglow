"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/legacy/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "./ui/Loading";
import Error from "./ui/Error";

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
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
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
                <p className="text-dark">No hero images available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="mt-28 md:mt-32 rounded-lg overflow-hidden shadow-lg">
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper h-[40vh] md:h-[calc(100vh-128px)]"
            >
                {heroes.map((hero) => (
                    <SwiperSlide key={hero._id}>
                        <div className="relative w-full h-full">
                            <Image src={hero.imageURL} alt={language === "bn" ? hero.title.bn : hero.title.en} layout="fill" objectFit="cover" priority />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-light p-4">
                                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                                    {language === "bn" ? hero.title.bn : hero.title.en}
                                </h1>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Hero;
