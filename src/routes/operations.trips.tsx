import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Table, THead, TH, TR, TD, Panel, Btn } from "@/components/admin/ui";
import { BOOKINGS, formatMoney } from "@/lib/mock-data";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/operations/trips")({
  head: () => ({ meta: [{ title: "Active Trips — Movers Admin" }] }),
  component: TripsPage,
});

function TripsPage() {
    const initial = BOOKINGS.filter((b) => b.status === "In Transit");
    const [trips, setTrips] = useState(initial);
    return (
      <AdminLayout>
        <PageHeader title="Active Trips" subtitle={`${trips.length} shipments currently moving across the network`} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {trips.slice(0, 6).map((t) => {
            const progress = 20 + ((t.id.length * 13) % 70);
            return (
              <Panel key={t.id}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary">{t.id}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{t.origin}</div>
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[var(--accent-lime)]" />{t.destination}</div>
                </div>
                <div className="mt-2 h-1.5 bg-[var(--surface-2)] rounded-full relative">
                  <div className="h-full bg-gradient-to-r from-primary to-[var(--accent-lime)] rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-muted-foreground">{t.driver}</span>
                  <span className="font-mono text-[var(--accent-lime)]">{formatMoney(t.amount)}</span>
                </div>
                <div className="flex gap-1 mt-3">
                  <Btn className="h-7 px-2 text-xs flex-1" onClick={() => {
                    setTrips(trips.filter((x) => x.id !== t.id));
                    toast.success(`${t.id} marked delivered`);
                  }}>Mark Delivered</Btn>
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast(`Live tracking ${t.id}`)}>Track</Btn>
                </div>
              </Panel>
            );
          })}
        </div>
        <Table>
          <THead><TR><TH>Trip</TH><TH>Driver</TH><TH>Route</TH><TH>Cargo</TH><TH>Weight</TH><TH>ETA</TH></TR></THead>
          <tbody>
            {trips.map((t) => (
              <TR key={t.id}>
                <TD className="font-mono text-xs text-primary">{t.id}</TD>
                <TD>{t.driver}</TD>
                <TD className="text-xs text-muted-foreground">{t.origin} → {t.destination}</TD>
                <TD>{t.cargo}</TD>
                <TD className="font-mono">{t.weight}</TD>
                <TD className="font-mono text-xs">{t.date}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </AdminLayout>
    );
}