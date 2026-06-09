import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";

export const Route = createFileRoute("/logistics/sea")({
  head: () => ({ meta: [{ title: "Sea Port — Movers Admin" }] }),
  component: () => (
    <AdminLayout>
      <PageHeader title="Sea Port" subtitle="FCL · LCL · Bulk container operations" />
      <BookingsView type="Sea" idLabel="Booking" showContainer />
    </AdminLayout>
  ),
});