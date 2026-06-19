import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Table, THead, TH, TR, TD, Avatar, Input, Select, Toggle, Modal, Field } from "@/components/admin/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Agents & Territories — TRANS8" }] }),
  component: AgentsPage,
});

type AgentRole = "Local Transport" | "Custom Agent" | "Long Distance";
interface Agent {
  id: string; name: string; role: AgentRole; territory: string;
  txCount: number; profitPct: number; active: boolean; initials: string;
  port: string; warehouse: string; company: string;
}

const TERRITORIES = ["UAE · Dubai", "Iran · Tehran", "Pakistan · Karachi", "Turkey · Istanbul", "South Africa · Durban", "GCC · Riyadh", "Russia · Moscow"];
const ROLES: AgentRole[] = ["Local Transport", "Custom Agent", "Long Distance"];

const SEED: Agent[] = [
  { id: "AG-1001", name: "Reza Karimi",    role: "Local Transport", territory: "Iran · Tehran",      txCount: 342, profitPct: 6.5, active: true,  initials: "RK", port: "Bandar Abbas Port", warehouse: "Tehran East Depot", company: "Pak-Iran Cargo" },
  { id: "AG-1002", name: "Layla Hosseini", role: "Custom Agent",    territory: "UAE · Dubai",         txCount: 218, profitPct: 8.0, active: true,  initials: "LH", port: "Jebel Ali Port", warehouse: "Dubai Logistics Center", company: "TransGlobal Shipping" },
  { id: "AG-1003", name: "Omar Al-Saud",   role: "Long Distance",   territory: "GCC · Riyadh",        txCount: 410, profitPct: 5.5, active: true,  initials: "OA", port: "Jebel Ali Port", warehouse: "Riyadh South Depot", company: "Afrilink Logistics" },
  { id: "AG-1004", name: "Hassan Khan",    role: "Local Transport", territory: "Pakistan · Karachi",  txCount: 287, profitPct: 6.0, active: true,  initials: "HK", port: "Port of Karachi", warehouse: "Karachi Central Hub", company: "Pak-Iran Cargo" },
  { id: "AG-1005", name: "Mehmet Yilmaz",  role: "Custom Agent",    territory: "Turkey · Istanbul",   txCount: 196, profitPct: 7.5, active: false, initials: "MY", port: "Port of Istanbul", warehouse: "Istanbul Gateway Whse", company: "EurAsia Freighters" },
  { id: "AG-1006", name: "Ivan Volkov",    role: "Long Distance",   territory: "Russia · Moscow",     txCount: 152, profitPct: 6.0, active: true,  initials: "IV", port: "Port of Moscow", warehouse: "Moscow North Hub", company: "EurAsia Freighters" },
  { id: "AG-1007", name: "Nadia Mansouri", role: "Custom Agent",    territory: "Iran · Tehran",       txCount: 174, profitPct: 7.0, active: true,  initials: "NM", port: "Bandar Abbas Port", warehouse: "Tehran East Depot", company: "Blue Ocean Shipping" },
  { id: "AG-1008", name: "Fatima Aydin",   role: "Local Transport", territory: "South Africa · Durban", txCount: 98,  profitPct: 5.0, active: false, initials: "FA", port: "Port of Durban", warehouse: "Durban Harbor Whse", company: "Afrilink Logistics" },
  { id: "AG-1009", name: "Amir Rahimi",    role: "Long Distance",   territory: "UAE · Dubai",         txCount: 305, profitPct: 6.0, active: true,  initials: "AR", port: "Jebel Ali Port", warehouse: "Dubai Logistics Center", company: "Blue Ocean Shipping" },
  { id: "AG-1010", name: "Sara Petrov",    role: "Custom Agent",    territory: "Russia · Moscow",     txCount: 88,  profitPct: 7.5, active: true,  initials: "SP", port: "Port of Moscow", warehouse: "Moscow North Hub", company: "TransGlobal Shipping" },
];

