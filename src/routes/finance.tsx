import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Tabs, Table, THead, TH, TR, TD, Btn, Input, Select, Panel } from "@/components/admin/ui";
import { TRANSACTIONS, REGIONS, formatMoney } from "@/lib/mock-data";

export const Route = createFileRoute("/finance")({
  head: () => ({ meta: [{ title: "Finance — Movers Admin" }] }),
  component: () => {
    const [tab, setTab] = useState("Transactions");
    return (
      <AdminLayout>
        <PageHeader title="Finance" subtitle="Wallets, payouts and commission policy" />
        <Tabs tabs={["Transactions", "Payouts", "Commission Settings"]} active={tab} onChange={setTab} />
        {tab === "Transactions" && <TxTab />}
        {tab === "Payouts" && <PayoutsTab />}
        {tab === "Commission Settings" && <CommissionTab />}
      </AdminLayout>
    );
  },
});

function TxTab() {
  const [q, setQ] = useState("");
  const [gw, setGw] = useState("");
  const [st, setSt] = useState("");
  const rows = useMemo(() => TRANSACTIONS.filter((t) => {
    if (q && !`${t.id} ${t.user}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (gw && t.gateway !== gw) return false;
    if (st && t.status !== st) return false;
    return true;
  }), [q, gw, st]);
  return (
    <>
      <div className="flex gap-2 mb-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transaction ID or user" className="flex-1 min-w-[220px]" />
        <Select value={gw} onChange={(e) => setGw(e.target.value)}><option value="">All gateways</option><option>Stripe</option><option>bKash</option><option>Razorpay</option><option>PayPal</option><option>Wise</option></Select>
        <Select value={st} onChange={(e) => setSt(e.target.value)}><option value="">Any status</option><option>Completed</option><option>Pending</option><option>Failed</option></Select>
      </div>
      <Table>
        <THead><TR><TH>Txn ID</TH><TH>User</TH><TH>Type</TH><TH>Gateway</TH><TH>Date</TH><TH>Status</TH><TH className="text-right">Amount</TH></TR></THead>
        <tbody>{rows.map((t) => (
          <TR key={t.id}><TD className="font-mono text-xs text-primary">{t.id}</TD><TD>{t.user}</TD>
            <TD className="text-xs font-mono uppercase text-muted-foreground">{t.type}</TD>
            <TD>{t.gateway}</TD><TD className="font-mono text-xs">{t.date}</TD>
            <TD><StatusBadge status={t.status} /></TD>
            <TD className="text-right font-mono">{formatMoney(t.amount)}</TD></TR>
        ))}</tbody>
      </Table>
    </>
  );
}

function PayoutsTab() {
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const pending = TRANSACTIONS.filter((t) => t.type === "Payout" && t.status !== "Completed").slice(0, 8);
  return (
    <Table>
      <THead><TR><TH>Request</TH><TH>Owner</TH><TH>Method</TH><TH>Requested</TH><TH className="text-right">Amount</TH><TH></TH></TR></THead>
      <tbody>{pending.map((t) => (
        <TR key={t.id}><TD className="font-mono text-xs text-primary">{t.id}</TD>
          <TD className="font-medium">{t.user}</TD><TD>{t.gateway}</TD>
          <TD className="font-mono text-xs">{t.date}</TD>
          <TD className="text-right font-mono text-[var(--accent-lime)]">{formatMoney(t.amount)}</TD>
          <TD>{decisions[t.id] ? (
            <span className={`text-[10px] font-mono uppercase ${decisions[t.id] === "approved" ? "text-[var(--accent-lime)]" : "text-[var(--danger)]"}`}>
              {decisions[t.id]} ✓
            </span>
          ) : (
            <div className="flex gap-1 justify-end">
              <Btn className="h-7 px-3 text-xs" onClick={() => { setDecisions({ ...decisions, [t.id]: "approved" }); toast.success(`Approved ${t.id}`); }}>Approve</Btn>
              <Btn variant="danger" className="h-7 px-3 text-xs" onClick={() => { setDecisions({ ...decisions, [t.id]: "rejected" }); toast(`Rejected ${t.id}`); }}>Reject</Btn>
            </div>
          )}</TD></TR>
      ))}</tbody>
    </Table>
  );
}

function CommissionTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {REGIONS.map((r) => (
        <Panel key={r.code} title={<><span>{r.flag}</span> {r.name}</>}>
          <div className="space-y-3">
            {["Road", "Train", "Air", "Sea"].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-muted-foreground w-16">{t}</span>
                <Input type="number" defaultValue={5 + Math.floor(Math.random() * 10)} className="w-24" />
                <span className="text-xs text-muted-foreground">% commission</span>
              </div>
            ))}
          </div>
          <Btn className="mt-4" onClick={() => toast.success(`${r.name} commission saved`)}>Save</Btn>
        </Panel>
      ))}
    </div>
  );
}