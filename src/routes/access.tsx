import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Table, THead, TH, TR, TD, Avatar, Input, Select, Toggle } from "@/components/admin/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/access")({
  head: () => ({ meta: [{ title: "Users & Access — TRANS8" }] }),
  component: AccessPage,
});

type Role =
  // Networked Users
  | "Logistic Broker"
  | "Port Agent"
  | "Custom Agent"
  | "Logistics Partner"
  // System Users
  | "Driver"
  | "Agent"
  | "Admin"
  | "Shipping";

const ROLE_ACCESS: Record<Role, string[]> = {
  "Logistic Broker":   ["Tender access", "Commission ledger", "/load-request"],
  "Port Agent":        ["Port status update", "/ports visibility", "/tracking"],
  "Custom Agent":      ["Customs clearance status", "/tracking customs steps"],
  "Logistics Partner": ["Cargo response", "Status tracking", "/tracking"],
  "Driver":            ["Trip execution", "Active route", "/tracking"],
  "Agent":             ["Survey reports", "Warehouse status", "Insurance verification"],
  "Admin":             ["Full dashboard settings", "App config", "User management"],
  "Shipping":          ["Spot tenders", "Vessel logs", "Container loading"]
};

interface Row {
  id: string; name: string; email: string; role: Role; assignment: string;
  active: boolean; lastLogin: string; initials: string;
}

const SEED: Row[] = [
  { id: "U-001", name: "Yusuf Karimi",   email: "yusuf@trans8.io",    role: "Admin",             assignment: "Supervisor",            active: true,  lastLogin: "2 min ago",   initials: "YK" },
  { id: "U-002", name: "Layla Hosseini", email: "layla@trans8.io",    role: "Logistic Broker",  assignment: "Global",                active: true,  lastLogin: "12 min ago",  initials: "LH" },
  { id: "U-003", name: "Omar Al-Saud",   email: "omar@trans8.io",     role: "Port Agent",        assignment: "Jebel Ali",             active: true,  lastLogin: "1 hr ago",    initials: "OA" },
  { id: "U-004", name: "Hassan Khan",    email: "hassan@trans8.io",   role: "Agent",             assignment: "Logistics (Pakistan)",  active: true,  lastLogin: "3 hr ago",    initials: "HK" },
  { id: "U-005", name: "Mehmet Yilmaz",  email: "mehmet@trans8.io",   role: "Custom Agent",      assignment: "Istanbul Port",         active: true,  lastLogin: "Yesterday",   initials: "MY" },
  { id: "U-006", name: "Reza Karimi",    email: "reza@trans8.io",     role: "Logistics Partner", assignment: "Sea Freight (AE)",      active: true,  lastLogin: "5 hr ago",    initials: "RK" },
  { id: "U-007", name: "Nadia Mansouri", email: "nadia@trans8.io",    role: "Driver",            assignment: "Truck (UAE)",           active: true,  lastLogin: "2 days ago",  initials: "NM" },
  { id: "U-008", name: "Ivan Volkov",    email: "ivan@trans8.io",     role: "Shipping",          assignment: "Liners (RU)",            active: false, lastLogin: "12 days ago", initials: "IV" },
  { id: "U-009", name: "Amir Rahimi",    email: "amir@trans8.io",     role: "Custom Agent",      assignment: "Jebel Ali",             active: true,  lastLogin: "4 hr ago",    initials: "AR" },
  { id: "U-010", name: "Sara Petrov",    email: "sara@trans8.io",     role: "Logistic Broker",  assignment: "Turkey",                active: false, lastLogin: "1 month ago", initials: "SP" },
];

function AccessPage() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");

  const filtered = useMemo(() => rows.filter((r) =>
    (role === "all" || r.role === role) &&
    (q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase()))
  ), [rows, role, q]);

  const toggle = (id: string) => {
    setRows((p) => p.map((r) => r.id === id ? { ...r, active: !r.active } : r));
    toast.success("Access updated");
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Users & Access"
        subtitle="Role-based access control across the TRANS8 platform"
        actions={<Btn onClick={() => toast.success("Invite sent (demo)")}>+ Invite user</Btn>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {(Object.keys(ROLE_ACCESS) as Role[]).map((r) => (
          <div key={r} className="bg-[var(--surface-1)] border border-border rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{r}</div>
            <div className="font-mono text-2xl font-bold mt-1">{rows.filter((u) => u.role === r).length}</div>
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
              {ROLE_ACCESS[r].slice(0, 3).map((a) => <li key={a} className="truncate">• {a}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <Panel
        title="Users"
        action={
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search name / email…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={role} onChange={(e) => setRole(e.target.value as "all" | Role)}>
              <option value="all">All roles</option>
              {Object.keys(ROLE_ACCESS).map((r) => <option key={r}>{r}</option>)}
            </Select>
          </div>
        }
      >
        <Table>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Assigned Port</TH>
              <TH>Status</TH>
              <TH>Last Login</TH>
              <TH className="text-right">Toggle</TH>
            </tr>
          </THead>
          <tbody>
            {filtered.map((r) => (
              <TR key={r.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar initials={r.initials} />
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{r.id}</div>
                    </div>
                  </div>
                </TD>
                <TD className="text-muted-foreground">{r.email}</TD>
                <TD>{r.role}</TD>
                <TD>{r.assignment}</TD>
                <TD><StatusBadge status={r.active ? "Active" : "Suspended"} /></TD>
                <TD className="text-muted-foreground text-xs">{r.lastLogin}</TD>
                <TD className="text-right"><Toggle on={r.active} onChange={() => toggle(r.id)} /></TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-8">No users match these filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            )}
          </tbody>
        </Table>
      </Panel>
    </AdminLayout>
  );
}