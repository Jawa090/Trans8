import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Table, THead, TH, TR, TD, Btn, StatusBadge, Input, Select } from "@/components/admin/ui";
import { formatMoney } from "@/lib/mock-data";
import { Search, DollarSign, CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";

export const Route = createFileRoute("/finance/payouts")({
  head: () => ({ meta: [{ title: "Payouts — TRANS8 Admin" }] }),
  component: PayoutsPage,
});

interface Payout {
  id: string;
  agentName: string;
  agentType: string;
  amountEarned: number;
  status: "Pending Approval" | "Paid" | "Rejected";
  date: string;
}

const INITIAL_PAYOUTS: Payout[] = [
  { id: "PAY-001", agentName: "Ali Yilmaz", agentType: "Logistic Broker", amountEarned: 2450, status: "Pending Approval", date: "2026-06-20" },
  { id: "PAY-002", agentName: "Reza Karimi", agentType: "Port Agent", amountEarned: 1850, status: "Pending Approval", date: "2026-06-21" },
  { id: "PAY-003", agentName: "Omar Khan", agentType: "Custom Agent", amountEarned: 3200, status: "Pending Approval", date: "2026-06-18" },
  { id: "PAY-004", agentName: "Zara Naidoo", agentType: "Warehouse", amountEarned: 950, status: "Paid", date: "2026-06-15" },
  { id: "PAY-005", agentName: "Sergei Volkov", agentType: "Road Logistics Partner", amountEarned: 4200, status: "Pending Approval", date: "2026-06-22" },
  { id: "PAY-006", agentName: "Nadia Mansouri", agentType: "Survey Agent", amountEarned: 1150, status: "Rejected", date: "2026-06-19" },
  { id: "PAY-007", agentName: "Hassan Al-Saud", agentType: "Sea Logistics Partner", amountEarned: 5800, status: "Paid", date: "2026-06-12" },
];

function PayoutsPage() {
  const [rows, setRows] = useState<Payout[]>(INITIAL_PAYOUTS);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = rows.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (q && !`${t.id} ${t.agentName} ${t.agentType}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Paid" } : item
      )
    );
    const item = rows.find(r => r.id === id);
    toast.success(`Payout approved and successfully credited to wallet: ${formatMoney(item?.amountEarned || 0)} for ${item?.agentName}`);
  };

  const handleReject = (id: string) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );
    const item = rows.find(r => r.id === id);
    toast.error(`Payout request ${id} for ${item?.agentName} has been Rejected.`);
  };

  const handleResetToPending = (id: string) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Pending Approval" } : item
      )
    );
    const item = rows.find(r => r.id === id);
    toast.info(`Payout request ${id} for ${item?.agentName} reset back to Pending Approval.`);
  };

  const pendingCount = rows.filter((r) => r.status === "Pending Approval").length;
  const rejectedCount = rows.filter((r) => r.status === "Rejected").length;
  const paidCount = rows.filter((r) => r.status === "Paid").length;
  const totalPaidAmount = rows
    .filter((r) => r.status === "Paid")
    .reduce((sum, r) => sum + r.amountEarned, 0);

  return (
    <AdminLayout>
      <PageHeader title="Payouts" subtitle="Review agent payout requests and manually settle balances" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
        <Panel>
          <Stat label="Pending Approval" value={String(pendingCount)} icon={<AlertCircle className="h-5 w-5 text-[var(--warning)]" />} />
        </Panel>
        <Panel>
          <Stat label="Rejected Requests" value={String(rejectedCount)} icon={<XCircle className="h-5 w-5 text-[var(--danger)]" />} />
        </Panel>
        <Panel>
          <Stat label="Paid / Settled" value={String(paidCount)} icon={<CheckCircle2 className="h-5 w-5 text-[var(--accent-lime)]" />} />
        </Panel>
        <Panel>
          <Stat label="Total Wallet Credited" value={formatMoney(totalPaidAmount)} icon={<DollarSign className="h-5 w-5 text-primary" />} />
        </Panel>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agent name, type or ID..." className="w-full pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any status</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Paid">Paid</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Payout ID</TH>
            <TH>Agent / Broker</TH>
            <TH>Agent Type</TH>
            <TH>Date Generated</TH>
            <TH>Status</TH>
            <TH className="text-right">Amount Earned</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {filtered.map((t) => (
            <TR key={t.id}>
              <TD className="font-mono text-xs text-primary">{t.id}</TD>
              <TD className="font-semibold text-foreground">{t.agentName}</TD>
              <TD className="text-xs text-muted-foreground font-mono uppercase">{t.agentType}</TD>
              <TD className="font-mono text-xs">{t.date}</TD>
              <TD><StatusBadge status={t.status} /></TD>
              <TD className="text-right font-mono text-[var(--accent-lime)] font-bold">{formatMoney(t.amountEarned)}</TD>
              <TD className="text-right">
                <div className="flex gap-2 justify-end">
                  {t.status === "Pending Approval" && (
                    <>
                      <Btn className="h-7 px-3 text-xs" onClick={() => handleApprove(t.id)}>
                        Approve
                      </Btn>
                      <Btn variant="danger" className="h-7 px-3 text-xs" onClick={() => handleReject(t.id)}>
                        Reject
                      </Btn>
                    </>
                  )}
                  {t.status === "Rejected" && (
                    <Btn variant="secondary" className="h-7 px-3 text-xs gap-1" onClick={() => handleResetToPending(t.id)}>
                      <RefreshCw className="h-3 w-3" /> Reset to Pending
                    </Btn>
                  )}
                  {t.status === "Paid" && (
                    <span className="text-[10px] font-mono uppercase text-[var(--accent-lime)] px-2.5 py-1 bg-primary/10 rounded border border-primary/20">
                      Wallet Credited ✓
                    </span>
                  )}
                </div>
              </TD>
            </TR>
          ))}
          {filtered.length === 0 && (
            <TR><TD className="text-center text-muted-foreground py-8" colSpan={7}>No payout requests found.</TD></TR>
          )}
        </tbody>
      </Table>
    </AdminLayout>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      </div>
      {icon && <div className="p-2 rounded-md bg-[var(--surface-2)] border border-border">{icon}</div>}
    </div>
  );
}