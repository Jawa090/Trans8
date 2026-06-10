import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Input } from "@/components/admin/ui";
import { REGIONS } from "@/lib/mock-data";

const TRANSPORT_TYPES = ["Road", "Train", "Air", "Sea"];
const AGENT_TYPES = [
  "Logistic Broker",
  "Port Agent",
  "Custom Agent",
  "Logistics Partner",
  "Insurance Agent",
  "Survey Agent",
  "Warehouse Agent"
];

export const Route = createFileRoute("/finance/commission")({
  head: () => ({ meta: [{ title: "Commission — TRANS8" }] }),
  component: CommissionSettingsPage,
});

function CommissionSettingsPage() {
  const [rates, setRates] = useState<Record<string, Record<string, number>>>(() => {
    const r: Record<string, Record<string, number>> = {};
    REGIONS.forEach((reg, idx) => {
      r[reg.code] = {};
      TRANSPORT_TYPES.forEach((t, i) => { r[reg.code][t] = 4 + ((idx + i) % 9); });
      AGENT_TYPES.forEach((a, i) => { r[reg.code][a] = +(1.5 + ((idx + i) % 4) * 0.5).toFixed(1); });
    });
    return r;
  });

  return (
    <AdminLayout>
      <PageHeader title="Commission Settings" subtitle="Per-region commission settings for Transport Types & Agent Types" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {REGIONS.map((r) => (
          <Panel key={r.code} title={<><span className="text-base">{r.flag}</span> <span className="font-semibold">{r.name} Rates</span></>}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-primary mb-3">Transport Commission</h4>
                <div className="space-y-3">
                  {TRANSPORT_TYPES.map((t) => (
                    <div key={t} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-24 truncate">{t}</span>
                      <Input type="number" step="0.1" value={rates[r.code]?.[t] ?? 0} className="w-24 text-right"
                        onChange={(e) => setRates({ ...rates, [r.code]: { ...rates[r.code], [t]: Number(e.target.value) } })} />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-primary mb-3">Agent Commission</h4>
                <div className="space-y-3">
                  {AGENT_TYPES.map((a) => (
                    <div key={a} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-28 truncate">{a}</span>
                      <Input type="number" step="0.1" value={rates[r.code]?.[a] ?? 0} className="w-24 text-right"
                        onChange={(e) => setRates({ ...rates, [r.code]: { ...rates[r.code], [a]: Number(e.target.value) } })} />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <Btn onClick={() => toast.success(`${r.name} commission configuration saved successfully!`)}>
                Save Changes
              </Btn>
            </div>
          </Panel>
        ))}
      </div>
    </AdminLayout>
  );
}