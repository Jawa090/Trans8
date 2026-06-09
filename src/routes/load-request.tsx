import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Field, Input, Select } from "@/components/admin/ui";
import { toast } from "sonner";
import { UploadCloud, FileText, Image as ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/load-request")({
  head: () => ({ meta: [{ title: "Load Request — TRANS8" }] }),
  component: LoadRequestPage,
});

const PORTS = [
  // UAE
  "Jebel Ali", "Sharjah", "Abu Dhabi", "Fujairah", "Ras Al Khaimah", "DXB", "AUH", "SHJ", "DWC", "Etihad Rail", "Hatta", "Al Ghuwaifat", "Mezyad",
  // Pakistan
  "Karachi", "Port Qasim", "Gwadar", "KHI", "LHE", "ISB", "Karachi Station", "Lahore Station", "Rimdan", "Tafatan", "Wagah", "Torkham",
  // Iran
  "Bandar Abbas", "Chabahar", "Bushehr", "Bandar Imam", "IKA Tehran", "Mashhad", "Shiraz", "Tehran Station", "Mashhad Station", "Dogharoun", "Milak", "Bazargan", "Mirjaveh",
  // South Africa
  "Durban", "Cape Town", "Port Elizabeth", "Richards Bay", "JNB", "CPT", "DUR", "Johannesburg", "Cape Town Station", "Beit Bridge", "Lebombo", "Oshoek",
  // Turkey
  "Istanbul", "Mersin", "Izmir", "Trabzon", "Iskenderun", "IST", "ESB", "ADB", "Haydarpasa", "Ankara Central", "Kapikule", "Habur", "Dogukapi",
  // India
  "JNPT Mumbai", "Chennai", "Mundra", "Kolkata", "Cochin", "BOM", "DEL", "MAA", "CCU", "Mumbai Central", "Delhi Junction", "Chennai Central", "Attari Wagah", "Petrapole", "Raxaul"
];

const TRANSPORT = ["Sea", "Air", "Rail", "Road"] as const;
const LOAD_TYPES = ["Container", "Bulk", "CNG Gas", "LPG Gas", "LNG Gas", "Raw", "Jumbo", "Liquid", "White Fuel", "Gray Fuel"];
const INCOTERMS = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DPU", "DAP", "DDP"];
const ROUTES = ["TR-001 · UAE → Iran", "TR-014 · PK → AE", "TR-022 · ZA → AE", "TR-031 · TR → RU", "TR-040 · GCC → IR"];
const BROKERS = ["Layla Hosseini", "Omar Al-Saud", "Mehmet Yilmaz", "Nadia Mansouri", "Hassan Khan"];

function FileChip({ name, onRemove, icon: Icon }: { name: string; onRemove: () => void; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--surface-2)] border border-border text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="truncate flex-1">{name}</span>
      <button onClick={onRemove} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
    </div>
  );
}

function LoadRequestPage() {
  const [form, setForm] = useState({
    customer: "", origin: PORTS[0], destination: PORTS[5],
    transport: "Sea" as typeof TRANSPORT[number],
    loadType: LOAD_TYPES[0],
    incoterm: "FOB", route: ROUTES[0], broker: BROKERS[0], notes: "",
  });
  const [boe, setBoe] = useState<File | null>(null);
  const [pic, setPic] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer.trim()) return toast.error("Customer name is required");
    if (form.origin === form.destination) return toast.error("Origin and destination must differ");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Booking created for ${form.customer} · ${form.origin} → ${form.destination}`);
      setForm((f) => ({ ...f, customer: "", notes: "" })); setBoe(null); setPic(null);
    }, 600);
  };

  return (
    <AdminLayout>
      <PageHeader title="New Load Request" subtitle="Capture booking, route, evidence and broker assignment" />

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Booking">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Customer name">
                <Input value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="e.g. Aurora Trading LLC" />
              </Field>
              <Field label="Broker">
                <Select value={form.broker} onChange={(e) => set("broker", e.target.value)}>
                  {BROKERS.map((b) => <option key={b}>{b}</option>)}
                </Select>
              </Field>
              <Field label="Origin port">
                <Select value={form.origin} onChange={(e) => set("origin", e.target.value)}>
                  {PORTS.map((p) => <option key={p}>{p}</option>)}
                </Select>
              </Field>
              <Field label="Destination port">
                <Select value={form.destination} onChange={(e) => set("destination", e.target.value)}>
                  {PORTS.map((p) => <option key={p}>{p}</option>)}
                </Select>
              </Field>
            </div>
          </Panel>

          <Panel title="Cargo & terms">
            <div className="space-y-5">
              <Field label="Transport type">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRANSPORT.map((t) => (
                    <button key={t} type="button" onClick={() => set("transport", t)}
                      className={`h-10 rounded-md border text-sm font-medium transition-colors ${form.transport === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-[var(--surface-2)]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Type of load">
                  <Select value={form.loadType} onChange={(e) => set("loadType", e.target.value)}>
                    {LOAD_TYPES.map((l) => <option key={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="Incoterm">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {INCOTERMS.map((i) => (
                      <button key={i} type="button" onClick={() => set("incoterm", i)}
                        className={`h-9 rounded-md border text-xs font-mono font-semibold transition-colors ${form.incoterm === i ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-[var(--surface-2)]"}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Active route">
                <Select value={form.route} onChange={(e) => set("route", e.target.value)}>
                  {ROUTES.map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>

              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
                  className="w-full bg-[var(--surface-2)] border border-border rounded-md p-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Special handling, temperature, urgency…" />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Evidence attachments">
            <div className="space-y-4">
              <Field label="BOE document">
                {!boe ? (
                  <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-md border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">Upload BOE PDF</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setBoe(e.target.files?.[0] ?? null)} />
                  </label>
                ) : <FileChip name={boe.name} onRemove={() => setBoe(null)} icon={FileText} />}
              </Field>
              <Field label="PIC photo">
                {!pic ? (
                  <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-md border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">Upload PIC image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPic(e.target.files?.[0] ?? null)} />
                  </label>
                ) : <FileChip name={pic.name} onRemove={() => setPic(null)} icon={ImageIcon} />}
              </Field>
            </div>
          </Panel>

          <Panel title="Summary">
            <dl className="text-sm space-y-2">
              <Row k="Customer" v={form.customer || "—"} />
              <Row k="Route" v={`${form.origin} → ${form.destination}`} />
              <Row k="Transport" v={form.transport} />
              <Row k="Load" v={form.loadType} />
              <Row k="Incoterm" v={form.incoterm} />
              <Row k="Broker" v={form.broker} />
            </dl>
            <div className="mt-5 flex gap-2">
              <Btn type="submit" disabled={submitting} className="flex-1">{submitting ? "Submitting…" : "Submit booking"}</Btn>
            </div>
          </Panel>
        </div>
      </form>
    </AdminLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
      <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-right truncate max-w-[60%]">{v}</dd>
    </div>
  );
}