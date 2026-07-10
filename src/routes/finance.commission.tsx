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
  // Initialize rates per region with persistent storage
  const [rates, setRates] = useState<Record<string, Record<string, number>>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("trans8_commission_rates");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // Fallback
        }
      }
    }
    const initialRates: Record<string, Record<string, number>> = {};
    REGIONS.forEach((reg, idx) => {
      initialRates[reg.code] = {};
      AGENT_TYPES.forEach((agent, i) => {
        initialRates[reg.code][agent.key] = +(2.5 + ((idx + i) % 5) * 0.5).toFixed(1);
      });
    });
    return initialRates;
  });

  const [simRegion, setSimRegion] = useState("AE");
  const [simAmount, setSimAmount] = useState(15000);

  const handleSave = (regionName: string, regionCode: string) => {
    localStorage.setItem("trans8_commission_rates", JSON.stringify(rates));
    toast.success(`${regionName} commission rates saved and synchronized system-wide!`);
  };

  const getSimulatedSplits = () => {
    const regionRates = rates[simRegion] || {};
    let totalAgentPay = 0;
    const splits = AGENT_TYPES.map((agent) => {
      const rate = regionRates[agent.key] || 0;
      const share = +(simAmount * (rate / 100)).toFixed(2);
      totalAgentPay += share;
      return {
        label: agent.label.replace(" %", ""),
        rate,
        share,
      };
    });
    const platformFee = +(simAmount - totalAgentPay).toFixed(2);
    return { splits, totalAgentPay, platformFee };
  };

  const { splits, totalAgentPay, platformFee } = getSimulatedSplits();

  return (
    <AdminLayout>
      <PageHeader title="Commission Settings" subtitle="Configure commission rates for logistics agents and partners by region" />
      <FinanceTabs active="commission" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Left column: Regional configurations */}
        <div className="lg:col-span-2 space-y-6">
          {REGIONS.map((r) => (
            <Panel key={r.code} title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-base">{r.flag}</span>
                  <span className="font-semibold text-foreground">{r.name} Commission Scope</span>
                </div>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
            }>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="w-20 text-right bg-[var(--surface-3)]"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = {
                            ...rates,
                            [r.code]: {
                              ...rates[r.code],
                              [agent.key]: val,
                            },
                          };
                          setRates(updated);
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

        {/* Right column: Calculator Simulator & Ledgering */}
        <div className="space-y-6">
          <Panel title="Ledger Commission Calculator" action={<Landmark className="h-4 w-4 text-primary" />}>
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Simulate how cargo/tender bookings split in real-time based on active regional commission rates.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Target Region</label>
                  <select
                    value={simRegion}
                    onChange={(e) => setSimRegion(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-border rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.flag} {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Simulated Tender/Booking Amount ($)</label>
                  <Input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                    className="w-full"
                    placeholder="e.g. 10000"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="text-xs font-mono uppercase text-primary">Simulated Distribution</div>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {splits.map((s) => (
                    <div key={s.label} className="flex justify-between text-xs py-1 border-b border-border/40 last:border-0">
                      <span className="text-muted-foreground">{s.label} <span className="font-mono text-[9px]">({s.rate}%)</span></span>
                      <span className="font-mono font-medium">${s.share.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-dashed border-border/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid to Partners/Agents:</span>
                    <span className="font-mono text-[var(--warning)] font-semibold">${totalAgentPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Platform Commission Fee:</span>
                    <span className={`font-mono font-bold ${platformFee >= 0 ? "text-[var(--accent-lime)]" : "text-[var(--danger)]"}`}>
                      ${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-[10px] text-primary font-mono mt-4 space-y-1">
                  <div className="font-bold uppercase mb-1">Simulated Ledger Trace:</div>
                  <div>[LEDGER LOG] Applied split rules for region {simRegion}.</div>
                  <div>[LEDGER LOG] Platform net retention fee route: ${platformFee.toLocaleString()}</div>
                  <div>[LEDGER LOG] Distributed ledger routes: {splits.filter(s => s.share > 0).length} channels authenticated.</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}