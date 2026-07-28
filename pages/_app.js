import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar/MainNavbar";
import ReduxProvider from "@/providers/ReduxProvider";
import "@/styles/globals.css";
import TopNavbar from "@/components/shared/Navbar/TopNavbar";

export default function App({ Component, pageProps }) {
  return (
    <ReduxProvider>
      <TopNavbar />
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </ReduxProvider>
  );
}
