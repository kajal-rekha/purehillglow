import Hero from "@/components/Hero";
import Category from "@/components/Category";
import Feature from "@/components/Feature";


const HomePage = () => {
    return (
        <div className="w-full">
            <Hero />
            <Feature/>
            <Category />
        </div>
    );
};

export default HomePage;
