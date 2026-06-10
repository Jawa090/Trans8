import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Avatar, Table, THead, TH, TR, TD, Btn, Input, Select } from "@/components/admin/ui";
import { USERS, REGIONS } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/truck-owners")({
  head: () => ({ meta: [{ title: "System Users — TRANS8" }] }),
  component: () => {
    const list = useMemo(() => USERS.filter((u) => u.kind === "System"), []);
    const [q, setQ] = useState("");
    const [region, setRegion] = useState("");
    const [role, setRole] = useState("");

    const filtered = list
      .filter((u) => (region ? u.region === region : true))
      .filter((u) => (role ? u.role === role : true))
      .filter((u) => (q ? `${u.name} ${u.id} ${u.subRole}`.toLowerCase().includes(q.toLowerCase()) : true));

    return (
      <AdminLayout>
        <PageHeader title="System Users" subtitle={`${list.length} administrative and operational accounts`}
          actions={<Btn onClick={() => toast("Onboarding flow starts here")}>+ Onboard System User</Btn>} />
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
            <option value="Driver">Driver</option>
            <option value="Agent">Agent</option>
            <option value="Admin">Admin</option>
            <option value="Shipping">Shipping</option>
          </Select>
        </div>
        <Table>
          <THead><TR><TH>System User</TH><TH>Region</TH><TH>Role</TH><TH>Sub-role / Spec</TH><TH>Status</TH></TR></THead>
          <tbody>
            {filtered.map((u) => (
              <TR key={u.id}>
                <TD><div className="flex items-center gap-3"><Avatar initials={u.avatar} /><div><div className="font-medium">{u.name}</div><div className="text-[11px] font-mono text-muted-foreground">{u.id}</div></div></div></TD>
                <TD>{u.region}</TD>
                <TD><span className="text-xs font-semibold uppercase font-mono text-primary">{u.role}</span></TD>
                <TD className="text-xs text-muted-foreground font-mono">{u.subRole || "—"}</TD>
                <TD><StatusBadge status={u.status} /></TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-10" colSpan={5}>No system users match</TD></TR>
            )}
          </tbody>
        </Table>
      </AdminLayout>
    );
  },
});