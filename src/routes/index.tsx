import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel, PageHeader, StatusBadge, Btn, Avatar, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { Users, Truck, DollarSign, MapPin, ArrowUpRight, Star, Check, X } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { REVENUE_SERIES, BOOKINGS_BY_TYPE, BOOKINGS, USERS, TRANSACTIONS, REGIONS, formatMoney, formatCompact } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Movers Admin" }] }),
  component: Dashboard,
});

function KPI({ label, value, delta, icon: Icon, accent }: { label: string; value: string; delta: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  const positive = delta.startsWith("+");
  return (
    <div className="bg-[var(--surface-1)] border border-border rounded-lg p-5 relative overflow-hidden group hover:border-primary/50 transition-colors">
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
}

function Dashboard() {
  const recentBookings = BOOKINGS.slice(0, 6);
  const topOwners = USERS.filter((u) => u.kind === "Truck Owner").slice(0, 5);
  const recentTxns = TRANSACTIONS.slice(0, 5);
  const pendingUsers = USERS.filter((u) => u.status === "Pending").slice(0, 4);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPI label="Total Users" value="73,610" delta="+12.4%" icon={Users} accent />
        <KPI label="Active Bookings" value="2,184" delta="+8.1%" icon={Truck} />
        <KPI label="Total Revenue" value={formatMoney(6128400)} delta="+18.7%" icon={DollarSign} />
        <KPI label="Active Trips" value="412" delta="+3.2%" icon={MapPin} />
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
        <Panel title="Recent Transactions">
          <ul className="divide-y divide-border -my-2">
            {recentTxns.map((t) => (
              <li key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm truncate">{t.user}</div>
                  <div className="text-[11px] font-mono text-muted-foreground uppercase">{t.type} · {t.gateway}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{formatMoney(t.amount)}</div>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Pending Verifications" action={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)]">{pendingUsers.length} QUEUE</span>
        }>
          <ul className="space-y-3">
            {pendingUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <Avatar initials={u.avatar} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{u.kind} · {u.region}</div>
                </div>
                <button className="h-7 w-7 grid place-items-center rounded bg-primary/15 text-[var(--accent-lime)] hover:bg-primary/25 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                <button className="h-7 w-7 grid place-items-center rounded bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25 transition-colors"><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
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