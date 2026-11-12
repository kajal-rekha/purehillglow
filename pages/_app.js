import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar/MainNavbar";
import ReduxProvider from "@/providers/ReduxProvider";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import TopNavbar from "@/components/shared/Navbar/TopNavbar";
import CategoryNavbar from "@/components/shared/Navbar/CategoryNavbar";
import FloatingCart from "@/components/shared/FloatingCart";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isStandaloneAdmin = router.pathname.startsWith("/dashboard");

  return (
    <ReduxProvider>
      {!isStandaloneAdmin && <TopNavbar />}
      {!isStandaloneAdmin && <Navbar />}
      {router.pathname === "/" && <CategoryNavbar />}
      <div className="min-h-screen">
        <Component {...pageProps} />
      </div>
      {!isStandaloneAdmin && <FloatingCart />}
      {!isStandaloneAdmin && <Footer />}
      <Toaster position="top-center" />
    </ReduxProvider>
  );
}
