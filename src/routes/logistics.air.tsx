import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/logistics/air")({
  head: () => ({ meta: [{ title: "Airport Cargo — Movers Admin" }] }),
  component: () => {
    const rows = BOOKINGS.filter((b) => b.type === "Air");
    return (
      <AdminLayout>
        <PageHeader title="Airport Cargo" subtitle={`${rows.length} air freight bookings`} />
        <BookingsView type="Air" idLabel="AWB" />
      </AdminLayout>
    );
  },
});