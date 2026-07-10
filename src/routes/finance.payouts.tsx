

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Table, THead, TH, TR, TD, Btn, StatusBadge, Input, Select, Drawer } from "@/components/admin/ui";
import { formatMoney } from "@/lib/mock-data";
import { Search, DollarSign, CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { FinanceTabs } from "./finance";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (q && !`${t.id} ${t.agentName} ${t.agentType}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, statusFilter]);

  const handleApprove = (id: string) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Paid" } : item
      )
    );
    const item = rows.find(r => r.id === id);
    if (item) {
      toast.success(`Payout approved and successfully credited to wallet: ${formatMoney(item.amountEarned)} for ${item.agentName}`);
      // Sync to persistent database
      try {
        const storedUsers = localStorage.getItem("trans8_users_database_persistent");
        if (storedUsers) {
          const list = JSON.parse(storedUsers);
          const idx = list.findIndex((u: any) => u.name.toLowerCase() === item.agentName.toLowerCase());
          if (idx !== -1) {
            list[idx].walletBalance = (list[idx].walletBalance || 0) + item.amountEarned;
            localStorage.setItem("trans8_users_database_persistent", JSON.stringify(list));
            toast.success(`Wallet of ${item.agentName} credited. New Balance: ${formatMoney(list[idx].walletBalance)}`);
          }
        }
      } catch (err) {
        console.error("Failed to credit wallet:", err);
      }
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) {
      toast.error("No payouts selected.");
      return;
    }

    let successCount = 0;
    let usersList = [];
    const storedUsers = localStorage.getItem("trans8_users_database_persistent");
    if (storedUsers) {
      try {
        usersList = JSON.parse(storedUsers);
      } catch (e) {}
    }

    const updatedRows = rows.map((item) => {
      if (selectedIds.includes(item.id) && item.status === "Pending Approval") {
        successCount++;
        // Credit the user's wallet
        if (usersList.length > 0) {
          const idx = usersList.findIndex((u: any) => u.name.toLowerCase() === item.agentName.toLowerCase());
          if (idx !== -1) {
            usersList[idx].walletBalance = (usersList[idx].walletBalance || 0) + item.amountEarned;
          }
        }
        return { ...item, status: "Paid" as const };
      }
      return item;
    });

    if (usersList.length > 0) {
      localStorage.setItem("trans8_users_database_persistent", JSON.stringify(usersList));
    }

    setRows(updatedRows);
    setSelectedIds([]);
    toast.success(`Approved ${successCount} payouts and successfully credited user wallets.`);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) {
      toast.error("No payouts selected.");
      return;
    }
    const updatedRows = rows.map((item) => {
      if (selectedIds.includes(item.id) && item.status === "Pending Approval") {
        return { ...item, status: "Rejected" as const };
      }
      return item;
    });
    setRows(updatedRows);
    setSelectedIds([]);
    toast.error(`Rejected ${selectedIds.length} payouts.`);
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

  const isAllSelected = useMemo(() => {
    const pendings = filtered.filter(f => f.status === "Pending Approval");
    return pendings.length > 0 && pendings.every(p => selectedIds.includes(p.id));
  }, [filtered, selectedIds]);

  const handleSelectAllToggle = () => {
    const pendings = filtered.filter(f => f.status === "Pending Approval");
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter(id => !pendings.map(p => p.id).includes(id)));
    } else {
      const pendingIds = pendings.map(p => p.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pendingIds])));
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="Payouts" subtitle="Review agent payout requests and manually settle balances" />
      <FinanceTabs active="payouts" />

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

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-[var(--surface-2)] border border-primary/20 animate-in fade-in">
          <span className="text-xs font-mono text-muted-foreground">{selectedIds.length} selected for action</span>
          <Btn className="h-8 py-0 px-3 text-xs" onClick={handleBulkApprove}>
            Approve Selected
          </Btn>
          <Btn variant="danger" className="h-8 py-0 px-3 text-xs" onClick={handleBulkReject}>
            Reject Selected
          </Btn>
          <Btn variant="ghost" className="h-8 py-0 px-2 text-xs" onClick={() => setSelectedIds([])}>
            Cancel
          </Btn>
        </div>
      )}

      <Table>
        <THead>
          <TR>
            <TH className="w-10">
              <input
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={isAllSelected}
                onChange={handleSelectAllToggle}
              />
            </TH>
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
            <TR key={t.id} className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors" onClick={() => setSelectedPayout(t)}>
              <TD onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="accent-[var(--primary)]"
                  checked={selectedIds.includes(t.id)}
                  disabled={t.status !== "Pending Approval"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, t.id]);
                    } else {
                      setSelectedIds(selectedIds.filter((id) => id !== t.id));
                    }
                  }}
                />
              </TD>
              <TD className="font-mono text-xs text-primary">{t.id}</TD>
              <TD className="font-semibold text-foreground">{t.agentName}</TD>
              <TD className="text-xs text-muted-foreground font-mono uppercase">{t.agentType}</TD>
              <TD className="font-mono text-xs">{t.date}</TD>
              <TD><StatusBadge status={t.status} /></TD>
              <TD className="text-right font-mono text-[var(--accent-lime)] font-bold">{formatMoney(t.amountEarned)}</TD>
              <TD className="text-right" onClick={(e) => e.stopPropagation()}>
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
                      <RefreshCw className="h-3 w-3" /> Reset
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
            <TR><TD className="text-center text-muted-foreground py-8" colSpan={8}>No payout requests found.</TD></TR>
          )}
        </tbody>
      </Table>

      {/* Selective Transaction Summary Detail Drawer */}
      <Drawer open={!!selectedPayout} onClose={() => setSelectedPayout(null)} title={selectedPayout ? `Payout Transaction: ${selectedPayout.id}` : ""}>
        {selectedPayout && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3.5 bg-[var(--surface-2)] border border-border rounded-lg">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Payout Recipient</span>
                <h4 className="text-lg font-bold text-foreground mt-0.5">{selectedPayout.agentName}</h4>
                <span className="text-[11px] font-mono text-primary uppercase">{selectedPayout.agentType}</span>
              </div>
              <StatusBadge status={selectedPayout.status} />
            </div>

            <Panel title="Transaction Summary">
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">User / Agent Name</span>
                  <span className="font-semibold text-foreground">{selectedPayout.agentName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Settlement Amount</span>
                  <span className="font-mono text-sm font-bold text-[var(--accent-lime)]">{formatMoney(selectedPayout.amountEarned)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-primary font-semibold">{selectedPayout.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Generated Date</span>
                  <span className="font-mono text-foreground">{selectedPayout.date}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Transfer Destination</span>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-semibold uppercase">CREDIT WALLET</span>
                </div>
              </div>
            </Panel>

            <div className="pt-2 text-xs text-muted-foreground leading-relaxed bg-[var(--surface-2)] border border-border rounded-md p-3">
              <strong>Compliance Notice:</strong> Payout approvals will instantly transfer the designated amount of <strong>{formatMoney(selectedPayout.amountEarned)}</strong> to the user's primary operating wallet balance, making funds available for immediate utilization.
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => setSelectedPayout(null)}>Close Summary</Btn>
              {selectedPayout.status === "Pending Approval" && (
                <Btn onClick={() => { handleApprove(selectedPayout.id); setSelectedPayout(null); }}>Approve Settlement</Btn>
              )}
            </div>
          </div>
        )}
      </Drawer>
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