import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Table, THead, TH, TR, TD, Tabs, Input, Select, Drawer, Btn, Panel, Field, Modal } from "@/components/admin/ui";
import { Search, Container, ArrowRight, Package, MapPin, Navigation, Edit, RefreshCw, Compass, Plus, Globe } from "lucide-react";
import { useCountries } from "@/lib/countries-store";

export const Route = createFileRoute("/fleet/containers")({
  head: () => ({ meta: [{ title: "Containers — Movers Admin" }] }),
  component: ContainersPage,
});

interface ShipmentInside {
  id: string;
  customer: string;
  cargo: string;
  weight: string;
  destination: string;
  status: string;
}

interface ContainerHistoryEvent {
  time: string;
  event: string;
  location: string;
}

interface ContainerUnit {
  id: string;
  type: "20ft" | "40ft";
  status: "At Port" | "Loaded" | "In Transit" | "Delivered";
  load: string;
  port: string;
  owner: string;
  mode: "FCL" | "LCL";
  shipments: ShipmentInside[];
  yardLocation?: string;
  trackerHistory?: ContainerHistoryEvent[];
}

const INITIAL_CONTAINERS: ContainerUnit[] = [
  {
    id: "MSCU-8839201",
    type: "40ft",
    status: "Loaded",
    load: "26.5 t",
    port: "Jebel Ali Port",
    owner: "MSC Shipping",
    mode: "FCL",
    yardLocation: "Yard Section A-4 (Dubai Port)",
    shipments: [
      { id: "BK-20418", customer: "Aurora Trading", cargo: "Heavy Machinery Parts", weight: "26.5 t", destination: "Port of Karachi", status: "Confirmed" }
    ],
    trackerHistory: [
      { time: "2026-07-08 09:30", event: "FCA Booking Confirmed (Empty Container)", location: "Jebel Ali Port" },
      { time: "2026-07-08 11:15", event: "Container Yard Received", location: "Yard Section A-4 (Dubai Port)" },
      { time: "2026-07-08 14:00", event: "Stuffed and Loaded with Cargo", location: "Jebel Ali Port" }
    ]
  },
  {
    id: "MSCU-1192840",
    type: "20ft",
    status: "At Port",
    load: "18.2 t",
    port: "Port of Karachi",
    owner: "Maersk Line",
    mode: "LCL",
    yardLocation: "Warehouse Terminal Yard 2",
    shipments: [
      { id: "BK-20419", customer: "Zahid & Sons", cargo: "Textiles & Cotton", weight: "6.2 t", destination: "Jebel Ali Port", status: "Pending" },
      { id: "BK-20420", customer: "Pak Foods Corp", cargo: "Himalayan Pink Salt", weight: "12.0 t", destination: "Jebel Ali Port", status: "Pending" }
    ],
    trackerHistory: [
      { time: "2026-07-07 10:00", event: "FCA Booking Confirmed (Empty Container)", location: "Port of Karachi" },
      { time: "2026-07-07 12:30", event: "Positioned in Container Yard", location: "Warehouse Terminal Yard 2" },
      { time: "2026-07-08 08:45", event: "LCL Consolidations Packed", location: "Port of Karachi" }
    ]
  },
  {
    id: "MSCU-9023481",
    type: "40ft",
    status: "In Transit",
    load: "28.0 t",
    port: "Bandar Abbas Port",
    owner: "Evergreen",
    mode: "LCL",
    yardLocation: "Transit Yard Area B",
    shipments: [
      { id: "BK-20421", customer: "Persian Carpets Co", cargo: "Handwoven Silk Rugs", weight: "5.5 t", destination: "Port of Istanbul", status: "In Transit" },
      { id: "BK-20422", customer: "Shiraz Fruit Exporters", cargo: "Dried Dates & Figs", weight: "10.5 t", destination: "Port of Istanbul", status: "In Transit" },
      { id: "BK-20423", customer: "Tehran Polychem", cargo: "Raw Plastic Granules", weight: "12.0 t", destination: "Port of Istanbul", status: "In Transit" }
    ],
    trackerHistory: [
      { time: "2026-07-05 14:00", event: "FCA Booking Confirmed", location: "Bandar Abbas Port" },
      { time: "2026-07-06 09:00", event: "Received at Domestic Yard Location", location: "Transit Yard Area B" },
      { time: "2026-07-06 17:30", event: "Customs Inspection Complete", location: "Bandar Abbas Port" },
      { time: "2026-07-07 12:00", event: "Loaded on Vessel & In Transit", location: "Persian Gulf Transit" }
    ]
  },
  {
    id: "MSCU-7740294",
    type: "20ft",
    status: "Delivered",
    load: "14.5 t",
    port: "Durban Port",
    owner: "COSCO Shipping",
    mode: "FCL",
    yardLocation: "Delivered to Warehouse Hub",
    shipments: [
      { id: "BK-20424", customer: "Johannesburg Metals", cargo: "Copper Cathodes", weight: "14.5 t", destination: "Durban Port", status: "Delivered" }
    ],
    trackerHistory: [
      { time: "2026-07-01 11:00", event: "FCA Booking Confirmed (Empty)", location: "Durban Port" },
      { time: "2026-07-02 10:00", event: "Container Loaded", location: "Durban Port" },
      { time: "2026-07-06 16:30", event: "Arrived at Durban Terminal", location: "Durban Port" },
      { time: "2026-07-07 15:45", event: "Delivered to consignee warehouse yard", location: "Delivered to Warehouse Hub" }
    ]
  },
  {
    id: "MSCU-6629402",
    type: "40ft",
    status: "At Port",
    load: "22.8 t",
    port: "Mundra Port",
    owner: "Hapag-Lloyd",
    mode: "LCL",
    yardLocation: "Mundra Port Yard 4",
    shipments: [
      { id: "BK-20425", customer: "Mumbai Electronics", cargo: "Circuit Boards & Chips", weight: "8.8 t", destination: "Durban Port", status: "Pending" },
      { id: "BK-20426", customer: "Delhi Garments", cargo: "Cotton Apparels", weight: "14.0 t", destination: "Durban Port", status: "Pending" }
    ],
    trackerHistory: [
      { time: "2026-07-06 08:00", event: "FCA Booking Confirmed", location: "Mundra Port" },
      { time: "2026-07-06 14:00", event: "Yard Received & Positioned", location: "Mundra Port Yard 4" }
    ]
  }
];

