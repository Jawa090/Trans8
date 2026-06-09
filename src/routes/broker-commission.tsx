import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Table, THead, TH, TR, TD, Input, Select } from "@/components/admin/ui";
import { formatMoney } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/broker-commission")({
  head: () => ({ meta: [{ title: "Broker Commission — TRANS8" }] }),
  component: BrokerCommissionPage,
});

const BROKERS = ["Layla Hosseini", "Omar Al-Saud", "Mehmet Yilmaz", "Nadia Mansouri", "Hassan Khan"];
const INCOTERMS = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DPU", "DAP", "DDP"];

interface Row {
  id: string;
  broker: string;
  bookingId: string;
  loadValue: number;
  incoterm: string;
  commissionPct: number;
  transportCommission: number;
  paid: boolean;
}

function build(): Row[] {
  let seed = 7;
  const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  return Array.from({ length: 18 }, (_, i) => {
    const loadValue = Math.floor(r() * 28000) + 2000;
    const pct = +(2 + r() * 6).toFixed(1);
    const incoterm = INCOTERMS[Math.floor(r() * INCOTERMS.length)];
    return {
      id: `CM-${5021 + i}`,
      broker: BROKERS[Math.floor(r() * BROKERS.length)],
      bookingId: `BK-${20418 + i}`,
      loadValue,
      incoterm,
      commissionPct: pct,
      transportCommission: Math.floor(loadValue * (1 + r() * 2.5) / 100),
      paid: r() > 0.45,
    };
  });
}

function BrokerCommissionPage() {
  const [rows, setRows] = useState<Row[]>(() => build());
  const [q, setQ] = useState("");
  const [broker, setBroker] = useState("all");
  const [status, setStatus] = useState<"all" | "Paid" | "Pending">("all");

  const filtered = useMemo(() => rows.filter((r) =>
    (broker === "all" || r.broker === broker) &&
    (status === "all" || (status === "Paid" ? r.paid : !r.paid)) &&
    (q === "" || r.broker.toLowerCase().includes(q.toLowerCase()) || r.bookingId.toLowerCase().includes(q.toLowerCase()))
  ), [rows, broker, status, q]);

  const totals = useMemo(() => {
    const earned = filtered.reduce((s, r) => s + Math.round(r.loadValue * r.commissionPct / 100), 0);
    const transport = filtered.reduce((s, r) => s + r.transportCommission, 0);
    const pending = filtered.filter((r) => !r.paid).reduce((s, r) => s + Math.round(r.loadValue * r.commissionPct / 100), 0);
    return { earned, transport, pending };
  }, [filtered]);

  const markPaid = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, paid: true } : r));
    toast.success("Commission marked as paid");
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Broker Commission"
        subtitle="Earnings, payouts and reconciliation across brokers"
        actions={<Btn variant="secondary" onClick={() => toast.success("CSV exported (demo)")}>Export CSV</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KPI label="Commission earned" value={formatMoney(totals.earned)} />
        <KPI label="Transport commission" value={formatMoney(totals.transport)} />
        <KPI label="Pending payout" value={formatMoney(totals.pending)} warn />
      </div>

      <Panel
        title="Commission ledger"
        action={
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search broker / booking…" value={q} onChange={(e) => setQ(e.target.value)} className="w-60" />
            <Select value={broker} onChange={(e) => setBroker(e.target.value)}>
              <option value="all">All brokers</option>
              {BROKERS.map((b) => <option key={b}>{b}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value as "all" | "Paid" | "Pending")}>
              <option value="all">All status</option>
              <option>Paid</option>
              <option>Pending</option>
            </Select>
          </div>
        }
      >
        <Table>
          <THead>
            <tr>
              <TH>Broker name</TH>
              <TH>Booking ID</TH>
              <TH className="text-right">Load value</TH>
              <TH>Incoterm</TH>
              <TH className="text-right">Commission%</TH>
              <TH className="text-right">Amount</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </THead>
          <tbody>
            {filtered.map((r) => {
              const earned = Math.round(r.loadValue * r.commissionPct / 100);
              return (
                <TR key={r.id}>
                  <TD className="font-medium">{r.broker}</TD>
                  <TD className="font-mono text-xs">{r.bookingId}</TD>
                  <TD className="text-right font-mono">{formatMoney(r.loadValue)}</TD>
                  <TD className="font-mono text-xs">{r.incoterm}</TD>
                  <TD className="text-right font-mono">{r.commissionPct.toFixed(1)}%</TD>
                  <TD className="text-right font-mono text-[var(--accent-lime)]">{formatMoney(earned)}</TD>
                  <TD><StatusBadge status={r.paid ? "Completed" : "Pending"} /></TD>
                  <TD className="text-right">
                    {r.paid
                      ? <span className="text-xs text-muted-foreground">Paid</span>
                      : <Btn variant="secondary" onClick={() => markPaid(r.id)}>Mark paid</Btn>}
                  </TD>
                </TR>
              );
            })}
            {filtered.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-8">No commissions match these filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            )}
          </tbody>
        </Table>
      </Panel>
    </AdminLayout>
  );
}

function KPI({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-[var(--surface-1)] border border-border rounded-lg p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${warn ? "text-[var(--warning)]" : ""}`}>{value}</div>
    </div>
  );
}