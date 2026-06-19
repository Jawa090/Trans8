import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Btn, Modal, Field, Input, Select, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { Search, Flame, Droplets, Box } from "lucide-react";

export const Route = createFileRoute("/fleet/bulk")({
  head: () => ({ meta: [{ title: "Bulk Load Management — Movers Admin" }] }),
  component: BulkPage,
});

interface BulkLoad {
  id: string;
  category: "Dry" | "Wet" | "Gas";
  method: string; // Bag, Pallet, Loose, Hydrocarbon, Gasoil, Gasoline, LNG, LPG, CNG, NG
  material: string;
  quantity: string;
  origin: string;
  destination: string;
  consignee: string;
  status: "At Port" | "Loaded" | "In Transit" | "Delivered";
}

const INITIAL_BULK_LOADS: BulkLoad[] = [
  // Dry Bulk
  { id: "BLK-101", category: "Dry", method: "Bag", material: "Agricultural Wheat Grain", quantity: "450 t", origin: "Port of Karachi", destination: "Jebel Ali Port", consignee: "Gulf Agri Group", status: "Loaded" },
  { id: "BLK-102", category: "Dry", method: "Pallet", material: "Construction Cement Bags", quantity: "600 t", origin: "Jebel Ali Port", destination: "Khalifa Port", consignee: "Emaar Buildcon", status: "At Port" },
  { id: "BLK-103", category: "Dry", method: "Loose", material: "Raw Silica Sand", quantity: "1,200 t", origin: "Mundra Port", destination: "Fujairah Port", consignee: "UAE Glass Works", status: "In Transit" },
  // Wet Bulk
  { id: "BLK-201", category: "Wet", method: "Hydrocarbon", material: "Raw Crude Oil", quantity: "45,000 bbl", origin: "Bandar Abbas Port", destination: "Durban Port", consignee: "Sasol Refineries", status: "In Transit" },
  { id: "BLK-202", category: "Wet", method: "Gasoil", material: "Ultra Low Sulfur Gasoil", quantity: "35,000 L", origin: "Fujairah Port", destination: "Port Qasim", consignee: "Pakistan Petroleum", status: "Loaded" },
  { id: "BLK-203", category: "Wet", method: "Gasoline", material: "Premium Octane-95 Gasoline", quantity: "50,000 L", origin: "Port of Istanbul", destination: "Jebel Ali Port", consignee: "ENOC Supply", status: "Delivered" },
  // Gas
  { id: "BLK-301", category: "Gas", method: "LNG", material: "Liquefied Natural Gas", quantity: "8,500 m³", origin: "Ras Laffan Terminal", destination: "Mundra Port", consignee: "Adani Gas Grid", status: "In Transit" },
  { id: "BLK-302", category: "Gas", method: "LPG", material: "Liquefied Petroleum Gas", quantity: "6,200 m³", origin: "Jebel Ali Port", destination: "Port of Karachi", consignee: "SSGC Pakistan", status: "At Port" },
  { id: "BLK-303", category: "Gas", method: "CNG", material: "Compressed Natural Gas", quantity: "3,400 cylinders", origin: "Bandar Abbas Port", destination: "Chabahar Port", consignee: "Iran Transgas", status: "Delivered" },
  { id: "BLK-304", category: "Gas", method: "NG", material: "Compressed Natural Gas Pipeline Feed", quantity: "12,000 m³", origin: "Etihad Hub UAE", destination: "Mezyad Hub", consignee: "Abu Dhabi Gas", status: "In Transit" }
];

const METHODS_BY_CATEGORY = {
  Dry: ["Bag", "Pallet", "Loose"],
  Wet: ["Hydrocarbon", "Gasoil", "Gasoline"],
  Gas: ["LNG", "LPG", "CNG", "NG"]
} as const;

