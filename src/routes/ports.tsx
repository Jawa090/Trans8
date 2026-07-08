import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Table, THead, TH, TR, TD, Input, Select, Drawer, Modal, Field } from "@/components/admin/ui";
import { Anchor, Plane, Train as TrainIcon, Truck, Users as UsersIcon, Package, ShieldCheck, AlertTriangle, CheckCircle, Search, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useCountries } from "@/lib/countries-store";

export const Route = createFileRoute("/ports")({
  head: () => ({ meta: [{ title: "Ports Management — TRANS8" }] }),
  component: PortsPage,
});

type PortType = "SEAPORT" | "AIRPORT" | "TRAIN STATION" | "LAND PORT";
type PortStatus = "Operational" | "Limited" | "Closed";

interface Port {
  id: string;
  name: string;
  country: string;
  flag: string;
  type: PortType;
  agents: string[];
  activeShipments: number;
  status: PortStatus;
  customsPending: number;
  customsCleared: number;
  loading: number;
  discharge: number;
  scope: "Domestic" | "International";
  verified: boolean;
  operator: string;
  notes: string;
}

const RAW_DEFAULT_PORTS: Array<Omit<Port, "id" | "agents" | "activeShipments" | "status" | "customsPending" | "customsCleared" | "loading" | "discharge" | "scope" | "verified" | "operator" | "notes">> = [
  // UAE 🇦🇪
  { name: "Jebel Ali Port",        country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Sharjah Port",          country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Abu Dhabi Zayed Port",  country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Fujairah Seaport",      country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "DXB International",     country: "UAE", flag: "🇦🇪", type: "AIRPORT" },
  { name: "AUH Zayed Cargo",       country: "UAE", flag: "🇦🇪", type: "AIRPORT" },
  { name: "Etihad Rail Depot",     country: "UAE", flag: "🇦🇪", type: "TRAIN STATION" },
  { name: "Hatta Border Post",     country: "UAE", flag: "🇦🇪", type: "LAND PORT" },

  // Pakistan 🇵🇰
  { name: "Karachi Seaport",       country: "Pakistan", flag: "🇵🇰", type: "SEAPORT" },
  { name: "Port Qasim Container",  country: "Pakistan", flag: "🇵🇰", type: "SEAPORT" },
  { name: "Gwadar Deepwater Port", country: "Pakistan", flag: "🇵🇰", type: "SEAPORT" },
  { name: "Jinnah Cargo KHI",      country: "Pakistan", flag: "🇵🇰", type: "AIRPORT" },
  { name: "Allama Iqbal Aircargo", country: "Pakistan", flag: "🇵🇰", type: "AIRPORT" },
  { name: "Karachi Cantt Depot",   country: "Pakistan", flag: "🇵🇰", type: "TRAIN STATION" },
  { name: "Taftan Border Station", country: "Pakistan", flag: "🇵🇰", type: "LAND PORT" },

  // Iran 🇮🇷
  { name: "Bandar Abbas Gateway",  country: "Iran", flag: "🇮🇷", type: "SEAPORT" },
  { name: "Chabahar Free Port",    country: "Iran", flag: "🇮🇷", type: "SEAPORT" },
  { name: "Imam Khomeini Airport", country: "Iran", flag: "🇮🇷", type: "AIRPORT" },
  { name: "Tehran Railway Yard",   country: "Iran", flag: "🇮🇷", type: "TRAIN STATION" },
  { name: "Bazargan Customs",      country: "Iran", flag: "🇮🇷", type: "LAND PORT" },

  // South Africa 🇿🇦
  { name: "Durban Seaport Terminal", country: "South Africa", flag: "🇿🇦", type: "SEAPORT" },
  { name: "Cape Town Port Authority", country: "South Africa", flag: "🇿🇦", type: "SEAPORT" },
  { name: "OR Tambo Air Cargo JNB",  country: "South Africa", flag: "🇿🇦", type: "AIRPORT" },
  { name: "Pretoria Freight Yard",   country: "South Africa", flag: "🇿🇦", type: "TRAIN STATION" },

  // Turkey 🇹🇷
  { name: "Port of Istanbul Ambarli", country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "Mersin Seaport Hub",       country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "Istanbul IST Cargo",       country: "Turkey", flag: "🇹🇷", type: "AIRPORT" },
  { name: "Kapikule Border Crossing", country: "Turkey", flag: "🇹🇷", type: "LAND PORT" },

  // India 🇮🇳
  { name: "JNPT Nhava Sheva Mumbai", country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "Mundra Port Gujarat",      country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "Indira Gandhi Cargo DEL",  country: "India", flag: "🇮🇳", type: "AIRPORT" },
  { name: "Attari Wagah Land Port",   country: "India", flag: "🇮🇳", type: "LAND PORT" },
];

const AGENTS = ["Layla Hosseini", "Amir Rahimi", "Omar Al-Saud", "Hassan Khan", "Sara Petrov", "Reza Karimi", "Nadia Mansouri", "Mehmet Yilmaz", "Fatima Aydin", "Yusuf Karimi", "Ivan Volkov", "Zara Botha"];
const STATUSES: PortStatus[] = ["Operational", "Operational", "Operational", "Operational", "Limited", "Limited", "Closed"];
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

const INITIAL_PORTS: Port[] = RAW_DEFAULT_PORTS.map((r, i) => {
  const h = hash(r.name + r.country);
  const agentCount = (h % 3) + 1;
  const agents = Array.from({ length: agentCount }, (_, k) => AGENTS[(h + k * 7) % AGENTS.length]);
  const status = STATUSES[h % STATUSES.length];
  const base = (h % 140) + 8;
  const cleared = Math.floor(base * 0.78);
  const pending = base - cleared;
  return {
    id: `P-${String(i + 1).padStart(3, "0")}`,
    ...r,
    agents,
    activeShipments: base,
    status,
    customsPending: pending,
    customsCleared: cleared,
    loading: (h % 18) + 2,
    discharge: ((h >> 3) % 22) + 3,
    scope: (h % 5 === 0) ? "Domestic" : "International",
    verified: true,
    operator: `${r.country} State Port Logistics Authority`,
    notes: "Historically verified under global TRANS8 framework."
  };
});

const TYPE_ICON: Record<PortType, typeof Anchor> = { 
  "SEAPORT": Anchor, 
  "AIRPORT": Plane, 
  "TRAIN STATION": TrainIcon, 
  "LAND PORT": Truck 
};

const TYPE_TONE: Record<PortType, string> = {
  "SEAPORT": "text-sky-400",
  "AIRPORT": "text-violet-400",
  "TRAIN STATION": "text-amber-400",
  "LAND PORT": "text-emerald-400",
};

const FILTERS: Array<"ALL" | PortType> = ["ALL", "SEAPORT", "AIRPORT", "TRAIN STATION", "LAND PORT"];
const PORTS_STORAGE_KEY = "trans8_ports_database_persistent";

function PortsPage() {
  const { countries } = useCountries();
  const [ports, setPorts] = useState<Port[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"ALL" | PortType>("ALL");
  const [status, setStatus] = useState<"all" | PortStatus>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "Domestic" | "International">("all");
  const [verificationTab, setVerificationTab] = useState<"all" | "verified" | "pending">("all");
  const [selected, setSelected] = useState<Port | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");

  // Add Port Modal States
  const [addPortOpen, setAddPortOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("UAE");
  const [newType, setNewType] = useState<PortType>("SEAPORT");
  const [newScope, setNewScope] = useState<"Domestic" | "International">("International");
  const [newOperator, setNewOperator] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Load from Local Storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PORTS_STORAGE_KEY);
    if (stored) {
      try {
        setPorts(JSON.parse(stored));
      } catch (e) {
        setPorts(INITIAL_PORTS);
      }
    } else {
      setPorts(INITIAL_PORTS);
      localStorage.setItem(PORTS_STORAGE_KEY, JSON.stringify(INITIAL_PORTS));
    }
  }, []);

  const savePorts = (newPortsList: Port[]) => {
    setPorts(newPortsList);
    localStorage.setItem(PORTS_STORAGE_KEY, JSON.stringify(newPortsList));
  };

  const handleVerifyPort = (id: string) => {
    const updated = ports.map(p => p.id === id ? { ...p, verified: true, notes: `Verified on ${new Date().toLocaleDateString()} by Operations Compliance.` } : p);
    savePorts(updated);
    if (selected && selected.id === id) {
      setSelected({ ...selected, verified: true, notes: `Verified on ${new Date().toLocaleDateString()} by Operations Compliance.` });
    }
    toast.success("Port gateway successfully verified for official operations!");
  };

  const handleAddPort = () => {
    if (!newName.trim()) {
      toast.error("Port name is required");
      return;
    }

    const flag = countries[newCountry]?.flag || "🌐";
    const newPortObj: Port = {
      id: `P-${String(ports.length + 1).padStart(3, "0")}`,
      name: newName,
      country: newCountry,
      flag,
      type: newType,
      agents: [],
      activeShipments: 0,
      status: "Operational",
      customsPending: 0,
      customsCleared: 0,
      loading: 0,
      discharge: 0,
      scope: newScope,
      verified: false, // Must go through compliance verification flow
      operator: newOperator.trim() || `${newCountry} Local Gateways Group`,
      notes: newNotes.trim() || "Awaiting compliance team verification."
    };

    const updated = [newPortObj, ...ports];
    savePorts(updated);
    toast.success(`Port ${newName} added! Status: Pending Operational Verification.`);
    setAddPortOpen(false);

    // Reset Form
    setNewName("");
    setNewCountry("UAE");
    setNewType("SEAPORT");
    setNewScope("International");
    setNewOperator("");
    setNewNotes("");
  };

  const filtered = useMemo(() => {
    return ports.filter((p) => {
      const matchType = type === "ALL" || p.type === type;
      const matchStatus = status === "all" || p.status === status;
      const matchScope = scopeFilter === "all" || p.scope === scopeFilter;
      const matchVerification = 
        verificationTab === "all" ? true :
        verificationTab === "verified" ? p.verified === true :
        p.verified === false;
      const matchQuery = q === "" || 
        p.name.toLowerCase().includes(q.toLowerCase()) || 
        p.country.toLowerCase().includes(q.toLowerCase()) ||
        p.operator.toLowerCase().includes(q.toLowerCase());

      return matchType && matchStatus && matchScope && matchVerification && matchQuery;
    });
  }, [ports, q, type, status, scopeFilter, verificationTab]);

  const stats = useMemo(() => ({
    total: ports.length,
    verified: ports.filter(p => p.verified).length,
    pendingVerification: ports.filter(p => !p.verified).length,
    domestic: ports.filter(p => p.scope === "Domestic").length,
    international: ports.filter(p => p.scope === "International").length,
    operational: ports.filter((p) => p.status === "Operational").length,
    shipments: ports.reduce((s, p) => s + p.activeShipments, 0),
  }), [ports]);

  const counts = useMemo(() => ({
    "ALL": ports.length,
    "SEAPORT": ports.filter((p) => p.type === "SEAPORT").length,
    "AIRPORT": ports.filter((p) => p.type === "AIRPORT").length,
    "TRAIN STATION": ports.filter((p) => p.type === "TRAIN STATION").length,
    "LAND PORT": ports.filter((p) => p.type === "LAND PORT").length,
  }), [ports]);

  return (
    <AdminLayout>
      <PageHeader
        title="Ports & Gateways"
        subtitle="Verification, regional scope, and agent assignments for all entryways"
        actions={
          <Btn onClick={() => setAddPortOpen(true)}>
            + Add Port / Terminal
          </Btn>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI label="Total Gateway Directory" value={String(stats.total)} />
        <KPI label="Verified Operational" value={String(stats.verified)} />
        <KPI label="Awaiting Verification" value={String(stats.pendingVerification)} highlight={stats.pendingVerification > 0} />
        <KPI label="Scope Ratio (Intl / Dom)" value={`${stats.international} / ${stats.domestic}`} />
      </div>

      {/* Verification Flow Tabs */}
      <div className="border-b border-border flex gap-1 mb-5 overflow-x-auto">
        {[
          { id: "all", label: "All Gateways" },
          { id: "verified", label: `Verified Operations (${stats.verified})` },
          { id: "pending", label: `Pending Review (${stats.pendingVerification})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setVerificationTab(t.id as any)}
            className={`px-4 py-2.5 text-sm font-medium relative transition-colors whitespace-nowrap ${
              verificationTab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {verificationTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
          </button>
        ))}
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = type === f;
          const Icon = f === "ALL" ? null : TYPE_ICON[f];
          const count = counts[f];
          return (
            <button
              key={f}
              onClick={() => setType(f)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono uppercase tracking-wider transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-[var(--surface-1)] border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {f}
              <span className={`ml-1 px-1.5 py-0.5 rounded ${active ? "bg-black/20" : "bg-[var(--surface-2)]"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel */}
      <Panel
        title={`Gateways List · ${filtered.length} visible`}
        action={
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search name/operator…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as any)}>
              <option value="all">All Scope</option>
              <option value="International">International Only</option>
              <option value="Domestic">Domestic Only</option>
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">All Status</option>
              <option>Operational</option>
              <option>Limited</option>
              <option>Closed</option>
            </Select>
            <Btn variant="secondary" onClick={() => setView(view === "cards" ? "table" : "cards")}>
              {view === "cards" ? "Table view" : "Card view"}
            </Btn>
          </div>
        }
      >
        {view === "cards" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((p) => {
              const Icon = TYPE_ICON[p.type];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`text-left bg-[var(--surface-1)] border hover:border-primary/60 rounded-lg p-4 transition group relative overflow-hidden ${
                    !p.verified ? "border-amber-500/30 bg-amber-500/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-md bg-[var(--surface-2)] border border-border grid place-items-center ${TYPE_TONE[p.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={p.status === "Operational" ? "Active" : p.status === "Limited" ? "Pending" : "Suspended"} />
                      {!p.verified ? (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Unverified</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Verified</span>
                      )}
                    </div>
                  </div>
                  <div className="font-semibold leading-tight group-hover:text-primary mt-1 flex items-center gap-1">
                    {p.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-between">
                    <span>{p.flag} {p.country} · {p.type}</span>
                    <span className={`text-[10px] font-mono font-semibold uppercase px-1 rounded ${
                      p.scope === "International" ? "text-blue-400 bg-blue-500/10" : "text-orange-400 bg-orange-500/10"
                    }`}>{p.scope}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border">
                    <div>
                      <div className="text-[9px] font-mono uppercase text-muted-foreground">Agents</div>
                      <div className="font-mono text-xs font-bold text-foreground">{p.agents.length} assigned</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono uppercase text-muted-foreground">Shipments</div>
                      <div className="font-mono text-xs font-bold text-foreground">{p.activeShipments} units</div>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12 font-mono">No gateways matched the specified criteria.</div>
            )}
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Gateway</TH>
                <TH>Country</TH>
                <TH>Type</TH>
                <TH>Scope</TH>
                <TH className="text-right">Shipments</TH>
                <TH>Verification</TH>
                <TH>Status</TH>
                <TH className="text-right">Action</TH>
              </tr>
            </THead>
            <tbody>
              {filtered.map((p) => {
                const Icon = TYPE_ICON[p.type];
                return (
                  <TR key={p.id} className={!p.verified ? "bg-amber-500/5 hover:bg-amber-500/10" : ""}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-md bg-[var(--surface-2)] border border-border grid place-items-center ${TYPE_TONE[p.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{p.id}</div>
                        </div>
                      </div>
                    </TD>
                    <TD><span className="mr-2">{p.flag}</span>{p.country}</TD>
                    <TD className="font-mono text-xs text-muted-foreground">{p.type}</TD>
                    <TD>
                      <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                        p.scope === "International" ? "text-blue-400 bg-blue-500/10" : "text-orange-400 bg-orange-500/10"
                      }`}>{p.scope}</span>
                    </TD>
                    <TD className="text-right font-mono font-bold">{p.activeShipments}</TD>
                    <TD>
                      {p.verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-500 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-full animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> PENDING
                        </span>
                      )}
                    </TD>
                    <TD><StatusBadge status={p.status === "Operational" ? "Active" : p.status === "Limited" ? "Pending" : "Suspended"} /></TD>
                    <TD className="text-right"><Btn variant="secondary" onClick={() => setSelected(p)}>View</Btn></TD>
                  </TR>
                );
              })}
              {filtered.length === 0 && (
                <TR>
                  <TD colSpan={8} className="text-center text-muted-foreground py-8 font-mono">
                    No ports match these filters.
                  </TD>
                </TR>
              )}
            </tbody>
          </Table>
        )}
      </Panel>

      {/* Port Detail Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.flag} ${selected.name}` : ""}>
        {selected && (
          <div className="space-y-5">
            {/* Verification Alert Banner */}
            {!selected.verified && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex gap-3 text-xs">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400">Operational Verification Pending</strong>
                  <p className="text-muted-foreground mt-1">This gateway is newly added and must be audited and verified before domestic routes or container yard transfers are unlocked.</p>
                  <Btn size="sm" className="mt-3 bg-amber-500 text-black hover:bg-amber-600 gap-1 text-[10px] h-7 px-2" onClick={() => handleVerifyPort(selected.id)}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Verify & Authorize Gateway
                  </Btn>
                </div>
              </div>
            )}

            {selected.verified && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-center gap-2.5 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Gateway Authorized & Active for All Logistics Shipments
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Meta k="Country" v={selected.country} />
              <Meta k="Type" v={selected.type} />
              <Meta k="Regional Scope" v={selected.scope} />
              <Meta k="Status" v={selected.status} />
              <Meta k="Operator" v={selected.operator} className="col-span-2" />
              <Meta k="Compliance Log" v={selected.notes} className="col-span-2 text-xs font-mono bg-black/25 text-muted-foreground" />
            </div>

            <section>
              <SectionTitle icon={UsersIcon}>Assigned Agents</SectionTitle>
              {selected.agents.length > 0 ? (
                <ul className="space-y-1.5">
                  {selected.agents.map((a) => (
                    <li key={a} className="flex items-center justify-between bg-[var(--surface-2)] border border-border rounded-md px-3 py-2">
                      <span className="text-sm">{a}</span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">Port Agent</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground bg-[var(--surface-2)] p-3 border border-border rounded-md text-center">
                  No agents explicitly assigned to this port yet.
                </div>
              )}
            </section>

            <section>
              <SectionTitle icon={Package}>Active shipments at gateway ({selected.activeShipments})</SectionTitle>
              {selected.activeShipments > 0 ? (
                <ul className="space-y-1.5">
                  {Array.from({ length: Math.min(4, selected.activeShipments) }).map((_, i) => (
                    <li key={i} className="flex items-center justify-between bg-[var(--surface-2)] border border-border rounded-md px-3 py-2 text-sm">
                      <span className="font-mono text-xs">BK-{20418 + i + selected.activeShipments % 30}</span>
                      <span className="text-muted-foreground text-xs">{["Loading", "Discharging", "Awaiting customs", "Ready for dispatch"][i % 4]}</span>
                      <StatusBadge status={["In Transit", "Loaded", "Pending", "Active"][i % 4]} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground bg-[var(--surface-2)] p-3 border border-border rounded-md text-center">
                  No shipments active at this gateway.
                </div>
              )}
            </section>

            <div className="flex gap-2 pt-2 border-t border-border mt-4">
              <Btn variant="secondary" onClick={() => toast.success("Agent allocation dispatch pending")}>Assign Agent</Btn>
              <Btn onClick={() => toast.success("Operational status updated")}>Force Refresh</Btn>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Port Modal */}
      <Modal
        open={addPortOpen}
        onClose={() => setAddPortOpen(false)}
        title="Add New Port or Terminal Gateway"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAddPortOpen(false)}>Cancel</Btn>
            <Btn onClick={handleAddPort}>Create Port & Submit for Verification</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Port Name">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="e.g. Dammam Sea Terminal" 
              className="w-full"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Country">
              <Select value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="w-full">
                {Object.keys(countries).map(c => (
                  <option key={c} value={c}>{countries[c].flag} {c}</option>
                ))}
              </Select>
            </Field>

            <Field label="Gateway Type">
              <Select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full">
                <option value="SEAPORT">SEAPORT</option>
                <option value="AIRPORT">AIRPORT</option>
                <option value="TRAIN STATION">TRAIN STATION</option>
                <option value="LAND PORT">LAND PORT</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Regional Scope">
              <Select value={newScope} onChange={(e) => setNewScope(e.target.value as any)} className="w-full">
                <option value="International">International Gateway</option>
                <option value="Domestic">Domestic Gateway</option>
              </Select>
            </Field>

            <Field label="Operating Authority">
              <Input 
                value={newOperator} 
                onChange={(e) => setNewOperator(e.target.value)} 
                placeholder="e.g. Mawani Saudi Port Authority" 
                className="w-full"
              />
            </Field>
          </div>

          <Field label="Verification Notes / Background Details">
            <Input 
              value={newNotes} 
              onChange={(e) => setNewNotes(e.target.value)} 
              placeholder="Provide background references or compliance status details..." 
              className="w-full"
            />
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-[var(--surface-1)] border rounded-lg p-4 transition-colors ${
      highlight ? "border-amber-500/40 bg-amber-500/5 animate-pulse" : "border-border"
    }`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${highlight ? "text-amber-400" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Meta({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className={`bg-[var(--surface-2)] border border-border rounded-md p-3 ${className}`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold mt-1 break-words">{v}</div>
    </div>
  );
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <h4 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 mt-4">
      {Icon && <Icon className="h-3.5 w-3.5" />} {children}
    </h4>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" }) {
  const cls = tone === "good" ? "text-[var(--accent-lime)]" : tone === "warn" ? "text-[var(--warning)]" : "";
  return (
    <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}