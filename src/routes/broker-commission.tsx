import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Table, THead, TH, TR, TD, Input, Drawer } from "@/components/admin/ui";
import { formatMoney } from "@/lib/mock-data";
import { toast } from "sonner";
import { Users, DollarSign, Wallet, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/broker-commission")({
  head: () => ({ meta: [{ title: "Broker Commission Summary — TRANS8" }] }),
  component: BrokerCommissionPage,
});

const BROKERS = ["Layla Hosseini", "Omar Al-Saud", "Mehmet Yilmaz", "Nadia Mansouri", "Hassan Khan"];
const INCOTERMS = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DPU", "DAP", "DDP"];

const AGENT_ASSIGNMENTS: Record<string, { port: string; warehouse: string; company: string }> = {
  "Layla Hosseini": { port: "Jebel Ali Port", warehouse: "Dubai Logistics Center", company: "TransGlobal Shipping" },
  "Omar Al-Saud": { port: "Jebel Ali Port", warehouse: "Riyadh South Depot", company: "Afrilink Logistics" },
  "Mehmet Yilmaz": { port: "Port of Istanbul", warehouse: "Istanbul Gateway Whse", company: "EurAsia Freighters" },
  "Nadia Mansouri": { port: "Bandar Abbas Port", warehouse: "Tehran East Depot", company: "Blue Ocean Shipping" },
  "Hassan Khan": { port: "Port of Karachi", warehouse: "Karachi Central Hub", company: "Pak-Iran Cargo" },
};

interface Transaction {
  id: string;
  broker: string;
  bookingId: string;
  loadValue: number;
  incoterm: string;
  commissionPct: number;
  transportCommission: number;
  paid: boolean;
  date: string;
}

function buildTransactions(): Transaction[] {
  let seed = 42;
  const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  return Array.from({ length: 35 }, (_, i) => {
    const loadValue = Math.floor(r() * 25000) + 4000;
    const pct = +(3 + r() * 5).toFixed(1);
    const incoterm = INCOTERMS[Math.floor(r() * INCOTERMS.length)];
    const daysAgo = Math.floor(r() * 30);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return {
      id: `CM-${5000 + i}`,
      broker: BROKERS[Math.floor(r() * BROKERS.length)],
      bookingId: `BK-${20000 + i}`,
      loadValue,
      incoterm,
      commissionPct: pct,
      transportCommission: Math.floor(loadValue * (1.2 + r() * 2) / 100),
      paid: r() > 0.4,
      date,
    };
  });
}

function BrokerCommissionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => buildTransactions());
  const [q, setQ] = useState("");
  const [selectedBrokerName, setSelectedBrokerName] = useState<string | null>(null);

  const brokerIds: Record<string, string> = {
    "Layla Hosseini": "BRK-201",
    "Omar Al-Saud": "BRK-202",
    "Mehmet Yilmaz": "BRK-203",
    "Nadia Mansouri": "BRK-204",
    "Hassan Khan": "BRK-205",
  };

  // Group transactions by broker
  const brokerSummaries = useMemo(() => {
    const map: Record<string, {
      brokerName: string;
      brokerId: string;
      shipmentsCount: number;
      totalLoadValue: number;
      totalCommission: number;
      totalPending: number;
      avgCommissionPct: number;
      transactions: Transaction[];
    }> = {};

    BROKERS.forEach((name) => {
      map[name] = {
        brokerName: name,
        brokerId: brokerIds[name] || "BRK-999",
        shipmentsCount: 0,
        totalLoadValue: 0,
        totalCommission: 0,
        totalPending: 0,
        avgCommissionPct: 0,
        transactions: [],
      };
    });

    transactions.forEach((tx) => {
      const b = map[tx.broker];
      if (b) {
        b.shipmentsCount++;
        b.totalLoadValue += tx.loadValue;
        const commAmount = Math.round(tx.loadValue * tx.commissionPct / 100);
        b.totalCommission += commAmount;
        if (!tx.paid) {
          b.totalPending += commAmount;
        }
        b.transactions.push(tx);
      }
    });

    // Calculate averages
    Object.values(map).forEach((b) => {
      if (b.shipmentsCount > 0) {
        const sumPct = b.transactions.reduce((sum, t) => sum + t.commissionPct, 0);
        b.avgCommissionPct = +(sumPct / b.shipmentsCount).toFixed(1);
      }
    });

    return Object.values(map).filter(b => 
      b.brokerName.toLowerCase().includes(q.toLowerCase()) || 
      b.brokerId.toLowerCase().includes(q.toLowerCase())
    );
  }, [transactions, q]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalEarned = transactions.reduce((s, r) => s + Math.round(r.loadValue * r.commissionPct / 100), 0);
    const pendingPayout = transactions.filter((r) => !r.paid).reduce((s, r) => s + Math.round(r.loadValue * r.commissionPct / 100), 0);
    const settledPayout = totalEarned - pendingPayout;
    return { totalEarned, pendingPayout, settledPayout };
  }, [transactions]);

  const markPaid = (txId: string) => {
    setTransactions((prev) => prev.map((tx) => tx.id === txId ? { ...tx, paid: true } : tx));
    toast.success(`Commission ${txId} marked as paid successfully`);
  };

  const selectedBrokerDetails = useMemo(() => {
    if (!selectedBrokerName) return null;
    const details = transactions.filter(t => t.broker === selectedBrokerName);
    return {
      name: selectedBrokerName,
      id: brokerIds[selectedBrokerName] || "BRK-999",
      transactions: details,
      assignment: AGENT_ASSIGNMENTS[selectedBrokerName]
    };
  }, [transactions, selectedBrokerName]);

  return (
    <AdminLayout>
      <PageHeader
        title="Broker Commission Summary"
        subtitle="Consolidated earnings, load value and payout settlements grouped by agent"
        actions={<Btn variant="secondary" onClick={() => toast.success("Summary report exported to CSV")}><FileSpreadsheet className="h-4 w-4 mr-1.5" />Export Summary</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KPI label="Total commission earned" value={formatMoney(stats.totalEarned)} icon={<DollarSign className="h-5 w-5 text-primary" />} />
        <KPI label="Pending payout balance" value={formatMoney(stats.pendingPayout)} icon={<Wallet className="h-5 w-5 text-[var(--warning)]" />} warn />
        <KPI label="Settled commissions" value={formatMoney(stats.settledPayout)} icon={<Users className="h-5 w-5 text-[var(--accent-lime)]" />} />
      </div>

      <Panel
        title="Broker Performance Summary"
        action={
          <Input placeholder="Search broker by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} className="w-60" />
        }
      >
        <Table>
          <THead>
            <tr>
              <TH>Broker Details</TH>
              <TH>Assigned Location</TH>
              <TH className="text-right">Shipments</TH>
              <TH className="text-right">Load Value Handled</TH>
              <TH className="text-right">Avg Commission %</TH>
              <TH className="text-right">Total Commission</TH>
              <TH className="text-right">Pending Payout</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </THead>
          <tbody>
            {brokerSummaries.map((b) => (
              <TR key={b.brokerId} className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors" onClick={() => setSelectedBrokerName(b.brokerName)}>
                <TD>
                  <div>
                    <div className="font-semibold text-foreground hover:text-primary transition-colors">{b.brokerName}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{b.brokerId}</div>
                  </div>
                </TD>
                <TD>
                  {AGENT_ASSIGNMENTS[b.brokerName] ? (
                    <div className="text-xs">
                      <div>{AGENT_ASSIGNMENTS[b.brokerName].port}</div>
                      <div className="text-muted-foreground text-[10px]">{AGENT_ASSIGNMENTS[b.brokerName].company}</div>
                    </div>
                  ) : "—"}
                </TD>
                <TD className="text-right font-mono">{b.shipmentsCount}</TD>
                <TD className="text-right font-mono text-foreground">{formatMoney(b.totalLoadValue)}</TD>
                <TD className="text-right font-mono">{b.avgCommissionPct.toFixed(1)}%</TD>
                <TD className="text-right font-mono text-[var(--accent-lime)] font-semibold">{formatMoney(b.totalCommission)}</TD>
                <TD className="text-right font-mono text-[var(--warning)]">{formatMoney(b.totalPending)}</TD>
                <TD className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Btn variant="ghost" className="h-7 px-3 text-xs" onClick={() => setSelectedBrokerName(b.brokerName)}>
                    View Ledger
                  </Btn>
                </TD>
              </TR>
            ))}
            {brokerSummaries.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-8" colSpan={8}>No brokers match the query.</TD></TR>
            )}
          </tbody>
        </Table>
      </Panel>

      {/* Broker Ledger Drawer */}
      <Drawer open={!!selectedBrokerName} onClose={() => setSelectedBrokerName(null)} title={selectedBrokerDetails ? `Ledger: ${selectedBrokerDetails.name} (${selectedBrokerDetails.id})` : ""}>
        {selectedBrokerDetails && (
          <div className="space-y-5">
            {selectedBrokerDetails.assignment && (
              <div className="p-3 bg-[var(--surface-2)] border border-border rounded-md text-xs space-y-1">
                <div><span className="text-muted-foreground">Assigned Port:</span> <strong className="text-foreground">{selectedBrokerDetails.assignment.port}</strong></div>
                <div><span className="text-muted-foreground">Warehouse Depot:</span> <strong className="text-foreground">{selectedBrokerDetails.assignment.warehouse}</strong></div>
                <div><span className="text-muted-foreground">Associated Company:</span> <strong className="text-foreground">{selectedBrokerDetails.assignment.company}</strong></div>
              </div>
            )}

            <div className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">Past Transaction History</div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <Table>
                <THead>
                  <tr>
                    <TH>Txn ID</TH>
                    <TH>Booking ID</TH>
                    <TH className="text-right">Load Value</TH>
                    <TH>Incoterm</TH>
                    <TH className="text-right">Rate</TH>
                    <TH className="text-right font-bold">Commission</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Action</TH>
                  </tr>
                </THead>
                <tbody>
                  {selectedBrokerDetails.transactions.map((t) => {
                    const commissionAmount = Math.round(t.loadValue * t.commissionPct / 100);
                    return (
                      <TR key={t.id}>
                        <TD className="font-mono text-[10px] text-primary">{t.id}</TD>
                        <TD className="font-mono text-xs">{t.bookingId}</TD>
                        <TD className="text-right font-mono text-xs">{formatMoney(t.loadValue)}</TD>
                        <TD className="font-mono text-xs">{t.incoterm}</TD>
                        <TD className="text-right font-mono text-xs">{t.commissionPct.toFixed(1)}%</TD>
                        <TD className="text-right font-mono text-xs text-[var(--accent-lime)] font-bold">{formatMoney(commissionAmount)}</TD>
                        <TD><StatusBadge status={t.paid ? "Completed" : "Pending"} /></TD>
                        <TD className="text-right">
                          {t.paid ? (
                            <span className="text-xs text-muted-foreground font-medium">Paid</span>
                          ) : (
                            <Btn variant="secondary" className="h-6 px-2 text-[10px]" onClick={() => markPaid(t.id)}>
                              Mark paid
                            </Btn>
                          )}
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            
            <div className="pt-3 border-t border-border flex justify-end">
              <Btn variant="secondary" onClick={() => setSelectedBrokerName(null)}>Close Ledger</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

function KPI({ label, value, icon, warn }: { label: string; value: string; icon?: React.ReactNode; warn?: boolean }) {
  return (
    <div className="bg-[var(--surface-1)] border border-border rounded-lg p-4 flex items-center justify-between">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`font-mono text-2xl font-bold mt-1 ${warn ? "text-[var(--warning)]" : "text-foreground"}`}>{value}</div>
      </div>
      {icon && <div className="p-2 bg-[var(--surface-2)] border border-border rounded-md">{icon}</div>}
    </div>
  );
}