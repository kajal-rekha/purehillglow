import axios from "axios";
import Loading from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/features/auth/authSlice";
import Link from "next/link";
import { ChevronRight, Eye, EyeOff, Leaf, Lock, LogIn, Mail } from "lucide-react";

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language?.language);
    const isBangla = language === "bn";

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setIsLoading(true);

            if (!formData.email || !formData.password) {
                setIsLoading(false);
                toast.error(
                    isBangla
                        ? "ইমেইল এবং পাসওয়ার্ড দেওয়া আবশ্যক।"
                        : "Email and password are required."
                );
                return;
            }

            try {
                const res = await axios.post("/api/users/auth/login", {
                    email: formData.email,
                    password: formData.password,
                });

                if (res.data) {
                    toast.success(
                        isBangla ? "লগইন সফল হয়েছে!" : "Login successful!"
                    );
                    dispatch(
                        login({ user: res.data.user, token: res.data.token })
                    );
                    setFormData({ email: "", password: "" });
                    setIsLoading(false);
                    const redirectUrl = router.query.redirect || "/";
                    router.push(redirectUrl);
                }
            } catch (err) {
                setIsLoading(false);
                toast.error(
                    err?.response?.data?.error ||
                    (isBangla
                        ? "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
                        : "Login failed. Please try again.")
                );
            }
        },
        [formData, router, dispatch, isBangla]
    );

    const inputClass =
        "eq w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] py-3 pl-10 pr-4 text-sm text-dark outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

    return (
        <main className="min-h-screen bg-[#fbf8f2] pb-16 pt-[116px]">
            {/* ============ Hero Banner ============ */}
            <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
                <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
                <Leaf
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
                />
                <div className="wrapper relative mx-auto flex min-h-36 flex-col justify-center px-4 py-6 sm:px-6">
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-2.5 flex items-center gap-2 text-[11px] text-white/75"
                    >
                        <Link href="/" className="hover:text-white">
                            {isBangla ? "হোম" : "Home"}
                        </Link>
                        <ChevronRight size={13} />
                        <span>{isBangla ? "লগইন" : "Sign In"}</span>
                    </nav>
                    <h1 className="font-playfair text-2xl font-bold sm:text-3xl">
                        {isBangla ? (
                            <>
                                আপনার অ্যাকাউন্টে <span className="text-[#efc477]">লগইন করুন</span>
                            </>
                        ) : (
                            <>
                                Sign In to Your <span className="text-[#efc477]">Account</span>
                            </>
                        )}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {isBangla
                            ? "অর্ডার ট্র্যাক করতে এবং দ্রুত শপিং করতে সাইন ইন করুন"
                            : "Access your orders, wishlist, and saved delivery details"}
                    </p>
                </div>
            </section>

            <div className="wrapper mx-auto flex justify-center px-4 pt-8 sm:px-6 sm:pt-10">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                    {/* ============ Header ============ */}
                    <div className="border-b border-[#eee8df] bg-[#f7f4ec] px-6 py-6 text-center sm:px-8">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <LogIn size={22} />
                        </div>
                        <h2 className="font-playfair text-2xl font-bold text-[#203c28]">
                            {isBangla ? "স্বাগতম!" : "Welcome back!"}
                        </h2>
                        <p className="mt-1 text-sm text-black/55">
                            {isBangla
                                ? "আপনার অ্যাকাউন্টে সাইন ইন করুন"
                                : "Please sign in to your account"}
                        </p>
                    </div>

                    {/* ============ Form ============ */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full flex-col gap-5 p-6 sm:p-8"
                    >
                        <div className="flex flex-col items-start gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-dark"
                            >
                                {isBangla ? "ইমেইল অ্যাড্রেস" : "Email address"}
                            </label>
                            <div className="relative flex w-full items-center">
                                <Mail
                                    size={17}
                                    className="pointer-events-none absolute left-3.5 text-black/40"
                                />
                                <input
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    type="email"
                                    id="email"
                                    placeholder="hello@example.com"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-1.5">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-dark"
                            >
                                {isBangla ? "পাসওয়ার্ড" : "Password"}
                            </label>
                            <div className="relative flex w-full items-center">
                                <Lock
                                    size={17}
                                    className="pointer-events-none absolute left-3.5 text-black/40"
                                />
                                <input
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder={
                                        isBangla
                                            ? "পাসওয়ার্ড লিখুন"
                                            : "Write your password"
                                    }
                                    className="eq w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] py-3 pl-10 pr-10 text-sm text-dark outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 text-black/40 hover:text-dark"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`mt-1 w-full rounded-xl py-3 px-4 text-sm font-semibold shadow-sm ${isLoading
                                    ? "cursor-not-allowed bg-gray text-black/50"
                                    : "cursor-pointer bg-primary text-light hover:bg-secondary eq"
                                }`}
                        >
                            {isLoading ? (
                                <Loading isLoading={isLoading} />
                            ) : isBangla ? (
                                "লগইন"
                            ) : (
                                "Login"
                            )}
                        </button>

                        <div className="border-t border-[#eee8df] pt-4 text-center text-sm">
                            <span className="text-black/55">
                                {isBangla
                                    ? "অ্যাকাউন্ট নেই? "
                                    : `Don't have an account? `}
                            </span>
                            <Link
                                href={
                                    router.query.redirect
                                        ? `/auth/signup?redirect=${encodeURIComponent(
                                            router.query.redirect
                                        )}`
                                        : "/auth/signup"
                                }
                                className="font-semibold text-primary hover:underline"
                            >
                                {isBangla ? "রেজিস্টার করুন" : "Register"}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default LoginForm;
