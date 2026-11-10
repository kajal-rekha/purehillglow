"use client";

import Loading from "@/components/ui/Loading";
import { login, logout } from "@/redux/features/auth/authSlice";
import axios from "axios";
import {
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    Edit3,
    Leaf,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Package,
    Phone,
    Save,
    ShieldCheck,
    ShoppingBag,
    User,
    UserRound,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const ProfilePage = () => {
    const { userAndToken } = useSelector((state) => state.auth);
    const language = useSelector((state) => state.language?.language);
    const isBangla = language === "bn";
    const dispatch = useDispatch();
    const router = useRouter();
    const fileInputRef = useRef(null);

    const user = userAndToken?.user;
    const token = userAndToken?.token;

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        address: "",
        image: "",
        password: "",
    });
    const [imageName, setImageName] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                image: user.image || "",
                password: "",
            });
        }
    }, [user]);

    useEffect(() => {
        if (!token) return;
        let isMounted = true;

        const fetchOrders = async () => {
            setOrdersLoading(true);
            try {
                const { data } = await axios.get("/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (isMounted && Array.isArray(data)) {
                    setOrders(data);
                }
            } catch (err) {
                if (isMounted && err?.response?.status === 404) {
                    setOrders([]);
                }
            } finally {
                if (isMounted) setOrdersLoading(false);
            }
        };

        fetchOrders();
        return () => {
            isMounted = false;
        };
    }, [token]);

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error(
                isBangla
                    ? "অনুগ্রহ করে একটি সঠিক ছবির ফাইল নির্বাচন করুন।"
                    : "Please select a valid image file."
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_SIZE = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
                setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
                setImageName(file.name);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user?._id) return;

        if (
            !formData.username.trim() ||
            !formData.email.trim() ||
            !formData.address.trim()
        ) {
            toast.error(
                isBangla
                    ? "নাম, ইমেইল এবং ঠিকানা আবশ্যক।"
                    : "Name, email, and address are required."
            );
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                image: formData.image,
            };
            if (formData.password.trim()) {
                payload.password = formData.password.trim();
            }

            const { data } = await axios.put(
                `/api/users/${user._id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            dispatch(
                login({
                    user: data,
                    token,
                })
            );
            setIsEditing(false);
            setImageName("");
            setFormData((prev) => ({ ...prev, password: "" }));
            toast.success(
                isBangla
                    ? "প্রোফাইল সফলভাবে আপডেট হয়েছে!"
                    : "Profile updated successfully!"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error ||
                    (isBangla
                        ? "প্রোফাইল আপডেট করা যায়নি।"
                        : "Failed to update profile.")
            );
        } finally {
            setIsSaving(false);
        }
    };

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
        (o) => o.orderStatus === "pending" || o.orderStatus === "processing"
    ).length;
    const deliveredOrders = orders.filter(
        (o) => o.orderStatus === "delivered"
    ).length;

    const inputClass =
        "eq w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] py-2.5 pl-10 pr-4 text-sm text-dark outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

    return (
        <main className="min-h-screen bg-[#fbf8f2] pb-16 pt-[125px]">
            {/* Hero Banner */}
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
                        <span>{isBangla ? "আমার প্রোফাইল" : "My Profile"}</span>
                    </nav>
                    <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
                        {isBangla ? (
                            <>
                                আমার{" "}
                                <span className="text-[#efc477]">প্রোফাইল</span>
                            </>
                        ) : (
                            <>
                                My{" "}
                                <span className="text-[#efc477]">Profile</span>
                            </>
                        )}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {isBangla
                            ? "আপনার অ্যাকাউন্টের তথ্য দেখুন এবং প্রয়োজনে আপডেট করুন"
                            : "Manage your personal information and view your account activity"}
                    </p>
                </div>
            </section>

            <div className="wrapper mx-auto px-4 sm:px-6">
                {!userAndToken ? (
                    <section className="mx-auto my-10 flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-[#24452c]">
                            <ShieldCheck size={30} />
                        </span>
                        <h2 className="mt-4 text-xl font-bold text-dark">
                            {isBangla ? "অনুগ্রহ করে লগইন করুন" : "Please Sign In"}
                        </h2>
                        <p className="mt-2 text-sm text-dark/70">
                            {isBangla
                                ? "আপনার প্রোফাইল দেখতে হলে আগে অ্যাকাউন্টে লগইন করতে হবে।"
                                : "You need to be signed in to view and manage your profile."}
                        </p>
                        <Link
                            href="/auth/login"
                            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
                        >
                            {isBangla ? "লগইন করুন" : "Sign In"}
                        </Link>
                    </section>
                ) : (
                    <div className="relative z-10 -mt-5 grid items-start gap-6 lg:grid-cols-[320px_1fr]">
                        {/* Left Column: User Card & Quick Navigation */}
                        <aside className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                            <div className="flex flex-col items-center border-b border-[#eee8df] bg-green-light/40 px-6 py-7 text-center">
                                <div className="relative">
                                    { (isEditing ? formData.image : user?.image) ? (
                                        <Image
                                            src={
                                                isEditing
                                                    ? formData.image
                                                    : user.image
                                            }
                                            alt={user?.username || "User"}
                                            width={96}
                                            height={96}
                                            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary/15 text-primary shadow-md">
                                            <UserRound size={40} />
                                        </div>
                                    )}

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-secondary eq"
                                            title="Change photo"
                                        >
                                            <Camera size={15} />
                                        </button>
                                    )}
                                </div>

                                <h2 className="mt-3.5 text-lg font-bold text-dark">
                                    {user?.username}
                                </h2>
                                <p className="text-xs text-black/55">
                                    {user?.email}
                                </p>
                                <span className="mt-2 inline-flex items-center rounded-full bg-primary/15 px-3 py-0.5 text-[11px] font-semibold capitalize text-primary">
                                    {user?.role || "Customer"}
                                </span>
                            </div>

                            <div className="flex flex-col p-3">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 rounded-xl bg-green-light/70 px-4 py-3 text-sm font-semibold text-primary"
                                >
                                    <UserRound size={18} />
                                    <span>
                                        {isBangla
                                            ? "আমার প্রোফাইল"
                                            : "My Profile"}
                                    </span>
                                </Link>

                                <Link
                                    href="/my-orders"
                                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-dark hover:bg-green-light/40 hover:text-primary eq"
                                >
                                    <span className="flex items-center gap-3">
                                        <Package size={18} />
                                        <span>
                                            {isBangla
                                                ? "আমার অর্ডারসমূহ"
                                                : "My Orders"}
                                        </span>
                                    </span>
                                    {totalOrders > 0 && (
                                        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                                            {totalOrders}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/cart"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark hover:bg-green-light/40 hover:text-primary eq"
                                >
                                    <ShoppingBag size={18} />
                                    <span>
                                        {isBangla ? "শপিং কার্ট" : "Shopping Cart"}
                                    </span>
                                </Link>

                                <div className="my-1.5 border-t border-[#eee8df]" />

                                <button
                                    type="button"
                                    onClick={() => {
                                        dispatch(logout());
                                        router.push("/");
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red hover:bg-red/10 eq"
                                >
                                    <LogOut size={18} />
                                    <span>
                                        {isBangla ? "লগআউট" : "Logout"}
                                    </span>
                                </button>
                            </div>
                        </aside>

                        {/* Right Column: Stats, Profile Info / Edit Form, Recent Orders */}
                        <div className="flex flex-col gap-6">
                            {/* Order Summary Stats */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="flex items-center gap-4 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.05)]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Package size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-black/55">
                                            {isBangla
                                                ? "মোট অর্ডার"
                                                : "Total Orders"}
                                        </p>
                                        <p className="text-xl font-bold text-dark">
                                            {ordersLoading ? "..." : totalOrders}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.05)]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange/15 text-orange">
                                        <Clock size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-black/55">
                                            {isBangla
                                                ? "চলমান অর্ডার"
                                                : "Active Orders"}
                                        </p>
                                        <p className="text-xl font-bold text-dark">
                                            {ordersLoading
                                                ? "..."
                                                : pendingOrders}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.05)]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                        <CheckCircle2 size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-black/55">
                                            {isBangla
                                                ? "ডেলিভারি সম্পন্ন"
                                                : "Delivered"}
                                        </p>
                                        <p className="text-xl font-bold text-dark">
                                            {ordersLoading
                                                ? "..."
                                                : deliveredOrders}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information Card */}
                            <section className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                                <header className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4 sm:px-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-dark">
                                            {isBangla
                                                ? "ব্যক্তিগত তথ্য"
                                                : "Personal Information"}
                                        </h2>
                                        <p className="text-xs text-black/55">
                                            {isBangla
                                                ? "আপনার নাম, যোগাযোগের নম্বর এবং ডেলিভারি ঠিকানা"
                                                : "Your contact details and default delivery address"}
                                        </p>
                                    </div>

                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/25 bg-green-light/50 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white eq"
                                        >
                                            <Edit3 size={14} />
                                            <span>
                                                {isBangla
                                                    ? "এডিট করুন"
                                                    : "Edit Profile"}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setImageName("");
                                                setFormData({
                                                    username:
                                                        user?.username || "",
                                                    email: user?.email || "",
                                                    phone: user?.phone || "",
                                                    address:
                                                        user?.address || "",
                                                    image: user?.image || "",
                                                    password: "",
                                                });
                                            }}
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-gray px-3 py-1.5 text-xs font-medium text-black/60 hover:bg-red/10 hover:text-red eq"
                                        >
                                            <X size={14} />
                                            <span>
                                                {isBangla ? "বাতিল" : "Cancel"}
                                            </span>
                                        </button>
                                    )}
                                </header>

                                {isEditing ? (
                                    <form
                                        onSubmit={handleUpdateProfile}
                                        className="space-y-4 p-5 sm:p-6"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        <div className="flex items-center justify-between rounded-xl border border-dashed border-[#b8d4c2] bg-[#f8fbf9] px-4 py-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Camera
                                                    size={18}
                                                    className="shrink-0 text-primary"
                                                />
                                                <span className="truncate text-xs text-dark/80">
                                                    {imageName ||
                                                        (isBangla
                                                            ? "প্রোফাইল ছবি পরিবর্তন করতে চাইলে নতুন ছবি সিলেক্ট করুন"
                                                            : "Select a new photo to update your profile picture")}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="shrink-0 cursor-pointer rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white eq"
                                            >
                                                {isBangla
                                                    ? "ছবি পাল্টান"
                                                    : "Choose Photo"}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-dark">
                                                    {isBangla
                                                        ? "পূর্ণ নাম"
                                                        : "Full Name"}
                                                </label>
                                                <div className="relative flex items-center">
                                                    <User
                                                        size={16}
                                                        className="pointer-events-none absolute left-3.5 text-black/40"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.username
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                username:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-dark">
                                                    {isBangla
                                                        ? "ফোন নম্বর"
                                                        : "Phone Number"}
                                                </label>
                                                <div className="relative flex items-center">
                                                    <Phone
                                                        size={16}
                                                        className="pointer-events-none absolute left-3.5 text-black/40"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-dark">
                                                    {isBangla
                                                        ? "ইমেইল অ্যাড্রেস"
                                                        : "Email Address"}
                                                </label>
                                                <div className="relative flex items-center">
                                                    <Mail
                                                        size={16}
                                                        className="pointer-events-none absolute left-3.5 text-black/40"
                                                    />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                email: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-dark">
                                                    {isBangla
                                                        ? "নতুন পাসওয়ার্ড (ঐচ্ছিক)"
                                                        : "New Password (Optional)"}
                                                </label>
                                                <div className="relative flex items-center">
                                                    <Lock
                                                        size={16}
                                                        className="pointer-events-none absolute left-3.5 text-black/40"
                                                    />
                                                    <input
                                                        type="password"
                                                        value={
                                                            formData.password
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                password:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={
                                                            isBangla
                                                                ? "পরিবর্তন না করলে ফাঁকা রাখুন"
                                                                : "Leave blank to keep current"
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                <label className="text-xs font-semibold text-dark">
                                                    {isBangla
                                                        ? "ডেলিভারি ঠিকানা"
                                                        : "Delivery Address"}
                                                </label>
                                                <div className="relative flex items-center">
                                                    <MapPin
                                                        size={16}
                                                        className="pointer-events-none absolute left-3.5 text-black/40"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                address:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60 eq"
                                            >
                                                {isSaving ? (
                                                    <Loading
                                                        isLoading={isSaving}
                                                    />
                                                ) : (
                                                    <>
                                                        <Save size={16} />
                                                        <span>
                                                            {isBangla
                                                                ? "পরিবর্তন সেভ করুন"
                                                                : "Save Changes"}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                        <div className="flex items-start gap-3.5 rounded-xl bg-[#f8fbf9] p-4">
                                            <User
                                                size={18}
                                                className="mt-0.5 shrink-0 text-primary"
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-black/50">
                                                    {isBangla
                                                        ? "পূর্ণ নাম"
                                                        : "Full Name"}
                                                </p>
                                                <p className="mt-0.5 text-sm font-semibold text-dark">
                                                    {user?.username || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3.5 rounded-xl bg-[#f8fbf9] p-4">
                                            <Mail
                                                size={18}
                                                className="mt-0.5 shrink-0 text-primary"
                                            />
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-medium text-black/50">
                                                    {isBangla
                                                        ? "ইমেইল অ্যাড্রেস"
                                                        : "Email Address"}
                                                </p>
                                                <p className="mt-0.5 truncate text-sm font-semibold text-dark">
                                                    {user?.email || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3.5 rounded-xl bg-[#f8fbf9] p-4">
                                            <Phone
                                                size={18}
                                                className="mt-0.5 shrink-0 text-primary"
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-black/50">
                                                    {isBangla
                                                        ? "ফোন নম্বর"
                                                        : "Phone Number"}
                                                </p>
                                                <p className="mt-0.5 text-sm font-semibold text-dark">
                                                    {user?.phone ||
                                                        (isBangla
                                                            ? "দেওয়া হয়নি"
                                                            : "Not provided")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3.5 rounded-xl bg-[#f8fbf9] p-4">
                                            <MapPin
                                                size={18}
                                                className="mt-0.5 shrink-0 text-primary"
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-black/50">
                                                    {isBangla
                                                        ? "ডেলিভারি ঠিকানা"
                                                        : "Address"}
                                                </p>
                                                <p className="mt-0.5 text-sm font-semibold text-dark">
                                                    {user?.address || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Recent Orders Preview */}
                            <section className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                                <header className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4 sm:px-6">
                                    <h2 className="text-lg font-bold text-dark">
                                        {isBangla
                                            ? "সাম্প্রতিক অর্ডারসমূহ"
                                            : "Recent Orders"}
                                    </h2>
                                    <Link
                                        href="/my-orders"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                    >
                                        <span>
                                            {isBangla
                                                ? "সব অর্ডার দেখুন"
                                                : "View All Orders"}
                                        </span>
                                        <ChevronRight size={14} />
                                    </Link>
                                </header>

                                <div className="p-5 sm:p-6">
                                    {ordersLoading ? (
                                        <p className="py-4 text-center text-sm text-black/50">
                                            {isBangla
                                                ? "অর্ডার লোড হচ্ছে..."
                                                : "Loading recent orders..."}
                                        </p>
                                    ) : orders.length === 0 ? (
                                        <div className="flex flex-col items-center py-6 text-center">
                                            <Package
                                                size={32}
                                                className="text-black/30"
                                            />
                                            <p className="mt-2 text-sm text-black/60">
                                                {isBangla
                                                    ? "আপনার এখনো কোনো অর্ডার নেই।"
                                                    : "You haven't placed any orders yet."}
                                            </p>
                                            <Link
                                                href="/products"
                                                className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-secondary eq"
                                            >
                                                {isBangla
                                                    ? "কেনাকাটা শুরু করুন"
                                                    : "Start Shopping"}
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {orders.slice(0, 3).map((order) => (
                                                <div
                                                    key={order._id}
                                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eee8df] bg-[#fdfcf9] p-4"
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold text-dark">
                                                            {order.tran_id}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-black/55">
                                                            {new Date(
                                                                order.createdAt
                                                            ).toLocaleDateString(
                                                                isBangla
                                                                    ? "bn-BD"
                                                                    : "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}{" "}
                                                            •{" "}
                                                            {order.orderItems
                                                                ?.length || 0}{" "}
                                                            {isBangla
                                                                ? "টি পণ্য"
                                                                : "items"}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-primary">
                                                            {formatPrice(
                                                                order.totalAmount
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                                                                order.orderStatus ===
                                                                "delivered"
                                                                    ? "bg-primary/15 text-primary"
                                                                    : order.orderStatus ===
                                                                      "cancelled"
                                                                    ? "bg-red/10 text-red"
                                                                    : "bg-orange/15 text-orange"
                                                            }`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ProfilePage;

