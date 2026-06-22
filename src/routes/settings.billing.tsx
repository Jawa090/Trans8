import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Table, THead, TH, TR, TD, Btn, Input, StatusBadge, Drawer } from "@/components/admin/ui";
import { TRANSACTIONS, formatMoney } from "@/lib/mock-data";
import { SettingsTabs } from "./settings";
import { Search, Info, Landmark } from "lucide-react";

export const Route = createFileRoute("/settings/billing")({
  head: () => ({ meta: [{ title: "Billing & Logs — TRANS8" }] }),
  component: SettingsBillingPage,
});

function SettingsBillingPage() {
  const [q, setQ] = useState("");
  const [selectedTx, setSelectedTx] = useState<(typeof TRANSACTIONS)[number] | null>(null);

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      if (q && !`${t.id} ${t.user} ${t.gateway} ${t.type}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q]);

  return (
    <AdminLayout>
      <PageHeader title="Billing & Logs" subtitle="Audit logs of financial gateway transactions and API settlement events" />
      <SettingsTabs active="billing" />

      <Panel 
        title="Transaction History Audit Trail" 
        action={
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transaction logs..." className="w-full pl-9" />
          </div>
        }
      >
        <div className="mb-3 text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3.5 w-3.5" /> Clicking any Transaction ID links directly to the detailed transaction ledger.
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Txn ID</TH>
              <TH>User / Payer</TH>
              <TH>Type</TH>
              <TH>Payment Method</TH>
              <TH>Date Logged</TH>
              <TH>Settlement Status</TH>
              <TH className="text-right">Settled Amount</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((t) => (
              <TR key={t.id} className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors" onClick={() => setSelectedTx(t)}>
                <TD className="font-mono text-xs text-primary font-semibold hover:underline">{t.id}</TD>
                <TD className="font-medium text-foreground">{t.user}</TD>
                <TD className="text-xs font-mono uppercase text-muted-foreground">{t.type}</TD>
                <TD className="text-xs">{t.gateway}</TD>
                <TD className="font-mono text-xs text-muted-foreground">{t.date}</TD>
                <TD><StatusBadge status={t.status} /></TD>
                <TD className="text-right font-mono text-[var(--accent-lime)] font-bold">{formatMoney(t.amount)}</TD>
                <TD className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedTx(t)}>
                    View Details
                  </Btn>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-8" colSpan={8}>No system logs match the query.</TD></TR>
            )}
          </tbody>
        </Table>
      </Panel>

      {/* Transaction Details Drawer */}
      <Drawer open={!!selectedTx} onClose={() => setSelectedTx(null)} title={selectedTx ? `System Log: ${selectedTx.id}` : ""}>
        {selectedTx && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-[var(--surface-2)] border border-border rounded-lg">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{selectedTx.type}</span>
                <h4 className="text-lg font-bold text-foreground mt-0.5">{selectedTx.id}</h4>
              </div>
              <StatusBadge status={selectedTx.status} />
            </div>

            <Panel title="Details Profile">
              <div className="space-y-3.5">
                <DetailRow label="Payer User" value={selectedTx.user} />
                <DetailRow label="Settlement Amount" value={formatMoney(selectedTx.amount)} highlight />
                <DetailRow label="Payment Gateway" value={selectedTx.gateway} />
                <DetailRow label="Log Timestamp" value={selectedTx.date} />
              </div>
            </Panel>

            <Panel title="Integration Route & Gateway Response">
              <div className="text-xs space-y-2 font-mono bg-[var(--surface-2)] border border-border rounded p-3 text-muted-foreground">
                <div><span className="text-foreground">&gt; GET</span> /api/v1/gateways/settle?id={selectedTx.id}</div>
                <div><span className="text-[var(--accent-lime)]">&lt; 200 OK</span> Gateway processed successfully.</div>
                <div className="pt-2 border-t border-border/40 mt-2 text-[10px] text-muted-foreground">
                  Event: {selectedTx.type.toUpperCase()}_SUCCESSFUL
                  <br />
                  Settled Wallet: {selectedTx.user}
                </div>
              </div>
            </Panel>

            <div className="pt-3 border-t border-border flex justify-end">
              <Btn variant="secondary" onClick={() => setSelectedTx(null)}>Close Details</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-1 border-b border-border/50 last:border-0">
      <span className="text-[10px] font-mono uppercase text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-[var(--accent-lime)] font-bold font-mono" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