function BulkPage() {
  const [list, setList] = useState<BulkLoad[]>(INITIAL_BULK_LOADS);
  const [activeTab, setActiveTab] = useState<BulkLoad["category"]>("Dry");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);

  // Form draft state
  const [draft, setDraft] = useState({
    category: "Dry" as BulkLoad["category"],
    method: "Bag",
    material: "",
    quantity: "",
    origin: "Jebel Ali Port",
    destination: "Port of Karachi",
    consignee: "",
    status: "At Port" as const
  });

  const tabs: { key: BulkLoad["category"]; label: string; icon: any; desc: string }[] = [
    { key: "Dry", label: "Dry Bulk", icon: Box, desc: "Bags, Pallets, and Loose dry materials" },
    { key: "Wet", label: "Wet Bulk", icon: Droplets, desc: "Hydrocarbons, Gasoil, and Gasoline fluids" },
    { key: "Gas", label: "Gas Bulk", icon: Flame, desc: "LNG, LPG, CNG, and NG gas shipments" }
  ];

  const filtered = useMemo(() => {
    return list.filter((b) => {
      if (b.category !== activeTab) return false;
      if (status && b.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          b.id.toLowerCase().includes(s) ||
          b.material.toLowerCase().includes(s) ||
          b.method.toLowerCase().includes(s) ||
          b.consignee.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [list, activeTab, q, status]);

  const handleOpenAdd = () => {
    setDraft({
      category: activeTab,
      method: METHODS_BY_CATEGORY[activeTab][0],
      material: "",
      quantity: "",
      origin: "Jebel Ali Port",
      destination: "Port of Karachi",
      consignee: "",
      status: "At Port"
    });
    setAdding(true);
  };

  const handleCategoryChange = (cat: BulkLoad["category"]) => {
    setDraft((prev) => ({
      ...prev,
      category: cat,
      method: METHODS_BY_CATEGORY[cat][0]
    }));
  };

  const handleAdd = () => {
    if (!draft.material.trim() || !draft.quantity.trim() || !draft.consignee.trim()) {
      toast.error("Please fill out all required fields.");
      return;
    }
    const newBulk: BulkLoad = {
      id: `BLK-${100 + list.length + 1}`,
      category: draft.category,
      method: draft.method,
      material: draft.material,
      quantity: draft.quantity,
      origin: draft.origin,
      destination: draft.destination,
      consignee: draft.consignee,
      status: draft.status
    };
    setList([newBulk, ...list]);
    toast.success(`Registered new bulk consignment: ${newBulk.id}`);
    setAdding(false);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Bulk Load Management"
        subtitle={`Track and manage regional Dry, Wet, and Gas bulk cargos.`}
        actions={<Btn onClick={handleOpenAdd}>+ Add Bulk Consignment</Btn>}
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tabs.map((t) => {
          const TabIcon = t.icon;
          const count = list.filter((x) => x.category === t.key).length;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setQ("");
                setStatus("");
              }}
              className={`p-4 rounded-lg border text-left flex items-start gap-4 transition-all ${
                active
                  ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                  : "border-border hover:bg-[var(--surface-2)] text-muted-foreground"
              }`}
            >
              <div className={`p-2 rounded-md ${active ? "bg-primary text-primary-foreground" : "bg-[var(--surface-3)] text-muted-foreground"}`}>
                <TabIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-foreground">{t.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-primary/20 text-primary" : "bg-[var(--surface-3)] text-muted-foreground"}`}>{count} active</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase()} bulk shipments by ID, material, consignee…`}
            className="w-full pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>At Port</option>
          <option>Loaded</option>
          <option>In Transit</option>
          <option>Delivered</option>
        </Select>
      </div>

      {/* Table List */}
      <Panel>
        <Table>
          <THead>
            <TR>
              <TH>Reference</TH>
              <TH>Method / Type</TH>
              <TH>Material / Cargo</TH>
              <TH>Qty / Vol</TH>
              <TH>Route</TH>
              <TH>Consignee</TH>
              <TH>Status</TH>
              <TH></TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((b) => (
              <TR key={b.id}>
                <TD className="font-mono text-xs text-primary">{b.id}</TD>
                <TD>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--surface-3)] border border-border">
                    {b.method}
                  </span>
                </TD>
                <TD className="font-medium">{b.material}</TD>
                <TD className="font-mono text-xs">{b.quantity}</TD>
                <TD className="text-xs text-muted-foreground">{b.origin} → {b.destination}</TD>
                <TD className="text-xs">{b.consignee}</TD>
                <TD><StatusBadge status={b.status} /></TD>
                <TD>
                  <div className="flex gap-1.5 justify-end">
                    <Btn
                      variant="ghost"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => {
                        const statuses: BulkLoad["status"][] = ["At Port", "Loaded", "In Transit", "Delivered"];
                        const curr = statuses.indexOf(b.status);
                        const next = statuses[(curr + 1) % statuses.length];
                        setList(list.map((x) => x.id === b.id ? { ...x, status: next } : x));
                        toast.success(`${b.id} status advanced to ${next}`);
                      }}
                    >
                      Advance Status
                    </Btn>
                  </div>
                </TD>
              </TR>
            ))}

            {filtered.length === 0 && (
              <TR>
                <TD colSpan={8} className="text-center text-muted-foreground py-12">
                  No bulk loads registered under this category.
                </TD>
              </TR>
            )}
          </tbody>
        </Table>
      </Panel>

      {/* Add Bulk Consignment Modal */}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add Bulk Consignment"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Create Consignment</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select
                value={draft.category}
                onChange={(e) => handleCategoryChange(e.target.value as BulkLoad["category"])}
                className="w-full"
              >
                <option value="Dry">Dry Bulk</option>
                <option value="Wet">Wet Bulk</option>
                <option value="Gas">Gas Bulk</option>
              </Select>
            </Field>

            <Field label="Method / Subtype">
              <Select
                value={draft.method}
                onChange={(e) => setDraft({ ...draft, method: e.target.value })}
                className="w-full"
              >
                {METHODS_BY_CATEGORY[draft.category].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Material Description">
            <Input
              className="w-full"
              value={draft.material}
              onChange={(e) => setDraft({ ...draft, material: e.target.value })}
              placeholder={draft.category === "Dry" ? "e.g. Portland Cement" : draft.category === "Wet" ? "e.g. Crude Oil" : "e.g. Compressed LNG"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity / Volume">
              <Input
                className="w-full font-mono"
                value={draft.quantity}
                onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                placeholder="e.g. 500 t or 30,000 L"
              />
            </Field>
            <Field label="Consignee / Owner">
              <Input
                className="w-full"
                value={draft.consignee}
                onChange={(e) => setDraft({ ...draft, consignee: e.target.value })}
                placeholder="Consignee company"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Origin Hub/Port">
              <Input
                className="w-full text-xs"
                value={draft.origin}
                onChange={(e) => setDraft({ ...draft, origin: e.target.value })}
              />
            </Field>
            <Field label="Destination Hub/Port">
              <Input
                className="w-full text-xs"
                value={draft.destination}
                onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Initial Status">
            <Select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as any })}
              className="w-full"
            >
              <option>At Port</option>
              <option>Loaded</option>
              <option>In Transit</option>
              <option>Delivered</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}