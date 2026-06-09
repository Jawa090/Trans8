import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Avatar, Table, THead, TH, TR, TD, Btn, Input, Select } from "@/components/admin/ui";
import { USERS, REGIONS, formatMoney } from "@/lib/mock-data";
import { Star, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/truck-owners")({
  head: () => ({ meta: [{ title: "Truck Owners — Movers Admin" }] }),
  component: () => {
    const list = useMemo(() => USERS.filter((u) => u.kind === "Truck Owner"), []);
    const [q, setQ] = useState("");
    const [region, setRegion] = useState("");
    const [sort, setSort] = useState("trips");
    const filtered = list
      .filter((u) => (region ? u.region === region : true))
      .filter((u) => (q ? `${u.name} ${u.id} ${u.phone}`.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "earnings" ? b.walletBalance - a.walletBalance : b.trips - a.trips);
    return (
      <AdminLayout>
        <PageHeader title="Truck Owners" subtitle={`${list.length} carriers in network`}
          actions={<Btn onClick={() => toast("Onboarding flow starts here")}>+ Onboard Owner</Btn>} />
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search owner, ID, phone…" className="w-full pl-9" />
          </div>
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>{REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="trips">Sort: Trips</option><option value="rating">Sort: Rating</option><option value="earnings">Sort: Earnings</option>
          </Select>
        </div>
        <Table>
          <THead><TR><TH>Owner</TH><TH>Region</TH><TH>Trips</TH><TH>Rating</TH><TH>Earnings</TH><TH>Status</TH></TR></THead>
          <tbody>
            {filtered.map((u) => (
              <TR key={u.id}>
                <TD><div className="flex items-center gap-3"><Avatar initials={u.avatar} /><div><div className="font-medium">{u.name}</div><div className="text-[11px] font-mono text-muted-foreground">{u.phone}</div></div></div></TD>
                <TD>{u.region}</TD>
                <TD className="font-mono">{u.trips}</TD>
                <TD><span className="flex items-center gap-1 text-[var(--warning)] font-mono"><Star className="h-3.5 w-3.5 fill-current" />{u.rating}</span></TD>
                <TD className="font-mono text-[var(--accent-lime)]">{formatMoney(u.walletBalance)}</TD>
                <TD><StatusBadge status={u.status} /></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </AdminLayout>
    );
  },
});