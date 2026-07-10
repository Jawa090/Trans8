import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Toggle } from "@/components/admin/ui";
import { PAYMENT_GATEWAYS } from "@/lib/mock-data";
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { FinanceTabs } from "./finance";

export const Route = createFileRoute("/finance/gateways")({
  head: () => ({ meta: [{ title: "Gateways — Movers Admin" }] }),
  component: () => {
    const [gw, setGw] = useState(PAYMENT_GATEWAYS);
    return (
      <AdminLayout>
        <PageHeader title="Payment Gateways" subtitle="Per-region gateway availability" />
        <FinanceTabs active="gateways" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gw.map((g, i) => (
            <Panel key={g.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-[var(--surface-2)] border border-border grid place-items-center text-primary"><CreditCard className="h-5 w-5" /></div>
                  <div><div className="font-display font-bold">{g.name}</div><div className="text-[11px] font-mono text-muted-foreground">{g.on ? "Live" : "Disabled"}</div></div>
                </div>
                <Toggle on={g.on} onChange={(v) => {
                  setGw(gw.map((x, j) => j === i ? { ...x, on: v } : x));
                  toast.success(`${g.name} ${v ? "enabled" : "disabled"}`);
                }} />
              </div>
            </Panel>
          ))}
        </div>
      </AdminLayout>
    );
  },
});