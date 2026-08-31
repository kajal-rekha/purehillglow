import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar/MainNavbar";
import ReduxProvider from "@/providers/ReduxProvider";
import "@/styles/globals.css";
import TopNavbar from "@/components/shared/Navbar/TopNavbar";
import CategoryNavbar from "@/components/shared/Navbar/CategoryNavbar";

export default function App({ Component, pageProps }) {
  return (
    <ReduxProvider>
      <TopNavbar />
      <Navbar />
      <CategoryNavbar/>
      <Component {...pageProps} />
      <Footer />
    </ReduxProvider>
  );
}
