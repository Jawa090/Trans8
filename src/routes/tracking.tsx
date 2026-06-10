import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge } from "@/components/admin/ui";
import { BOOKINGS } from "@/lib/mock-data";
import { Check, Clock, Circle, User2, UploadCloud, FileText, X } from "lucide-react";
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
      notes: done && i === current - 1 ? "Handover signed and verified." : "Milestone updated by system agent.",
    };
  });
  return { steps, current };
}

function StepIcon({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") return <div className="h-9 w-9 rounded-full bg-primary grid place-items-center text-primary-foreground"><Check className="h-4 w-4" /></div>;
  if (state === "active") return <div className="h-9 w-9 rounded-full border-2 border-primary grid place-items-center text-primary"><Clock className="h-4 w-4 animate-pulse" /></div>;
  return <div className="h-9 w-9 rounded-full border-2 border-border grid place-items-center text-muted-foreground"><Circle className="h-3 w-3" /></div>;
}

interface UploadedDoc {
  name: string;
  size: string;
}

function TrackingPage() {
  const shipments = useMemo(() => BOOKINGS.slice(0, 12), []);
  const [selectedId, setSelectedId] = useState(shipments[0].id);
  const shipment = shipments.find((s) => s.id === selectedId)!;
  const seed = parseInt(shipment.id.replace(/\D/g, ""), 10);
  
  const initial = useMemo(() => seedSteps(seed, shipment.type), [seed, shipment.type]);
  const [steps, setSteps] = useState<Step[]>(initial.steps);
  const [current, setCurrent] = useState(initial.current);

  // Multi-document state per step
  const [stepDocs, setStepDocs] = useState<Record<number, UploadedDoc[]>>({
    0: [{ name: "Packing_List.pdf", size: "245 KB" }, { name: "Commercial_Invoice.pdf", size: "512 KB" }],
    1: [{ name: "Delivery_Order.pdf", size: "128 KB" }],
    2: [{ name: "Export_Declaration.pdf", size: "1.1 MB" }],
  });

  // Reset when changing shipment
  const onSelect = (id: string) => {
    setSelectedId(id);
    const s = shipments.find((x) => x.id === id)!;
    const fresh = seedSteps(parseInt(s.id.replace(/\D/g, ""), 10), s.type);
    setSteps(fresh.steps); 
    setCurrent(fresh.current);
    // Seed new files
    setStepDocs({
      0: [{ name: "Packing_List.pdf", size: "245 KB" }, { name: "Commercial_Invoice.pdf", size: "512 KB" }],
      1: [{ name: "Delivery_Order.pdf", size: "128 KB" }],
      2: [{ name: "Export_Declaration.pdf", size: "1.1 MB" }],
    });
  };

  const handleFileUpload = (stepIndex: number, files: FileList | null) => {
    if (!files) return;
    const newDocs: UploadedDoc[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1000 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      newDocs.push({ name: file.name, size: sizeStr });
    }
    setStepDocs((prev) => ({
      ...prev,
      [stepIndex]: [...(prev[stepIndex] || []), ...newDocs],
    }));
    toast.success(`Uploaded ${files.length} document(s) to Step ${stepIndex + 1}`);
  };

  const removeDoc = (stepIndex: number, docIndex: number) => {
    setStepDocs((prev) => {
      const list = [...(prev[stepIndex] || [])];
      list.splice(docIndex, 1);
      return { ...prev, [stepIndex]: list };
    });
    toast.info("Document removed");
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Shipment Tracking"
        subtitle="Milestone visibility across the 9-step pipeline (View Only)"
        actions={
          <Btn variant="secondary" onClick={() => toast.success("Tracking link copied")}>Share link</Btn>
        }
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Meta label="Shipment ID" value={shipment.id} />
              <Meta label="Customer" value={shipment.customer} />
              <Meta label="Route" value={`${shipment.origin} → ${shipment.destination}`} />
              <Meta label="Mode · Cargo" value={`${shipment.type} · ${shipment.cargo}`} />
            </div>
          </Panel>

          <Panel title={`Pipeline · ${shipment.id}`}>
            <ol className="relative">
              {steps.map((s, i) => {
                const state: "done" | "active" | "pending" = i < current ? "done" : i === current ? "active" : "pending";
                const docs = stepDocs[i] || [];
                return (
                  <li key={s.label} className="flex gap-4 pb-6 last:pb-0 relative">
                    {i < steps.length - 1 && (
                      <span className={`absolute left-[18px] top-9 bottom-0 w-px ${i < current - 1 ? "bg-primary" : "bg-border"}`} />
                    )}
                    <StepIcon state={state} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">STEP {i + 1}</span>
                        <span className="font-medium">{s.label}</span>
                        <StatusBadge status={state === "done" ? "Completed" : state === "active" ? "Active" : "Pending"} />
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mt-1.5">
                        <span className="inline-flex items-center gap-1.5"><User2 className="h-3 w-3" />{s.agent}</span>
                        <span className="inline-flex items-center gap-1.5">📍 {s.port}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{s.ts ?? "—"}</span>
                      </div>
                      
                      {/* View Only Notes Field */}
                      <div className="mt-2 bg-[var(--surface-2)] border border-border/85 rounded-md p-2.5 text-sm text-foreground/90">
                        <span className="text-[10px] font-mono text-muted-foreground block mb-0.5">STEP NOTES (READ ONLY):</span>
                        {s.notes || "No milestone notes available."}
                      </div>

                      {/* Multi-document upload section */}
                      <div className="mt-3 space-y-2">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Documents ({docs.length})</span>
                        
                        {docs.length > 0 && (
                          <div className="grid sm:grid-cols-2 gap-2">
                            {docs.map((doc, docIdx) => (
                              <div key={docIdx} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[var(--surface-2)] border border-border text-xs">
                                <span className="inline-flex items-center gap-1.5 truncate max-w-[80%]">
                                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="truncate">{doc.name}</span>
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">{doc.size}</span>
                                <button type="button" onClick={() => removeDoc(i, docIdx)} className="text-muted-foreground hover:text-[var(--danger)] ml-2" title="Remove">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center">
                          <label className="text-[11px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-[var(--surface-2)] hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors">
                            <UploadCloud className="h-3.5 w-3.5 text-primary" />
                            <span>Upload Documents</span>
                            <input 
                              type="file" 
                              multiple 
                              accept=".pdf,.doc,.docx,image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(i, e.target.files)} 
                            />
                          </label>
                        </div>
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