import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Input, Select, Toggle, Btn } from "@/components/admin/ui";
import { PAYMENT_GATEWAYS } from "@/lib/mock-data";
import { useState } from "react";
import { Upload } from "lucide-react";
import logoAsset from "@/assets/tlogo2.jpg.jpeg";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Movers Admin" }] }),
  component: () => {
    const [gw, setGw] = useState(PAYMENT_GATEWAYS);
    return (
      <AdminLayout>
        <PageHeader title="App Settings" subtitle="Global configuration" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="General">
            <div className="space-y-3">
              <Field label="App name"><Input className="w-full" defaultValue="Movers Logistics OS" /></Field>
              <Field label="Support email"><Input className="w-full" defaultValue="ops@movers.io" /></Field>
              <Field label="Timezone">
                <Select className="w-full" defaultValue="Asia/Dubai">
                  <option>Asia/Tehran</option><option>Asia/Dubai</option><option>Asia/Karachi</option><option>Europe/Istanbul</option><option>Europe/Moscow</option><option>UTC</option>
                </Select>
              </Field>
              <Field label="Logo">
                <div className="flex items-center gap-3">
                  <img src={logoAsset} className="h-12 w-12 rounded-md border border-border bg-[var(--surface-2)] p-1 object-contain" alt="" />
                  <Btn variant="secondary"><Upload className="h-4 w-4" />Upload</Btn>
                </div>
              </Field>
              <Btn onClick={() => toast.success("Settings saved")}>Save changes</Btn>
            </div>
          </Panel>
          <Panel title="Payment Gateways">
            <div className="space-y-2">
              {gw.map((g, i) => (
                <div key={g.name} className="flex items-center justify-between p-2.5 bg-[var(--surface-2)] border border-border rounded-md">
                  <span className="font-medium">{g.name}</span>
                  <Toggle on={g.on} onChange={(v) => { setGw(gw.map((x, j) => j === i ? { ...x, on: v } : x)); toast.success(`${g.name} ${v ? "enabled" : "disabled"}`); }} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </AdminLayout>
    );
  },
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}