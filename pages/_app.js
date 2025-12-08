import Footer from "@/components/shared/Footer";
import MainNavbar from "@/components/shared/Navbar/MainNavbar";
import Navbar from "@/components/shared/Navbar/TopNavbar";
import ReduxProvider from "@/providers/ReduxProvider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
    return (
        <ReduxProvider>
            <Navbar />
            <MainNavbar />
            <Component {...pageProps} />
            <Footer />
        </ReduxProvider>
    );
}
