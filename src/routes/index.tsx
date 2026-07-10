import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel, PageHeader, StatusBadge, Btn, Avatar, Table, THead, TH, TR, TD, Drawer } from "@/components/admin/ui";
import { Users, Truck, DollarSign, MapPin, ArrowUpRight, Star, Check, X, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { REVENUE_SERIES, BOOKINGS_BY_TYPE, BOOKINGS, USERS, TRANSACTIONS, REGIONS, formatMoney, formatCompact } from "@/lib/mock-data";
import { toCsv, downloadFile, csvFilename, printReceipt } from "@/lib/export-utils";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Movers Admin" }] }),
  component: Dashboard,
});

function KPI({ label, value, delta, icon: Icon, accent, to }: { label: string; value: string; delta: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean; to?: string }) {
  const positive = delta.startsWith("+");
  const content = (
    <div className="bg-[var(--surface-1)] border border-border rounded-lg p-5 relative overflow-hidden group hover:border-primary/50 cursor-pointer transition-colors h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-md grid place-items-center ${accent ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-primary border border-border"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${positive ? "text-[var(--accent-lime)] bg-primary/15" : "text-[var(--danger)] bg-[var(--danger)]/15"}`}>
          {delta}
        </span>
      </div>
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block no-underline text-inherit h-full">{content}</Link>;
  }
  return content;
}

function Dashboard() {
  const [usersDb, setUsersDb] = useState<any[]>([]);
  const [txnsDb, setTxnsDb] = useState<any[]>([]);
  const [txnDrawer, setTxnDrawer] = useState<any | null>(null);

  useEffect(() => {
    // Users database
    const storedUsers = localStorage.getItem("trans8_users_database_persistent");
    if (storedUsers) {
      try {
        setUsersDb(JSON.parse(storedUsers));
      } catch (e) {
        setUsersDb(USERS);
      }
    } else {
      setUsersDb(USERS);
      localStorage.setItem("trans8_users_database_persistent", JSON.stringify(USERS));
    }

    // Transactions database
    const storedTxns = localStorage.getItem("trans8_transactions_persistent");
    if (storedTxns) {
      try {
        setTxnsDb(JSON.parse(storedTxns));
      } catch (e) {
        setTxnsDb(TRANSACTIONS);
      }
    } else {
      setTxnsDb(TRANSACTIONS);
    }
  }, []);

  const handleApprove = (id: string) => {
    const updated = usersDb.map((u) => u.id === id ? { ...u, status: "Active", kycStatus: "Verified", complianceApproved: true } : u);
    setUsersDb(updated);
    localStorage.setItem("trans8_users_database_persistent", JSON.stringify(updated));
    toast.success("User compliance & KYC approved successfully!");
  };

  const handleReject = (id: string) => {
    const updated = usersDb.map((u) => u.id === id ? { ...u, status: "Rejected", kycStatus: "Rejected", complianceApproved: false } : u);
    setUsersDb(updated);
    localStorage.setItem("trans8_users_database_persistent", JSON.stringify(updated));
    toast.error("User compliance rejected.");
  };

  const recentBookings = BOOKINGS.slice(0, 6);
  const topOwners = usersDb.filter((u) => u.role === "Driver" || u.role === "Logistics Partner" || u.walletBalance > 0).slice(0, 5);
  const recentTxns = txnsDb.slice(0, 5);
  const pendingUsers = usersDb.filter((u) => u.kycStatus === "Pending" || u.status === "Pending").slice(0, 4);
  const pendingComplianceCount = usersDb.filter((u) => u.kycStatus === "Pending" || u.status === "Pending").length;

  return (
    <AdminLayout>
      <PageHeader
        title="Command Center"
        subtitle="Live network operations across 7 regions · last sync 12s ago"
        actions={<>
          <Btn variant="secondary">Export</Btn>
          <Btn>+ New Booking</Btn>
        </>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPI label="Total Users" value={String(usersDb.length ? usersDb.length.toLocaleString() : "73,610")} delta="+12.4%" icon={Users} to="/users" accent />
        <KPI label="Pending Compliance" value={String(pendingComplianceCount)} delta="Audit Required" icon={ShieldCheck} to="/users" />
        <KPI label="Active Bookings" value="2,184" delta="+8.1%" icon={Truck} to="/bookings" />
        <KPI label="Total Revenue" value={formatMoney(6128400)} delta="+18.7%" icon={DollarSign} to="/finance" />
        <KPI label="Active Trips" value="412" delta="+3.2%" icon={MapPin} to="/operations/trips" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Revenue · 12 months" className="lg:col-span-2" action={
          <span className="text-xs font-mono text-muted-foreground">USD</span>
        }>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={REVENUE_SERIES} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v as number)} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }}
                  formatter={(v: number) => [formatMoney(v), "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 5, fill: "var(--accent-lime)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Bookings by Type">
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={BOOKINGS_BY_TYPE} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="var(--background)" strokeWidth={3}>
                  {BOOKINGS_BY_TYPE.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {BOOKINGS_BY_TYPE.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-mono">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Recent Bookings" className="lg:col-span-2" action={
          <Link to="/bookings" className="text-xs text-primary hover:text-[var(--accent-lime)] inline-flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
        }>
          <Table>
            <THead><TR><TH>ID</TH><TH>Customer</TH><TH>Type</TH><TH>Route</TH><TH>Status</TH><TH className="text-right">Amount</TH><TH></TH></TR></THead>
            <tbody>
              {recentBookings.map((b) => (
                <TR key={b.id}>
                  <TD className="font-mono text-xs text-primary">{b.id}</TD>
                  <TD className="font-medium">{b.customer}</TD>
                  <TD><span className="text-xs font-mono uppercase text-muted-foreground">{b.type}</span></TD>
                  <TD className="text-xs text-muted-foreground">{b.origin} → {b.destination}</TD>
                  <TD><StatusBadge status={b.status} /></TD>
                  <TD className="text-right font-mono">{formatMoney(b.amount)}</TD>
                  <TD className=""><Btn variant="ghost" className="h-7 px-2 text-xs">View</Btn></TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Top Truck Owners">
          <ul className="space-y-3">
            {topOwners.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <Avatar initials={u.avatar} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <span>{u.trips} trips</span>
                    <span className="flex items-center gap-0.5 text-[var(--warning)]"><Star className="h-3 w-3 fill-current" /> {u.rating}</span>
                  </div>
                </div>
                <div className="font-mono text-sm text-[var(--accent-lime)]">{formatMoney(u.walletBalance)}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Recent Transactions" action={
          <Link to="/finance" className="text-xs text-primary hover:text-[var(--accent-lime)] inline-flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
        }>
          <ul className="divide-y divide-border -my-2">
            {recentTxns.map((t) => (
              <li key={t.id} className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--surface-2)] -mx-5 px-5 transition-colors" onClick={() => setTxnDrawer(t)}>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.user}</div>
                  <div className="text-[11px] font-mono text-muted-foreground uppercase"><span className="text-primary">{t.id}</span> · {t.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{formatMoney(t.amount)}</div>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Transaction Detail Drawer */}
      <Drawer open={!!txnDrawer} onClose={() => setTxnDrawer(null)} title={txnDrawer?.id || ""}>
        {txnDrawer && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{txnDrawer.type}</div>
                <div className="text-lg font-display font-bold mt-1">{txnDrawer.id}</div>
              </div>
              <StatusBadge status={txnDrawer.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">User</div>
                <div className="text-sm font-medium mt-1">{txnDrawer.user}</div>
              </div>
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Amount</div>
                <div className="text-sm font-mono text-[var(--accent-lime)] font-bold mt-1">{formatMoney(txnDrawer.amount)}</div>
              </div>
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Gateway</div>
                <div className="text-sm font-medium mt-1">{txnDrawer.gateway}</div>
              </div>
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Date</div>
                <div className="text-sm font-medium mt-1">{txnDrawer.date}</div>
              </div>
            </div>
            <Panel title="Transaction Timeline">
              <ol className="relative border-l border-border ml-2 space-y-3 pl-4">
                <li className="text-xs relative">
                  <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="font-medium">{txnDrawer.type} initiated</div>
                  <div className="text-muted-foreground font-mono">{txnDrawer.date} · {txnDrawer.gateway}</div>
                </li>
                <li className="text-xs relative">
                  <span className={`absolute -left-[5px] h-2.5 w-2.5 rounded-full ${txnDrawer.status !== "Failed" ? "bg-primary" : "bg-[var(--surface-3)]"}`} />
                  <div className="font-medium">Gateway processed</div>
                  <div className="text-muted-foreground font-mono">Confirmation pending</div>
                </li>
                <li className="text-xs relative">
                  <span className={`absolute -left-[5px] h-2.5 w-2.5 rounded-full ${txnDrawer.status === "Completed" ? "bg-primary" : "bg-[var(--surface-3)]"}`} />
                  <div className={`font-medium ${txnDrawer.status === "Completed" ? "" : "text-muted-foreground"}`}>
                    {txnDrawer.status === "Completed" ? "Completed" : txnDrawer.status === "Failed" ? "Failed" : "Pending"}
                  </div>
                </li>
              </ol>
            </Panel>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Btn className="flex-1" onClick={() => {
                const csv = toCsv([
                  { ID: txnDrawer.id, User: txnDrawer.user, Type: txnDrawer.type, Gateway: txnDrawer.gateway, Amount: txnDrawer.amount, Status: txnDrawer.status, Date: txnDrawer.date }
                ], ["ID", "User", "Type", "Gateway", "Amount", "Status", "Date"]);
                downloadFile(csv, csvFilename(`TXN_${txnDrawer.id}`));
                toast.success(`CSV exported: ${txnDrawer.id}`);
              }}>
                <Download className="h-4 w-4" /> Export CSV
              </Btn>
              <Btn variant="secondary" className="flex-1" onClick={() => {
                const w = printReceipt(`Transaction ${txnDrawer.id}`, [
                  { label: "Transaction ID", value: txnDrawer.id },
                  { label: "User", value: txnDrawer.user },
                  { label: "Type", value: txnDrawer.type },
                  { label: "Gateway", value: txnDrawer.gateway },
                  { label: "Amount", value: formatMoney(txnDrawer.amount) },
                  { label: "Status", value: txnDrawer.status },
                  { label: "Date", value: txnDrawer.date },
                ]);
                if (w) toast.success("Receipt opened for printing / PDF save");
                else toast.error("Popup blocked — allow popups to print receipts");
              }}>
                <FileText className="h-4 w-4" /> Save PDF
              </Btn>
            </div>
          </div>
        )}
      </Drawer>

      <Panel title="Pending Verifications" action={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)]">{pendingUsers.length} QUEUE</span>
        }>
          <ul className="space-y-3">
            {pendingUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <Avatar initials={u.avatar} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{u.role} · {u.region}</div>
                </div>
                <button onClick={() => handleApprove(u.id)} title="Approve Compliance & KYC" className="h-7 w-7 grid place-items-center rounded bg-primary/15 text-[var(--accent-lime)] hover:bg-primary/25 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleReject(u.id)} title="Reject compliance verification" className="h-7 w-7 grid place-items-center rounded bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25 transition-colors"><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
            {pendingUsers.length === 0 && (
              <li className="text-center text-xs text-muted-foreground font-mono py-6">All users are currently compliant.</li>
            )}
          </ul>
        </Panel>

        <Panel title="Region Activity">
          <div className="grid grid-cols-2 gap-2">
            {REGIONS.map((r) => (
              <div key={r.code} className="bg-[var(--surface-2)] border border-border rounded-md p-2.5 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{r.flag}</span>
                  <span className="text-xs font-medium truncate">{r.name}</span>
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full ${r.active ? "bg-[var(--accent-lime)]" : "bg-[var(--danger)]"}`} />
                </div>
                <div className="font-mono text-sm">{formatCompact(r.users)}</div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">users</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}