import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Btn, Modal, Field, Input, Select } from "@/components/admin/ui";
import { Truck, Ship, Plane, Train, Search } from "lucide-react";

export const Route = createFileRoute("/fleet/vehicles")({
  head: () => ({ meta: [{ title: "Fleet Management — Movers Admin" }] }),
  component: VehiclesPage,
});

interface Transporter {
  id: string;
  category: "Land" | "Sea" | "Air" | "Rail";
  type: string;
  identifier: string; // Plate / IMO / Tail # / Loco ID
  ownerOrOperator: string; // Owner / Line / Carrier / Operator
  capacity: string;
  status: "Idle" | "On Trip" | "Maintenance";
  lastTrip: string;
}

const INITIAL_TRANSPORTERS: Transporter[] = [
  // Land Fleet
  { id: "LND-101", category: "Land", type: "40ft Container Trailer", identifier: "DXB-88392", ownerOrOperator: "Al Faris Logistics", capacity: "28 t", status: "On Trip", lastTrip: "Jebel Ali Port → Al Ain" },
  { id: "LND-102", category: "Land", type: "Refrigerated Trailer", identifier: "THR-11904", ownerOrOperator: "Karimi Transport", capacity: "20 t", status: "Idle", lastTrip: "Bandar Abbas Port → Tehran" },
  { id: "LND-103", category: "Land", type: "Heavy Flatbed", identifier: "KHI-47201", ownerOrOperator: "Khan Trucking Ltd", capacity: "45 t", status: "Maintenance", lastTrip: "Port Qasim → Lahore" },
  { id: "LND-104", category: "Land", type: "Tipper Truck", identifier: "IST-29402", ownerOrOperator: "Yilmaz Hafriyat", capacity: "18 t", status: "Idle", lastTrip: "Istanbul Port → Bursa" },
  { id: "LND-105", category: "Land", type: "Chemical Tanker", identifier: "JNB-99081", ownerOrOperator: "Sasol Carriers", capacity: "30,000 L", status: "On Trip", lastTrip: "Durban Port → Johannesburg" },
  // Sea Fleet
  { id: "SEA-201", category: "Sea", type: "Container Vessel (15k TEU)", identifier: "IMO 9823910", ownerOrOperator: "Maersk Line", capacity: "154,000 t", status: "On Trip", lastTrip: "Jebel Ali Port → Port of Karachi" },
  { id: "SEA-202", category: "Sea", type: "LNG Cargo Carrier", identifier: "IMO 9741029", ownerOrOperator: "Qatar Gas Transport", capacity: "120,000 t", status: "Idle", lastTrip: "Fujairah Port → Shanghai" },
  { id: "SEA-203", category: "Sea", type: "Bulk Cargo Liner", identifier: "IMO 9631902", ownerOrOperator: "MSC Shipping", capacity: "95,000 t", status: "Maintenance", lastTrip: "Port of Durban → Rotterdam" },
  { id: "SEA-204", category: "Sea", type: "Ro-Ro Vehicle Ship", identifier: "IMO 9520019", ownerOrOperator: "NYK Line", capacity: "65,000 t", status: "On Trip", lastTrip: "Mundra Port → Jebel Ali Port" },
  // Air Fleet
  { id: "AIR-301", category: "Air", type: "Boeing 747-8F Cargo", identifier: "N747F-UA", ownerOrOperator: "Emirates SkyCargo", capacity: "134 t", status: "On Trip", lastTrip: "DXB Airport → LHE Airport" },
  { id: "AIR-302", category: "Air", type: "Airbus A330-200F", identifier: "A330-DH", ownerOrOperator: "DHL Express", capacity: "70 t", status: "Idle", lastTrip: "IKA Airport → IST Airport" },
  { id: "AIR-303", category: "Air", type: "Boeing 777F Freighter", identifier: "N777F-FE", ownerOrOperator: "FedEx Express", capacity: "102 t", status: "On Trip", lastTrip: "JNB Airport → DXB Airport" },
  { id: "AIR-304", category: "Air", type: "Antonov An-124", identifier: "UR-82060", ownerOrOperator: "Volga-Dnepr Airlines", capacity: "150 t", status: "Maintenance", lastTrip: "DEL Airport → IST Airport" },
  // Rail Fleet
  { id: "RAI-401", category: "Rail", type: "Electric Locomotive", identifier: "LOCO-9021", ownerOrOperator: "Etihad Rail", capacity: "4,500 t", status: "On Trip", lastTrip: "Ghuwaifat Station → Jebel Ali" },
  { id: "RAI-402", category: "Rail", type: "Diesel-Electric Cargo Train", identifier: "LOCO-7703", ownerOrOperator: "Pakistan Railways", capacity: "3,200 t", status: "Idle", lastTrip: "Karachi Station → Lahore Station" },
  { id: "RAI-403", category: "Rail", type: "Heavy Cargo Loco", identifier: "LOCO-8802", ownerOrOperator: "Islamic Republic Railways", capacity: "3,800 t", status: "On Trip", lastTrip: "Bandar Abbas Station → Tehran" },
  { id: "RAI-404", category: "Rail", type: "Freight Train Series-C", identifier: "LOCO-6610", ownerOrOperator: "Transnet Freight Rail", capacity: "4,000 t", status: "Maintenance", lastTrip: "Durban Station → Johannesburg" }
];

