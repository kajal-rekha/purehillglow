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
  const isStandaloneAdmin = router.pathname.startsWith("/adminDashboard");

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
      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 999999,
        }}
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "12px",
            background: "#19241c",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </ReduxProvider>
  );
}
