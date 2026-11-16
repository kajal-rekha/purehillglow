import { useSelector } from "react-redux";
import featureData from "@/data/featureData";
import { Sparkles } from "lucide-react";

const Feature = () => {
  const language = useSelector((state) => state.language.language);
  const isBangla = language === "bn";
  const features = featureData[language] || featureData.en;

  return (
    <section className="relative z-20 -mt-6 w-full px-4 sm:-mt-8 sm:px-6">
      <div className="wrapper">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group flex items-center gap-3.5 rounded-2xl border border-[#e6decb] bg-white/95 p-4 shadow-[0_8px_25px_rgba(33,59,28,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#678f56] hover:shadow-lg sm:p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eaf2e3] to-[#d6e5cd] text-[#2c5224] shadow-xs transition-transform duration-300 group-hover:scale-105">
                {feature.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="!text-xs !font-bold text-[#1f3823] sm:!text-sm">
                    {feature.title}
                  </h3>
                  {i === 0 && (
                    <Sparkles size={12} className="text-[#a06822]" />
                  )}
                </div>
                <p className="mt-0.5 !text-[11px] leading-4 text-[#666f5f] sm:!text-xs">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
