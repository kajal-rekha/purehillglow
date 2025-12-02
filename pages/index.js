import MainNavbar from "@/components/shared/Navbar/MainNavbar";
import Navbar from "@/components/shared/Navbar/TopNavbar";

const HomePage = () => {
    return (
        <div className="wrapper">
            <div className="flex flex-col ">
                <Navbar />
                <MainNavbar />
            </div>
        </div>
    );
};

export default HomePage;
