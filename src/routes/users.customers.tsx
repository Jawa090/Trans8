import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Avatar, Table, THead, TH, TR, TD, Btn, Input, Select, Modal, Field } from "@/components/admin/ui";
import { USERS, REGIONS } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/users/customers")({
  head: () => ({ meta: [{ title: "Customers — Movers Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
    const seed = useMemo(() => USERS.filter((u) => u.kind === "Customer"), []);
    const [list, setList] = useState(seed);
    const [q, setQ] = useState("");
    const [region, setRegion] = useState("");
    const [status, setStatus] = useState("");
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState({ name: "", email: "", region: REGIONS[0].name });
    const filtered = list.filter((u) => {
      if (region && u.region !== region) return false;
      if (status && u.status !== status) return false;
      if (q && !`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const add = () => {
      if (!draft.name || !draft.email) { toast.error("Name and email are required"); return; }
      const id = `USR-${Math.floor(Math.random() * 89999) + 10000}`;
      const initials = draft.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
      setList([{ id, name: draft.name, email: draft.email, region: draft.region, kind: "Customer",
        status: "Pending", joined: new Date().toISOString().slice(0, 10), avatar: initials,
        phone: "+00 000 0000", walletBalance: 0, rating: 5, trips: 0 }, ...list]);
      toast.success(`Customer ${draft.name} added`);
      setOpen(false); setDraft({ name: "", email: "", region: REGIONS[0].name });
    };
    return (
      <AdminLayout>
        <PageHeader title="Customers" subtitle={`${list.length} customer accounts`} actions={<Btn onClick={() => setOpen(true)}>+ Add Customer</Btn>} />
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, ID…" className="w-full pl-9" />
          </div>
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>{REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option><option>Active</option><option>Pending</option><option>Suspended</option>
          </Select>
        </div>
        <Table>
          <THead><TR><TH>Customer</TH><TH>Email</TH><TH>Region</TH><TH>Status</TH><TH>Joined</TH></TR></THead>
          <tbody>
            {filtered.map((u) => (
              <TR key={u.id}>
                <TD><div className="flex items-center gap-3"><Avatar initials={u.avatar} /><div><div className="font-medium">{u.name}</div><div className="text-[11px] font-mono text-muted-foreground">{u.id}</div></div></div></TD>
                <TD className="font-mono text-xs">{u.email}</TD>
                <TD>{u.region}</TD>
                <TD><StatusBadge status={u.status} /></TD>
                <TD className="font-mono text-xs text-muted-foreground">{u.joined}</TD>
              </TR>
            ))}
            {filtered.length === 0 && <TR><TD className="text-center text-muted-foreground py-10">No customers match</TD></TR>}
          </tbody>
        </Table>

        <Modal open={open} onClose={() => setOpen(false)} title="Add Customer"
          footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={add}>Add</Btn></>}>
          <div className="space-y-3">
            <Field label="Full Name"><Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Reza Karimi" /></Field>
            <Field label="Email"><Input className="w-full" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@movers.io" /></Field>
            <Field label="Region"><Select className="w-full" value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })}>{REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}</Select></Field>
          </div>
        </Modal>
      </AdminLayout>
    );
}