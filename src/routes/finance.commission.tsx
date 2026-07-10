import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Input } from "@/components/admin/ui";
import { REGIONS } from "@/lib/mock-data";
import { Percent, Shield, Landmark } from "lucide-react";
import { FinanceTabs } from "./finance";

const AGENT_TYPES = [
  { key: "logisticBroker", label: "Logistic Broker %" },
  { key: "portAgent", label: "Port Agent %" },
  { key: "customAgent", label: "Custom Agent %" },
  { key: "roadLogisticsPartner", label: "Road Logistics Partner %" },
  { key: "railLogisticsPartner", label: "Rail Logistics Partner %" },
  { key: "seaLogisticsPartner", label: "Sea Logistics Partner %" },
  { key: "airLogisticsPartner", label: "Air Logistics Partner %" },
  { key: "driver", label: "Driver %" },
  { key: "warehouse", label: "Warehouse %" },
  { key: "surveyAgent", label: "Survey Agent %" },
];

export const Route = createFileRoute("/finance/commission")({
  head: () => ({ meta: [{ title: "Commission Settings — TRANS8 Admin" }] }),
  component: CommissionSettingsPage,
});

function CommissionSettingsPage() {
  // Initialize rates per region
  const [rates, setRates] = useState<Record<string, Record<string, number>>>(() => {
    const initialRates: Record<string, Record<string, number>> = {};
    REGIONS.forEach((reg, idx) => {
      initialRates[reg.code] = {};
      AGENT_TYPES.forEach((agent, i) => {
        // Generate realistic default values
        initialRates[reg.code][agent.key] = +(2.5 + ((idx + i) % 5) * 0.5).toFixed(1);
      });
    });
    return initialRates;
  });

  const handleSave = (regionName: string, regionCode: string) => {
    toast.success(`${regionName} commission rates saved successfully!`);
  };

  return (
    <AdminLayout>
      <PageHeader title="Commission Settings" subtitle="Configure commission rates for logistics agents and partners by region" />
      <FinanceTabs active="commission" />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {REGIONS.map((r) => (
          <Panel key={r.code} title={
            <div className="flex items-center gap-2">
              <span className="text-base">{r.flag}</span>
              <span className="font-semibold text-foreground">{r.name} Rates</span>
            </div>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AGENT_TYPES.map((agent) => (
                <div key={agent.key} className="flex items-center justify-between p-2.5 bg-[var(--surface-2)] border border-border rounded-md hover:border-primary/30 transition-colors">
                  <span className="text-xs font-medium text-foreground">{agent.label}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={rates[r.code]?.[agent.key] ?? 0}
                      className="w-20 text-right"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRates({
                          ...rates,
                          [r.code]: {
                            ...rates[r.code],
                            [agent.key]: val,
                          },
                        });
                      }}
                    />
                    <Percent className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <Btn onClick={() => handleSave(r.name, r.code)}>
                Save {r.name} Settings
              </Btn>
            </div>
          </Panel>
        ))}
      </div>
    </AdminLayout>
  );
}