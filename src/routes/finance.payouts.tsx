import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Table, THead, TH, TR, TD, Btn, StatusBadge, Input, Select } from "@/components/admin/ui";
import { TRANSACTIONS, formatMoney } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/finance/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Movers Admin" }] }),
  component: PayoutsPage,
});

function PayoutsPage() {
  const base = useMemo(() => TRANSACTIONS.filter((t) => t.type === "Payout").map((t) => ({ ...t })), []);
  const [rows, setRows] = useState(base);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const filtered = rows.filter((t) => {
    if (status && t.status !== status) return false;
    if (q && !`${t.id} ${t.user} ${t.gateway}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const update = (id: string, next: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: next } : x)));

  const pending = rows.filter((r) => r.status === "Pending").length;
  const completed = rows.filter((r) => r.status === "Completed").length;
  const total = rows.reduce((a, r) => a + (r.status === "Completed" ? r.amount : 0), 0);

  return (
    <AdminLayout>
      <PageHeader title="Payouts" subtitle={`${rows.length} payout records · ${pending} awaiting review`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Panel><Stat label="Pending" value={String(pending)} accent /></Panel>
        <Panel><Stat label="Completed" value={String(completed)} /></Panel>
        <Panel><Stat label="Paid out" value={formatMoney(total)} /></Panel>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search request, owner, gateway…" className="w-full pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option><option>Pending</option><option>Completed</option><option>Failed</option>
        </Select>
      </div>

      <Table>
        <THead><TR><TH>Request</TH><TH>Owner</TH><TH>Gateway</TH><TH>Date</TH><TH>Status</TH><TH className="text-right">Amount</TH><TH></TH></TR></THead>
        <tbody>{filtered.map((t) => (
          <TR key={t.id}>
            <TD className="font-mono text-xs text-primary">{t.id}</TD>
            <TD>{t.user}</TD><TD>{t.gateway}</TD>
            <TD className="font-mono text-xs">{t.date}</TD>
            <TD><StatusBadge status={t.status} /></TD>
            <TD className="text-right font-mono">{formatMoney(t.amount)}</TD>
            <TD>
              {t.status === "Pending" ? (
                <div className="flex gap-1 justify-end">
                  <Btn className="h-7 px-3 text-xs" onClick={() => update(t.id, "Completed")}>Approve</Btn>
                  <Btn variant="danger" className="h-7 px-3 text-xs" onClick={() => update(t.id, "Failed")}>Reject</Btn>
                </div>
              ) : (
                <div className="text-right text-[10px] font-mono text-muted-foreground uppercase">Settled</div>
              )}
            </TD>
          </TR>
        ))}</tbody>
      </Table>
    </AdminLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl ${accent ? "text-[var(--accent-lime)]" : ""}`}>{value}</div>
    </div>
  );
}