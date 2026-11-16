"use client";

import { useAdminDashboard } from "@/components/admin/AdminDashboardLayout";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

const RANGE_TABS = [
  { key: "7d", en: "7 Days", bn: "৭ দিন" },
  { key: "14d", en: "14 Days", bn: "১৪ দিন" },
  { key: "6m", en: "6 Months", bn: "৬ মাস" },
];

const STATUS_DEFS = [
  { key: "delivered", en: "Delivered", bn: "ডেলিভারড", color: "#10b981", barClass: "bg-emerald-500", textClass: "text-emerald-400" },
  { key: "processing", en: "Processing", bn: "প্রসেসিং", color: "#38bdf8", barClass: "bg-sky-400", textClass: "text-sky-400" },
  { key: "pending", en: "Pending", bn: "পেন্ডিং", color: "#f59e0b", barClass: "bg-amber-400", textClass: "text-amber-400" },
  { key: "cancelled", en: "Cancelled", bn: "বাতিল", color: "#f43f5e", barClass: "bg-rose-500", textClass: "text-rose-400" },
];

export default function OverviewCharts() {
  const { isBangla, orders, orderCounts, formatPrice } = useAdminDashboard();
  const [revenueRange, setRevenueRange] = useState("7d");
  const [hoveredChartIdx, setHoveredChartIdx] = useState(null);

  /* ============ Compute Revenue Time-Series Analytics ============ */
  const revenueAnalytics = useMemo(() => {
    const locale = isBangla ? "bn-BD" : "en-US";
    const latestTs = orders.reduce((max, o) => {
      const ts = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      return ts > max ? ts : max;
    }, 0);
    const anchor = new Date(Math.max(Date.now(), latestTs));
    const pad2 = (n) => String(n).padStart(2, "0");
    const isMonthly = revenueRange === "6m";
    const count = isMonthly ? 6 : revenueRange === "14d" ? 14 : 7;

    const getKey = (d) =>
      isMonthly
        ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
        : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    const buckets = [];
    const bucketMap = new Map();

    for (let i = count - 1; i >= 0; i -= 1) {
      const d = isMonthly
        ? new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
        : new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - i);

      const key = getKey(d);
      const item = {
        key,
        label: d.toLocaleDateString(locale, isMonthly ? { month: "short" } : { day: "numeric", month: "short" }),
        fullLabel: d.toLocaleDateString(
          locale,
          isMonthly ? { month: "long", year: "numeric" } : { weekday: "short", month: "short", day: "numeric" }
        ),
        total: 0,
        delivered: 0,
        count: 0,
      };
      buckets.push(item);
      bucketMap.set(key, item);
    }

    for (const ord of orders) {
      if (!ord.createdAt) continue;
      const bucket = bucketMap.get(getKey(new Date(ord.createdAt)));
      if (!bucket) continue;
      const amt = Number(ord.totalAmount) || 0;
      if (ord.orderStatus !== "cancelled") {
        bucket.total += amt;
        bucket.count += 1;
      }
      if (ord.orderStatus === "delivered") {
        bucket.delivered += amt;
      }
    }

    const rawMax = Math.max(...buckets.map((b) => b.total), 0);
    const step = rawMax <= 1000 ? 250 : rawMax <= 5000 ? 1000 : rawMax <= 20000 ? 5000 : 10000;
    const chartMax = Math.max(Math.ceil((rawMax || 1000) / step) * step, 1000);
    const rangeTotal = buckets.reduce((s, b) => s + b.total, 0);
    const rangeDelivered = buckets.reduce((s, b) => s + b.delivered, 0);
    const rangeOrders = buckets.reduce((s, b) => s + b.count, 0);
    const avgOrderValue = rangeOrders > 0 ? Math.round(rangeTotal / rangeOrders) : 0;
    const peakBucket = buckets.reduce((best, cur) => (cur.total > best.total ? cur : best), buckets[0] || { total: 0 });

    return { buckets, chartMax, rangeTotal, rangeDelivered, rangeOrders, avgOrderValue, peakBucket };
  }, [orders, revenueRange, isBangla]);

  /* ============ Compute Order Status Breakdown ============ */
  const statusAnalytics = useMemo(() => {
    const totalOrdersCount = orders.length || 0;
    const rows = STATUS_DEFS.map((def) => {
      const matching = orders.filter((o) => o.orderStatus === def.key);
      const count = matching.length;
      const amount = matching.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const pct = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;
      return { ...def, count, amount, pct };
    });
    const deliveryRate = totalOrdersCount > 0 ? Math.round((orderCounts.delivered / totalOrdersCount) * 100) : 0;
    return { rows, totalOrdersCount, deliveryRate };
  }, [orders, orderCounts.delivered]);

  /* ============ SVG Chart Coordinates ============ */
  const chartW = 640;
  const chartH = 210;
  const padL = 54;
  const padR = 18;
  const padT = 18;
  const padB = 34;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxVal = revenueAnalytics.chartMax;
  const colW = plotW / (revenueAnalytics.buckets.length || 1);

  const pts = revenueAnalytics.buckets.map((b, idx) => ({
    ...b,
    x: padL + colW * idx + colW / 2,
    y: padT + plotH - (b.total / maxVal) * plotH,
    yDel: padT + plotH - (b.delivered / maxVal) * plotH,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : "";
  const activePt = hoveredChartIdx !== null ? pts[hoveredChartIdx] : null;

  /* ============ Donut Ring Coordinates ============ */
  const donutRadius = 46;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffsetAcc = 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      {/* ============ Revenue Overview Area/Bar Chart ============ */}
      <section className="rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
        {/* ============ Chart Header & Filter Tabs ============ */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                {isBangla ? "রেভিনিউ রিভিউ চার্ট (Revenue Overview)" : "Revenue Overview"}
              </h2>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {isBangla
                ? `${revenueAnalytics.rangeOrders}টি অর্ডার • মোট ${formatPrice(revenueAnalytics.rangeTotal)} • ডেলিভারড ${formatPrice(revenueAnalytics.rangeDelivered)}`
                : `${revenueAnalytics.rangeOrders} orders • Total ${formatPrice(revenueAnalytics.rangeTotal)} • Delivered ${formatPrice(revenueAnalytics.rangeDelivered)}`}
            </p>
          </div>

          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#0b1015] p-0.5">
            {RANGE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setRevenueRange(tab.key);
                  setHoveredChartIdx(null);
                }}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  revenueRange === tab.key
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {isBangla ? tab.bn : tab.en}
              </button>
            ))}
          </div>
        </div>

        {/* ============ Summary Metrics Strip ============ */}
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-white/6 bg-[#0b1015] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {isBangla ? "গড় অর্ডার (AOV)" : "Avg. Order"}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-white">
              {formatPrice(revenueAnalytics.avgOrderValue)}
            </p>
          </div>
          <div className="rounded-xl border border-white/6 bg-[#0b1015] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {isBangla ? "ডেলিভারড আয়" : "Delivered"}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-emerald-400">
              {formatPrice(revenueAnalytics.rangeDelivered)}
            </p>
          </div>
          <div className="rounded-xl border border-white/6 bg-[#0b1015] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {isBangla ? "সর্বোচ্চ সেল" : "Peak Period"}
            </p>
            <p className="mt-0.5 truncate text-sm font-extrabold text-amber-400">
              {formatPrice(revenueAnalytics.peakBucket?.total || 0)}
            </p>
          </div>
        </div>

        {/* ============ Interactive SVG Chart ============ */}
        <div className="relative select-none">
          {activePt && (
            <div className="pointer-events-none absolute right-2 top-0 z-10 rounded-xl border border-emerald-500/35 bg-[#0b1015]/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur-sm">
              <p className="font-bold text-white">{activePt.fullLabel}</p>
              <p className="mt-0.5 text-slate-300">
                {isBangla ? "মোট অর্ডার:" : "Total Orders:"}{" "}
                <span className="font-bold text-white">{formatPrice(activePt.total)}</span> ({activePt.count})
              </p>
              <p className="text-emerald-400">
                {isBangla ? "ডেলিভারড:" : "Delivered:"}{" "}
                <span className="font-bold">{formatPrice(activePt.delivered)}</span>
              </p>
            </div>
          )}

          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="h-52 w-full overflow-visible"
            onMouseLeave={() => setHoveredChartIdx(null)}
          >
            <defs>
              <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* ============ Horizontal Grid Lines ============ */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yPos = padT + plotH - ratio * plotH;
              const tickVal = Math.round(maxVal * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padL}
                    x2={chartW - padR}
                    y1={yPos}
                    y2={yPos}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray={ratio === 0 ? undefined : "4 4"}
                  />
                  <text x={padL - 8} y={yPos + 3.5} textAnchor="end" className="fill-slate-500 text-[10px]">
                    {tickVal >= 1000 ? `৳${(tickVal / 1000).toFixed(tickVal % 1000 === 0 ? 0 : 1)}k` : `৳${tickVal}`}
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="url(#revAreaGrad)" />}

            {/* ============ Bars & X-Axis Labels ============ */}
            {pts.map((p, idx) => {
              const barW = Math.min(20, Math.max(8, colW * 0.42));
              const barH = Math.max(0, padT + plotH - p.y);
              const delH = Math.max(0, padT + plotH - p.yDel);
              const isHovered = hoveredChartIdx === idx;
              const showLabel = revenueRange !== "14d" || idx % 2 === 0 || idx === pts.length - 1;

              return (
                <g key={p.key} className="cursor-pointer" onMouseEnter={() => setHoveredChartIdx(idx)}>
                  <rect
                    x={padL + colW * idx}
                    y={padT}
                    width={colW}
                    height={plotH}
                    fill={isHovered ? "rgba(255,255,255,0.03)" : "transparent"}
                    rx="6"
                  />
                  {barH > 0 && (
                    <rect x={p.x - barW / 2} y={p.y} width={barW} height={barH} rx="4" fill="rgba(56,189,248,0.22)" />
                  )}
                  {delH > 0 && (
                    <rect
                      x={p.x - barW / 2}
                      y={p.yDel}
                      width={barW}
                      height={delH}
                      rx="4"
                      fill={isHovered ? "#34d399" : "#10b981"}
                    />
                  )}
                  {showLabel && (
                    <text
                      x={p.x}
                      y={chartH - 10}
                      textAnchor="middle"
                      className={`text-[10px] ${isHovered ? "fill-emerald-400 font-bold" : "fill-slate-400"}`}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ============ Trend Line & Data Dots ============ */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {pts.map((p, idx) => {
              const isHovered = hoveredChartIdx === idx;
              return (
                <circle
                  key={`dot-${p.key}`}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? "#34d399" : "#080c0f"}
                  stroke="#10b981"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
              );
            })}
          </svg>

          {/* ============ Chart Legend ============ */}
          <div className="mt-2 flex flex-wrap items-center justify-end gap-4 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/60" />
              {isBangla ? "মোট অর্ডার" : "Total Orders"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              {isBangla ? "ডেলিভারড আয়" : "Delivered Revenue"}
            </span>
          </div>
        </div>
      </section>

      {/* ============ Order Status & Revenue Breakdown Donut ============ */}
      <section className="flex flex-col justify-between rounded-2xl border border-white/8 bg-[#10171e] p-5 shadow-lg">
        <div>
          <h2 className="text-sm font-bold text-white">
            {isBangla ? "অর্ডার ও আয়ের ব্রেকডাউন" : "Order & Revenue Breakdown"}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {isBangla ? "স্ট্যাটাস অনুযায়ী মোট অর্ডার ও আয়ের অনুপাত" : "Order distribution & value by status"}
          </p>
        </div>

        {/* ============ Donut Ring Visualization ============ */}
        <div className="my-4 flex items-center justify-center">
          <div className="relative flex h-34 w-34 items-center justify-center">
            <svg viewBox="0 0 120 120" className="-rotate-90 h-full w-full">
              <circle cx="60" cy="60" r={donutRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              {statusAnalytics.totalOrdersCount > 0 &&
                statusAnalytics.rows.map((row) => {
                  const segLen = (row.count / (statusAnalytics.totalOrdersCount || 1)) * donutCircumference;
                  const dashOffset = -donutOffsetAcc;
                  donutOffsetAcc += segLen;
                  if (row.count === 0) return null;
                  return (
                    <circle
                      key={row.key}
                      cx="60"
                      cy="60"
                      r={donutRadius}
                      fill="none"
                      stroke={row.color}
                      strokeWidth="12"
                      strokeDasharray={`${segLen} ${donutCircumference}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
            </svg>
            <div className="absolute text-center">
              <p className="text-xl font-extrabold text-white">{statusAnalytics.deliveryRate}%</p>
              <p className="text-[10px] font-medium text-slate-400">
                {isBangla ? "ডেলিভারি রেট" : "Delivered"}
              </p>
            </div>
          </div>
        </div>

        {/* ============ Status Progress Bars ============ */}
        <div className="space-y-2.5">
          {statusAnalytics.rows.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <span className={`h-2 w-2 rounded-full ${row.barClass}`} />
                  {isBangla ? row.bn : row.en}{" "}
                  <span className="text-[11px] font-normal text-slate-400">({row.count})</span>
                </span>
                <span className={`font-bold ${row.textClass}`}>{formatPrice(row.amount)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
