import axios from "axios";
import Loading from "@/components/ui/Loading";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/redux/features/auth/authSlice";
import Link from "next/link";

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
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
                    err?.response?.data?.error || "Login failed. Please try again."
                );
            }
        },
        [formData, router, dispatch]
    );

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-1.5">
                <h2>Welcome back!</h2>
                <p className="text-black/50">Please sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5 text-lg">
                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="email">Email address</label>
                    <input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        type="email"
                        id="email"
                        placeholder="hello@example.com"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>

                <div className="flex flex-col items-start gap-1.5">
                    <label htmlFor="password">Password</label>
                    <input
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        type="password"
                        id="password"
                        placeholder="Write your password"
                        className="eq w-full rounded-xl border border-gray bg-transparent px-3 py-5 outline-none focus:border-accent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-3 px-4 rounded ${
                        isLoading ? "bg-gray cursor-not-allowed" : "bg-secondary text-light hover:bg-primary mt-2 eq"
                    }`}
                >
                    {isLoading ? <Loading isLoading={isLoading} /> : "Login"}
                </button>

                <p>
                    <span className="text-black/50">{`Don't have an account?`}</span>
                    <Link href="/auth/signup" className="link-item ml-2">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;
