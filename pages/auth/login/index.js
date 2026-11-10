import axios from "axios";
import Loading from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/redux/features/auth/authSlice";
import Link from "next/link";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setIsLoading(true);

            if (!formData.email || !formData.password) {
                setIsLoading(false);
                toast.error("Email and password are required.");
                return;
            }

            try {
                const res = await axios.post("/api/users/auth/login", {
                    email: formData.email,
                    password: formData.password,
                });

                if (res.data) {
                    toast.success("Login successful!");
                    dispatch(
                        login({ user: res.data.user, token: res.data.token })
                    );
                    setFormData({ email: "", password: "" });
                    setIsLoading(false);
                    router.push("/");
                }
            } catch (err) {
                setIsLoading(false);
                toast.error(
                    err?.response?.data?.error ||
                        "Login failed. Please try again."
                );
            }
        },
        [formData, router, dispatch]
    );

    const inputClass =
        "eq w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] py-3 pl-10 pr-4 text-sm text-dark outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

    return (
        <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-36">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-[0_10px_35px_rgba(12,154,91,0.08)]">
                {/* Header */}
                <div className="border-b border-primary/10 bg-green-light/60 px-6 py-6 text-center sm:px-8">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <LogIn size={22} />
                    </div>
                    <h2 className="text-2xl font-bold text-dark">
                        Welcome back!
                    </h2>
                    <p className="mt-1 text-sm text-black/55">
                        Please sign in to your account
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full flex-col gap-5 p-6 sm:p-8"
                >
                    <div className="flex flex-col items-start gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-dark"
                        >
                            Email address
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
                            Password
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
                                placeholder="Write your password"
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
                        className={`mt-1 w-full rounded-xl py-3 px-4 text-sm font-semibold shadow-sm ${
                            isLoading
                                ? "cursor-not-allowed bg-gray text-black/50"
                                : "cursor-pointer bg-primary text-light hover:bg-secondary eq"
                        }`}
                    >
                        {isLoading ? (
                            <Loading isLoading={isLoading} />
                        ) : (
                            "Login"
                        )}
                    </button>

                    <div className="border-t border-primary/10 pt-4 text-center text-sm">
                        <span className="text-black/55">
                            {`Don't have an account?`}{" "}
                        </span>
                        <Link
                            href="/auth/signup"
                            className="font-semibold text-primary hover:underline"
                        >
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
