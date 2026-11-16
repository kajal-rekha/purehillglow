"use client";

import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import OverviewActivityPanels from "@/components/admin/OverviewActivityPanels";
import OverviewCharts from "@/components/admin/OverviewCharts";
import OverviewKpiCards from "@/components/admin/OverviewKpiCards";

export default function DashboardOverviewPage() {
  return (
    <AdminDashboardLayout activeSection="overview">
      <div className="space-y-6">
        <OverviewKpiCards />
        <OverviewCharts />
        <OverviewActivityPanels />
      </div>
    </AdminDashboardLayout>
  );
}
