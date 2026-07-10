import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Avatar, Table, THead, TH, TR, TD, Btn, Input, Select, Modal, Field } from "@/components/admin/ui";
import { USERS, REGIONS } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/users/customers")({
  head: () => ({ meta: [{ title: "Networked Users — TRANS8" }] }),
  component: NetworkedUsersPage,
});

const NET_ROLES = ["Logistic Broker", "Port Agent", "Custom Agent", "Logistics Partner"];

function NetworkedUsersPage() {
  const navigate = useNavigate();
  const seed = useMemo(() => USERS.filter((u) => u.kind === "Networked"), []);
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", role: "Logistic Broker", region: REGIONS[0].name, city: "Dubai", activity: "Customs Filing", photoSeed: "customer-" + Math.floor(Math.random() * 100) });

  const filtered = list.filter((u) => {
    if (region && u.region !== region) return false;
    if (status && u.status !== status) return false;
    if (q && !`${u.name} ${u.email} ${u.id} ${u.role} ${u.city} ${u.activity}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const add = () => {
    if (!draft.name || !draft.email) { toast.error("Name and email are required"); return; }
    const id = `USR-${Math.floor(Math.random() * 89999) + 10000}`;
    const initials = draft.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    setList([{
      id, name: draft.name, email: draft.email, region: draft.region, city: draft.city, kind: "Networked",
      role: draft.role, activity: draft.activity, photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${draft.photoSeed}`,
      status: "Pending", joined: new Date().toISOString().slice(0, 10), avatar: initials,
      phone: "+00 000 0000", walletBalance: 0, rating: 5, trips: 0
    }, ...list]);
    toast.success(`Networked User ${draft.name} added as ${draft.role}`);
    setOpen(false); setDraft({ name: "", email: "", role: "Logistic Broker", region: REGIONS[0].name, city: "Dubai", activity: "Customs Filing", photoSeed: "customer-" + Math.floor(Math.random() * 100) });
  };

  return (
    <AdminLayout>
      <PageHeader title="Networked Users" subtitle={`${list.length} networked accounts`} actions={<Btn onClick={() => setOpen(true)}>+ Add Networked User</Btn>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, role, city, ID…" className="w-full pl-9" />
        </div>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>{REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option><option>Active</option><option>Pending</option><option>Suspended</option>
        </Select>
      </div>
      <Table>
        <THead><TR><TH>User</TH><TH>Role / Activity</TH><TH>Email</TH><TH>Region / City</TH><TH>Status</TH><TH>Joined</TH></TR></THead>
        <tbody>
          {filtered.map((u) => (
            <TR key={u.id} className="cursor-pointer hover:bg-[var(--surface-2)] transition-colors" onClick={() => navigate({ to: "/users", search: { profileId: u.id } as any })}>
              <TD><div className="flex items-center gap-3"><Avatar initials={u.avatar} photo={u.photo} /><div><div className="font-medium">{u.name}</div><div className="text-[11px] font-mono text-muted-foreground">{u.id}</div></div></div></TD>
              <TD>
                <div className="text-xs font-semibold uppercase font-mono text-primary">{u.role}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{u.activity}</div>
              </TD>
              <TD className="font-mono text-xs">{u.email}</TD>
              <TD className="text-xs">
                <div>{u.region}</div>
                <div className="text-muted-foreground">{u.city}</div>
              </TD>
              <TD><StatusBadge status={u.status} /></TD>
              <TD className="font-mono text-xs text-muted-foreground">{u.joined}</TD>
            </TR>
          ))}
          {filtered.length === 0 && <TR><TD className="text-center text-muted-foreground py-10" colSpan={6}>No networked users match</TD></TR>}
        </tbody>
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Networked User"
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={add}>Add</Btn></>}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Full Name"><Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Leila Yazdi" /></Field>
          <Field label="Email"><Input className="w-full" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@trans8.io" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region"><Select className="w-full" value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })}>{REGIONS.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}</Select></Field>
            <Field label="City"><Input className="w-full" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="e.g. Dubai" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <Select className="w-full" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                {NET_ROLES.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Specific Activity"><Input className="w-full" value={draft.activity} onChange={(e) => setDraft({ ...draft, activity: e.target.value })} placeholder="e.g. Customs Clearance" /></Field>
          </div>
          <Field label="Profile Avatar Seed"><Input className="w-full" value={draft.photoSeed} onChange={(e) => setDraft({ ...draft, photoSeed: e.target.value })} /></Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}