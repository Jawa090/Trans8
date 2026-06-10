import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Input, Select, Toggle, Btn } from "@/components/admin/ui";
import { PAYMENT_GATEWAYS } from "@/lib/mock-data";
import { useState } from "react";
import { Upload } from "lucide-react";
import logoAsset from "@/assets/tlogo2.jpg.jpeg";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — TRANS8" }] }),
  component: () => {
    const [gw, setGw] = useState(PAYMENT_GATEWAYS);
    return (
      <AdminLayout>
        <PageHeader title="App Settings" subtitle="Global configuration" />
        <SettingsTabs active="general" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="General">
            <div className="space-y-4">
              <Field label="App name"><Input className="w-full" defaultValue="TRANS8 Logistics OS" /></Field>
              <Field label="Support email"><Input className="w-full" defaultValue="ops@trans8.io" /></Field>
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
              <Btn onClick={() => toast.success("Settings saved successfully!")}>Save changes</Btn>
            </div>
          </Panel>
          <Panel title="Payment Gateways">
            <div className="space-y-3">
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

export function SettingsTabs({ active }: { active: "general" | "regions" | "languages" | "admins" }) {
  const tabs = [
    { id: "general", label: "App Settings", to: "/settings" },
    { id: "regions", label: "Regions", to: "/settings/regions" },
    { id: "languages", label: "Languages", to: "/settings/languages" },
    { id: "admins", label: "Admin Users", to: "/settings/admins" },
  ];
  return (
    <div className="border-b border-border flex gap-1 mb-6 overflow-x-auto">
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          className={`px-4 py-2.5 text-sm font-medium relative transition-colors whitespace-nowrap ${
            active === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
          {active === t.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
        </Link>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}