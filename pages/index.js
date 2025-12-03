import Hero from "@/components/Hero";
import MainNavbar from "@/components/shared/Navbar/MainNavbar";
import Navbar from "@/components/shared/Navbar/TopNavbar";

const HomePage = () => {
    return (
        <div className="wrapper">
            <div className="flex flex-col ">
                <Navbar />
                <MainNavbar />
            </div>

            <Hero />
        </div>
    );
};

export default HomePage;
