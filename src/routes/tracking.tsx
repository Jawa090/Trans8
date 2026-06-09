import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Select } from "@/components/admin/ui";
import { BOOKINGS } from "@/lib/mock-data";
import { Check, Clock, Circle, User2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tracking")({
  head: () => ({ meta: [{ title: "Shipment Tracking — TRANS8" }] }),
  component: TrackingPage,
});

const STEPS = [
  "EXW Pickup",
  "Local Transport to Origin Port",
  "Origin Customs + Export docs",
  "Loading at Port",
  "Main Carriage Sea/Air/Rail/Road",
  "Arrival Destination Port",
  "Destination Customs + Import docs",
  "Local Transport to Delivery",
  "Delivered",
];

const AGENTS = [
  "Reza Karimi", "Layla Hosseini", "Omar Al-Saud", "Hassan Khan",
  "Ivan Volkov", "Nadia Mansouri", "Mehmet Yilmaz", "Amir Rahimi", "Fatima Aydin",
];

const PORTS_AT_STEP = [
  "Seller Warehouse", "Local Hub", "Origin Port (Customs)", "Origin Port (Loading)",
  "In Transit", "Destination Port (Arrival)", "Destination Port (Customs)",
  "Local Hub (Destination)", "Buyer Warehouse",
];

type Incoterm = "EXW" | "FCA" | "FOB" | "CFR" | "CIF" | "CPT" | "CIP" | "DPU" | "DAP" | "DDP";
/* Step ranges (1-indexed inclusive) shown for each incoterm */
const INCOTERM_RANGE: Record<Incoterm, [number, number]> = {
  EXW: [1, 9], FCA: [2, 9], FOB: [3, 9], CFR: [3, 9], CIF: [3, 9],
  CPT: [3, 9], CIP: [3, 9], DPU: [1, 8], DAP: [1, 8], DDP: [1, 9],
};
/* Inclusive last step the seller is responsible for, per incoterm */
const SELLER_LAST: Record<Incoterm, number> = {
  EXW: 1, FCA: 2, FOB: 4, CFR: 5, CIF: 6, CPT: 5, CIP: 6, DPU: 8, DAP: 7, DDP: 9,
};

type Step = { label: string; agent: string; port: string; ts: string | null; notes: string };

function seedSteps(seed: number, type: string): { steps: Step[]; current: number } {
  const current = (seed % 8) + 1; // 1..8 inclusive
  const baseDay = (seed % 20) + 1;
  const steps: Step[] = STEPS.map((label, i) => {
    const done = i < current;
    const day = String(baseDay + i).padStart(2, "0");
    return {
      label: label === "Main Carriage Sea/Air/Rail/Road" ? `Main Carriage (${type})` : label,
      agent: AGENTS[(seed + i) % AGENTS.length],
      port: PORTS_AT_STEP[i],
      ts: done ? `2026-06-${day} 0${(i % 9) + 1}:${String((seed * (i + 3)) % 60).padStart(2, "0")}` : null,
      notes: done && i === current - 1 ? "Handover signed and verified." : "",
    };
  });
  return { steps, current };
}

