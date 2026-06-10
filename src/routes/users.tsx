import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel, PageHeader, StatusBadge, Btn, Avatar, Tabs, Input, Select, Drawer, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { USERS, REGIONS, BOOKINGS, formatMoney, type User } from "@/lib/mock-data";
import { Search, Filter, Download, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Users — Movers Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => USERS.filter((u) => {
    if (tab === "Networked Users" && u.kind !== "Networked") return false;
    if (tab === "System Users" && u.kind !== "System") return false;
    if (q && !u.name.toLowerCase().includes(q.toLowerCase()) && !u.id.toLowerCase().includes(q.toLowerCase()) && !u.role.toLowerCase().includes(q.toLowerCase())) return false;
    if (region && u.region !== region) return false;
    if (status && u.status !== status) return false;
    return true;
  }), [tab, q, region, status]);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <AdminLayout>
      <PageHeader title="Users" subtitle={`${filtered.length} accounts across the network`}
        actions={<>
          <Btn variant="secondary" onClick={() => toast.success(`Exported ${filtered.length} users to CSV`)}><Download className="h-4 w-4" />Export</Btn>
          <Btn onClick={() => toast("Use user type settings to invite specific roles")}>+ Invite User</Btn>
        </>} />

      <Tabs tabs={["All", "Networked Users", "System Users"]} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or ID" className="w-full pl-9" />
        </div>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option><option>Active</option><option>Pending</option><option>Suspended</option>
        </Select>
          <Btn variant="secondary" onClick={() => toast("Advanced filters coming up")}><Filter className="h-4 w-4" />More filters</Btn>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30">
            <span className="text-xs font-mono">{selected.length} selected</span>
              <Btn variant="danger" className="h-7 px-2 text-xs"
                onClick={() => { toast.success(`Suspended ${selected.length} users`); setSelected([]); }}>Suspend</Btn>
            <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelected([])}>Clear</Btn>
          </div>
        )}
      </div>

      <Table>
        <THead><TR>
          <TH><input type="checkbox" className="accent-[var(--primary)]" onChange={(e) => setSelected(e.target.checked ? paged.map((u) => u.id) : [])} /></TH>
          <TH>User</TH><TH>Phone</TH><TH>Region</TH><TH>Role / Category</TH><TH>Status</TH><TH>Joined</TH><TH>Actions</TH>
        </TR></THead>
        <tbody>
          {paged.map((u) => (
            <TR key={u.id}>
              <TD><input type="checkbox" className="accent-[var(--primary)]" checked={selected.includes(u.id)}
                onChange={(e) => setSelected(e.target.checked ? [...selected, u.id] : selected.filter((s) => s !== u.id))} /></TD>
              <TD>
                <div className="flex items-center gap-3">
                  <Avatar initials={u.avatar} />
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{u.id}</div>
                  </div>
                </div>
              </TD>
              <TD className="font-mono text-xs">{u.phone}</TD>
              <TD>{u.region}</TD>
              <TD>
                <div className="text-xs font-semibold text-foreground uppercase font-mono">{u.role}</div>
                {u.subRole && <div className="text-[10px] text-muted-foreground font-mono">{u.subRole}</div>}
              </TD>
              <TD><StatusBadge status={u.status} /></TD>
              <TD className="font-mono text-xs text-muted-foreground">{u.joined}</TD>
              <TD>
                <div className="flex gap-1">
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDrawer(u)}>View</Btn>
                    <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast(`Editing ${u.name}…`)}>Edit</Btn>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="text-xs font-mono text-muted-foreground">
          Page {page} / {totalPages} · {filtered.length} results
        </div>
        <div className="flex gap-1">
          <Btn variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</Btn>
          <Btn variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</Btn>
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name}>
        {drawer && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={drawer.avatar} size={64} />
              <div>
                <div className="text-lg font-display font-bold">{drawer.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{drawer.email}</div>
                <div className="mt-1"><StatusBadge status={drawer.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Category" value={drawer.kind} />
              <Stat label="Role" value={drawer.role} />
              {drawer.subRole && <Stat label="Sub-role / Spec" value={drawer.subRole} />}
              <Stat label="Region" value={drawer.region} />
              <Stat label="Wallet" value={formatMoney(drawer.walletBalance)} />
              <Stat label="Trips" value={String(drawer.trips)} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Verification</div>
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3 space-y-2">
                <Row k="ID Document" v={<StatusBadge status="Active" />} />
                <Row k="Address Proof" v={<StatusBadge status="Pending" />} />
                <Row k="Vehicle Reg." v={<StatusBadge status="Active" />} />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Recent Bookings</div>
              <ul className="space-y-1.5">
                {BOOKINGS.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-xs bg-[var(--surface-2)] border border-border rounded p-2">
                    <span className="font-mono text-primary">{b.id}</span>
                    <span className="text-muted-foreground truncate mx-2">{b.origin} → {b.destination}</span>
                    <span className="font-mono">{formatMoney(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Reviews</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--warning)] flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(drawer.rating) ? "fill-current" : ""}`} />)}</span>
                <span className="font-mono">{drawer.rating}</span>
                <span className="text-muted-foreground">· 124 reviews</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Btn className="flex-1" onClick={() => toast(`Editing ${drawer.name}…`)}>Edit</Btn>
              <Btn variant="secondary" className="flex-1" onClick={() => toast.success(`Notification sent to ${drawer.name}`)}>Notify</Btn>
              <Btn variant="danger" onClick={() => { toast.success(`${drawer.name} suspended`); setDrawer(null); }}>Suspend</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-lg mt-1">{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{k}</span>{v}</div>;
}