import Hero from "@/components/Hero";
import Category from "@/components/Category";
import Feature from "@/components/Feature";
import BestSeller from "@/components/BestSeller";
import NewArrivals from "@/components/NewArrivals";
import ComboOffer from "@/components/ComboOffer";
import Testimonials from "@/components/Testimonials";
import AuthenticityPromise from "@/components/AuthenticityPromise";

const HomePage = () => {
  return (
    <div className="w-full">
      <Hero />
      <Feature />
      <Category />
      <BestSeller />
      <NewArrivals />
      <ComboOffer />
      <Testimonials />
      <AuthenticityPromise />
    </div>
  );
};

export default HomePage;
