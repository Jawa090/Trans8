import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Input, Select, Toggle, Btn } from "@/components/admin/ui";
import { PAYMENT_GATEWAYS } from "@/lib/mock-data";
import { useState } from "react";
import { Upload, HelpCircle, Save } from "lucide-react";
import logoAsset from "@/assets/tlogo2.jpg.jpeg";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — TRANS8" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [appName, setAppName] = useState("TRANS8 Logistics OS");
  const [supportEmail, setSupportEmail] = useState("ops@trans8.io");
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [logoPreview, setLogoPreview] = useState(logoAsset);
  const [gw, setGw] = useState(PAYMENT_GATEWAYS);

  const handleSaveGeneral = () => {
    toast.success(`General settings saved! App Name: "${appName}", Email: "${supportEmail}", Timezone: "${timezone}"`);
  };

  return (
    <AdminLayout>
      <PageHeader title="App Settings" subtitle="Global system configuration and service policies" />
      <SettingsTabs active="general" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="General Configuration">
          <div className="space-y-4">
            <Field label="App name">
              <Input className="w-full" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </Field>
            <Field label="Support email">
              <Input className="w-full" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </Field>
            <Field label="Timezone">
              <Select className="w-full" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="Asia/Tehran">Asia/Tehran (GMT+3:50)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4:00)</option>
                <option value="Asia/Karachi">Asia/Karachi (GMT+5:00)</option>
                <option value="Europe/Istanbul">Europe/Istanbul (GMT+3:00)</option>
                <option value="Europe/Moscow">Europe/Moscow (GMT+3:00)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </Select>
            </Field>
            <Field label="System Logo">
              <div className="flex items-center gap-4 p-3 bg-[var(--surface-2)] border border-border rounded-md">
                <img src={logoPreview} className="h-12 w-12 rounded-md border border-border bg-[var(--surface-3)] p-1 object-contain" alt="Logo preview" />
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="settings-logo-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoPreview(URL.createObjectURL(file));
                        toast.info("New logo uploaded (unsaved preview)");
                      }
                    }}
                  />
                  <Btn variant="secondary" className="h-8 text-xs gap-1" onClick={() => document.getElementById("settings-logo-upload")?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Upload Image
                  </Btn>
                  <div className="text-[10px] text-muted-foreground mt-1">Recommended size: 256x256 px.</div>
                </div>
              </div>
            </Field>
            <div className="pt-2">
              <Btn onClick={handleSaveGeneral} className="gap-1.5">
                <Save className="h-4 w-4" /> Save changes
              </Btn>
            </div>
          </div>
        </Panel>

        <Panel title="Payment Gateways Toggle">
          <div className="space-y-3">
            {gw.map((g, i) => (
              <div key={g.name} className="flex items-center justify-between p-2.5 bg-[var(--surface-2)] border border-border rounded-md hover:border-primary/20 transition-colors">
                <div>
                  <span className="font-medium text-foreground">{g.name}</span>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{g.on ? "Active and Live" : "Inactive"}</div>
                </div>
                <Toggle on={g.on} onChange={(v) => {
                  setGw(gw.map((x, j) => j === i ? { ...x, on: v } : x));
                  toast.success(`${g.name} ${v ? "enabled" : "disabled"} successfully`);
                }} />
              </div>
            ))}
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2">
              <HelpCircle className="h-3.5 w-3.5" /> Disabling primary gateways will fallback to secondary methods.
            </div>
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}

export function SettingsTabs({ active }: { active: "general" | "regions" | "languages" | "admins" | "billing" }) {
  const tabs = [
    { id: "general", label: "App Settings", to: "/settings" },
    { id: "regions", label: "Regions", to: "/settings/regions" },
    { id: "languages", label: "Languages", to: "/settings/languages" },
    { id: "admins", label: "Admin Users", to: "/settings/admins" },
    { id: "billing", label: "Billing & Logs", to: "/settings/billing" },
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