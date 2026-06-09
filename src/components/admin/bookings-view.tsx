import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input, Select, Table, THead, TH, TR, TD, StatusBadge, Btn, Drawer } from "./ui";
import { BOOKINGS, formatMoney, type Booking } from "@/lib/mock-data";
import { toast } from "sonner";

interface Props {
  type?: "Road" | "Train" | "Air" | "Sea";
  idLabel?: string;
  showContainer?: boolean;
}

export function BookingsView({ type, idLabel = "Booking", showContainer }: Props) {
  const initial = useMemo(() => (type ? BOOKINGS.filter((b) => b.type === type) : BOOKINGS), [type]);
  const [all, setAll] = useState<Booking[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const rows = useMemo(() => all.filter((b) => {
    if (q) {
      const s = q.toLowerCase();
      if (![b.id, b.customer, b.driver, b.origin, b.destination, b.cargo, b.containerId ?? ""]
        .some((v) => v.toLowerCase().includes(s))) return false;
    }
    if (status && b.status !== status) return false;
    if (mode && b.containerType !== mode) return false;
    return true;
  }), [all, q, status, mode]);

  const updateStatus = (id: string, next: Booking["status"]) => {
    setAll((rows) => rows.map((r) => (r.id === id ? { ...r, status: next } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status: next } : s));
    toast.success(`${id} → ${next}`);
  };
  const reassign = (id: string) => toast.success(`${id} reassigned to next available carrier`);
  const cancel = (id: string) => { updateStatus(id, "Cancelled" as Booking["status"]); };
  const nextStatus = (s: string): Booking["status"] => {
    const flow = ["Pending", "Confirmed", "In Transit", "Delivered"];
    const i = flow.indexOf(s);
    return (flow[Math.min(i + 1, flow.length - 1)] || "Confirmed") as Booking["status"];
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, customer, route, cargo…" className="w-full pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option>Pending</option><option>Confirmed</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
        </Select>
        {showContainer && (
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All modes</option><option>FCL</option><option>LCL</option><option>Bulk</option>
          </Select>
        )}
      </div>

      <Table>
        <THead><TR>
          <TH>{idLabel}</TH>
          {showContainer && <TH>Container</TH>}
          <TH>Customer</TH><TH>Driver</TH><TH>Route</TH><TH>Cargo</TH><TH>Weight</TH><TH>Status</TH>
          <TH className="text-right">Amount</TH><TH></TH>
        </TR></THead>
        <tbody>
          {rows.map((b) => (
            <TR key={b.id} className="cursor-pointer" >
              <TD className="font-mono text-xs text-primary">{b.id}</TD>
              {showContainer && <TD className="font-mono text-xs">{b.containerId} <span className="ml-1 text-[10px] text-muted-foreground">{b.containerType}</span></TD>}
              <TD>{b.customer}</TD>
              <TD className="text-muted-foreground">{b.driver}</TD>
              <TD className="text-xs text-muted-foreground">{b.origin} → {b.destination}</TD>
              <TD>{b.cargo}</TD>
              <TD className="font-mono text-xs">{b.weight}</TD>
              <TD><StatusBadge status={b.status} /></TD>
              <TD className="text-right font-mono">{formatMoney(b.amount)}</TD>
              <TD><Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelected(b)}>View</Btn></TD>
            </TR>
          ))}
          {rows.length === 0 && (
            <TR><TD className="text-center text-muted-foreground py-10">No bookings match these filters</TD></TR>
          )}
        </tbody>
      </Table>

      <div className="mt-3 text-xs font-mono text-muted-foreground">{rows.length} / {all.length} bookings</div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.id}` : ""}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{selected.type} freight</div>
                <div className="text-lg font-display font-bold mt-1">{selected.origin} → {selected.destination}</div>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Mini label="Customer" value={selected.customer} />
              <Mini label="Driver" value={selected.driver} />
              <Mini label="Cargo" value={selected.cargo} />
              <Mini label="Weight" value={selected.weight} />
              <Mini label="Booked" value={selected.date} />
              <Mini label="Amount" value={formatMoney(selected.amount)} />
              {selected.containerId && <Mini label="Container" value={`${selected.containerId} · ${selected.containerType}`} />}
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Timeline</div>
              <ol className="relative border-l border-border ml-2 space-y-3 pl-4">
                {["Order placed", "Confirmed", "Pickup", "In transit", "Delivered"].map((s, i) => (
                  <li key={s} className="text-xs">
                    <span className={`absolute -left-[5px] h-2.5 w-2.5 rounded-full ${i < 3 ? "bg-primary" : "bg-[var(--surface-3)]"}`} />
                    <div className={i < 3 ? "text-foreground" : "text-muted-foreground"}>{s}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Btn className="flex-1" onClick={() => updateStatus(selected.id, nextStatus(selected.status))}>
                Advance → {nextStatus(selected.status)}
              </Btn>
              <Btn variant="secondary" className="flex-1" onClick={() => reassign(selected.id)}>Reassign</Btn>
              <Btn variant="danger" onClick={() => cancel(selected.id)}>Cancel</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value}</div>
    </div>
  );
}