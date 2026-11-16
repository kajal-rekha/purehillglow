"use client";

import AdminDashboardLayout, {
    DARK_INPUT_CLASS,
    localized,
    ORDER_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    useAdminDashboard,
} from "@/components/admin/AdminDashboardLayout";
import {
    Calendar,
    CreditCard,
    Eye,
    MapPin,
    Package,
    Phone,
    Search,
    Trash2,
    User,
    X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

function AdminOrdersContent() {
    const {
        language,
        isBangla,
        orders,
        orderCounts,
        formatPrice,
        updatingOrderId,
        handleOrderStatusChange,
        handleDeleteOrder,
    } = useAdminDashboard();

    const [orderFilter, setOrderFilter] = useState("all");
    const [orderSearch, setOrderSearch] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const selectedOrder = useMemo(
        () => orders.find((o) => o._id === selectedOrderId) || null,
        [orders, selectedOrderId]
    );

    useEffect(() => {
        if (!selectedOrderId) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setSelectedOrderId(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedOrderId]);

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

    const onRemoveOrder = (orderId) => {
        handleDeleteOrder(orderId, (deletedId) => {
            if (selectedOrderId === deletedId) {
                setSelectedOrderId(null);
            }
        });
    };

    return (
        <div className="space-y-5">
            {/* ============ Filter Tabs & Search ============ */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#10171e] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { key: "all", en: "All Orders", bn: "সব অর্ডার" },
                        { key: "pending", en: "Pending", bn: "পেন্ডিং" },
                        { key: "processing", en: "Processing", bn: "প্রসেসিং" },
                        { key: "delivered", en: "Delivered", bn: "ডেলিভারড" },
                        { key: "cancelled", en: "Cancelled", bn: "বাতিল" },
                    ].map((tab) => {
                        const active = orderFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setOrderFilter(tab.key)}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${active
                                    ? "bg-emerald-500 text-slate-950 font-bold"
                                    : "bg-[#0b1015] text-slate-400 hover:bg-white/8 hover:text-white"
                                    }`}
                            >
                                <span>{isBangla ? tab.bn : tab.en}</span>
                                <span
                                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${active
                                        ? "bg-slate-950/20 text-slate-950"
                                        : "bg-white/10 text-slate-300"
                                        }`}
                                >
                                    {orderCounts[tab.key] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative flex items-center sm:w-80">
                    <Search
                        size={15}
                        className="pointer-events-none absolute left-3.5 text-slate-500"
                    />
                    <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder={
                            isBangla
                                ? "অর্ডার আইডি, নাম বা ফোন খুঁজুন..."
                                : "Search Order ID, name, or phone..."
                        }
                        className={`${DARK_INPUT_CLASS} pl-9`}
                    />
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-[#10171e] p-12 text-center text-sm text-slate-400">
                    {isBangla
                        ? "কোনো অর্ডার পাওয়া যায়নি।"
                        : "No matching orders found."}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#10171e] shadow-xl">
                    {/* ============ Desktop & Tablet Table View ============ */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-white/8 bg-[#0c1218] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "অর্ডার আইডি" : "Order ID"}
                                    </th>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "তারিখ" : "Date"}
                                    </th>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "কাস্টমার" : "Customer"}
                                    </th>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "পণ্য" : "Items"}
                                    </th>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "মোট মূল্য" : "Total"}
                                    </th>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "পেমেন্ট" : "Payment"}
                                    </th>
                                    <th className="px-4 py-3.5">
                                        {isBangla ? "স্ট্যাটাস" : "Status"}
                                    </th>
                                    <th className="px-4 py-3.5 text-right">
                                        {isBangla ? "অ্যাকশন" : "Action"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/6 text-slate-300">
                                {filteredOrders.map((order) => {
                                    const currentStatusObj =
                                        ORDER_STATUS_OPTIONS.find(
                                            (s) => s.value === order.orderStatus
                                        ) || ORDER_STATUS_OPTIONS[0];
                                    const paymentObj =
                                        PAYMENT_STATUS_OPTIONS.find(
                                            (p) =>
                                                p.value === order.paymentStatus
                                        ) || PAYMENT_STATUS_OPTIONS[0];
                                    const itemCount =
                                        order.orderItems?.length || 0;

                                    return (
                                        <tr
                                            key={order._id}
                                            onClick={() =>
                                                setSelectedOrderId(order._id)
                                            }
                                            className="group cursor-pointer transition-colors hover:bg-white/[0.04]"
                                        >
                                            <td className="px-4 py-3 font-mono font-bold text-white transition-colors group-hover:text-emerald-400">
                                                {order.tran_id}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleString(
                                                    isBangla
                                                        ? "bn-BD"
                                                        : "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-white">
                                                    {order.deliveryDetails
                                                        ?.name || "Customer"}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {order.deliveryDetails
                                                        ?.phone || "No phone"}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-semibold text-slate-200">
                                                        {itemCount}{" "}
                                                        {isBangla
                                                            ? "টি"
                                                            : "items"}
                                                    </span>
                                                    <div className="flex -space-x-1.5 overflow-hidden">
                                                        {order.orderItems
                                                            ?.slice(0, 2)
                                                            .map((item, i) => {
                                                                const popProd =
                                                                    typeof item.product_id ===
                                                                        "object"
                                                                        ? item.product_id
                                                                        : null;
                                                                const thumb =
                                                                    popProd
                                                                        ?.images?.[0];
                                                                if (!thumb)
                                                                    return null;
                                                                return (
                                                                    <Image
                                                                        key={
                                                                            item._id ||
                                                                            i
                                                                        }
                                                                        src={
                                                                            thumb
                                                                        }
                                                                        alt="item"
                                                                        width={
                                                                            22
                                                                        }
                                                                        height={
                                                                            22
                                                                        }
                                                                        className="h-5.5 w-5.5 rounded-full border border-[#10171e] object-cover"
                                                                    />
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-400">
                                                {formatPrice(order.totalAmount)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0b1015] px-2 py-0.5 text-[11px] font-medium text-slate-300">
                                                    <CreditCard
                                                        size={11}
                                                        className="text-emerald-400"
                                                    />
                                                    <span className="uppercase text-slate-400">
                                                        {order.paymentMethod ||
                                                            "COD"}
                                                        :
                                                    </span>
                                                    <span
                                                        className={
                                                            order.paymentStatus ===
                                                                "paid"
                                                                ? "font-bold text-emerald-400"
                                                                : "text-slate-300"
                                                        }
                                                    >
                                                        {isBangla
                                                            ? paymentObj.bn
                                                            : paymentObj.en}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${currentStatusObj.badgeClass}`}
                                                >
                                                    <currentStatusObj.icon
                                                        size={12}
                                                    />
                                                    {isBangla
                                                        ? currentStatusObj.bn
                                                        : currentStatusObj.en}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrderId(
                                                                order._id
                                                            );
                                                        }}
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950"
                                                        title={
                                                            isBangla
                                                                ? "অর্ডার বিস্তারিত দেখুন"
                                                                : "View order details"
                                                        }
                                                    >
                                                        <Eye size={13} />
                                                        <span>
                                                            {isBangla
                                                                ? "বিস্তারিত"
                                                                : "Details"}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveOrder(
                                                                order._id
                                                            );
                                                        }}
                                                        className="cursor-pointer rounded-lg border border-rose-500/25 bg-rose-500/10 p-1.5 text-rose-400 transition hover:bg-rose-500 hover:text-white"
                                                        title={
                                                            isBangla
                                                                ? "মুছে ফেলুন"
                                                                : "Delete Order"
                                                        }
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ============ Mobile Cards View ============ */}
                    <div className="divide-y divide-white/6 md:hidden">
                        {filteredOrders.map((order) => {
                            const currentStatusObj =
                                ORDER_STATUS_OPTIONS.find(
                                    (s) => s.value === order.orderStatus
                                ) || ORDER_STATUS_OPTIONS[0];

                            return (
                                <div
                                    key={order._id}
                                    onClick={() =>
                                        setSelectedOrderId(order._id)
                                    }
                                    className="cursor-pointer p-4 transition-colors hover:bg-white/[0.04]"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-bold text-white">
                                            {order.tran_id}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${currentStatusObj.badgeClass}`}
                                        >
                                            <currentStatusObj.icon size={11} />
                                            {isBangla
                                                ? currentStatusObj.bn
                                                : currentStatusObj.en}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-white">
                                            {order.deliveryDetails?.name ||
                                                "Customer"}
                                        </span>
                                        <span className="font-bold text-emerald-400">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>
                                            {order.orderItems?.length || 0}{" "}
                                            {isBangla ? "টি পণ্য" : "items"} •{" "}
                                            {order.deliveryDetails?.phone ||
                                                "No phone"}
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-emerald-400">
                                            <Eye size={12} />
                                            {isBangla
                                                ? "বিস্তারিত দেখুন"
                                                : "View"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ============ Order Details Modal ============ */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-xs animate-in fade-in sm:p-5"
                    onClick={() => setSelectedOrderId(null)}
                >
                    <div
                        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#10171e] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ============ Modal Header ============ */}
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#0c1218] px-5 py-3.5">
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Order ID
                                    </span>
                                    <p className="font-mono text-sm font-bold text-white">
                                        {selectedOrder.tran_id}
                                    </p>
                                </div>

                                <span className="hidden h-6 w-px bg-white/10 sm:block" />

                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Calendar size={14} />
                                    <span>
                                        {new Date(
                                            selectedOrder.createdAt
                                        ).toLocaleString(
                                            isBangla ? "bn-BD" : "en-US",
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
                                <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0b1015] px-2.5 py-1 text-xs">
                                    <CreditCard
                                        size={13}
                                        className="text-emerald-400"
                                    />
                                    <span className="uppercase text-slate-400">
                                        {selectedOrder.paymentMethod || "COD"}:
                                    </span>
                                    <select
                                        value={
                                            selectedOrder.paymentStatus ||
                                            "pending"
                                        }
                                        onChange={(e) =>
                                            handleOrderStatusChange(
                                                selectedOrder._id,
                                                {
                                                    paymentStatus:
                                                        e.target.value,
                                                }
                                            )
                                        }
                                        className="bg-transparent font-semibold text-white outline-none"
                                    >
                                        {PAYMENT_STATUS_OPTIONS.map((p) => (
                                            <option
                                                key={p.value}
                                                value={p.value}
                                                className="bg-[#10171e] text-white"
                                            >
                                                {isBangla ? p.bn : p.en}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {(() => {
                                    const currentStatusObj =
                                        ORDER_STATUS_OPTIONS.find(
                                            (s) =>
                                                s.value ===
                                                selectedOrder.orderStatus
                                        ) || ORDER_STATUS_OPTIONS[0];
                                    return (
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${currentStatusObj.badgeClass}`}
                                        >
                                            <currentStatusObj.icon size={13} />
                                            {isBangla
                                                ? currentStatusObj.bn
                                                : currentStatusObj.en}
                                        </span>
                                    );
                                })()}

                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveOrder(selectedOrder._id)
                                    }
                                    className="cursor-pointer rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500 hover:text-white"
                                    title={
                                        isBangla
                                            ? "অর্ডার মুছে ফেলুন"
                                            : "Delete Order"
                                    }
                                >
                                    <Trash2 size={14} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedOrderId(null)}
                                    className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                    title={isBangla ? "বন্ধ করুন" : "Close"}
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </header>

                        {/* ============ Modal Body ============ */}
                        <div className="overflow-y-auto p-5">
                            <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                                {/* ============ Ordered Items ============ */}
                                <div className="space-y-2.5">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        {isBangla
                                            ? `অর্ডারকৃত পণ্য (${selectedOrder.orderItems
                                                ?.length || 0
                                            })`
                                            : `Ordered Items (${selectedOrder.orderItems
                                                ?.length || 0
                                            })`}
                                    </h3>
                                    <div className="divide-y divide-white/6 rounded-xl border border-white/8 bg-[#0b1015]">
                                        {selectedOrder.orderItems?.map(
                                            (item, idx) => {
                                                const popProd =
                                                    typeof item.product_id ===
                                                        "object"
                                                        ? item.product_id
                                                        : null;
                                                const thumb =
                                                    popProd?.images?.[0];
                                                const itemName =
                                                    localized(
                                                        popProd?.name,
                                                        language
                                                    ) || item.name;
                                                const itemUnit =
                                                    localized(
                                                        popProd?.unit,
                                                        language
                                                    ) || item.unit;
                                                const qty =
                                                    Number(item.cartQuantity) ||
                                                    1;

                                                return (
                                                    <div
                                                        key={item._id || idx}
                                                        className="flex items-center justify-between gap-3 p-3"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            {thumb ? (
                                                                <Image
                                                                    src={thumb}
                                                                    alt={
                                                                        itemName
                                                                    }
                                                                    width={44}
                                                                    height={44}
                                                                    className="h-11 w-11 shrink-0 rounded-lg border border-white/10 object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                                                                    <Package
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="overflow-hidden">
                                                                <p className="truncate text-xs font-bold text-white sm:text-sm">
                                                                    {itemName}
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                    {itemUnit} •{" "}
                                                                    {formatPrice(
                                                                        item.price
                                                                    )}{" "}
                                                                    × {qty}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-xs font-bold text-emerald-400 sm:text-sm">
                                                            {formatPrice(
                                                                (Number(
                                                                    item.price
                                                                ) || 0) * qty
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* ============ Customer & Delivery + Status Controls ============ */}
                                <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/8 bg-[#0b1015] p-4">
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between border-b border-white/8 pb-2">
                                            <span className="font-bold uppercase tracking-wider text-slate-400">
                                                {isBangla
                                                    ? "ডেলিভারি তথ্য"
                                                    : "Delivery Info"}
                                            </span>
                                            <span className="text-sm font-extrabold text-emerald-400">
                                                Total:{" "}
                                                {formatPrice(
                                                    selectedOrder.totalAmount
                                                )}
                                            </span>
                                        </div>

                                        <p className="flex items-center gap-2 font-semibold text-white">
                                            <User
                                                size={14}
                                                className="text-emerald-400"
                                            />
                                            <span>
                                                {
                                                    selectedOrder
                                                        .deliveryDetails?.name
                                                }
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-300">
                                            <Phone
                                                size={14}
                                                className="text-emerald-400"
                                            />
                                            <span>
                                                {
                                                    selectedOrder
                                                        .deliveryDetails?.phone
                                                }
                                            </span>
                                        </p>
                                        <p className="flex items-start gap-2 text-slate-300">
                                            <MapPin
                                                size={14}
                                                className="mt-0.5 shrink-0 text-emerald-400"
                                            />
                                            <span>
                                                {
                                                    selectedOrder
                                                        .deliveryDetails
                                                        ?.address
                                                }
                                                ,{" "}
                                                {
                                                    selectedOrder
                                                        .deliveryDetails?.thana
                                                }
                                                ,{" "}
                                                {
                                                    selectedOrder
                                                        .deliveryDetails
                                                        ?.district
                                                }
                                            </span>
                                        </p>
                                        {selectedOrder.deliveryDetails
                                            ?.note && (
                                                <p className="rounded-lg border border-white/6 bg-white/[0.03] px-2.5 py-1.5 text-[11px] italic text-slate-300">
                                                    Note:{" "}
                                                    {
                                                        selectedOrder
                                                            .deliveryDetails.note
                                                    }
                                                </p>
                                            )}
                                    </div>

                                    <div className="border-t border-white/8 pt-3">
                                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                                            {isBangla
                                                ? "অর্ডার স্ট্যাটাস পরিবর্তন করুন:"
                                                : "Update Order Status:"}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {ORDER_STATUS_OPTIONS.map((opt) => {
                                                const Icon = opt.icon;
                                                const isCurrent =
                                                    selectedOrder.orderStatus ===
                                                    opt.value;
                                                const isUpdating =
                                                    updatingOrderId ===
                                                    selectedOrder._id;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        disabled={
                                                            isCurrent ||
                                                            isUpdating
                                                        }
                                                        onClick={() =>
                                                            handleOrderStatusChange(
                                                                selectedOrder._id,
                                                                {
                                                                    orderStatus:
                                                                        opt.value,
                                                                }
                                                            )
                                                        }
                                                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${isCurrent
                                                            ? opt.activeClass
                                                            : "border-white/10 bg-[#121a22] text-slate-300 hover:border-emerald-500/40 hover:text-white"
                                                            } disabled:cursor-default`}
                                                    >
                                                        <Icon size={13} />
                                                        <span>
                                                            {isBangla
                                                                ? opt.bn
                                                                : opt.en}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============ Modal Footer ============ */}
                        <div className="flex items-center justify-between border-t border-white/8 bg-[#0c1218] px-5 py-3 text-xs text-slate-400">
                            <span>
                                {isBangla
                                    ? "স্ট্যাটাস পরিবর্তন সাথে সাথেই সেভ হয়"
                                    : "Status changes take effect immediately"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedOrderId(null)}
                                className="rounded-xl border border-white/10 bg-[#16212b] px-4 py-1.5 font-bold text-white transition hover:bg-white/10"
                            >
                                {isBangla ? "বন্ধ করুন" : "Close"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    return (
        <AdminDashboardLayout activeSection="orders">
            <AdminOrdersContent />
        </AdminDashboardLayout>
    );
}
