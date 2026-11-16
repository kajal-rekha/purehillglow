"use client";

import {
  localized,
  ORDER_STATUS_OPTIONS,
  useAdminDashboard,
} from "@/components/admin/AdminDashboardLayout";
import { AlertTriangle, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STATUS_ICON_COLOR = {
  processing: "text-sky-400",
  delivered: "text-emerald-400",
  cancelled: "text-rose-400",
  pending: "text-amber-400",
};

export default function OverviewActivityPanels() {
  const {
    language,
    isBangla,
    orders,
    products,
    formatPrice,
    updatingOrderId,
    handleOrderStatusChange,
  } = useAdminDashboard();

  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);

  /* ============ Close Dropdown on Outside Click ============ */
  useEffect(() => {
    if (!openStatusDropdownId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest("[data-status-dropdown]")) {
        setOpenStatusDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openStatusDropdownId]);

  /* ============ Filtered Lists ============ */
  const recentOrders = useMemo(() => (orders || []).slice(0, 5), [orders]);
  const lowStockProducts = useMemo(
    () => (products || []).filter((p) => Number(p.stock) <= 5).slice(0, 6),
    [products]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      {/* ============ Recent Orders Quick Action ============ */}
      <section className="rounded-2xl border border-white/8 bg-[#10171e] p-5">
        {/* ============ Panel Header ============ */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              {isBangla
                ? "সাম্প্রতিক অর্ডারসমূহ (দ্রুত স্ট্যাটাস পরিবর্তন)"
                : "Recent Orders — Quick Action"}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isBangla
                ? "সর্বশেষ অর্ডারগুলোর স্ট্যাটাস এখান থেকেই পরিবর্তন করুন"
                : "Update the latest incoming orders directly"}
            </p>
          </div>
          <Link
            href="/adminDashboard/orders"
            className="cursor-pointer text-xs font-semibold text-emerald-400 hover:underline"
          >
            {isBangla ? "সব অর্ডার দেখুন →" : "View All →"}
          </Link>
        </div>

        {/* ============ Recent Orders List ============ */}
        <div className="space-y-3">
          {recentOrders.map((order) => {
            const currentStatus = order.orderStatus || "pending";
            const currentOpt =
              ORDER_STATUS_OPTIONS.find((opt) => opt.value === currentStatus) ||
              ORDER_STATUS_OPTIONS[0];
            const CurrentIcon = currentOpt.icon;
            const otherOptions = ORDER_STATUS_OPTIONS.filter(
              (opt) => opt.value !== currentStatus
            );
            const isDropdownOpen = openStatusDropdownId === order._id;
            const isUpdating = updatingOrderId === order._id;

            return (
              <div
                key={order._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/6 bg-[#0b1015] p-3.5"
              >
                {/* ============ Order Summary Info ============ */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {order.tran_id}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {order.deliveryDetails?.name} • {order.deliveryDetails?.phone} •{" "}
                    {order.deliveryDetails?.district}
                  </p>
                </div>

                {/* ============ Status Dropdown Selector ============ */}
                <div className="relative" data-status-dropdown>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      setOpenStatusDropdownId(isDropdownOpen ? null : order._id)
                    }
                    className={`inline-flex min-w-33 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${currentOpt.badgeClass} hover:brightness-110 disabled:opacity-60`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <CurrentIcon size={13} />
                      <span>{isBangla ? currentOpt.bn : currentOpt.en}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 z-30 mt-1.5 w-40 overflow-hidden rounded-xl border border-white/12 bg-[#121a24] p-1 shadow-2xl">
                      {otherOptions.map((opt) => {
                        const OptIcon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setOpenStatusDropdownId(null);
                              handleOrderStatusChange(order._id, {
                                orderStatus: opt.value,
                              });
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-white/8 hover:text-white"
                          >
                            <OptIcon
                              size={13}
                              className={STATUS_ICON_COLOR[opt.value] || "text-amber-400"}
                            />
                            <span>{isBangla ? opt.bn : opt.en}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ Low Stock Watchlist ============ */}
      <section className="rounded-2xl border border-white/8 bg-[#10171e] p-5">
        {/* ============ Watchlist Header ============ */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              {isBangla ? "স্টক অ্যালার্ট (কম স্টক)" : "Low Stock Watchlist"}
            </h2>
          </div>
          <Link
            href="/adminDashboard/products"
            className="cursor-pointer text-xs font-semibold text-emerald-400 hover:underline"
          >
            {isBangla ? "পণ্য ম্যানেজ →" : "Manage →"}
          </Link>
        </div>

        {/* ============ Watchlist Items ============ */}
        {lowStockProducts.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-xs text-emerald-300">
            {isBangla
              ? "সব পণ্যের পর্যাপ্ত স্টক রয়েছে!"
              : "All products are well-stocked!"}
          </div>
        ) : (
          <div className="space-y-2.5">
            {lowStockProducts.map((prod) => (
              <div
                key={prod._id}
                className="flex items-center justify-between rounded-xl border border-white/6 bg-[#0b1015] p-3"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {prod.images?.[0] && (
                    <Image
                      src={prod.images[0]}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <p className="truncate text-xs font-semibold text-white">
                    {localized(prod.name, language)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                  Stock: {prod.stock}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
