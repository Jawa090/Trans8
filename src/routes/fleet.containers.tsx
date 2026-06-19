import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Table, THead, TH, TR, TD, Tabs, Input, Select, Drawer, Btn, Panel, Field } from "@/components/admin/ui";
import { Search, Container, ArrowRight, Package } from "lucide-react";

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

interface ContainerUnit {
  id: string;
  type: "20ft" | "40ft";
  status: "At Port" | "Loaded" | "In Transit" | "Delivered";
  load: string;
  port: string;
  owner: string;
  mode: "FCL" | "LCL";
  shipments: ShipmentInside[];
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
    shipments: [
      { id: "BK-20418", customer: "Aurora Trading", cargo: "Heavy Machinery Parts", weight: "26.5 t", destination: "Port of Karachi", status: "Confirmed" }
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
    shipments: [
      { id: "BK-20419", customer: "Zahid & Sons", cargo: "Textiles & Cotton", weight: "6.2 t", destination: "Jebel Ali Port", status: "Pending" },
      { id: "BK-20420", customer: "Pak Foods Corp", cargo: "Himalayan Pink Salt", weight: "12.0 t", destination: "Jebel Ali Port", status: "Pending" }
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
    shipments: [
      { id: "BK-20421", customer: "Persian Carpets Co", cargo: "Handwoven Silk Rugs", weight: "5.5 t", destination: "Port of Istanbul", status: "In Transit" },
      { id: "BK-20422", customer: "Shiraz Fruit Exporters", cargo: "Dried Dates & Figs", weight: "10.5 t", destination: "Port of Istanbul", status: "In Transit" },
      { id: "BK-20423", customer: "Tehran Polychem", cargo: "Raw Plastic Granules", weight: "12.0 t", destination: "Port of Istanbul", status: "In Transit" }
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
    shipments: [
      { id: "BK-20424", customer: "Johannesburg Metals", cargo: "Copper Cathodes", weight: "14.5 t", destination: "Durban Port", status: "Delivered" }
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
    shipments: [
      { id: "BK-20425", customer: "Mumbai Electronics", cargo: "Circuit Boards & Chips", weight: "8.8 t", destination: "Durban Port", status: "Pending" },
      { id: "BK-20426", customer: "Delhi Garments", cargo: "Cotton Apparels", weight: "14.0 t", destination: "Durban Port", status: "Pending" }
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
        return {
          ...c,
          shipments: updatedShipments,
          load: `${totalWeight.toFixed(1)} t`
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
        load: `${totalWeight.toFixed(1)} t`
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
        return {
          ...c,
          shipments: updated,
          load: `${totalWeight.toFixed(1)} t`
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
        load: `${totalWeight.toFixed(1)} t`
      };
    });
  };

  return (
    <AdminLayout>
      <PageHeader title="Container Management" subtitle="Track ocean container loading structures, pack mixed shipments, and manage consolidated LCL routes." />
      
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
            <TH>Owner/Carrier</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <tbody>
          {rows.map((c) => (
            <TR key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
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
                  {c.shipments.length === 0 && <span className="text-xs text-muted-foreground">Empty</span>}
                </div>
              </TD>
              <TD className="font-mono text-xs font-semibold">{c.load}</TD>
              <TD className="text-xs">{c.port}</TD>
              <TD className="text-xs text-muted-foreground">{c.owner}</TD>
              <TD><StatusBadge status={c.status} /></TD>
              <TD>
                <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setSelected(c); }}>View & Pack</Btn>
              </TD>
            </TR>
          ))}
          {rows.length === 0 && (
            <TR>
              <TD colSpan={9} className="text-center text-muted-foreground py-12">
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ocean Asset Details</span>
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
                <div className="font-semibold mt-0.5">{selected.mode === "FCL" ? "FCL (Full Load)" : "LCL (Consolidated / Mixed)"}</div>
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
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}