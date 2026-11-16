"use client";

import { useAdminDashboard } from "@/components/admin/AdminDashboardLayout";
import { Box, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function OverviewKpiCards() {
  const { isBangla, orders, products, categories, users, orderCounts, formatPrice } =
    useAdminDashboard();

  /* ============ Calculate Revenue Metrics ============ */
  const { totalRevenue, deliveredRevenue } = useMemo(() => {
    let total = 0;
    let delivered = 0;
    for (const o of orders) {
      const amt = Number(o.totalAmount) || 0;
      if (o.orderStatus !== "cancelled") total += amt;
      if (o.orderStatus === "delivered") delivered += amt;
    }
    return { totalRevenue: total, deliveredRevenue: delivered };
  }, [orders]);

  /* ============ KPI Card Definitions ============ */
  const kpiCards = [
    {
      id: "revenue",
      title: isBangla ? "মোট অর্ডার রেভিনিউ" : "Total Order Revenue",
      value: formatPrice(totalRevenue),
      footerLabel: isBangla ? "ডেলিভারড আয়" : "Delivered",
      footerBadge: formatPrice(deliveredRevenue),
      icon: TrendingUp,
      barGradient: "from-emerald-400 to-teal-500",
      hoverClass: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
      iconClass: "bg-emerald-500/15 text-emerald-400",
      badgeClass: "bg-emerald-500/15 text-emerald-400",
    },
    {
      id: "pending",
      title: isBangla ? "পেন্ডিং ও প্রসেসিং" : "Pending & Processing",
      value: orderCounts.pending + orderCounts.processing,
      footerLabel: isBangla ? "অর্ডার স্ট্যাটাস" : "Status",
      footerBadge: `${orderCounts.pending} Pending • ${orderCounts.processing} In Progress`,
      icon: Clock,
      barGradient: "from-amber-400 to-orange-500",
      hoverClass: "hover:border-amber-500/30 hover:shadow-amber-500/5",
      iconClass: "bg-amber-500/15 text-amber-400",
      badgeClass: "bg-amber-500/15 text-amber-400",
    },
    {
      id: "completed",
      title: isBangla ? "সম্পন্ন ডেলিভারি" : "Completed Orders",
      value: orderCounts.delivered,
      footerLabel: isBangla ? "মোট অর্ডার অনুপাত" : "Total Ratio",
      footerBadge: isBangla
        ? `${orders.length}টির মধ্যে ${orderCounts.delivered}টি`
        : `${orderCounts.delivered} of ${orders.length} total`,
      icon: CheckCircle2,
      barGradient: "from-sky-400 to-blue-500",
      hoverClass: "hover:border-sky-500/30 hover:shadow-sky-500/5",
      iconClass: "bg-sky-500/15 text-sky-400",
      badgeClass: "bg-sky-500/15 text-sky-400",
    },
    {
      id: "catalog",
      title: isBangla ? "পণ্য ও কাস্টমার" : "Catalog & Customers",
      value: products.length,
      valueSuffix: "items",
      footerLabel: isBangla ? "ক্যাটাগরি ও ইউজার" : "Overview",
      footerBadge: `${categories.length} Categories • ${users.length} Users`,
      icon: Box,
      barGradient: "from-purple-400 to-indigo-500",
      hoverClass: "hover:border-purple-500/30 hover:shadow-purple-500/5",
      iconClass: "bg-purple-500/15 text-purple-400",
      badgeClass: "bg-purple-500/15 text-purple-400",
    },
  ];

  return (
    /* ============ KPI Summary Cards Grid ============ */
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0e161f] p-5 shadow-lg shadow-black/20 transition-all duration-300 ${card.hoverClass}`}
          >
            {/* ============ Top Accent Bar ============ */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.barGradient}`} />

            {/* ============ Card Header ============ */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${card.iconClass}`}>
                <Icon size={19} />
              </span>
            </div>

            {/* ============ Main Metric Value ============ */}
            <p className="mt-3 font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
              {card.value}{" "}
              {card.valueSuffix && (
                <span className="text-sm font-normal text-slate-400">{card.valueSuffix}</span>
              )}
            </p>

            {/* ============ Card Footer ============ */}
            <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
              <span className="text-slate-400">{card.footerLabel}</span>
              <span className={`rounded-md px-2 py-0.5 font-bold ${card.badgeClass}`}>
                {card.footerBadge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
