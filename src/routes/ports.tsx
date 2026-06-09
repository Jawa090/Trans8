import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Table, THead, TH, TR, TD, Input, Select, Drawer } from "@/components/admin/ui";
import { Anchor, Plane, Train as TrainIcon, Truck, Users as UsersIcon, Package } from "lucide-react";
import { toast } from "sonner";

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
}

const RAW: Array<Omit<Port, "id" | "agents" | "activeShipments" | "status" | "customsPending" | "customsCleared" | "loading" | "discharge">> = [
  // UAE 🇦🇪
  { name: "Jebel Ali",        country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Sharjah",          country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Abu Dhabi",        country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Fujairah",         country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "Ras Al Khaimah",   country: "UAE", flag: "🇦🇪", type: "SEAPORT" },
  { name: "DXB",              country: "UAE", flag: "🇦🇪", type: "AIRPORT" },
  { name: "AUH",              country: "UAE", flag: "🇦🇪", type: "AIRPORT" },
  { name: "SHJ",              country: "UAE", flag: "🇦🇪", type: "AIRPORT" },
  { name: "DWC",              country: "UAE", flag: "🇦🇪", type: "AIRPORT" },
  { name: "Etihad Rail",      country: "UAE", flag: "🇦🇪", type: "TRAIN STATION" },
  { name: "Hatta",            country: "UAE", flag: "🇦🇪", type: "LAND PORT" },
  { name: "Al Ghuwaifat",     country: "UAE", flag: "🇦🇪", type: "LAND PORT" },
  { name: "Mezyad",           country: "UAE", flag: "🇦🇪", type: "LAND PORT" },

  // Pakistan 🇵🇰
  { name: "Karachi",          country: "Pakistan", flag: "🇵🇰", type: "SEAPORT" },
  { name: "Port Qasim",       country: "Pakistan", flag: "🇵🇰", type: "SEAPORT" },
  { name: "Gwadar",           country: "Pakistan", flag: "🇵🇰", type: "SEAPORT" },
  { name: "KHI",              country: "Pakistan", flag: "🇵🇰", type: "AIRPORT" },
  { name: "LHE",              country: "Pakistan", flag: "🇵🇰", type: "AIRPORT" },
  { name: "ISB",              country: "Pakistan", flag: "🇵🇰", type: "AIRPORT" },
  { name: "Karachi Station",  country: "Pakistan", flag: "🇵🇰", type: "TRAIN STATION" },
  { name: "Lahore Station",   country: "Pakistan", flag: "🇵🇰", type: "TRAIN STATION" },
  { name: "Rimdan",           country: "Pakistan", flag: "🇵🇰", type: "LAND PORT" },
  { name: "Tafatan",          country: "Pakistan", flag: "🇵🇰", type: "LAND PORT" },
  { name: "Wagah",            country: "Pakistan", flag: "🇵🇰", type: "LAND PORT" },
  { name: "Torkham",          country: "Pakistan", flag: "🇵🇰", type: "LAND PORT" },

  // Iran 🇮🇷
  { name: "Bandar Abbas",      country: "Iran", flag: "🇮🇷", type: "SEAPORT" },
  { name: "Chabahar",          country: "Iran", flag: "🇮🇷", type: "SEAPORT" },
  { name: "Bushehr",           country: "Iran", flag: "🇮🇷", type: "SEAPORT" },
  { name: "Bandar Imam",       country: "Iran", flag: "🇮🇷", type: "SEAPORT" },
  { name: "IKA Tehran",        country: "Iran", flag: "🇮🇷", type: "AIRPORT" },
  { name: "Mashhad",           country: "Iran", flag: "🇮🇷", type: "AIRPORT" },
  { name: "Shiraz",            country: "Iran", flag: "🇮🇷", type: "AIRPORT" },
  { name: "Tehran Station",    country: "Iran", flag: "🇮🇷", type: "TRAIN STATION" },
  { name: "Mashhad Station",   country: "Iran", flag: "🇮🇷", type: "TRAIN STATION" },
  { name: "Dogharoun",         country: "Iran", flag: "🇮🇷", type: "LAND PORT" },
  { name: "Milak",             country: "Iran", flag: "🇮🇷", type: "LAND PORT" },
  { name: "Bazargan",          country: "Iran", flag: "🇮🇷", type: "LAND PORT" },
  { name: "Mirjaveh",          country: "Iran", flag: "🇮🇷", type: "LAND PORT" },

  // South Africa 🇿🇦
  { name: "Durban",            country: "South Africa", flag: "🇿🇦", type: "SEAPORT" },
  { name: "Cape Town",         country: "South Africa", flag: "🇿🇦", type: "SEAPORT" },
  { name: "Port Elizabeth",    country: "South Africa", flag: "🇿🇦", type: "SEAPORT" },
  { name: "Richards Bay",      country: "South Africa", flag: "🇿🇦", type: "SEAPORT" },
  { name: "JNB",               country: "South Africa", flag: "🇿🇦", type: "AIRPORT" },
  { name: "CPT",               country: "South Africa", flag: "🇿🇦", type: "AIRPORT" },
  { name: "DUR",               country: "South Africa", flag: "🇿🇦", type: "AIRPORT" },
  { name: "Johannesburg",      country: "South Africa", flag: "🇿🇦", type: "TRAIN STATION" },
  { name: "Cape Town Station", country: "South Africa", flag: "🇿🇦", type: "TRAIN STATION" },
  { name: "Beit Bridge",       country: "South Africa", flag: "🇿🇦", type: "LAND PORT" },
  { name: "Lebombo",           country: "South Africa", flag: "🇿🇦", type: "LAND PORT" },
  { name: "Oshoek",            country: "South Africa", flag: "🇿🇦", type: "LAND PORT" },

  // Turkey 🇹🇷
  { name: "Istanbul",          country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "Mersin",            country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "Izmir",             country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "Trabzon",           country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "Iskenderun",        country: "Turkey", flag: "🇹🇷", type: "SEAPORT" },
  { name: "IST",               country: "Turkey", flag: "🇹🇷", type: "AIRPORT" },
  { name: "ESB",               country: "Turkey", flag: "🇹🇷", type: "AIRPORT" },
  { name: "ADB",               country: "Turkey", flag: "🇹🇷", type: "AIRPORT" },
  { name: "Haydarpasa",        country: "Turkey", flag: "🇹🇷", type: "TRAIN STATION" },
  { name: "Ankara Central",    country: "Turkey", flag: "🇹🇷", type: "TRAIN STATION" },
  { name: "Kapikule",          country: "Turkey", flag: "🇹🇷", type: "LAND PORT" },
  { name: "Habur",             country: "Turkey", flag: "🇹🇷", type: "LAND PORT" },
  { name: "Dogukapi",          country: "Turkey", flag: "🇹🇷", type: "LAND PORT" },

  // India 🇮🇳
  { name: "JNPT Mumbai",       country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "Chennai",           country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "Mundra",            country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "Kolkata",           country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "Cochin",            country: "India", flag: "🇮🇳", type: "SEAPORT" },
  { name: "BOM",               country: "India", flag: "🇮🇳", type: "AIRPORT" },
  { name: "DEL",               country: "India", flag: "🇮🇳", type: "AIRPORT" },
  { name: "MAA",               country: "India", flag: "🇮🇳", type: "AIRPORT" },
  { name: "CCU",               country: "India", flag: "🇮🇳", type: "AIRPORT" },
  { name: "Mumbai Central",    country: "India", flag: "🇮🇳", type: "TRAIN STATION" },
  { name: "Delhi Junction",    country: "India", flag: "🇮🇳", type: "TRAIN STATION" },
  { name: "Chennai Central",   country: "India", flag: "🇮🇳", type: "TRAIN STATION" },
  { name: "Attari Wagah",      country: "India", flag: "🇮🇳", type: "LAND PORT" },
  { name: "Petrapole",         country: "India", flag: "🇮🇳", type: "LAND PORT" },
  { name: "Raxaul",            country: "India", flag: "🇮🇳", type: "LAND PORT" },
];

const AGENTS = ["Layla Hosseini", "Amir Rahimi", "Omar Al-Saud", "Hassan Khan", "Sara Petrov", "Reza Karimi", "Nadia Mansouri", "Mehmet Yilmaz", "Fatima Aydin", "Yusuf Karimi", "Ivan Volkov", "Zara Botha"];
const STATUSES: PortStatus[] = ["Operational", "Operational", "Operational", "Operational", "Limited", "Limited", "Closed"];
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

const PORTS: Port[] = RAW.map((r, i) => {
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

function PortsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"ALL" | PortType>("ALL");
  const [status, setStatus] = useState<"all" | PortStatus>("all");
  const [selected, setSelected] = useState<Port | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");

  const filtered = useMemo(() => PORTS.filter((p) =>
    (type === "ALL" || p.type === type) &&
    (status === "all" || p.status === status) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.country.toLowerCase().includes(q.toLowerCase()))
  ), [q, type, status]);

  const stats = useMemo(() => ({
    total: PORTS.length,
    operational: PORTS.filter((p) => p.status === "Operational").length,
    shipments: PORTS.reduce((s, p) => s + p.activeShipments, 0),
    agents: new Set(PORTS.flatMap((p) => p.agents)).size,
  }), []);

  const counts = useMemo(() => ({
    "ALL": PORTS.length,
    "SEAPORT": PORTS.filter((p) => p.type === "SEAPORT").length,
    "AIRPORT": PORTS.filter((p) => p.type === "AIRPORT").length,
    "TRAIN STATION": PORTS.filter((p) => p.type === "TRAIN STATION").length,
    "LAND PORT": PORTS.filter((p) => p.type === "LAND PORT").length,
  }), []);

  return (
    <AdminLayout>
      <PageHeader
        title="Ports Directory"
        subtitle="Global port network · agents, shipments and customs at every gateway"
        actions={<Btn onClick={() => toast.success("New port form opened (demo)")}>+ Add Port</Btn>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI label="Total ports" value={String(stats.total)} />
        <KPI label="Operational" value={String(stats.operational)} />
        <KPI label="Active shipments" value={stats.shipments.toLocaleString()} />
        <KPI label="Assigned agents" value={String(stats.agents)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = type === f;
          const Icon = f === "ALL" ? null : TYPE_ICON[f];
          const count = counts[f];
          const label = f;
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
              {label}
              <span className={`ml-1 px-1.5 py-0.5 rounded ${active ? "bg-black/20" : "bg-[var(--surface-2)]"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <Panel
        title={`Ports directory · ${filtered.length}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search port / country…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={status} onChange={(e) => setStatus(e.target.value as "all" | PortStatus)}>
              <option value="all">All status</option><option>Operational</option><option>Limited</option><option>Closed</option>
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
                  className="text-left bg-[var(--surface-1)] border border-border hover:border-primary/60 rounded-lg p-4 transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-md bg-[var(--surface-2)] border border-border grid place-items-center ${TYPE_TONE[p.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <StatusBadge status={p.status === "Operational" ? "Active" : p.status === "Limited" ? "Pending" : "Suspended"} />
                  </div>
                  <div className="font-semibold leading-tight group-hover:text-primary">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <span className="mr-1.5">{p.flag}</span>{p.country} · {p.type}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">Agents</div>
                      <div className="font-mono text-sm font-bold">{p.agents.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">Shipments</div>
                      <div className="font-mono text-sm font-bold">{p.activeShipments}</div>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">No ports match these filters.</div>
            )}
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Port</TH><TH>Country</TH><TH>Type</TH>
                <TH className="text-right">Agents</TH>
                <TH className="text-right">Active shipments</TH>
                <TH>Status</TH><TH className="text-right">Action</TH>
              </tr>
            </THead>
            <tbody>
              {filtered.map((p) => {
                const Icon = TYPE_ICON[p.type];
                return (
                  <TR key={p.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-md bg-[var(--surface-2)] border border-border grid place-items-center ${TYPE_TONE[p.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{p.id}</div>
                        </div>
                      </div>
                    </TD>
                    <TD><span className="mr-2">{p.flag}</span>{p.country}</TD>
                    <TD>{p.type}</TD>
                    <TD className="text-right font-mono">{p.agents.length}</TD>
                    <TD className="text-right font-mono">{p.activeShipments}</TD>
                    <TD><StatusBadge status={p.status === "Operational" ? "Active" : p.status === "Limited" ? "Pending" : "Suspended"} /></TD>
                    <TD className="text-right"><Btn variant="secondary" onClick={() => setSelected(p)}>View</Btn></TD>
                  </TR>
                );
              })}
              {filtered.length === 0 && (
                <TR><TD className="text-center text-muted-foreground py-8">No ports match these filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /></TR>
              )}
            </tbody>
          </Table>
        )}
      </Panel>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.flag} ${selected.name}` : ""}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Meta k="Country" v={selected.country} />
              <Meta k="Type" v={selected.type} />
              <Meta k="Status" v={selected.status} />
              <Meta k="Active shipments" v={String(selected.activeShipments)} />
            </div>

            <section>
              <SectionTitle icon={UsersIcon}>Assigned agents</SectionTitle>
              <ul className="space-y-1.5">
                {selected.agents.map((a) => (
                  <li key={a} className="flex items-center justify-between bg-[var(--surface-2)] border border-border rounded-md px-3 py-2">
                    <span className="text-sm">{a}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Active</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionTitle icon={Package}>Active shipments at port</SectionTitle>
              <ul className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center justify-between bg-[var(--surface-2)] border border-border rounded-md px-3 py-2 text-sm">
                    <span className="font-mono text-xs">BK-{20418 + i + selected.activeShipments % 30}</span>
                    <span className="text-muted-foreground text-xs">{["Loading", "Discharging", "Awaiting customs", "Ready for dispatch"][i]}</span>
                    <StatusBadge status={["In Transit", "Loaded", "Pending", "Active"][i]} />
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionTitle>Customs clearance queue</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Pending" value={selected.customsPending} tone="warn" />
                <Stat label="Cleared" value={selected.customsCleared} tone="good" />
              </div>
            </section>

            <section>
              <SectionTitle>Loading & discharge</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Loading" value={selected.loading} />
                <Stat label="Discharge" value={selected.discharge} />
              </div>
            </section>

            <div className="flex gap-2 pt-2">
              <Btn variant="secondary" onClick={() => toast.success("Agent assignment opened (demo)")}>Assign agent</Btn>
              <Btn onClick={() => toast.success("Status updated")}>Update status</Btn>
            </div>
          </div>
        )}
      </Drawer>
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
function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-sm font-medium mt-1">{v}</div>
    </div>
  );
}
function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <h4 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
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