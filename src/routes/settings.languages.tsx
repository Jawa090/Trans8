import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Toggle } from "@/components/admin/ui";
import { LANGUAGES } from "@/lib/mock-data";
import { Lock } from "lucide-react";
import { SettingsTabs } from "./settings";

export const Route = createFileRoute("/settings/languages")({
  head: () => ({ meta: [{ title: "Languages — TRANS8" }] }),
  component: () => {
    const [langs, setLangs] = useState(LANGUAGES);
    return (
      <AdminLayout>
        <PageHeader title="Languages" subtitle={`${langs.filter((l) => l.on).length} active locales`} />
        <SettingsTabs active="languages" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {langs.map((l, i) => (
            <Panel key={l.code}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-display font-bold uppercase">{l.name}</div>
                  <div className="text-sm text-muted-foreground">{l.native}</div>
                </div>
                {l.locked ? <Lock className="h-4 w-4 text-primary" /> : null}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">{l.code}</span>
                <Toggle on={l.on} disabled={l.locked} onChange={(v) => {
                  setLangs(langs.map((x, j) => j === i ? { ...x, on: v } : x));
                  toast.success(`${l.name} ${v ? "enabled" : "disabled"}`);
                }} />
              </div>
            </Panel>
          ))}
        </div>
      </AdminLayout>
    );
  },
});