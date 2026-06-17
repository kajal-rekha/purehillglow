"use client";
import Image from "next/image";
import { useSelector } from "react-redux";
import Link from "next/link";

const DashboardPage = () => {
    const { userAndToken } = useSelector((state) => state.auth);

    if (!userAndToken) {
        return (
            <div className="wrapper p-6">
                <h2 className="text-xl font-bold">Please sign in</h2>
                <p className="mt-2">You need to be signed in to view your dashboard.</p>
                <Link href="/auth/login" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded">
                    Sign in
                </Link>
            </div>
        );
    }

    const user = userAndToken.user;

    return (
        <div className="wrapper p-6">
            <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>

            <div className="mt-6 flex items-center gap-6">
                <Image
                    src={user.image}
                    alt={user.username}
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                />

                <div>
                    <p className="font-semibold">Email: {user.email}</p>
                    <p className="mt-2">Address: {user.address}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
