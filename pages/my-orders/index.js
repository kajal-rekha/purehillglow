"use client";

import axios from "axios";
import {
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Leaf,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const STATUS_TABS = [
    { key: "all", en: "All Orders", bn: "সব অর্ডার" },
    { key: "pending", en: "Pending", bn: "পেন্ডিং" },
    { key: "processing", en: "Processing", bn: "প্রসেসিং" },
    { key: "delivered", en: "Delivered", bn: "ডেলিভারড" },
    { key: "cancelled", en: "Cancelled", bn: "বাতিল" },
];

const getStatusConfig = (status, isBangla) => {
    switch (status) {
        case "delivered":
            return {
                label: isBangla ? "ডেলিভারি সম্পন্ন" : "Delivered",
                badgeClass: "bg-primary/15 text-primary border-primary/25",
                Icon: CheckCircle2,
            };
        case "processing":
            return {
                label: isBangla ? "প্রসেসিং চলছে" : "Processing",
                badgeClass: "bg-blue/15 text-blue border-blue/25",
                Icon: Truck,
            };
        case "cancelled":
            return {
                label: isBangla ? "বাতিল" : "Cancelled",
                badgeClass: "bg-red/10 text-red border-red/20",
                Icon: XCircle,
            };
        default:
            return {
                label: isBangla ? "পেন্ডিং" : "Pending",
                badgeClass: "bg-orange/15 text-orange border-orange/25",
                Icon: Clock,
            };
    }
};

const MyOrdersPage = () => {
    const { userAndToken } = useSelector((state) => state.auth);
    const language = useSelector((state) => state.language?.language);
    const isBangla = language === "bn";
    const token = userAndToken?.token;

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError("");

        try {
            const { data } = await axios.get("/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err?.response?.status === 404) {
                setOrders([]);
            } else {
                setError(err?.response?.data?.error || "FETCH_ERROR");
            }
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;

    const filteredOrders = useMemo(() => {
        if (activeTab === "all") return orders;
        return orders.filter((order) => order.orderStatus === activeTab);
    }, [orders, activeTab]);

    const counts = useMemo(() => {
        const map = {
            all: orders.length,
            pending: 0,
            processing: 0,
            delivered: 0,
            cancelled: 0,
        };
        orders.forEach((order) => {
            if (map[order.orderStatus] !== undefined) {
                map[order.orderStatus] += 1;
            }
        });
        return map;
    }, [orders]);

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
                        <Link href="/profile" className="hover:text-white">
                            {isBangla ? "প্রোফাইল" : "Profile"}
                        </Link>
                        <ChevronRight size={13} />
                        <span>{isBangla ? "আমার অর্ডার" : "My Orders"}</span>
                    </nav>
                    <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
                        {isBangla ? (
                            <>
                                আমার{" "}
                                <span className="text-[#efc477]">
                                    অর্ডার হিস্ট্রি
                                </span>
                            </>
                        ) : (
                            <>
                                My{" "}
                                <span className="text-[#efc477]">
                                    Order History
                                </span>
                            </>
                        )}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {isBangla
                            ? "আপনার সকল অর্ডারের বর্তমান অবস্থা এবং বিস্তারিত তথ্য এখানে দেখুন"
                            : "Track your current orders and review your past purchases"}
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
                                ? "আপনার অর্ডার হিস্ট্রি দেখতে আগে অ্যাকাউন্টে লগইন করুন।"
                                : "Please sign in to view your order history."}
                        </p>
                        <Link
                            href="/auth/login"
                            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
                        >
                            {isBangla ? "লগইন করুন" : "Sign In"}
                        </Link>
                    </section>
                ) : (
                    <div className="relative z-10 -mt-5 space-y-6">
                        {/* Filter Bar & Refresh */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eee5d6] bg-white p-3.5 shadow-[0_8px_30px_rgba(54,58,39,0.06)] sm:px-5">
                            <div className="flex flex-wrap items-center gap-2">
                                {STATUS_TABS.map((tab) => {
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(tab.key)
                                            }
                                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                                isActive
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "bg-[#f6f8f5] text-dark hover:bg-green-light/70 hover:text-primary"
                                            }`}
                                        >
                                            <span>
                                                {isBangla ? tab.bn : tab.en}
                                            </span>
                                            <span
                                                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                                    isActive
                                                        ? "bg-white/20 text-white"
                                                        : "bg-black/10 text-dark"
                                                }`}
                                            >
                                                {counts[tab.key] || 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={fetchOrders}
                                disabled={isLoading}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/20 bg-green-light/40 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white disabled:opacity-50 eq"
                            >
                                <RefreshCw
                                    size={14}
                                    className={isLoading ? "animate-spin" : ""}
                                />
                                <span>
                                    {isBangla ? "রিফ্রেশ" : "Refresh"}
                                </span>
                            </button>
                        </div>

                        {/* Orders List */}
                        {isLoading ? (
                            <div className="rounded-2xl border border-[#eee5d6] bg-white p-12 text-center shadow-[0_8px_30px_rgba(54,58,39,0.05)]">
                                <RefreshCw
                                    size={28}
                                    className="mx-auto animate-spin text-primary"
                                />
                                <p className="mt-3 text-sm text-black/60">
                                    {isBangla
                                        ? "আপনার অর্ডারগুলো লোড হচ্ছে..."
                                        : "Loading your orders..."}
                                </p>
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl border border-red/20 bg-white p-8 text-center">
                                <p className="text-sm font-medium text-red">
                                    {error === "FETCH_ERROR"
                                        ? isBangla
                                            ? "অর্ডার লোড করতে সমস্যা হয়েছে।"
                                            : "Failed to load orders."
                                        : error}
                                </p>
                                <button
                                    type="button"
                                    onClick={fetchOrders}
                                    className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white"
                                >
                                    {isBangla ? "আবার চেষ্টা করুন" : "Try Again"}
                                </button>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <section className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-[#eee5d6] bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(54,58,39,0.05)]">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2e7] text-primary">
                                    <ShoppingBag size={30} />
                                </span>
                                <h2 className="mt-4 text-lg font-bold text-dark">
                                    {isBangla
                                        ? "কোনো অর্ডার পাওয়া যায়নি"
                                        : "No Orders Found"}
                                </h2>
                                <p className="mt-1.5 text-sm text-black/60">
                                    {activeTab === "all"
                                        ? isBangla
                                            ? "আপনি এখনো কোনো অর্ডার করেননি। আমাদের অর্গানিক পণ্যগুলো ঘুরে দেখুন!"
                                            : "You haven't placed any orders yet. Explore our authentic hill products!"
                                        : isBangla
                                        ? "এই ক্যাটাগরিতে বর্তমানে কোনো অর্ডার নেই।"
                                        : `You have no ${activeTab} orders right now.`}
                                </p>
                                <Link
                                    href="/products"
                                    className="mt-5 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary eq"
                                >
                                    {isBangla ? "পণ্য দেখুন" : "Browse Products"}
                                </Link>
                            </section>
                        ) : (
                            <div className="space-y-5">
                                {filteredOrders.map((order) => {
                                    const statusInfo = getStatusConfig(
                                        order.orderStatus,
                                        isBangla
                                    );
                                    const StatusIcon = statusInfo.Icon;
                                    const subtotal =
                                        (Number(order.totalAmount) || 0) -
                                        (Number(order.deliveryCharge) || 0);

                                    return (
                                        <article
                                            key={order._id}
                                            className="overflow-hidden rounded-2xl border border-[#eee5d6] bg-white shadow-[0_8px_30px_rgba(54,58,39,0.06)]"
                                        >
                                            {/* Order Card Header */}
                                            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8df] bg-[#f8fbf9] px-5 py-4 sm:px-6">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div>
                                                        <span className="text-[11px] font-medium uppercase tracking-wider text-black/45">
                                                            {isBangla
                                                                ? "অর্ডার আইডি"
                                                                : "Order ID"}
                                                        </span>
                                                        <p className="font-mono text-sm font-bold text-dark">
                                                            {order.tran_id}
                                                        </p>
                                                    </div>

                                                    <div className="hidden h-7 w-px bg-[#e2e8e4] sm:block" />

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

                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe7e2] bg-white px-3 py-1 text-xs font-medium text-dark">
                                                        <CreditCard size={13} />
                                                        <span className="uppercase">
                                                            {order.paymentMethod ||
                                                                "COD"}
                                                        </span>
                                                    </span>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
                                                    >
                                                        <StatusIcon size={14} />
                                                        <span>
                                                            {statusInfo.label}
                                                        </span>
                                                    </span>
                                                </div>
                                            </header>

                                            {/* Order Body */}
                                            <div className="grid gap-6 p-5 lg:grid-cols-[1.5fr_1fr] sm:p-6">
                                                {/* Ordered Items */}
                                                <div>
                                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-black/50">
                                                        {isBangla
                                                            ? `অর্ডারকৃত পণ্যসমূহ (${
                                                                  order
                                                                      .orderItems
                                                                      ?.length ||
                                                                  0
                                                              })`
                                                            : `Ordered Items (${
                                                                  order
                                                                      .orderItems
                                                                      ?.length ||
                                                                  0
                                                              })`}
                                                    </h3>

                                                    <div className="divide-y divide-[#f0ece3] rounded-xl border border-[#eee8df] bg-[#fdfcf9]">
                                                        {order.orderItems?.map(
                                                            (item, idx) => {
                                                                const populatedProduct =
                                                                    typeof item.product_id ===
                                                                    "object"
                                                                        ? item.product_id
                                                                        : null;
                                                                const productId =
                                                                    populatedProduct?._id ||
                                                                    item.product_id;
                                                                const thumb =
                                                                    populatedProduct
                                                                        ?.images?.[0];
                                                                const itemName =
                                                                    (isBangla
                                                                        ? populatedProduct
                                                                              ?.name
                                                                              ?.bn ||
                                                                          populatedProduct
                                                                              ?.name
                                                                              ?.en
                                                                        : populatedProduct
                                                                              ?.name
                                                                              ?.en ||
                                                                          populatedProduct
                                                                              ?.name
                                                                              ?.bn) ||
                                                                    item.name;
                                                                const itemUnit =
                                                                    (isBangla
                                                                        ? populatedProduct
                                                                              ?.unit
                                                                              ?.bn ||
                                                                          populatedProduct
                                                                              ?.unit
                                                                              ?.en
                                                                        : populatedProduct
                                                                              ?.unit
                                                                              ?.en ||
                                                                          populatedProduct
                                                                              ?.unit
                                                                              ?.bn) ||
                                                                    item.unit;
                                                                const qty =
                                                                    Number(
                                                                        item.cartQuantity
                                                                    ) || 1;
                                                                const lineTotal =
                                                                    (Number(
                                                                        item.price
                                                                    ) || 0) *
                                                                    qty;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            item._id ||
                                                                            idx
                                                                        }
                                                                        className="flex items-center justify-between gap-3 p-3.5"
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
                                                                                        48
                                                                                    }
                                                                                    height={
                                                                                        48
                                                                                    }
                                                                                    className="h-12 w-12 shrink-0 rounded-lg border border-[#e8e2d5] object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                                    <Package
                                                                                        size={
                                                                                            20
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            )}

                                                                            <div className="overflow-hidden">
                                                                                {productId ? (
                                                                                    <Link
                                                                                        href={`/products/${productId}`}
                                                                                        className="truncate text-sm font-semibold text-dark hover:text-primary"
                                                                                    >
                                                                                        {
                                                                                            itemName
                                                                                        }
                                                                                    </Link>
                                                                                ) : (
                                                                                    <p className="truncate text-sm font-semibold text-dark">
                                                                                        {
                                                                                            itemName
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                                <p className="mt-0.5 text-xs text-black/55">
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

                                                                        <span className="shrink-0 text-sm font-bold text-dark">
                                                                            {formatPrice(
                                                                                lineTotal
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Delivery Info & Price Summary */}
                                                <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#eee8df] bg-[#f8fbf9] p-4">
                                                    <div>
                                                        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-black/50">
                                                            {isBangla
                                                                ? "ডেলিভারি ঠিকানা"
                                                                : "Delivery Details"}
                                                        </h3>
                                                        <div className="space-y-1.5 text-xs text-dark/80">
                                                            <p className="flex items-center gap-2 font-semibold text-dark">
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
                                                            <p className="flex items-center gap-2">
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
                                                            <p className="flex items-start gap-2">
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
                                                                    {order
                                                                        .deliveryDetails
                                                                        ?.thana
                                                                        ? `, ${order.deliveryDetails.thana}`
                                                                        : ""}
                                                                    {order
                                                                        .deliveryDetails
                                                                        ?.district
                                                                        ? `, ${order.deliveryDetails.district}`
                                                                        : ""}
                                                                </span>
                                                            </p>
                                                            {order
                                                                .deliveryDetails
                                                                ?.note && (
                                                                <p className="mt-1 rounded-lg bg-white p-2 text-[11px] italic text-black/60">
                                                                    {isBangla
                                                                        ? "নোট: "
                                                                        : "Note: "}
                                                                    {
                                                                        order
                                                                            .deliveryDetails
                                                                            .note
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 border-t border-[#e2ebe5] pt-3 text-xs">
                                                        <div className="flex justify-between text-black/60">
                                                            <span>
                                                                {isBangla
                                                                    ? "সাবটোটাল"
                                                                    : "Subtotal"}
                                                            </span>
                                                            <span>
                                                                {formatPrice(
                                                                    subtotal
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-black/60">
                                                            <span>
                                                                {isBangla
                                                                    ? "ডেলিভারি চার্জ"
                                                                    : "Delivery Charge"}
                                                            </span>
                                                            <span>
                                                                {formatPrice(
                                                                    order.deliveryCharge
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between border-t border-[#e2ebe5] pt-2 text-sm font-bold text-primary">
                                                            <span>
                                                                {isBangla
                                                                    ? "সর্বমোট"
                                                                    : "Total Amount"}
                                                            </span>
                                                            <span>
                                                                {formatPrice(
                                                                    order.totalAmount
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default MyOrdersPage;

