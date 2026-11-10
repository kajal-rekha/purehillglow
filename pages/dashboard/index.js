"use client";
import Image from "next/image";
import { useSelector } from "react-redux";
import Link from "next/link";

const DashboardPage = () => {
    const { userAndToken } = useSelector((state) => state.auth);

    if (!userAndToken) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-36">
                <div className="w-full max-w-md rounded-2xl border border-primary/15 bg-white p-8 text-center shadow-[0_8px_30px_rgba(12,154,91,0.08)]">
                    <h2 className="text-xl font-bold text-dark">Please sign in</h2>
                    <p className="mt-2 text-sm text-black/60">
                        You need to be signed in to view your dashboard.
                    </p>
                    <Link
                        href="/auth/login"
                        className="mt-5 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary eq"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    const user = userAndToken.user;

    return (
        <div className="min-h-screen px-4 pb-16 pt-36">
            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_8px_30px_rgba(12,154,91,0.08)] sm:p-8">
                <h1 className="border-b border-primary/10 pb-4 text-2xl font-bold text-dark">
                    Welcome, {user.username}
                </h1>

                <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                    <Image
                        src={user.image}
                        alt={user.username}
                        width={112}
                        height={112}
                        className="h-28 w-28 shrink-0 rounded-full border-2 border-primary/30 object-cover"
                    />

                    <div className="space-y-2 text-center sm:text-left">
                        <p className="text-sm font-semibold text-dark">
                            Email:{" "}
                            <span className="font-normal text-black/70">
                                {user.email}
                            </span>
                        </p>
                        <p className="text-sm font-semibold text-dark">
                            Address:{" "}
                            <span className="font-normal text-black/70">
                                {user.address}
                            </span>
                        </p>
                        {user.phone && (
                            <p className="text-sm font-semibold text-dark">
                                Phone:{" "}
                                <span className="font-normal text-black/70">
                                    {user.phone}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
