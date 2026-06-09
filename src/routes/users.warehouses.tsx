import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Btn } from "@/components/admin/ui";
import { REGIONS } from "@/lib/mock-data";
import { Warehouse, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/warehouses")({
  head: () => ({ meta: [{ title: "Warehouses — Movers Admin" }] }),
  component: () => {
    const houses = Array.from({ length: 9 }, (_, i) => ({
      id: `WH-${1024 + i}`,
      name: ["Tehran Central", "Dubai Free Zone", "Karachi Port", "Istanbul Hub", "Riyadh Logistics Park", "Doha South", "Lahore Distribution", "Cape Town Harbor", "Moscow North"][i],
      region: REGIONS[i % REGIONS.length].name,
      capacity: `${(8 + i * 1.4).toFixed(1)}k m³`,
      utilization: 40 + ((i * 11) % 60),
      status: i % 4 === 0 ? "Pending" : "Active",
    }));
    return (
      <AdminLayout>
        <PageHeader title="Warehouses" subtitle={`${houses.length} partner facilities`}
          actions={<Btn onClick={() => toast("Warehouse registration started")}>+ Register Warehouse</Btn>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map((w) => (
            <Panel key={w.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-md bg-primary/15 text-primary grid place-items-center"><Warehouse className="h-5 w-5" /></div>
                <StatusBadge status={w.status} />
              </div>
              <div className="font-display font-bold text-lg">{w.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{w.region}</div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Capacity</div><div className="font-mono text-sm">{w.capacity}</div></div>
                <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Utilized</div><div className="font-mono text-sm text-[var(--accent-lime)]">{w.utilization}%</div></div>
              </div>
              <div className="mt-3 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${w.utilization}%` }} />
              </div>
            </Panel>
          ))}
        </div>
      </AdminLayout>
    );
  },
});