function VehiclesPage() {
  const [list, setList] = useState<Transporter[]>(INITIAL_TRANSPORTERS);
  const [activeTab, setActiveTab] = useState<Transporter["category"]>("Land");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);

  // Form draft customized dynamically per category
  const [draft, setDraft] = useState({
    type: "",
    identifier: "",
    ownerOrOperator: "",
    capacity: "",
    status: "Idle" as const
  });

  const tabs: { key: Transporter["category"]; label: string; icon: any }[] = [
    { key: "Land", label: "Land Fleet", icon: Truck },
    { key: "Sea", label: "Sea Fleet", icon: Ship },
    { key: "Air", label: "Air Fleet", icon: Plane },
    { key: "Rail", label: "Rail Fleet", icon: Train }
  ];

  const filtered = useMemo(() => {
    return list.filter((v) => {
      if (v.category !== activeTab) return false;
      if (status && v.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          v.type.toLowerCase().includes(s) ||
          v.identifier.toLowerCase().includes(s) ||
          v.ownerOrOperator.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [list, activeTab, q, status]);

  const handleOpenAdd = () => {
    // Set type placeholder and labels based on active tab
    const defaults = {
      Land: { type: "Box Truck", identifier: "DXB-1039", ownerOrOperator: "Al Faris Logistics", capacity: "12 t" },
      Sea: { type: "Container Cargo Vessel", identifier: "IMO 9210492", ownerOrOperator: "Maersk Line", capacity: "120,000 t" },
      Air: { type: "Boeing 747-8F Cargo", identifier: "N294-DH", ownerOrOperator: "DHL Aviation", capacity: "130 t" },
      Rail: { type: "Heavy Cargo Locomotive", identifier: "LOCO-8839", ownerOrOperator: "Etihad Rail", capacity: "4,000 t" }
    };
    const def = defaults[activeTab];
    setDraft({
      type: def.type,
      identifier: "",
      ownerOrOperator: "",
      capacity: def.capacity,
      status: "Idle"
    });
    setAdding(true);
  };

  const handleAdd = () => {
    if (!draft.type.trim() || !draft.identifier.trim() || !draft.ownerOrOperator.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newTransporter: Transporter = {
      id: `${activeTab.substring(0, 3).toUpperCase()}-${100 + list.length + 1}`,
      category: activeTab,
      type: draft.type,
      identifier: draft.identifier,
      ownerOrOperator: draft.ownerOrOperator,
      capacity: draft.capacity || "N/A",
      status: draft.status,
      lastTrip: "—"
    };
    setList([newTransporter, ...list]);
    toast.success(`${activeTab} transporter registered: ${draft.identifier}`);
    setAdding(false);
  };

  // Get labels dynamically based on category
  const identifierLabel = activeTab === "Land" ? "License Plate"
    : activeTab === "Sea" ? "IMO Vessel Number"
    : activeTab === "Air" ? "Tail / Registration #"
    : "Engine / Loco ID";

  const ownerLabel = activeTab === "Land" ? "Owner Company"
    : activeTab === "Sea" ? "Shipping Line Operator"
    : activeTab === "Air" ? "Air Cargo Carrier"
    : "Rail Freight Operator";

  const ActiveIcon = tabs.find(t => t.key === activeTab)?.icon || Truck;

  return (
    <AdminLayout>
      <PageHeader
        title="Fleet Management"
        subtitle={`Admin portal for global transport assets: ${list.length} units registered`}
        actions={<Btn onClick={handleOpenAdd}>+ Register {activeTab} Unit</Btn>}
      />

      {/* Fleet Sub-navigation tabs */}
      <div className="flex border-b border-border/80 mb-6 bg-[var(--surface-1)] p-1 rounded-lg max-w-lg">
        {tabs.map((t) => {
          const TabIcon = t.icon;
          const count = list.filter(item => item.category === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setQ("");
                setStatus("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
              }`}
            >
              <TabIcon className="h-4 w-4" />
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-[var(--surface-3)] text-muted-foreground"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase()} fleet by model, registration, operator…`}
            className="w-full pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Active</option>
          <option>Idle</option>
          <option>On Trip</option>
          <option>Maintenance</option>
        </Select>
      </div>

      {/* Transporter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((v) => (
          <Panel key={v.id}>
            <div className="h-32 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)] border-b border-border grid place-items-center relative overflow-hidden">
              <ActiveIcon className="h-14 w-14 text-primary/30" />
              <div className="absolute top-2 right-2"><StatusBadge status={v.status} /></div>
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-muted-foreground bg-[var(--surface-1)] px-1.5 py-0.5 rounded border border-border">{v.id}</div>
            </div>
            <div className="font-display font-bold uppercase truncate">{v.type}</div>
            <div className="font-mono text-xs text-primary mt-0.5">{v.identifier}</div>

            <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{ownerLabel}</span>
                <span className="font-medium truncate max-w-[60%]">{v.ownerOrOperator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-mono">{v.capacity}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Last Route</span>
                <span className="text-right truncate max-w-[60%] font-medium text-muted-foreground">{v.lastTrip}</span>
              </div>
            </div>

            <div className="flex gap-1 mt-4">
              <Btn
                variant="secondary"
                className="h-7 px-2 text-xs flex-1"
                onClick={() => {
                  const statuses: Transporter["status"][] = ["Idle", "On Trip", "Maintenance"];
                  const cur = statuses.indexOf(v.status);
                  const next = statuses[(cur + 1) % statuses.length];
                  setList(list.map((x) => x.id === v.id ? { ...x, status: next } : x));
                  toast.success(`${v.identifier} set to ${next}`);
                }}
              >
                Change Status
              </Btn>
              <Btn
                variant="danger"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setList(list.filter((x) => x.id !== v.id));
                  toast.success(`Deregistered ${v.identifier}`);
                }}
              >
                Remove
              </Btn>
            </div>
          </Panel>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No {activeTab.toLowerCase()} assets found matching the query.
          </div>
        )}
      </div>

      {/* Add Transporter Modal */}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={`Register New ${activeTab} Transporter`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Register Transporter</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Model / Type">
            <Input
              className="w-full"
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              placeholder={activeTab === "Land" ? "e.g. 40ft Reefer Trailer" : "e.g. Boeing 747-8F"}
            />
          </Field>
          <Field label={identifierLabel}>
            <Input
              className="w-full font-mono"
              value={draft.identifier}
              onChange={(e) => setDraft({ ...draft, identifier: e.target.value })}
              placeholder={activeTab === "Land" ? "DXB-99214" : activeTab === "Sea" ? "IMO 9902341" : "Tail # / ID"}
            />
          </Field>
          <Field label={ownerLabel}>
            <Input
              className="w-full"
              value={draft.ownerOrOperator}
              onChange={(e) => setDraft({ ...draft, ownerOrOperator: e.target.value })}
              placeholder="e.g. Maersk, DHL Express, Etihad Rail"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity">
              <Input
                className="w-full font-mono"
                value={draft.capacity}
                onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
                placeholder="e.g. 130 t"
              />
            </Field>
            <Field label="Initial Status">
              <Select
                className="w-full"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as any })}
              >
                <option>Idle</option>
                <option>On Trip</option>
                <option>Maintenance</option>
              </Select>
            </Field>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}