"use client";

import { useSelector } from "react-redux";
import { Cannabis, Star } from "lucide-react";

const testimonials = {
  en: [
    {
      quote:
        "The products feel gentle on my skin, and I love that they are inspired by nature.",
      name: "Tamla Jannat",
      location: "Chattogram",
      initials: "TJ",
    },
    {
      quote:
        "I tried the Thanaka products and really liked the soft, fresh feeling after use.",
      name: "Marma Sweety",
      location: "Bandarban",
      initials: "MS",
    },
    {
      quote:
        "Beautiful products and thoughtful packaging. The natural skincare collection is lovely.",
      name: "Sadia Afrin",
      location: "Dhaka",
      initials: "SA",
    },
  ],
  bn: [
    {
      quote:
        "পণ্যগুলো ত্বকে বেশ কোমল লাগে, আর প্রাকৃতিক উপাদানের অনুপ্রেরণাটা আমার ভালো লেগেছে।",
      name: "তামলা জান্নাত",
      location: "চট্টগ্রাম",
      initials: "ত",
    },
    {
      quote:
        "থানাকা পণ্যগুলো ব্যবহার করে ভালো লেগেছে। ব্যবহারের পর ত্বকে সতেজ অনুভূতি হয়।",
      name: "মারমা সুইটি",
      location: "বান্দরবান",
      initials: "ম",
    },
    {
      quote:
        "পণ্যের প্যাকেজিং সুন্দর ও যত্নসহকারে করা। প্রাকৃতিক স্কিনকেয়ার কালেকশনটি চমৎকার।",
      name: "সাদিয়া আফরিন",
      location: "ঢাকা",
      initials: "স",
    },
  ],
};

const Testimonials = () => {
  const language = useSelector((state) => state.language.language);
  const reviews = testimonials[language] || testimonials.en;

  return (
    <section className="w-full bg-[#fffdf8] py-8 sm:py-10">
      <div className="wrapper px-4">
        <div className="mb-5 text-center sm:mb-6">
          <h2 className="font-playfair !text-xl !font-bold text-[#344a31] sm:!text-2xl">
            {language === "bn" ? "আমাদের গ্রাহকেরা যা বলেন" : "What Our Customers Say"}
          </h2>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[#78904f]">
            <span className="h-px w-8 bg-[#d9dfc8]" />
            <Cannabis size={13} />
            <span className="h-px w-8 bg-[#d9dfc8]" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="flex min-h-[150px] flex-col rounded-xl border border-[#f0e9dc] bg-[#fffaf1] p-4 shadow-sm sm:p-5"
            >
              <p className="line-clamp-3 text-left text-xs leading-5 text-[#5e6255] sm:text-[13px]">
                “{review.quote}”
              </p>

              <div
                className="mt-2 flex items-center gap-0.5 text-amber-500"
                aria-label={language === "bn" ? "৫ এর মধ্যে ৫ স্টার" : "5 out of 5 stars"}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={12}
                    fill="currentColor"
                    strokeWidth={1}
                  />
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2.5 pt-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7eddb] text-[10px] font-semibold text-[#526c3c]">
                  {review.initials}
                </span>
                <div>
                  <p className="text-[11px] font-semibold leading-4 text-[#384a32]">
                    {review.name}
                  </p>
                  <p className="text-[9px] leading-3 text-[#858477]">
                    {review.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
