import { useSelector } from "react-redux";
import featureData from "@/data/featureData";

const Feature = () => {
  const language = useSelector((state) => state.language.language);
  const features = featureData[language] || featureData.en;

  return (
    <div className="pt-4">
      <div className="wrapper">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="shrink-0 w-12 h-12 text-2xl rounded-full bg-primary/20 flex items-center justify-center text-primary">
                {feature.icon}
              </div>

              <div className="flex-1">
                <h5 className="text-base font-semibold mb-1">
                  {feature.title}
                </h5>

                <p className="text-xs leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feature;