function StepIcon({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") return <div className="h-9 w-9 rounded-full bg-primary grid place-items-center text-primary-foreground"><Check className="h-4 w-4" /></div>;
  if (state === "active") return <div className="h-9 w-9 rounded-full border-2 border-primary grid place-items-center text-primary"><Clock className="h-4 w-4 animate-pulse" /></div>;
  return <div className="h-9 w-9 rounded-full border-2 border-border grid place-items-center text-muted-foreground"><Circle className="h-3 w-3" /></div>;
}

function TrackingPage() {
  const shipments = useMemo(() => BOOKINGS.slice(0, 12), []);
  const [selectedId, setSelectedId] = useState(shipments[0].id);
  const shipment = shipments.find((s) => s.id === selectedId)!;
  const seed = parseInt(shipment.id.replace(/\D/g, ""), 10);
  const initial = useMemo(() => seedSteps(seed, shipment.type), [seed, shipment.type]);
  const [steps, setSteps] = useState<Step[]>(initial.steps);
  const [current, setCurrent] = useState(initial.current);
  const [incoterm, setIncoterm] = useState<Incoterm>("EXW");

  const [rangeStart, rangeEnd] = INCOTERM_RANGE[incoterm];
  const visibleSteps = steps.slice(rangeStart - 1, rangeEnd);
  const sellerLast = SELLER_LAST[incoterm];

  // Reset when changing shipment
  const onSelect = (id: string) => {
    setSelectedId(id);
    const s = shipments.find((x) => x.id === id)!;
    const fresh = seedSteps(parseInt(s.id.replace(/\D/g, ""), 10), s.type);
    setSteps(fresh.steps); setCurrent(fresh.current);
  };

  const advance = () => {
    if (current >= STEPS.length) return toast.info("Already delivered.");
    const idx = current;
    const now = new Date();
    const ts = `${now.toISOString().slice(0,10)} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setSteps((prev) => prev.map((s, i) => i === idx ? { ...s, ts } : s));
    setCurrent(current + 1);
    toast.success(`Marked completed: ${steps[idx].label}`);
  };

  const updateNotes = (i: number, v: string) =>
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, notes: v } : s));

  return (
    <AdminLayout>
      <PageHeader
        title="Shipment Tracking"
        subtitle="Incoterm-aware milestone visibility across the 9-step pipeline"
        actions={<>
          <Btn variant="secondary" onClick={() => toast.success("Tracking link copied")}>Share link</Btn>
          <Btn onClick={advance}>Advance step</Btn>
        </>}
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <Panel title="Active shipments">
          <ul className="space-y-1.5">
            {shipments.map((s) => (
              <li key={s.id}>
                <button onClick={() => onSelect(s.id)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${selectedId === s.id ? "border-primary bg-primary/10" : "border-border hover:bg-[var(--surface-2)]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{s.id}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="text-sm mt-1 truncate">{s.origin} → {s.destination}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.type} · {s.cargo}</div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <Meta label="Shipment ID" value={shipment.id} />
              <Meta label="Customer" value={shipment.customer} />
              <Meta label="Route" value={`${shipment.origin} → ${shipment.destination}`} />
              <Meta label="Mode · Cargo" value={`${shipment.type} · ${shipment.cargo}`} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Incoterm</div>
                <Select value={incoterm} onChange={(e) => setIncoterm(e.target.value as Incoterm)} className="w-full">
                  {(Object.keys(INCOTERM_RANGE) as Incoterm[]).map((t) => <option key={t}>{t}</option>)}
                </Select>
              </div>
            </div>
          </Panel>

          <Panel
            title={`Pipeline · ${shipment.id} · ${incoterm}`}
            action={<span className="text-[10px] font-mono text-muted-foreground uppercase">Steps {rangeStart}–{rangeEnd} · Seller until step {sellerLast}</span>}
          >
            <ol className="relative">
              {visibleSteps.map((s, idx) => {
                const i = rangeStart - 1 + idx;
                const state: "done" | "active" | "pending" = i < current ? "done" : i === current ? "active" : "pending";
                const responsibility = (i + 1) <= sellerLast ? "Seller" : "Buyer";
                return (
                  <li key={s.label} className="flex gap-4 pb-6 last:pb-0 relative">
                    {idx < visibleSteps.length - 1 && (
                      <span className={`absolute left-[18px] top-9 bottom-0 w-px ${i < current - 1 ? "bg-primary" : "bg-border"}`} />
                    )}
                    <StepIcon state={state} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">STEP {i + 1}</span>
                        <span className="font-medium">{s.label}</span>
                        <StatusBadge status={state === "done" ? "Completed" : state === "active" ? "Active" : "Pending"} />
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${responsibility === "Seller" ? "border-[var(--info)]/40 text-[var(--info)]" : "border-[var(--accent-lime)]/40 text-[var(--accent-lime)]"}`}>
                          {responsibility.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mt-1.5">
                        <span className="inline-flex items-center gap-1.5"><User2 className="h-3 w-3" />{s.agent}</span>
                        <span className="inline-flex items-center gap-1.5">📍 {s.port}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{s.ts ?? "—"}</span>
                      </div>
                      <textarea
                        rows={2}
                        value={s.notes}
                        onChange={(e) => updateNotes(i, e.target.value)}
                        placeholder="Add notes for this step…"
                        className="mt-2 w-full bg-[var(--surface-2)] border border-border rounded-md p-2 text-sm focus:outline-none focus:border-primary"
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <label className="text-[11px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-[var(--surface-2)] hover:border-primary cursor-pointer">
                          📄 BOE
                          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && toast.success(`BOE uploaded: ${e.target.files[0].name}`)} />
                        </label>
                        <label className="text-[11px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-[var(--surface-2)] hover:border-primary cursor-pointer">
                          🖼 PIC
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && toast.success(`PIC uploaded: ${e.target.files[0].name}`)} />
                        </label>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}