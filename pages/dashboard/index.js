"use client";

import { login } from "@/redux/features/auth/authSlice";
import axios from "axios";
import {
    Box,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    FolderTree,
    Heart,
    ImagePlus,
    Leaf,
    MapPin,
    Package,
    Phone,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    TrendingUp,
    Truck,
    User,
    UserRound,
    Users,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const localized = (value, language) => {
    if (typeof value === "string") return value;
    return language === "bn" ? value?.bn || value?.en : value?.en || value?.bn;
};

const ORDER_STATUS_OPTIONS = [
    {
        value: "pending",
        en: "Pending",
        bn: "পেন্ডিং",
        icon: Clock,
        activeClass: "bg-orange text-white border-orange shadow-xs",
        badgeClass: "bg-orange/15 text-orange border-orange/30",
    },
    {
        value: "processing",
        en: "Processing",
        bn: "প্রসেসিং",
        icon: Truck,
        activeClass: "bg-blue text-white border-blue shadow-xs",
        badgeClass: "bg-blue/15 text-blue border-blue/30",
    },
    {
        value: "delivered",
        en: "Delivered",
        bn: "ডেলিভারড",
        icon: CheckCircle2,
        activeClass: "bg-primary text-white border-primary shadow-xs",
        badgeClass: "bg-primary/15 text-primary border-primary/30",
    },
    {
        value: "cancelled",
        en: "Cancelled",
        bn: "বাতিল",
        icon: XCircle,
        activeClass: "bg-red text-white border-red shadow-xs",
        badgeClass: "bg-red/10 text-red border-red/25",
    },
];

const compressImageFile = (file, maxSize = 500) =>
    new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("Invalid image file"));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { userAndToken } = useSelector((state) => state.auth);
    const language = useSelector((state) => state.language?.language);
    const isBangla = language === "bn";

    const user = userAndToken?.user;
    const token = userAndToken?.token;
    const isAdmin = user?.role === "admin";

    const [activeTab, setActiveTab] = useState("orders");
    const [orderFilter, setOrderFilter] = useState("all");
    const [orderSearch, setOrderSearch] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState("");
    const [loading, setLoading] = useState(false);

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [users, setUsers] = useState([]);

    // Sync user role from DB if needed
    useEffect(() => {
        if (!user?._id || !token) return;
        let isMounted = true;
        axios
            .get(`/api/users/${user._id}`)
            .then(({ data }) => {
                if (isMounted && data?._id && data.role !== user.role) {
                    dispatch(login({ user: data, token }));
                }
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, [user?._id, user?.role, token, dispatch]);

    // New Product Form State
    const [showProductForm, setShowProductForm] = useState(false);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
    const [productForm, setProductForm] = useState({
        nameEn: "",
        nameBn: "",
        descEn: "",
        descBn: "",
        unitEn: "100g",
        unitBn: "১০০ গ্রাম",
        originEn: "Bandarban, Bangladesh",
        originBn: "বান্দরবান, বাংলাদেশ",
        usageEn: "Apply gently on clean skin",
        usageBn: "পরিষ্কার ত্বকে আলতোভাবে ব্যবহার করুন",
        price: "",
        discount: "0",
        stock: "20",
        category: "",
        subCategory: "",
        featured: false,
        image: "",
    });

    // New Category Form State
    const [catForm, setCatForm] = useState({
        nameEn: "",
        nameBn: "",
        image: "",
    });
    const [isSubmittingCat, setIsSubmittingCat] = useState(false);

    const fetchAdminData = useCallback(async () => {
        if (!token || !isAdmin) return;
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [ordersRes, prodsRes, catsRes, subsRes, usersRes] =
                await Promise.allSettled([
                    axios.get("/api/orders", { headers }),
                    axios.get("/api/products"),
                    axios.get("/api/categories"),
                    axios.get("/api/subcategories"),
                    axios.get("/api/users", { headers }),
                ]);

            if (
                ordersRes.status === "fulfilled" &&
                Array.isArray(ordersRes.value.data)
            ) {
                setOrders(ordersRes.value.data);
            } else {
                setOrders([]);
            }

            if (
                prodsRes.status === "fulfilled" &&
                Array.isArray(prodsRes.value.data)
            ) {
                setProducts(prodsRes.value.data);
            }

            if (
                catsRes.status === "fulfilled" &&
                Array.isArray(catsRes.value.data)
            ) {
                setCategories(catsRes.value.data);
            }

            if (
                subsRes.status === "fulfilled" &&
                Array.isArray(subsRes.value.data)
            ) {
                setSubcategories(subsRes.value.data);
            }

            if (
                usersRes.status === "fulfilled" &&
                Array.isArray(usersRes.value.data)
            ) {
                setUsers(usersRes.value.data);
            }
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

    const handleOrderStatusChange = async (orderId, updates) => {
        setUpdatingOrderId(orderId);
        try {
            const { data } = await axios.put(
                `/api/orders/${orderId}`,
                updates,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? data.updatedOrder || { ...o, ...updates }
                        : o
                )
            );
            toast.success(
                isBangla
                    ? "অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে!"
                    : "Order status updated successfully!"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to update order status"
            );
        } finally {
            setUpdatingOrderId("");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await axios.delete(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            toast.success(isBangla ? "অর্ডার ডিলিট করা হয়েছে" : "Order deleted");
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to delete order");
        }
    };

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            const { data } = await axios.put(
                `/api/users/${targetUserId}`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers((prev) =>
                prev.map((u) => (u._id === targetUserId ? data : u))
            );
            toast.success(
                isBangla
                    ? `ইউজার রোল ${newRole}-এ পরিবর্তন করা হয়েছে`
                    : `User role updated to ${newRole}`
            );
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to update role");
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (
            !productForm.nameEn ||
            !productForm.nameBn ||
            !productForm.price ||
            !productForm.category ||
            !productForm.image
        ) {
            toast.error(
                isBangla
                    ? "নাম, দাম, ক্যাটাগরি এবং ছবি দেওয়া আবশ্যক।"
                    : "Name, price, category, and image are required."
            );
            return;
        }

        const matchedSub =
            productForm.subCategory ||
            subcategories.find(
                (s) =>
                    String(s.category_id?._id || s.category_id) ===
                    String(productForm.category)
            )?._id;

        if (!matchedSub) {
            toast.error(
                isBangla
                    ? "এই ক্যাটাগরিতে অন্তত একটি সাব-ক্যাটাগরি নির্বাচন করুন।"
                    : "Please select a subcategory for this category."
            );
            return;
        }

        setIsSubmittingProduct(true);
        try {
            const payload = {
                name: { en: productForm.nameEn, bn: productForm.nameBn },
                description: {
                    en: productForm.descEn || productForm.nameEn,
                    bn: productForm.descBn || productForm.nameBn,
                },
                unit: { en: productForm.unitEn, bn: productForm.unitBn },
                origin: { en: productForm.originEn, bn: productForm.originBn },
                usage: {
                    en: [productForm.usageEn],
                    bn: [productForm.usageBn],
                },
                benefits: { en: [], bn: [] },
                ingredients: { en: [], bn: [] },
                price: Number(productForm.price),
                discount: Number(productForm.discount) || 0,
                stock: Number(productForm.stock) || 0,
                featured: Boolean(productForm.featured),
                category: productForm.category,
                subCategory: matchedSub,
                images: [productForm.image],
                tags: [],
            };

            const { data } = await axios.post("/api/products", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProducts((prev) => [data, ...prev]);
            setShowProductForm(false);
            setProductForm({
                nameEn: "",
                nameBn: "",
                descEn: "",
                descBn: "",
                unitEn: "100g",
                unitBn: "১০০ গ্রাম",
                originEn: "Bandarban, Bangladesh",
                originBn: "বান্দরবান, বাংলাদেশ",
                usageEn: "Apply gently on clean skin",
                usageBn: "পরিষ্কার ত্বকে আলতোভাবে ব্যবহার করুন",
                price: "",
                discount: "0",
                stock: "20",
                category: "",
                subCategory: "",
                featured: false,
                image: "",
            });
            toast.success(
                isBangla
                    ? "নতুন পণ্য সফলভাবে যোগ হয়েছে!"
                    : "Product added successfully!"
            );
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to add product");
        } finally {
            setIsSubmittingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts((prev) => prev.filter((p) => p._id !== productId));
            toast.success(isBangla ? "পণ্য ডিলিট করা হয়েছে" : "Product deleted");
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to delete product"
            );
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!catForm.nameEn || !catForm.nameBn || !catForm.image) {
            toast.error(
                isBangla
                    ? "ক্যাটাগরির ইংরেজি নাম, বাংলা নাম ও ছবি আবশ্যক।"
                    : "English name, Bangla name, and image are required."
            );
            return;
        }
        setIsSubmittingCat(true);
        try {
            const { data } = await axios.post(
                "/api/categories",
                {
                    name: { en: catForm.nameEn, bn: catForm.nameBn },
                    image: catForm.image,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories((prev) => [...prev, data]);
            setCatForm({ nameEn: "", nameBn: "", image: "" });
            toast.success(
                isBangla ? "ক্যাটাগরি তৈরি হয়েছে!" : "Category created!"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to create category"
            );
        } finally {
            setIsSubmittingCat(false);
        }
    };

    const handleDeleteCategory = async (catId) => {
        try {
            await axios.delete(`/api/categories/${catId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories((prev) => prev.filter((c) => c._id !== catId));
            toast.success(
                isBangla ? "ক্যাটাগরি মুছে ফেলা হয়েছে" : "Category deleted"
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to delete category"
            );
        }
    };

    const orderCounts = useMemo(() => {
        const counts = {
            all: orders.length,
            pending: 0,
            processing: 0,
            delivered: 0,
            cancelled: 0,
        };
        orders.forEach((o) => {
            if (counts[o.orderStatus] !== undefined) {
                counts[o.orderStatus] += 1;
            }
        });
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (orderFilter !== "all" && order.orderStatus !== orderFilter) {
                return false;
            }
            if (orderSearch.trim()) {
                const q = orderSearch.trim().toLowerCase();
                const hay = [
                    order.tran_id,
                    order.deliveryDetails?.name,
                    order.deliveryDetails?.phone,
                    order.deliveryDetails?.district,
                    order.user_id?.username,
                    order.user_id?.email,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [orders, orderFilter, orderSearch]);

    if (!userAndToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fbf8f2] px-4 pb-16 pt-36">
                <div className="w-full max-w-md rounded-2xl border border-[#eee5d6] bg-white p-8 text-center shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-light text-primary">
                        <ShieldCheck size={28} />
                    </span>
                    <h2 className="mt-4 text-xl font-bold text-dark">
                        {isBangla ? "অনুগ্রহ করে লগইন করুন" : "Please Sign In"}
                    </h2>
                    <p className="mt-2 text-sm text-black/60">
                        {isBangla
                            ? "ড্যাশবোর্ড দেখতে আগে আপনার অ্যাকাউন্টে লগইন করুন।"
                            : "You need to be signed in to view your dashboard."}
                    </p>
                    <Link
                        href="/auth/login"
                        className="mt-5 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary eq"
                    >
                        {isBangla ? "লগইন করুন" : "Sign In"}
                    </Link>
                </div>
            </div>
        );
    }

    // Regular User View
    if (!isAdmin) {
        return (
            <main className="min-h-screen bg-[#fbf8f2] px-4 pb-16 pt-36">
                <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.07)]">
                    <div className="flex flex-col items-center gap-4 border-b border-[#eee8df] bg-green-light/50 p-6 sm:flex-row sm:p-8">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.username}
                                width={88}
                                height={88}
                                className="h-22 w-22 shrink-0 rounded-full border-4 border-white object-cover shadow-md"
                            />
                        ) : (
                            <div className="flex h-22 w-22 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <UserRound size={36} />
                            </div>
                        )}
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-dark">
                                {isBangla
                                    ? `স্বাগতম, ${user.username}!`
                                    : `Welcome, ${user.username}!`}
                            </h1>
                            <p className="mt-1 text-sm text-black/60">
                                {user.email} • {user.address}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">
                        <Link
                            href="/profile"
                            className="flex flex-col items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fdfcf9] p-5 text-center transition hover:border-primary hover:shadow-sm"
                        >
                            <UserRound size={24} className="text-primary" />
                            <span className="text-sm font-bold text-dark">
                                {isBangla ? "আমার প্রোফাইল" : "My Profile"}
                            </span>
                        </Link>

                        <Link
                            href="/my-orders"
                            className="flex flex-col items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fdfcf9] p-5 text-center transition hover:border-primary hover:shadow-sm"
                        >
                            <Package size={24} className="text-primary" />
                            <span className="text-sm font-bold text-dark">
                                {isBangla ? "অর্ডার হিস্ট্রি" : "My Orders"}
                            </span>
                        </Link>

                        <Link
                            href="/wishlist"
                            className="flex flex-col items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fdfcf9] p-5 text-center transition hover:border-primary hover:shadow-sm"
                        >
                            <Heart size={24} className="text-primary" />
                            <span className="text-sm font-bold text-dark">
                                {isBangla ? "উইশলিস্ট" : "My Wishlist"}
                            </span>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Admin View
    const totalRevenue = orders
        .filter((o) => o.orderStatus !== "cancelled")
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const inputClass =
        "w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] px-3.5 py-2.5 text-xs text-dark outline-none focus:border-primary focus:bg-white";

    return (
        <main className="min-h-screen bg-[#fbf8f2] pb-16 pt-[125px]">
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14391f_0%,#1d4929_55%,#375c37_100%)] text-white">
                <Leaf
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 right-[12%] h-32 w-32 rotate-[-35deg] text-white/10"
                />
                <div className="wrapper relative mx-auto flex min-h-36 flex-col justify-center px-4 py-6 sm:px-6">
                    <nav className="mb-2 flex items-center gap-2 text-[11px] text-white/75">
                        <Link href="/" className="hover:text-white">
                            {isBangla ? "হোম" : "Home"}
                        </Link>
                        <ChevronRight size={13} />
                        <span>
                            {isBangla
                                ? "অ্যাডমিন ড্যাশবোর্ড"
                                : "Admin Dashboard"}
                        </span>
                    </nav>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
                                {isBangla ? (
                                    <>
                                        অ্যাডমিন{" "}
                                        <span className="text-[#efc477]">
                                            ড্যাশবোর্ড
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Admin{" "}
                                        <span className="text-[#efc477]">
                                            Dashboard
                                        </span>
                                    </>
                                )}
                            </h1>
                            <p className="mt-1 text-xs text-white/80 sm:text-sm">
                                {isBangla
                                    ? `স্বাগতম ${user?.username} — এখান থেকে অর্ডারের স্ট্যাটাস, পণ্য ও ক্যাটাগরি নিয়ন্ত্রণ করুন`
                                    : `Welcome ${user?.username} — Control order statuses, products, categories & customers`}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchAdminData}
                            disabled={loading}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/25"
                        >
                            <RefreshCw
                                size={15}
                                className={loading ? "animate-spin" : ""}
                            />
                            <span>{isBangla ? "রিফ্রেশ" : "Refresh Data"}</span>
                        </button>
                    </div>
                </div>
            </section>

            <div className="wrapper mx-auto px-4 sm:px-6">
                {/* Summary Stats */}
                <div className="relative z-10 -mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="flex items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <TrendingUp size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] text-black/55">
                                {isBangla ? "মোট বিক্রি" : "Total Sales"}
                            </p>
                            <p className="text-base font-bold text-dark">
                                {formatPrice(totalRevenue)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/15 text-orange">
                            <Clock size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] text-black/55">
                                {isBangla ? "পেন্ডিং" : "Pending"}
                            </p>
                            <p className="text-base font-bold text-dark">
                                {orderCounts.pending}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/15 text-blue">
                            <Truck size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] text-black/55">
                                {isBangla ? "প্রসেসিং" : "Processing"}
                            </p>
                            <p className="text-base font-bold text-dark">
                                {orderCounts.processing}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <CheckCircle2 size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] text-black/55">
                                {isBangla ? "ডেলিভারড" : "Delivered"}
                            </p>
                            <p className="text-base font-bold text-dark">
                                {orderCounts.delivered}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[#24452c]">
                            <Box size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] text-black/55">
                                {isBangla ? "মোট পণ্য" : "Products"}
                            </p>
                            <p className="text-base font-bold text-dark">
                                {products.length}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-[0_8px_30px_rgba(54,58,39,0.06)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <Users size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] text-black/55">
                                {isBangla ? "মোট ইউজার" : "Users"}
                            </p>
                            <p className="text-base font-bold text-dark">
                                {users.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-[#eee5d6] bg-white p-2.5 shadow-xs">
                    {[
                        {
                            key: "orders",
                            icon: Package,
                            en: `Manage Orders (${orders.length})`,
                            bn: `অর্ডার ম্যানেজমেন্ট (${orders.length})`,
                        },
                        {
                            key: "products",
                            icon: Box,
                            en: `Manage Products (${products.length})`,
                            bn: `পণ্যসমূহ (${products.length})`,
                        },
                        {
                            key: "categories",
                            icon: FolderTree,
                            en: `Categories (${categories.length})`,
                            bn: `ক্যাটাগরি (${categories.length})`,
                        },
                        {
                            key: "users",
                            icon: Users,
                            en: `Customers (${users.length})`,
                            bn: `ইউজার তালিকা (${users.length})`,
                        },
                    ].map(({ key, icon: Icon, en, bn }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                                activeTab === key
                                    ? "bg-primary text-white shadow-xs"
                                    : "text-dark hover:bg-green-light/60 hover:text-primary"
                            }`}
                        >
                            <Icon size={15} />
                            <span>{isBangla ? bn : en}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {/* 1. ORDERS TAB */}
                    {activeTab === "orders" && (
                        <div className="space-y-5">
                            {/* Order Status Filter & Search Bar */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    {[
                                        {
                                            key: "all",
                                            en: "All Orders",
                                            bn: "সব অর্ডার",
                                        },
                                        {
                                            key: "pending",
                                            en: "Pending",
                                            bn: "পেন্ডিং",
                                        },
                                        {
                                            key: "processing",
                                            en: "Processing",
                                            bn: "প্রসেসিং",
                                        },
                                        {
                                            key: "delivered",
                                            en: "Delivered",
                                            bn: "ডেলিভারড",
                                        },
                                        {
                                            key: "cancelled",
                                            en: "Cancelled",
                                            bn: "বাতিল",
                                        },
                                    ].map((tab) => {
                                        const active = orderFilter === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() =>
                                                    setOrderFilter(tab.key)
                                                }
                                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                                    active
                                                        ? "bg-[#20452b] text-white"
                                                        : "bg-[#f4f7f3] text-dark hover:bg-green-light"
                                                }`}
                                            >
                                                <span>
                                                    {isBangla ? tab.bn : tab.en}
                                                </span>
                                                <span
                                                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                                        active
                                                            ? "bg-white/20 text-white"
                                                            : "bg-black/10 text-dark"
                                                    }`}
                                                >
                                                    {orderCounts[tab.key] || 0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="relative flex items-center sm:w-72">
                                    <Search
                                        size={15}
                                        className="pointer-events-none absolute left-3.5 text-black/40"
                                    />
                                    <input
                                        type="text"
                                        value={orderSearch}
                                        onChange={(e) =>
                                            setOrderSearch(e.target.value)
                                        }
                                        placeholder={
                                            isBangla
                                                ? "অর্ডার আইডি, নাম বা ফোন নম্বর খুঁজুন..."
                                                : "Search Order ID, name, or phone..."
                                        }
                                        className="w-full rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] py-2 pl-9 pr-3.5 text-xs text-dark outline-none focus:border-primary focus:bg-white"
                                    />
                                </div>
                            </div>

                            {filteredOrders.length === 0 ? (
                                <div className="rounded-2xl border border-[#eee5d6] bg-white p-12 text-center text-sm text-black/55">
                                    {isBangla
                                        ? "কোনো অর্ডার পাওয়া যায়নি।"
                                        : "No matching orders found."}
                                </div>
                            ) : (
                                filteredOrders.map((order) => {
                                    const currentStatusObj =
                                        ORDER_STATUS_OPTIONS.find(
                                            (s) => s.value === order.orderStatus
                                        ) || ORDER_STATUS_OPTIONS[0];
                                    const isUpdating =
                                        updatingOrderId === order._id;

                                    return (
                                        <article
                                            key={order._id}
                                            className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_28px_rgba(54,58,39,0.05)]"
                                        >
                                            {/* Order Card Header */}
                                            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8df] bg-[#f8fbf9] px-5 py-3.5 sm:px-6">
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                                                            {isBangla
                                                                ? "অর্ডার আইডি"
                                                                : "Order ID"}
                                                        </span>
                                                        <p className="font-mono text-sm font-bold text-dark">
                                                            {order.tran_id}
                                                        </p>
                                                    </div>

                                                    <span className="hidden h-6 w-px bg-[#dfe7e1] sm:block" />

                                                    <div className="flex items-center gap-1.5 text-xs text-black/60">
                                                        <Calendar size={14} />
                                                        <span>
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
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-[#dce6de] bg-white px-3 py-1 text-xs font-semibold uppercase text-dark">
                                                        <CreditCard size={13} />
                                                        {order.paymentMethod ||
                                                            "COD"}
                                                    </span>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${currentStatusObj.badgeClass}`}
                                                    >
                                                        <currentStatusObj.icon
                                                            size={13}
                                                        />
                                                        {isBangla
                                                            ? currentStatusObj.bn
                                                            : currentStatusObj.en}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteOrder(
                                                                order._id
                                                            )
                                                        }
                                                        className="ml-1 cursor-pointer rounded-xl border border-red/20 bg-red/5 p-2 text-red transition hover:bg-red hover:text-white"
                                                        title={
                                                            isBangla
                                                                ? "অর্ডার ডিলিট করুন"
                                                                : "Delete Order"
                                                        }
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </header>

                                            {/* Order Card Body */}
                                            <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_1fr] sm:p-6">
                                                {/* Ordered Products */}
                                                <div className="space-y-3">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-black/50">
                                                        {isBangla
                                                            ? `অর্ডারকৃত পণ্য (${
                                                                  order
                                                                      .orderItems
                                                                      ?.length ||
                                                                  0
                                                              })`
                                                            : `Ordered Products (${
                                                                  order
                                                                      .orderItems
                                                                      ?.length ||
                                                                  0
                                                              })`}
                                                    </h3>

                                                    <div className="divide-y divide-[#f0ece3] rounded-xl border border-[#eee8df] bg-[#fdfcf9]">
                                                        {order.orderItems?.map(
                                                            (item, idx) => {
                                                                const popProd =
                                                                    typeof item.product_id ===
                                                                    "object"
                                                                        ? item.product_id
                                                                        : null;
                                                                const thumb =
                                                                    popProd
                                                                        ?.images?.[0];
                                                                const itemName =
                                                                    localized(
                                                                        popProd?.name,
                                                                        language
                                                                    ) ||
                                                                    item.name;
                                                                const itemUnit =
                                                                    localized(
                                                                        popProd?.unit,
                                                                        language
                                                                    ) ||
                                                                    item.unit;
                                                                const qty =
                                                                    Number(
                                                                        item.cartQuantity
                                                                    ) || 1;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            item._id ||
                                                                            idx
                                                                        }
                                                                        className="flex items-center justify-between gap-3 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                                            {thumb ? (
                                                                                <Image
                                                                                    src={
                                                                                        thumb
                                                                                    }
                                                                                    alt={
                                                                                        itemName
                                                                                    }
                                                                                    width={
                                                                                        44
                                                                                    }
                                                                                    height={
                                                                                        44
                                                                                    }
                                                                                    className="h-11 w-11 shrink-0 rounded-lg border object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                                    <Package
                                                                                        size={
                                                                                            18
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div className="overflow-hidden">
                                                                                <p className="truncate text-xs font-bold text-dark sm:text-sm">
                                                                                    {
                                                                                        itemName
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs text-black/55">
                                                                                    {
                                                                                        itemUnit
                                                                                    }{" "}
                                                                                    •{" "}
                                                                                    {formatPrice(
                                                                                        item.price
                                                                                    )}{" "}
                                                                                    ×{" "}
                                                                                    {
                                                                                        qty
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="shrink-0 text-xs font-bold text-dark sm:text-sm">
                                                                            {formatPrice(
                                                                                (Number(
                                                                                    item.price
                                                                                ) ||
                                                                                    0) *
                                                                                    qty
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Customer Info + Admin Status Control */}
                                                <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#e6eee8] bg-[#f8fbf9] p-4">
                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex items-center justify-between border-b border-[#e4ece6] pb-2">
                                                            <span className="font-bold uppercase tracking-wider text-black/50">
                                                                {isBangla
                                                                    ? "গ্রাহকের তথ্য"
                                                                    : "Customer & Delivery"}
                                                            </span>
                                                            <span className="text-sm font-extrabold text-primary">
                                                                {isBangla
                                                                    ? "মোট: "
                                                                    : "Total: "}
                                                                {formatPrice(
                                                                    order.totalAmount
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="flex items-center gap-2 pt-1 font-semibold text-dark">
                                                            <User
                                                                size={14}
                                                                className="text-primary"
                                                            />
                                                            <span>
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.name
                                                                }
                                                            </span>
                                                        </p>
                                                        <p className="flex items-center gap-2 text-dark/80">
                                                            <Phone
                                                                size={14}
                                                                className="text-primary"
                                                            />
                                                            <span>
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.phone
                                                                }
                                                            </span>
                                                        </p>
                                                        <p className="flex items-start gap-2 text-dark/80">
                                                            <MapPin
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-primary"
                                                            />
                                                            <span>
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.address
                                                                }
                                                                ,{" "}
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.thana
                                                                }
                                                                ,{" "}
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        ?.district
                                                                }
                                                            </span>
                                                        </p>
                                                        {order.deliveryDetails
                                                            ?.note && (
                                                            <p className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] italic text-black/65">
                                                                Note:{" "}
                                                                {
                                                                    order
                                                                        .deliveryDetails
                                                                        .note
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Admin Status Controls */}
                                                    <div className="border-t border-[#e4ece6] pt-3">
                                                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#24452c]">
                                                            {isBangla
                                                                ? "অর্ডার স্ট্যাটাস পরিবর্তন করুন:"
                                                                : "Change Order Status:"}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                            {ORDER_STATUS_OPTIONS.map(
                                                                (opt) => {
                                                                    const Icon =
                                                                        opt.icon;
                                                                    const isCurrent =
                                                                        order.orderStatus ===
                                                                        opt.value;
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                opt.value
                                                                            }
                                                                            type="button"
                                                                            disabled={
                                                                                isCurrent ||
                                                                                isUpdating
                                                                            }
                                                                            onClick={() =>
                                                                                handleOrderStatusChange(
                                                                                    order._id,
                                                                                    {
                                                                                        orderStatus:
                                                                                            opt.value,
                                                                                    }
                                                                                )
                                                                            }
                                                                            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition ${
                                                                                isCurrent
                                                                                    ? opt.activeClass
                                                                                    : "border-[#d5e2d9] bg-white text-dark hover:border-primary hover:text-primary"
                                                                            } disabled:cursor-default`}
                                                                        >
                                                                            <Icon
                                                                                size={
                                                                                    13
                                                                                }
                                                                            />
                                                                            <span>
                                                                                {isBangla
                                                                                    ? opt.bn
                                                                                    : opt.en}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* 2. PRODUCTS TAB */}
                    {activeTab === "products" && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between rounded-2xl border border-[#eee5d6] bg-white px-5 py-4">
                                <h2 className="text-base font-bold text-dark">
                                    {isBangla
                                        ? `সকল পণ্য (${products.length})`
                                        : `All Products (${products.length})`}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowProductForm((prev) => !prev)
                                    }
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-secondary eq"
                                >
                                    <Plus size={15} />
                                    <span>
                                        {isBangla
                                            ? "নতুন পণ্য যোগ করুন"
                                            : "Add Product"}
                                    </span>
                                </button>
                            </div>

                            {showProductForm && (
                                <form
                                    onSubmit={handleCreateProduct}
                                    className="space-y-4 rounded-2xl border border-primary/20 bg-white p-6 shadow-md"
                                >
                                    <h3 className="text-sm font-bold text-dark">
                                        {isBangla
                                            ? "নতুন পণ্যের তথ্য দিন"
                                            : "Add New Product"}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                        <input
                                            type="text"
                                            placeholder="Product Name (English)"
                                            value={productForm.nameEn}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    nameEn: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                        <input
                                            type="text"
                                            placeholder="পণ্যের নাম (বাংলা)"
                                            value={productForm.nameBn}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    nameBn: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price (৳)"
                                            value={productForm.price}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    price: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock Quantity"
                                            value={productForm.stock}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    stock: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />

                                        <select
                                            value={productForm.category}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    category: e.target.value,
                                                    subCategory: "",
                                                })
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select Category
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat._id}
                                                    value={cat._id}
                                                >
                                                    {localized(
                                                        cat.name,
                                                        language
                                                    )}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={productForm.subCategory}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    subCategory: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select Subcategory
                                            </option>
                                            {subcategories
                                                .filter(
                                                    (s) =>
                                                        !productForm.category ||
                                                        String(
                                                            s.category_id
                                                                ?._id ||
                                                                s.category_id
                                                        ) ===
                                                            String(
                                                                productForm.category
                                                            )
                                                )
                                                .map((sub) => (
                                                    <option
                                                        key={sub._id}
                                                        value={sub._id}
                                                    >
                                                        {localized(
                                                            sub.name,
                                                            language
                                                        )}
                                                    </option>
                                                ))}
                                        </select>

                                        <textarea
                                            rows={2}
                                            placeholder="Description (English)"
                                            value={productForm.descEn}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    descEn: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="বিবরণ (বাংলা)"
                                            value={productForm.descBn}
                                            onChange={(e) =>
                                                setProductForm({
                                                    ...productForm,
                                                    descBn: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-green-light/30 px-4 py-2.5 text-xs font-semibold text-primary">
                                            <ImagePlus size={16} />
                                            <span>
                                                {productForm.image
                                                    ? "Image Selected ✓"
                                                    : "Upload Product Image"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        const dataUrl =
                                                            await compressImageFile(
                                                                file
                                                            );
                                                        setProductForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                image: dataUrl,
                                                            })
                                                        );
                                                    } catch {
                                                        toast.error(
                                                            "Failed to load image"
                                                        );
                                                    }
                                                }}
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={isSubmittingProduct}
                                            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-secondary disabled:opacity-50"
                                        >
                                            {isSubmittingProduct
                                                ? "Saving..."
                                                : "Save Product"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {products.map((product) => (
                                    <div
                                        key={product._id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#eee5d6] bg-white p-3.5 shadow-2xs"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {product.images?.[0] && (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={localized(
                                                        product.name,
                                                        language
                                                    )}
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                                                />
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="truncate text-xs font-bold text-dark">
                                                    {localized(
                                                        product.name,
                                                        language
                                                    )}
                                                </p>
                                                <p className="text-xs text-primary">
                                                    {formatPrice(product.price)}{" "}
                                                    • Stock: {product.stock}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteProduct(product._id)
                                            }
                                            className="shrink-0 cursor-pointer rounded-xl p-2 text-red hover:bg-red/10"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. CATEGORIES TAB */}
                    {activeTab === "categories" && (
                        <div className="space-y-6">
                            <form
                                onSubmit={handleCreateCategory}
                                className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#eee5d6] bg-white p-5"
                            >
                                <input
                                    type="text"
                                    placeholder="Category Name (EN)"
                                    value={catForm.nameEn}
                                    onChange={(e) =>
                                        setCatForm({
                                            ...catForm,
                                            nameEn: e.target.value,
                                        })
                                    }
                                    className="flex-1 rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] px-3.5 py-2.5 text-xs outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="ক্যাটাগরির নাম (BN)"
                                    value={catForm.nameBn}
                                    onChange={(e) =>
                                        setCatForm({
                                            ...catForm,
                                            nameBn: e.target.value,
                                        })
                                    }
                                    className="flex-1 rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] px-3.5 py-2.5 text-xs outline-none"
                                />
                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-green-light/30 px-3.5 py-2.5 text-xs font-semibold text-primary">
                                    <ImagePlus size={15} />
                                    <span>
                                        {catForm.image
                                            ? "Photo ✓"
                                            : "Upload Photo"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                const dataUrl =
                                                    await compressImageFile(
                                                        file,
                                                        300
                                                    );
                                                setCatForm((prev) => ({
                                                    ...prev,
                                                    image: dataUrl,
                                                }));
                                            } catch {
                                                toast.error(
                                                    "Invalid image file"
                                                );
                                            }
                                        }}
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isSubmittingCat}
                                    className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-secondary"
                                >
                                    {isBangla
                                        ? "ক্যাটাগরি যোগ করুন"
                                        : "Add Category"}
                                </button>
                            </form>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {categories.map((cat) => (
                                    <div
                                        key={cat._id}
                                        className="flex items-center justify-between rounded-2xl border border-[#eee5d6] bg-white p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            {cat.image && (
                                                <Image
                                                    src={cat.image}
                                                    alt={localized(
                                                        cat.name,
                                                        language
                                                    )}
                                                    width={42}
                                                    height={42}
                                                    className="h-10.5 w-10.5 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="text-xs font-bold text-dark">
                                                    {cat.name?.en}
                                                </p>
                                                <p className="text-xs text-black/55">
                                                    {cat.name?.bn}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteCategory(cat._id)
                                            }
                                            className="cursor-pointer rounded-xl p-2 text-red hover:bg-red/10"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. USERS TAB */}
                    {activeTab === "users" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {users.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#eee5d6] bg-white p-4"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {u.image ? (
                                            <Image
                                                src={u.image}
                                                alt={u.username}
                                                width={46}
                                                height={46}
                                                className="h-11.5 w-11.5 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UserRound size={20} />
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="truncate text-sm font-bold text-dark">
                                                {u.username}
                                            </p>
                                            <p className="truncate text-xs text-black/55">
                                                {u.email}
                                            </p>
                                            <p className="text-[11px] text-black/50">
                                                {u.phone || "No phone"}
                                            </p>
                                        </div>
                                    </div>

                                    <select
                                        value={u.role || "user"}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                u._id,
                                                e.target.value
                                            )
                                        }
                                        className="rounded-xl border border-[#cfe0d5] bg-[#f8fbf9] px-2.5 py-1.5 text-xs font-semibold capitalize text-primary outline-none"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default DashboardPage;
