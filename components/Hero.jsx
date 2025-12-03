"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Button from "./ui/Button";
import Error from "./ui/Error";
import Loading from "./ui/Loading";

const Hero = () => {
    const [heros, setHeros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHeros = async () => {
            try {
                const res = await fetch("/api/heros");

                if (!res.ok) {
                    const err = await res.json();
                    setError(err);
                } else {
                    const data = await res.json();
                    setHeros(data);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHeros();
    }, []);

    return (
        <div className="mt-32 md:mt-40 w-full">
            <div className="wrapper">
                {/* ======== Error ======== */}
                {error && (
                    <div className="mt-40 text-center text-red">
                        <Error />
                    </div>
                )}

                {/* ======== Loading ======= */}
                {loading && (
                    <div className="mt-40 text-center">
                        <Loading />
                    </div>
                )}

                {/* ======== No Data ========*/}
                {!loading && !error && heros.length === 0 && (
                    <div className="mt-40 text-center text-dark">
                        No data available.
                    </div>
                )}

                {/* ======== Success ======== */}
                {!loading && !error && heros.length > 0 && (
                    <Swiper
                        pagination={false}
                        loop={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        grabCursor={true}
                        speed={500}
                        modules={[Navigation, Pagination, Autoplay]}
                        slidesPerView={1}
                        spaceBetween={20}
                        className="w-full h-full"
                    >
                        {heros.map((hero) => (
                            <SwiperSlide key={hero._id}>
                                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                                    <div>
                                        <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold">
                                            {hero.title?.en}
                                        </h2>

                                        <Button variant="info">Shop Now</Button>
                                    </div>

                                    <div className="w-full h-[28rem]">
                                        <Image
                                            src={hero.imageURL}
                                            alt={hero.title?.en}
                                            width={600}
                                            height={600}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </div>
    );
};

export default Hero;
