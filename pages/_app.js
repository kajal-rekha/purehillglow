import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar/MainNavbar";
import ReduxProvider from "@/providers/ReduxProvider";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import TopNavbar from "@/components/shared/Navbar/TopNavbar";
import CategoryNavbar from "@/components/shared/Navbar/CategoryNavbar";
import FloatingCart from "@/components/shared/FloatingCart";

export default function App({ Component, pageProps }) {
  return (
    <ReduxProvider>
      <TopNavbar />
      <Navbar />
      <CategoryNavbar/>
      <Component {...pageProps} />
      <FloatingCart />
      <Footer />
      <Toaster position="top-center" />
    </ReduxProvider>
  );
}
