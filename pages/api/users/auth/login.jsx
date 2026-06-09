"use client";

import { setCredentials } from "@/redux/features/auth/authSlice";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { buttonVariants } from "@/components/ui/Button";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/users/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to login");
            }

            dispatch(setCredentials({ token: data.token, user: data.user }));
            router.push("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-green-light/20 py-20">
            <div className="wrapper max-w-md w-full">
                <div className="bg-white p-8 rounded-lg shadow-lg border border-primary/10">
                    <h1 className="text-2xl font-bold text-primary text-center mb-6">
                        Login to Purehillglow
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red text-center">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`${buttonVariants({
                                    variant: "primary",
                                })} w-full`}
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Not a member?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-primary hover:text-primary/80"
                        >
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;