import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Avatar, Table, THead, TH, TR, TD, Btn, Input, Select, Modal, Field } from "@/components/admin/ui";
import { USERS, REGIONS } from "@/lib/mock-data";
import { Search, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/truck-owners")({
  head: () => ({ meta: [{ title: "System Users — TRANS8" }] }),
  component: SystemUsersPage,
});

const SYS_ROLES = ["Driver", "Agent", "Admin", "Shipping"];

function SystemUsersPage() {
  const seed = useMemo(() => USERS.filter((u) => u.kind === "System"), []);
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    region: REGIONS[0].name,
    city: "Dubai",
    role: "Driver",
    activity: "Linehaul Transport",
    subRole: "Truck by type",
    photoSeed: "system-" + Math.floor(Math.random() * 100)
  });

  const filtered = list
    .filter((u) => (region ? u.region === region : true))
    .filter((u) => (role ? u.role === role : true))
    .filter((u) => (q ? `${u.name} ${u.id} ${u.subRole} ${u.activity}`.toLowerCase().includes(q.toLowerCase()) : true));

  const onboard = () => {
    if (!draft.name || !draft.email) { toast.error("Name and email are required"); return; }
    const initials = draft.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    const newUser = {
      id: `USR-${Math.floor(Math.random() * 89999) + 20000}`,
      name: draft.name,
      email: draft.email,
      region: draft.region,
      city: draft.city,
      kind: "System" as const,
      role: draft.role,
      activity: draft.activity,
      subRole: draft.subRole,
      photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${draft.photoSeed}`,
      status: "Pending" as const,
      joined: new Date().toISOString().slice(0, 10),
      avatar: initials,
      phone: "+00 000 0000",
      walletBalance: 0,
      rating: 5,
      trips: 0
    };
    setList([newUser, ...list]);
    toast.success(`System User ${draft.name} onboarded as ${draft.role}`);
    setOpen(false);
    setDraft({
      name: "", email: "", region: REGIONS[0].name, city: "Dubai",
      role: "Driver", activity: "Linehaul Transport", subRole: "Truck by type",
      photoSeed: "system-" + Math.floor(Math.random() * 100)
    });
  };

  return (
    <AdminLayout>
      <PageHeader title="System Users" subtitle={`${list.length} administrative and operational accounts`}
        actions={<Btn onClick={() => setOpen(true)}><Truck className="h-4 w-4" />+ Onboard System User</Btn>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user, ID, specs…" className="w-full pl-9" />
        </div>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>{REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}
        </Select>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All system roles</option>
          {SYS_ROLES.map((r) => <option key={r}>{r}</option>)}
        </Select>
      </div>
      <Table>
        <THead><TR><TH>System User</TH><TH>Region / City</TH><TH>Role / Activity</TH><TH>Sub-role / Spec</TH><TH>Status</TH></TR></THead>
        <tbody>
          {filtered.map((u) => (
            <TR key={u.id}>
              <TD><div className="flex items-center gap-3"><Avatar initials={u.avatar} photo={u.photo} /><div><div className="font-medium">{u.name}</div><div className="text-[11px] font-mono text-muted-foreground">{u.id}</div></div></div></TD>
                <TD className="text-xs">
                  <div>{u.region}</div>
                  <div className="text-muted-foreground">{u.city}</div>
                </TD>
                <TD>
                  <div className="text-xs font-semibold uppercase font-mono text-primary">{u.role}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{u.activity}</div>
                </TD>
                <TD className="text-xs text-muted-foreground font-mono">{u.subRole || "—"}</TD>
                <TD><StatusBadge status={u.status} /></TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-10" colSpan={5}>No system users match</TD></TR>
            )}
          </tbody>
        </Table>

      <Modal open={open} onClose={() => setOpen(false)} title="Onboard System User"
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={onboard}>Onboard User</Btn></>}>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <Field label="Full Name"><Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Yusuf Karimi" /></Field>
          <Field label="Email"><Input className="w-full" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@trans8.io" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region"><Select className="w-full" value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })}>{REGIONS.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}</Select></Field>
            <Field label="City"><Input className="w-full" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="e.g. Dubai" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <Select className="w-full" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                {SYS_ROLES.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Specific Activity"><Input className="w-full" value={draft.activity} onChange={(e) => setDraft({ ...draft, activity: e.target.value })} placeholder="e.g. Linehaul Transport" /></Field>
          </div>
          <Field label="Sub-role / Specialization"><Input className="w-full" value={draft.subRole} onChange={(e) => setDraft({ ...draft, subRole: e.target.value })} placeholder="e.g. Truck by type, Container, Supervisor" /></Field>
          <Field label="Profile Avatar Seed">
            <div className="flex gap-2 items-center">
              <Input className="flex-1" value={draft.photoSeed} onChange={(e) => setDraft({ ...draft, photoSeed: e.target.value })} />
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${draft.photoSeed}`} alt="Preview" className="h-9 w-9 bg-[var(--surface-3)] rounded border border-border" />
            </div>
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}