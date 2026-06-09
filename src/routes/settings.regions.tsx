import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Toggle, Btn } from "@/components/admin/ui";
import { REGIONS, formatCompact } from "@/lib/mock-data";

export const Route = createFileRoute("/settings/regions")({
  head: () => ({ meta: [{ title: "Regions — Movers Admin" }] }),
  component: () => {
    const [regions, setRegions] = useState(REGIONS);
    return (
      <AdminLayout>
        <PageHeader title="Regions" subtitle={`${regions.filter((r) => r.active).length} of ${regions.length} active`} actions={<Btn onClick={() => toast("New region setup coming up")}>+ New Region</Btn>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {regions.map((r, i) => (
            <Panel key={r.code}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{r.flag}</span>
                  <div>
                    <div className="font-display font-bold text-lg">{r.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{r.currency}</div>
                  </div>
                </div>
                <Toggle on={r.active} onChange={(v) => {
                  setRegions(regions.map((x, j) => j === i ? { ...x, active: v } : x));
                  toast.success(`${r.name} ${v ? "activated" : "deactivated"}`);
                }} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Users</div><div className="font-mono">{formatCompact(r.users)}</div></div>
                <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Bookings</div><div className="font-mono">{formatCompact(r.bookings)}</div></div>
              </div>
              <Btn variant="secondary" className="w-full mt-3" onClick={() => toast(`Editing ${r.name}…`)}>Edit</Btn>
            </Panel>
          ))}
        </div>
      </AdminLayout>
    );
  },
});