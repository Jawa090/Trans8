import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Btn, Input, Select, Modal, Field } from "@/components/admin/ui";
import { REGIONS } from "@/lib/mock-data";
import { Warehouse, MapPin, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/warehouses")({
  head: () => ({ meta: [{ title: "Warehouses — Movers Admin" }] }),
  component: WarehousesPage,
});

interface WarehouseUnit {
  id: string;
  name: string;
  region: string;
  city: string;
  capacity: string;
  utilization: number;
  status: "Active" | "Pending" | "Suspended";
}

const INITIAL: WarehouseUnit[] = Array.from({ length: 9 }, (_, i) => ({
  id: `WH-${1024 + i}`,
  name: ["Tehran Central", "Dubai Free Zone", "Karachi Port", "Istanbul Hub", "Riyadh Logistics Park", "Doha South", "Lahore Distribution", "Cape Town Harbor", "Moscow North"][i],
  region: REGIONS[i % REGIONS.length].name,
  city: ["Tehran", "Dubai", "Karachi", "Istanbul", "Riyadh", "Doha", "Lahore", "Cape Town", "Moscow"][i],
  capacity: `${(8 + i * 1.4).toFixed(1)}k m³`,
  utilization: 40 + ((i * 11) % 60),
  status: i % 4 === 0 ? "Pending" : "Active",
}));

function WarehousesPage() {
  const [list, setList] = useState<WarehouseUnit[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseUnit | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    region: REGIONS[0].name,
    city: "Dubai",
    capacity: "10.0k m³",
    utilization: 30
  });

  const openAdd = () => {
    setEditing(null);
    setDraft({ name: "", region: REGIONS[0].name, city: "Dubai", capacity: "10.0k m³", utilization: 30 });
    setOpen(true);
  };

  const openEdit = (w: WarehouseUnit) => {
    setEditing(w);
    setDraft({ name: w.name, region: w.region, city: w.city, capacity: w.capacity, utilization: w.utilization });
    setOpen(true);
  };

  const save = () => {
    if (!draft.name.trim()) { toast.error("Warehouse name is required"); return; }
    if (editing) {
      setList(list.map((w) => w.id === editing.id ? { ...w, ...draft } : w));
      toast.success(`Warehouse ${draft.name} updated`);
    } else {
      const newWarehouse: WarehouseUnit = {
        id: `WH-${1024 + list.length + 1}`,
        ...draft,
        status: "Pending",
      };
      setList([newWarehouse, ...list]);
      toast.success(`Warehouse ${draft.name} registered`);
    }
    setOpen(false);
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    setList(list.map((w) => w.id === id ? { ...w, status: w.status === "Active" ? "Suspended" : "Active" } : w));
    toast.success("Warehouse status toggled");
  };

  const remove = (id: string) => {
    setList(list.filter((w) => w.id !== id));
    toast.success("Warehouse removed");
  };

  return (
    <AdminLayout>
      <PageHeader title="Warehouses" subtitle={`${list.length} partner facilities · ${list.filter((w) => w.status === "Active").length} active`}
        actions={<Btn onClick={openAdd}><Warehouse className="h-4 w-4" />+ Register Warehouse</Btn>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((w) => (
          <Panel key={w.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-md bg-primary/15 text-primary grid place-items-center"><Warehouse className="h-5 w-5" /></div>
              <StatusBadge status={w.status} />
            </div>
            <div className="font-display font-bold text-lg">{w.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{w.region} · {w.city}</div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
              <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Capacity</div><div className="font-mono text-sm">{w.capacity}</div></div>
              <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Utilized</div><div className="font-mono text-sm text-[var(--accent-lime)]">{w.utilization}%</div></div>
            </div>
            <div className="mt-3 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${w.utilization}%` }} />
            </div>
            <div className="flex gap-1 mt-4">
              <Btn variant="secondary" className="h-7 px-2 text-xs flex-1" onClick={() => openEdit(w)}>
                <Edit3 className="h-3 w-3" /> Edit
              </Btn>
              <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => toggleStatus(w.id)}>
                {w.status === "Active" ? "Suspend" : "Activate"}
              </Btn>
              <Btn variant="danger" className="h-7 px-2 text-xs" onClick={() => remove(w.id)}>
                <Trash2 className="h-3 w-3" />
              </Btn>
            </div>
          </Panel>
        ))}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }}
        title={editing ? "Edit Warehouse" : "Register Warehouse"}
        footer={<><Btn variant="ghost" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Btn><Btn onClick={save}>{editing ? "Update" : "Register"}</Btn></>}>
        <div className="space-y-4">
          <Field label="Warehouse Name">
            <Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Dubai Logistics Center" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <Select className="w-full" value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
              </Select>
            </Field>
            <Field label="City">
              <Input className="w-full" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="e.g. Dubai" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Storage Capacity">
              <Input className="w-full font-mono" value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} placeholder="e.g. 10.0k m³" />
            </Field>
            <Field label="Initial Utilization (%)">
              <Input type="number" min={0} max={100} className="w-full" value={draft.utilization} onChange={(e) => setDraft({ ...draft, utilization: Number(e.target.value) })} />
            </Field>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}