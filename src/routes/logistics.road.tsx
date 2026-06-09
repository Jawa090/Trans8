import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/logistics/road")({
  head: () => ({ meta: [{ title: "Road Shipments — Movers Admin" }] }),
  component: () => {
    const rows = BOOKINGS.filter((b) => b.type === "Road");
    return (
      <AdminLayout>
        <PageHeader title="Road Shipments" subtitle={`${rows.length} truck movements`} />
        <BookingsView type="Road" idLabel="Trip" />
      </AdminLayout>
    );
  },
});