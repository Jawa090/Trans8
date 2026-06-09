import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Input } from "@/components/admin/ui";
import { REGIONS } from "@/lib/mock-data";

const TYPES = ["Road", "Train", "Air", "Sea"];

export const Route = createFileRoute("/finance/commission")({
  head: () => ({ meta: [{ title: "Commission — Movers Admin" }] }),
  component: () => {
    const [rates, setRates] = useState<Record<string, Record<string, number>>>(() => {
      const r: Record<string, Record<string, number>> = {};
      REGIONS.forEach((reg, idx) => {
        r[reg.code] = {};
        TYPES.forEach((t, i) => { r[reg.code][t] = 4 + ((idx + i) % 9); });
      });
      return r;
    });
    return (
      <AdminLayout>
        <PageHeader title="Commission Settings" subtitle="Per-region · per-shipment-type rates" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {REGIONS.map((r) => (
            <Panel key={r.code} title={<><span>{r.flag}</span> {r.name}</>}>
              <div className="space-y-3">
                {TYPES.map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase text-muted-foreground w-16">{t}</span>
                    <Input type="number" value={rates[r.code][t]} className="w-24"
                      onChange={(e) => setRates({ ...rates, [r.code]: { ...rates[r.code], [t]: Number(e.target.value) } })} />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                ))}
              </div>
              <Btn className="mt-4" onClick={() => toast.success(`${r.name} commission rates saved`)}>Save</Btn>
            </Panel>
          ))}
        </div>
      </AdminLayout>
    );
  },
});