function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(SEED);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | AgentRole>("all");
  const [terr, setTerr] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    role: "Local Transport" as AgentRole,
    territory: "UAE · Dubai",
    port: "Jebel Ali Port",
    warehouse: "Dubai Logistics Center",
    company: "TransGlobal Shipping"
  });

  const filtered = useMemo(() => agents.filter((a) =>
    (role === "all" || a.role === role) &&
    (terr === "all" || a.territory === terr) &&
    (q === "" || a.name.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase()))
  ), [agents, role, terr, q]);

  const toggle = (id: string) => {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
    toast.success("Agent status updated");
  };

  const invite = () => {
    if (!draft.name.trim()) {
      toast.error("Agent name is required");
      return;
    }
    const initials = draft.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    const newAgent: Agent = {
      id: `AG-${1000 + agents.length + 1}`,
      name: draft.name,
      role: draft.role,
      territory: draft.territory,
      txCount: 0,
      profitPct: 5.0,
      active: true,
      initials,
      port: draft.port,
      warehouse: draft.warehouse,
      company: draft.company
    };
    setAgents([newAgent, ...agents]);
    toast.success(`Agent ${draft.name} invited successfully!`);
    setOpen(false);
    setDraft({
      name: "",
      role: "Local Transport",
      territory: "UAE · Dubai",
      port: "Jebel Ali Port",
      warehouse: "Dubai Logistics Center",
      company: "TransGlobal Shipping"
    });
  };

  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter((a) => a.active).length,
    tx: agents.reduce((s, a) => s + a.txCount, 0),
  }), [agents]);

  return (
    <AdminLayout>
      <PageHeader
        title="Agents & Territories"
        subtitle="Field operations network · roles, regions and participation"
        actions={<Btn onClick={() => setOpen(true)}>+ Invite Agent</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KPI label="Total agents" value={String(stats.total)} />
        <KPI label="Active" value={String(stats.active)} />
        <KPI label="Transactions handled" value={stats.tx.toLocaleString()} />
      </div>

      <Panel
        title="Directory"
        action={
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search agent…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={role} onChange={(e) => setRole(e.target.value as "all" | AgentRole)}>
              <option value="all">All roles</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
            <Select value={terr} onChange={(e) => setTerr(e.target.value)}>
              <option value="all">All territories</option>
              {TERRITORIES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
        }
      >
        <Table>
          <THead>
            <tr>
              <TH>Agent</TH>
              <TH>Role</TH>
              <TH>Territory</TH>
              <TH>Assigned Port</TH>
              <TH>Warehouse</TH>
              <TH>Company</TH>
              <TH className="text-right">Transactions</TH>
              <TH className="text-right">Profit %</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <tbody>
            {filtered.map((a) => (
              <TR key={a.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar initials={a.initials} />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{a.id}</div>
                    </div>
                  </div>
                </TD>
                <TD>{a.role}</TD>
                <TD>{a.territory}</TD>
                <TD><span className="text-xs font-mono">{a.port}</span></TD>
                <TD><span className="text-xs font-mono">{a.warehouse}</span></TD>
                <TD><span className="text-xs text-muted-foreground">{a.company}</span></TD>
                <TD className="text-right font-mono">{a.txCount.toLocaleString()}</TD>
                <TD className="text-right font-mono text-[var(--accent-lime)]">{a.profitPct.toFixed(1)}%</TD>
                <TD><StatusBadge status={a.active ? "Active" : "Suspended"} /></TD>
                <TD className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Toggle on={a.active} onChange={() => toggle(a.id)} />
                  </div>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center text-muted-foreground py-8">No agents match these filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            )}
          </tbody>
        </Table>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Invite Agent"
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={invite}>Invite Agent</Btn></>}>
        <div className="space-y-3">
          <Field label="Agent Name"><Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Ali Reza" /></Field>
          <Field label="Role">
            <Select className="w-full" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as AgentRole })}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Territory">
            <Select className="w-full" value={draft.territory} onChange={(e) => setDraft({ ...draft, territory: e.target.value })}>
              {TERRITORIES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Assigned Port">
            <Select className="w-full" value={draft.port} onChange={(e) => setDraft({ ...draft, port: e.target.value })}>
              <option>Jebel Ali Port</option>
              <option>Port of Karachi</option>
              <option>Bandar Abbas Port</option>
              <option>Port of Durban</option>
              <option>Port of Istanbul</option>
              <option>Port of Moscow</option>
              <option>Mundra Port</option>
            </Select>
          </Field>
          <Field label="Assigned Warehouse">
            <Select className="w-full" value={draft.warehouse} onChange={(e) => setDraft({ ...draft, warehouse: e.target.value })}>
              <option>Dubai Logistics Center</option>
              <option>Karachi Central Hub</option>
              <option>Tehran East Depot</option>
              <option>Durban Harbor Whse</option>
              <option>Istanbul Gateway Whse</option>
              <option>Moscow North Hub</option>
              <option>Cape Town Whse</option>
            </Select>
          </Field>
          <Field label="Assigned Company">
            <Select className="w-full" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })}>
              <option>TransGlobal Shipping</option>
              <option>Pak-Iran Cargo</option>
              <option>Afrilink Logistics</option>
              <option>EurAsia Freighters</option>
              <option>Blue Ocean Shipping</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-1)] border border-border rounded-lg p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}