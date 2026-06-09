import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Btn, Modal, Field, Input, Select } from "@/components/admin/ui";
import { VEHICLES } from "@/lib/mock-data";
import { Truck, Search } from "lucide-react";

export const Route = createFileRoute("/fleet/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — Movers Admin" }] }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const [list, setList] = useState(VEHICLES);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ type: "Box Truck", plate: "", owner: "", capacity: "5 ton", status: "Idle" });

  const rows = useMemo(() => list.filter((v) => {
    if (status && v.status !== status) return false;
    if (q && !`${v.plate} ${v.owner} ${v.type}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [list, q, status]);

  return (
    <AdminLayout>
      <PageHeader title="Fleet · Vehicles" subtitle={`${rows.length} of ${list.length} vehicles`}
        actions={<Btn onClick={() => setAdding(true)}>+ Add Vehicle</Btn>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plate, owner, type…" className="w-full pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option><option>Active</option><option>Idle</option><option>On Trip</option><option>Maintenance</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rows.map((v) => (
          <Panel key={v.id}>
            <div className="h-32 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)] border-b border-border grid place-items-center relative overflow-hidden">
              <Truck className="h-16 w-16 text-primary/40" />
              <div className="absolute top-2 right-2"><StatusBadge status={v.status} /></div>
            </div>
            <div className="font-display font-bold uppercase">{v.type}</div>
            <div className="font-mono text-xs text-primary mt-0.5">{v.plate}</div>
            <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span>{v.owner}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span className="font-mono">{v.capacity}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last trip</span><span className="text-right truncate ml-2">{v.lastTrip}</span></div>
            </div>
            <div className="flex gap-1 mt-3">
              <Btn variant="ghost" className="h-7 px-2 text-xs flex-1" onClick={() => {
                const next = v.status === "Maintenance" ? "Idle" : "Maintenance";
                setList(list.map((x) => x.id === v.id ? { ...x, status: next } : x));
                toast.success(`${v.plate} → ${next}`);
              }}>{v.status === "Maintenance" ? "Mark Idle" : "Maintenance"}</Btn>
              <Btn variant="danger" className="h-7 px-2 text-xs" onClick={() => {
                setList(list.filter((x) => x.id !== v.id));
                toast.success(`Removed ${v.plate}`);
              }}>Remove</Btn>
            </div>
          </Panel>
        ))}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add Vehicle"
        footer={<><Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
          <Btn onClick={() => {
            if (!draft.plate.trim() || !draft.owner.trim()) { toast.error("Plate and owner required"); return; }
            setList([{ id: `VEH-${1000 + list.length + 1}`, lastTrip: "—", ...draft }, ...list]);
            toast.success(`Vehicle ${draft.plate} added`);
            setAdding(false);
            setDraft({ type: "Box Truck", plate: "", owner: "", capacity: "5 ton", status: "Idle" });
          }}>Add</Btn></>}>
        <div className="space-y-3">
          <Field label="Type"><Select className="w-full" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            <option>Box Truck</option><option>Flatbed</option><option>Reefer</option><option>Container Trailer</option><option>Pickup</option>
          </Select></Field>
          <Field label="Plate"><Input className="w-full" value={draft.plate} onChange={(e) => setDraft({ ...draft, plate: e.target.value })} placeholder="ABC-1234" /></Field>
          <Field label="Owner"><Input className="w-full" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} /></Field>
          <Field label="Capacity"><Input className="w-full" value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} /></Field>
          <Field label="Status"><Select className="w-full" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            <option>Idle</option><option>Active</option><option>Maintenance</option>
          </Select></Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}