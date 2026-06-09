import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/logistics/train")({
  head: () => ({ meta: [{ title: "Train Cargo — Movers Admin" }] }),
  component: () => {
    const rows = BOOKINGS.filter((b) => b.type === "Train");
    return (
      <AdminLayout>
        <PageHeader title="Train Cargo" subtitle={`${rows.length} rail consignments`} />
        <BookingsView type="Train" idLabel="Consignment" />
      </AdminLayout>
    );
  },
});