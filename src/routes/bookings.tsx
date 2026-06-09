import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Btn, Input, Select, Drawer, Table, THead, TH, TR, TD, Panel } from "@/components/admin/ui";
import { BOOKINGS, formatMoney, type Booking } from "@/lib/mock-data";
import { Truck, Train, Plane, Ship, Search, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = { Road: Truck, Train, Air: Plane, Sea: Ship };

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "Bookings — Movers Admin" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [drawer, setDrawer] = useState<Booking | null>(null);

  const filtered = useMemo(() => BOOKINGS.filter((b) => {
    if (q && !b.id.toLowerCase().includes(q.toLowerCase()) && !b.customer.toLowerCase().includes(q.toLowerCase())) return false;
    if (type && b.type !== type) return false;
    if (status && b.status !== status) return false;
    return true;
  }), [q, type, status]);

  return (
    <AdminLayout>
      <PageHeader title="Bookings" subtitle={`${filtered.length} shipments in the pipeline`}
        actions={<Btn onClick={() => toast("Manual booking flow starts here")}>+ Manual Booking</Btn>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking ID or customer" className="w-full pl-9" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option><option>Road</option><option>Sea</option><option>Air</option><option>Train</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option><option>Pending</option><option>Confirmed</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
        </Select>
      </div>
      <Table>
        <THead><TR><TH>ID</TH><TH>Type</TH><TH>Customer</TH><TH>Driver</TH><TH>Route</TH><TH>Date</TH><TH>Status</TH><TH className="text-right">Amount</TH></TR></THead>
        <tbody>
          {filtered.slice(0, 20).map((b) => {
            const Icon = ICON[b.type];
            return (
              <TR key={b.id} className="cursor-pointer" {...{ onClick: () => setDrawer(b) }}>
                <TD className="font-mono text-xs text-primary">{b.id}</TD>
                <TD><span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase"><Icon className="h-3.5 w-3.5 text-primary" />{b.type}</span></TD>
                <TD className="font-medium">{b.customer}</TD>
                <TD className="text-sm">{b.driver}</TD>
                <TD className="text-xs text-muted-foreground">{b.origin} → {b.destination}</TD>
                <TD className="font-mono text-xs">{b.date}</TD>
                <TD><StatusBadge status={b.status} /></TD>
                <TD className="text-right font-mono">{formatMoney(b.amount)}</TD>
              </TR>
            );
          })}
        </tbody>
      </Table>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.id}>
        {drawer && <BookingDetail b={drawer} />}
      </Drawer>
    </AdminLayout>
  );
}

function BookingDetail({ b }: { b: Booking }) {
  const Icon = ICON[b.type];
  const stages = ["Booked", "Confirmed", "In Transit", "Delivered"];
  const stageIdx = b.status === "Delivered" ? 3 : b.status === "In Transit" ? 2 : b.status === "Confirmed" ? 1 : 0;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md bg-primary/15 text-primary grid place-items-center"><Icon className="h-6 w-6" /></div>
          <div>
            <div className="text-xs font-mono uppercase text-muted-foreground">{b.type} shipment</div>
            <div className="font-display font-bold text-lg">{b.cargo} · {b.weight}</div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>

      <Panel>
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{b.origin}</div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--accent-lime)]" />{b.destination}</div>
        </div>
      </Panel>

      {b.containerType && (
        <Panel title="Sea cargo">
          <div className="grid grid-cols-3 gap-2">
            {(["FCL", "LCL", "Bulk"] as const).map((m) => (
              <button key={m} className={`px-3 py-2 rounded-md text-xs font-mono uppercase border ${b.containerType === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>{m}</button>
            ))}
          </div>
          <div className="mt-3 text-xs font-mono text-muted-foreground">Container: <span className="text-foreground">{b.containerId}</span></div>
        </Panel>
      )}

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Timeline</div>
        <ol className="space-y-3">
          {stages.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full grid place-items-center border ${i <= stageIdx ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                {i <= stageIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px] font-mono">{i + 1}</span>}
              </div>
              <span className={`text-sm ${i <= stageIdx ? "" : "text-muted-foreground"}`}>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Panel><div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Customer</div><div className="font-medium">{b.customer}</div></Panel>
        <Panel><div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Driver</div><div className="font-medium">{b.driver}</div></Panel>
      </div>

      <Panel title="Payment">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Freight</span><span className="font-mono">{formatMoney(b.amount * 0.85)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Fees</span><span className="font-mono">{formatMoney(b.amount * 0.10)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Commission</span><span className="font-mono">{formatMoney(b.amount * 0.05)}</span></div>
          <div className="flex justify-between pt-2 border-t border-border"><span className="font-semibold">Total</span><span className="font-mono text-[var(--accent-lime)] font-bold">{formatMoney(b.amount)}</span></div>
        </div>
      </Panel>

      <div>
        <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Admin notes</div>
        <textarea className="w-full bg-[var(--surface-2)] border border-border rounded-md p-2 text-sm focus:outline-none focus:border-primary" rows={3} placeholder="Add internal note…" />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Btn className="flex-1" onClick={() => toast.success(`${b.id} marked complete`)}>Mark Complete</Btn>
        <Btn variant="secondary" className="flex-1" onClick={() => toast(`Reassigning ${b.id}…`)}>Reassign</Btn>
        <Btn variant="danger" onClick={() => toast.success(`${b.id} cancelled`)}>Cancel</Btn>
      </div>
    </div>
  );
}