// Simulated pending shipments that can be packed into a container
const PENDING_SHIPMENTS_TO_PACK: ShipmentInside[] = [
  { id: "BK-20501", customer: "Karan Exports", cargo: "Polyester Yarn", weight: "5.2 t", destination: "Durban Port", status: "Pending" },
  { id: "BK-20502", customer: "Indo Foods", cargo: "Basmati Rice Bags", weight: "9.0 t", destination: "Jebel Ali Port", status: "Pending" },
  { id: "BK-20503", customer: "Al-Nafees Trading", cargo: "Leather Jackets", weight: "3.5 t", destination: "Port of Istanbul", status: "Pending" },
  { id: "BK-20504", customer: "Gulf Tech Distributors", cargo: "Solar Inverter Units", weight: "11.0 t", destination: "Port of Karachi", status: "Pending" }
];

function ContainersPage() {
  const [list, setList] = useState<ContainerUnit[]>(INITIAL_CONTAINERS);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<ContainerUnit | null>(null);
  const [pendingToPack, setPendingToPack] = useState<ShipmentInside[]>(PENDING_SHIPMENTS_TO_PACK);
  const [packTargetId, setPackTargetId] = useState("");

  // Modal State for booking empty container
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newId, setNewId] = useState("");
  const [newType, setNewType] = useState<"20ft" | "40ft">("40ft");
  const [newMode, setNewMode] = useState<"FCL" | "LCL">("FCL");
  const [newPort, setNewPort] = useState("Jebel Ali Port");
  const [newOwner, setNewOwner] = useState("MSC Shipping");
  const [newYard, setNewYard] = useState("");

  // Drawer edit states
  const [yardInput, setYardInput] = useState("");
  const [editingYard, setEditingYard] = useState(false);
  const [switchPortSelect, setSwitchPortSelect] = useState("");

  const ALL_PORTS = [
    "Jebel Ali Port",
    "Port of Karachi",
    "Bandar Abbas Port",
    "Durban Port",
    "Mundra Port",
    "Port of Istanbul",
    "Sharjah Port",
    "Abu Dhabi Zayed Port",
    "Fujairah Seaport",
    "Port Qasim Container",
    "Gwadar Deepwater Port",
    "Bandar Abbas Gateway",
    "Chabahar Free Port",
    "Cape Town Port Authority",
    "Mersin Seaport Hub",
    "JNPT Nhava Sheva Mumbai"
  ];

  const handleSelectContainer = (c: ContainerUnit) => {
    setSelected(c);
    setYardInput(c.yardLocation || "");
    setEditingYard(false);
    setSwitchPortSelect(c.port);
  };

  const handleOpenAddModal = () => {
    const randId = `MSCU-${Math.floor(1000000 + Math.random() * 9000000)}`;
    setNewId(randId);
    setNewType("40ft");
    setNewMode("FCL");
    setNewPort("Jebel Ali Port");
    setNewOwner("MSC Shipping");
    setNewYard("Yard Section A-1");
    setAddModalOpen(true);
  };

  const handleAddContainer = () => {
    if (!newId.trim()) {
      toast.error("Container ID is required.");
      return;
    }
    const newUnit: ContainerUnit = {
      id: newId,
      type: newType,
      status: "At Port",
      load: "0.0 t",
      port: newPort,
      owner: newOwner,
      mode: newMode,
      shipments: [],
      yardLocation: newYard || "Gate 3 Terminal Yard",
      trackerHistory: [
        { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: "FCA Booking Confirmed (Empty Container)", location: newPort }
      ]
    };
    setList([newUnit, ...list]);
    setAddModalOpen(false);
    toast.success(`FCA Empty Container ${newId} booked successfully!`);
  };

  const handleUpdateYard = (containerId: string) => {
    if (!yardInput.trim()) {
      toast.error("Yard location cannot be empty");
      return;
    }
    setList(prev => prev.map(c => {
      if (c.id === containerId) {
        const newHistory = [
          ...(c.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Container Yard Location Updated: ${yardInput}`, location: c.port }
        ];
        return { ...c, yardLocation: yardInput, trackerHistory: newHistory };
      }
      return c;
    }));
    setSelected(prev => {
      if (!prev || prev.id !== containerId) return prev;
      return {
        ...prev,
        yardLocation: yardInput,
        trackerHistory: [
          ...(prev.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Container Yard Location Updated: ${yardInput}`, location: prev.port }
        ]
      };
    });
    setEditingYard(false);
    toast.success("Container Yard location updated under domestic port warehousing.");
  };

  const handleSwitchPort = (containerId: string, newPortName: string) => {
    if (!newPortName) return;
    setList(prev => prev.map(c => {
      if (c.id === containerId) {
        const newHistory = [
          ...(c.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Port Switched / Route Redirected`, location: newPortName }
        ];
        return {
          ...c,
          port: newPortName,
          trackerHistory: newHistory
        };
      }
      return c;
    }));
    setSelected(prev => {
      if (!prev || prev.id !== containerId) return prev;
      return {
        ...prev,
        port: newPortName,
        trackerHistory: [
          ...(prev.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Port Switched / Route Redirected`, location: newPortName }
        ]
      };
    });
    toast.success(`Container ${containerId} switched port to: ${newPortName}`);
  };

  const rows = useMemo(() => {
    return list.filter((c) => {
      if (tab !== "All" && c.mode !== tab) return false;
      if (status && c.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          c.id.toLowerCase().includes(s) ||
          c.port.toLowerCase().includes(s) ||
          c.owner.toLowerCase().includes(s) ||
          c.shipments.some((ship) => ship.id.toLowerCase().includes(s) || ship.customer.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }, [list, tab, q, status]);

  const handlePack = (containerId: string) => {
    if (!packTargetId) {
      toast.error("Please select a shipment to pack.");
      return;
    }
    const ship = pendingToPack.find(s => s.id === packTargetId);
    if (!ship) return;

    // Add to container's shipment list
    setList(prev => prev.map(c => {
      if (c.id === containerId) {
        // Enforce FCL constraint: only 1 shipment
        if (c.mode === "FCL" && c.shipments.length >= 1) {
          toast.error("FCL (Full Container Load) containers can only hold a single shipment.");
          return c;
        }
        const updatedShipments = [...c.shipments, { ...ship, status: "Confirmed" }];
        // Calculate new load weight
        const totalWeight = updatedShipments.reduce((acc, curr) => acc + parseFloat(curr.weight), 0);
        const newHistory = [
          ...(c.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Loaded Shipment ${ship.id} (${c.mode})`, location: c.port }
        ];
        return {
          ...c,
          shipments: updatedShipments,
          load: `${totalWeight.toFixed(1)} t`,
          status: "Loaded" as const,
          trackerHistory: newHistory
        };
      }
      return c;
    }));

    // Remove from pending pack list
    setPendingToPack(prev => prev.filter(s => s.id !== packTargetId));
    toast.success(`Shipment ${ship.id} packed into container ${containerId}`);

    // Update selected container details view
    setSelected(prev => {
      if (!prev || prev.id !== containerId) return prev;
      if (prev.mode === "FCL" && prev.shipments.length >= 1) return prev;
      const updated = [...prev.shipments, { ...ship, status: "Confirmed" }];
      const totalWeight = updated.reduce((acc, curr) => acc + parseFloat(curr.weight), 0);
      return {
        ...prev,
        shipments: updated,
        load: `${totalWeight.toFixed(1)} t`,
        status: "Loaded" as const,
        trackerHistory: [
          ...(prev.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Loaded Shipment ${ship.id} (${prev.mode})`, location: prev.port }
        ]
      };
    });

    setPackTargetId("");
  };

  const handleUnpack = (containerId: string, shipmentId: string) => {
    const container = list.find(c => c.id === containerId);
    if (!container) return;
    const targetShipment = container.shipments.find(s => s.id === shipmentId);
    if (!targetShipment) return;

    // Remove from container
    setList(prev => prev.map(c => {
      if (c.id === containerId) {
        const updated = c.shipments.filter(s => s.id !== shipmentId);
        const totalWeight = updated.reduce((acc, curr) => acc + parseFloat(curr.weight), 0);
        const newHistory = [
          ...(c.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Unpacked Shipment ${shipmentId}`, location: c.port }
        ];
        return {
          ...c,
          shipments: updated,
          load: `${totalWeight.toFixed(1)} t`,
          status: updated.length === 0 ? "At Port" : c.status,
          trackerHistory: newHistory
        };
      }
      return c;
    }));

    // Add back to pending pack list
    setPendingToPack(prev => [...prev, { ...targetShipment, status: "Pending" }]);
    toast.success(`Shipment ${shipmentId} unpacked from container ${containerId}`);

    // Update selected container details view
    setSelected(prev => {
      if (!prev || prev.id !== containerId) return prev;
      const updated = prev.shipments.filter(s => s.id !== shipmentId);
      const totalWeight = updated.reduce((acc, curr) => acc + parseFloat(curr.weight), 0);
      return {
        ...prev,
        shipments: updated,
        load: `${totalWeight.toFixed(1)} t`,
        status: updated.length === 0 ? "At Port" : prev.status,
        trackerHistory: [
          ...(prev.trackerHistory || []),
          { time: new Date().toISOString().replace("T", " ").substring(0, 16), event: `Unpacked Shipment ${shipmentId}`, location: prev.port }
        ]
      };
    });
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="Container Management" 
        subtitle="Track ocean container loading structures, pack mixed shipments, and manage consolidated LCL routes." 
        actions={
          <Btn onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4 mr-1" /> Book FCA Empty Container
          </Btn>
        }
      />
      
      {/* Container Mode Tabs */}
      <Tabs tabs={["All", "FCL", "LCL"]} active={tab} onChange={setTab} />

      {/* Filter panel */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Container ID, port, owner or packed shipment ID…" className="w-full pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option>At Port</option>
          <option>Loaded</option>
          <option>In Transit</option>
          <option>Delivered</option>
        </Select>
      </div>

      {/* Containers Table */}
      <Table>
        <THead>
          <TR>
            <TH>Container ID</TH>
            <TH>Type</TH>
            <TH>Consolidated Mode</TH>
            <TH>Shipments Packed Inside</TH>
            <TH>Current Load</TH>
            <TH>Tracking Port</TH>
            <TH>Yard Location</TH>
            <TH>Owner/Carrier</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <tbody>
          {rows.map((c) => (
            <TR key={c.id} className="cursor-pointer" onClick={() => handleSelectContainer(c)}>
              <TD className="font-mono text-xs text-primary font-bold">{c.id}</TD>
              <TD className="font-mono text-xs">{c.type}</TD>
              <TD>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${c.mode === "FCL" ? "bg-indigo-950/60 border-indigo-700 text-indigo-400" : "bg-emerald-950/60 border-emerald-700 text-emerald-400"}`}>
                  {c.mode}
                </span>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-1">
                  {c.shipments.map(s => (
                    <span key={s.id} className="text-[10px] bg-[var(--surface-3)] border border-border px-1.5 py-0.5 rounded font-mono text-foreground font-semibold">
                      {s.id}
                    </span>
                  ))}
                  {c.shipments.length === 0 && <span className="text-xs text-muted-foreground">Empty (FCA ready)</span>}
                </div>
              </TD>
              <TD className="font-mono text-xs font-semibold">{c.load}</TD>
              <TD className="text-xs">{c.port}</TD>
              <TD className="text-xs text-muted-foreground font-mono">{c.yardLocation || "—"}</TD>
              <TD className="text-xs text-muted-foreground">{c.owner}</TD>
              <TD><StatusBadge status={c.status} /></TD>
              <TD>
                <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleSelectContainer(c); }}>View & Pack</Btn>
              </TD>
            </TR>
          ))}
          {rows.length === 0 && (
            <TR>
              <TD colSpan={10} className="text-center text-muted-foreground py-12">
                No containers matching filters found.
              </TD>
            </TR>
          )}
        </tbody>
      </Table>

      {/* Container Details Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={`Container Unit: ${selected?.id}`}>
        {selected && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Ocean & Port Asset</span>
                <h3 className="text-lg font-bold font-display mt-0.5">{selected.type} Cargo Unit</h3>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-2 gap-3">
              <Panel>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Type</div>
                <div className="font-semibold mt-0.5">{selected.type} Standard</div>
              </Panel>
              <Panel>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Consolidation</div>
                <div className="font-semibold mt-0.5">{selected.mode === "FCL" ? "FCL (Full Load)" : "LCL (Consolidated)"}</div>
              </Panel>
              <Panel>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Current Port</div>
                <div className="font-semibold mt-0.5 truncate">{selected.port}</div>
              </Panel>
              <Panel>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Gross Weight</div>
                <div className="font-mono font-semibold text-[var(--accent-lime)] mt-0.5">{selected.load}</div>
              </Panel>
            </div>

            {/* Yard Location (Domestic Port Warehousing) Section */}
            <Panel title="Domestic Port Warehousing Yard Location">
              <div className="space-y-2">
                {editingYard ? (
                  <div className="flex gap-2">
                    <Input 
                      value={yardInput} 
                      onChange={(e) => setYardInput(e.target.value)} 
                      placeholder="e.g. Yard C, Section 4" 
                      className="flex-1 text-xs"
                    />
                    <Btn onClick={() => handleUpdateYard(selected.id)}>Save</Btn>
                    <Btn variant="ghost" onClick={() => setEditingYard(false)}>Cancel</Btn>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{selected.yardLocation || "Not Assigned"}</span>
                    </div>
                    <button 
                      onClick={() => { setYardInput(selected.yardLocation || ""); setEditingYard(true); }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit Yard
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  Designates the current terminal yard position for physical stuffing, unstuffing, and local customs auditing.
                </p>
              </div>
            </Panel>

            {/* Switching port redirection section */}
            <Panel title="Switch Port Gateway (Redirection)">
              <div className="space-y-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-muted-foreground block mb-1">Transfer Gateway Port:</span>
                    <Select 
                      value={switchPortSelect} 
                      onChange={(e) => setSwitchPortSelect(e.target.value)} 
                      className="w-full text-xs"
                    >
                      {ALL_PORTS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </div>
                  <Btn 
                    className="h-9 px-3 text-xs" 
                    variant="secondary"
                    onClick={() => handleSwitchPort(selected.id, switchPortSelect)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Transfer Port
                  </Btn>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Switch the container tracking to a different domestic or international port location. A log of this redirection is added to tracker records.
                </p>
              </div>
            </Panel>

            {/* Pack / Add shipment form section */}
            <Panel title="Pack Pending Shipment Inside">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {selected.mode === "FCL" 
                    ? "This is an FCL container. It can contain only 1 dedicated shipment. Unpack existing cargo first to assign a new one." 
                    : "Add consolidated LCL shipments to this container unit."}
                </p>
                {((selected.mode === "LCL") || (selected.mode === "FCL" && selected.shipments.length === 0)) && (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select 
                        value={packTargetId} 
                        onChange={(e) => setPackTargetId(e.target.value)} 
                        className="w-full text-xs"
                      >
                        <option value="">Select booking to pack…</option>
                        {pendingToPack.map((p) => (
                          <option key={p.id} value={p.id}>{p.id} - {p.customer} ({p.cargo} · {p.weight})</option>
                        ))}
                      </Select>
                    </div>
                    <Btn className="h-9 px-4 text-xs font-semibold" onClick={() => handlePack(selected.id)}>Pack</Btn>
                  </div>
                )}
              </div>
            </Panel>

            {/* Shipments inside container */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" /> Packed Shipments ({selected.shipments.length})
              </div>
              <div className="space-y-3">
                {selected.shipments.map((s) => (
                  <div key={s.id} className="p-3 bg-[var(--surface-2)] border border-border rounded-lg relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-primary">{s.id}</div>
                      <button 
                        onClick={() => handleUnpack(selected.id, s.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-mono font-semibold"
                      >
                        Unpack / Remove
                      </button>
                    </div>
                    <div className="text-sm font-semibold mt-1">{s.customer}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div>Cargo: <span className="text-foreground">{s.cargo}</span></div>
                      <div>Weight: <span className="text-foreground font-mono">{s.weight}</span></div>
                      <div className="col-span-2 truncate">Destination Hub: <span className="text-foreground font-medium">{s.destination}</span></div>
                    </div>
                  </div>
                ))}

                {selected.shipments.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground">
                    This container is currently empty.
                  </div>
                )}
              </div>
            </div>

            {/* Container Live Tracker History */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" /> Live Location Tracker Logs
              </div>
              <div className="bg-[var(--surface-2)] border border-border rounded-lg p-3 space-y-3">
                {selected.trackerHistory && selected.trackerHistory.length > 0 ? (
                  <ol className="relative pl-4 space-y-3.5">
                    {selected.trackerHistory.map((log, idx) => (
                      <li key={idx} className="relative group text-xs">
                        <span className="absolute left-[-16px] top-1 h-2 w-2 rounded-full bg-primary border border-background" />
                        {idx < selected.trackerHistory!.length - 1 && (
                          <span className="absolute left-[-13px] top-3 bottom-[-15px] w-[1px] bg-border" />
                        )}
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>{log.time}</span>
                          <span className="font-semibold text-primary">{log.location}</span>
                        </div>
                        <p className="mt-0.5 text-foreground font-medium">{log.event}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    No location tracking history registered yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Book FCA Empty Container Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Book FCA Empty Container Asset"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Btn>
            <Btn onClick={handleAddContainer}>Book Empty Container</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Container ID Code">
            <Input 
              value={newId} 
              onChange={(e) => setNewId(e.target.value)} 
              placeholder="e.g. MSCU-1002931" 
              className="w-full font-mono text-sm"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Container size">
              <Select value={newType} onChange={(e: any) => setNewType(e.target.value)} className="w-full">
                <option value="20ft">20ft Standard Cube</option>
                <option value="40ft">40ft High Cube</option>
              </Select>
            </Field>

            <Field label="Consolidation Mode">
              <Select value={newMode} onChange={(e: any) => setNewMode(e.target.value)} className="w-full">
                <option value="FCL">FCL (Full Container Load)</option>
                <option value="LCL">LCL (Less than Container Load)</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Operating Carrier / Owner">
              <Select value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className="w-full">
                <option value="MSC Shipping">MSC Shipping</option>
                <option value="Maersk Line">Maersk Line</option>
                <option value="Evergreen">Evergreen Logistics</option>
                <option value="COSCO Shipping">COSCO Shipping</option>
                <option value="Hapag-Lloyd">Hapag-Lloyd</option>
              </Select>
            </Field>

            <Field label="Initial Port Gateway">
              <Select value={newPort} onChange={(e) => setNewPort(e.target.value)} className="w-full">
                {ALL_PORTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Yard Warehouse Location (Domestic Port Yard)">
            <Input 
              value={newYard} 
              onChange={(e) => setNewYard(e.target.value)} 
              placeholder="e.g. Terminal Yard 3, Slot B-12" 
              className="w-full"
            />
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}