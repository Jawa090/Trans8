import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Field, Input, Select } from "@/components/admin/ui";
import { toast } from "sonner";
import { UploadCloud, FileText, Image as ImageIcon, X, ChevronRight, ChevronLeft, Check } from "lucide-react";

export const Route = createFileRoute("/load-request")({
  head: () => ({ meta: [{ title: "Load Request — TRANS8" }] }),
  component: LoadRequestPage,
});

import { getCountriesDatabase, useCountries } from "@/lib/countries-store";

export const META_DIRECTORIES = getCountriesDatabase();


const TRANSPORT = ["Sea", "Air", "Rail", "Road"] as const;
const LOAD_TYPES = ["Container", "Bulk", "Gas", "Fuel", "Raw", "Liquid"];
const INCOTERMS = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DPU", "DAP", "DDP"];
const ROUTES_BY_COUNTRY: Record<string, string[]> = {
  UAE: ["TR-001 · UAE Local Route", "TR-002 · Gulf Link", "TR-003 · UAE → Iran Transit"],
  Pakistan: ["TR-014 · PK Port Qasim Route", "TR-015 · Gwadar Link", "TR-016 · PK → AE Express"],
  Iran: ["TR-022 · Bandar Abbas Inland", "TR-023 · Chabahar Gate", "TR-024 · IR → TR Route"],
  "South Africa": ["TR-031 · Durban Port Express", "TR-032 · ZA Transit Link", "TR-033 · JNB Airport Route"],
  Turkey: ["TR-040 · Istanbul Sea Route", "TR-041 · Mersin Port Gate", "TR-042 · Turkey → Europe"],
  India: ["TR-051 · JNPT Mumbai Link", "TR-052 · Mundra Express", "TR-053 · India Port Transit"]
};

const AGENT_MAPPING: Record<string, Record<string, string>> = {
  UAE: { Sea: "Omar Al-Saud (Port Agent)", Air: "Amir Rahimi (Custom Agent)", Rail: "Layla Hosseini (Logistic Broker)", Road: "Omar Al-Saud (Logistics Partner)" },
  Pakistan: { Sea: "Hassan Khan (Port Agent)", Air: "Sara Petrov (Logistics Partner)", Rail: "Nadia Mansouri (Logistic Broker)", Road: "Hassan Khan (Logistics Partner)" },
  Iran: { Sea: "Reza Karimi (Port Agent)", Air: "Mehmet Yilmaz (Custom Agent)", Rail: "Ivan Volkov (Logistics Partner)", Road: "Nadia Mansouri (Logistic Broker)" },
  "South Africa": { Sea: "Zara Botha (Port Agent)", Air: "Ivan Volkov (Logistics Partner)", Rail: "Mehmet Yilmaz (Custom Agent)", Road: "Sara Petrov (Logistics Partner)" },
  Turkey: { Sea: "Mehmet Yilmaz (Port Agent)", Air: "Fatima Aydin (Custom Agent)", Rail: "Yusuf Karimi (Logistic Broker)", Road: "Zara Botha (Logistics Partner)" },
  India: { Sea: "Hassan Khan (Port Agent)", Air: "Amir Rahimi (Custom Agent)", Rail: "Ivan Volkov (Logistics Partner)", Road: "Zara Botha (Logistics Partner)" }
};

function FileChip({ name, onRemove, icon: Icon }: { name: string; onRemove: () => void; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--surface-2)] border border-border text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="truncate flex-1">{name}</span>
      <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
    </div>
  );
}

function LoadRequestPage() {
  const { countries } = useCountries();
  const COUNTRIES = Object.keys(countries);
  const COUNTRY_FLAGS = Object.entries(countries).reduce<Record<string, string>>((acc, [k, v]) => {
    acc[k] = v.flag;
    return acc;
  }, {});
  const META_DIRECTORIES = countries;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    customer: "",
    country: "UAE",
    city: "Dubai",
    transport: "Sea" as typeof TRANSPORT[number],
    origin: "Jebel Ali Port",
    destination: "Khalifa Port",
    loadType: "Container",
    incoterm: "FOB",
    route: "TR-001 · UAE Local Route",
    notes: "",
  });
  const [boe, setBoe] = useState<File | null>(null);
  const [pic, setPic] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);


  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "country") {
        const meta = META_DIRECTORIES[v as string];
        next.city = meta?.cities[0] || "";
        if (next.transport === "Road") {
          next.origin = meta?.cities[0] || "";
          next.destination = meta?.cities[1] || meta?.cities[0] || "";
        } else if (next.transport === "Train") {
          next.origin = meta?.stations[0] || "";
          next.destination = meta?.stations[1] || meta?.stations[0] || "";
        } else if (next.transport === "Air") {
          next.origin = meta?.airports[0]?.code || "";
          next.destination = meta?.airports[1]?.code || meta?.airports[0]?.code || "";
        } else {
          next.origin = meta?.ports[0] || "";
          next.destination = meta?.ports[1] || meta?.ports[0] || "";
        }
        const routes = ROUTES_BY_COUNTRY[v as string] || [];
        next.route = routes[0] || "";
      } else if (k === "transport") {
        const meta = META_DIRECTORIES[next.country];
        if (v === "Road") {
          next.origin = meta?.cities[0] || "";
          next.destination = meta?.cities[1] || meta?.cities[0] || "";
        } else if (v === "Train") {
          next.origin = meta?.stations[0] || "";
          next.destination = meta?.stations[1] || meta?.stations[0] || "";
        } else if (v === "Air") {
          next.origin = meta?.airports[0]?.code || "";
          next.destination = meta?.airports[1]?.code || meta?.airports[0]?.code || "";
        } else {
          next.origin = meta?.ports[0] || "";
          next.destination = meta?.ports[1] || meta?.ports[0] || "";
        }
      }
      return next;
    });
  };

  // Determine auto-assigned agent
  const autoAssignedAgent = useMemo(() => {
    const countryMap = AGENT_MAPPING[form.country];
    if (countryMap) {
      return countryMap[form.transport] || "Global Assign Agent";
    }
    return "Global Assign Agent";
  }, [form.country, form.transport]);

  const nextStep = () => {
    if (step === 1 && !form.customer.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer.trim()) return toast.error("Customer name is required");
    if (form.origin === form.destination) return toast.error("Origin and destination must differ");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Booking created for ${form.customer} · Assigned Agent: ${autoAssignedAgent}`);
      setForm({
        customer: "",
        country: "UAE",
        city: "Dubai",
        transport: "Sea",
        origin: "Jebel Ali Port",
        destination: "Khalifa Port",
        loadType: "Container",
        incoterm: "FOB",
        route: "TR-001 · UAE Local Route",
        notes: "",
      });
      setBoe(null);
      setPic(null);
      setStep(1);
    }, 800);
  };

  return (
    <AdminLayout>
      <PageHeader title="New Load Request" subtitle="Interactive step-by-step load request & agent assignment wizard" />

      {/* Visual Stepper Progress Bar */}
      <div className="mb-8 bg-[var(--surface-1)] border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { num: 1, label: "Country" },
              { num: 2, label: "Type" },
              { num: 3, label: "Port/Route" },
              { num: 4, label: "Incoterm" },
              { num: 5, label: "Agent" }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-1.5 shrink-0">
                <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-mono font-bold transition-colors ${
                  step > s.num ? "bg-primary text-primary-foreground" : step === s.num ? "border-2 border-primary text-primary bg-primary/10" : "border border-border text-muted-foreground"
                }`}>
                  {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <span className={`text-xs font-medium ${step === s.num ? "text-foreground font-bold" : "text-muted-foreground"}`}>{s.label}</span>
                {s.num < 5 && <div className="h-px w-6 sm:w-10 bg-border mx-1" />}
              </div>
            ))}
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Step {step} of 5
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: SELECT COUNTRY */}
          {step === 1 && (
            <Panel title="Step 1: Select Country & Customer">
              <div className="space-y-5">
                <Field label="Customer name">
                  <Input value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="e.g. Aurora Trading LLC" className="w-full" />
                </Field>
                <Field label="Select Target Country">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {COUNTRIES.map((c) => (
                      <button key={c} type="button" onClick={() => set("country", c)}
                        className={`p-4 rounded-md border text-left flex flex-col gap-2 transition-all ${
                          form.country === c ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary" : "border-border hover:bg-[var(--surface-2)] text-muted-foreground"
                        }`}>
                        <span className="text-3xl">{COUNTRY_FLAGS[c]}</span>
                        <span className="font-semibold text-sm">{c}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Select City (Target Region)">
                  <Select value={form.city} onChange={(e) => set("city", e.target.value)} className="w-full">
                    {(META_DIRECTORIES[form.country]?.cities || []).map((ct) => <option key={ct}>{ct}</option>)}
                  </Select>
                </Field>
              </div>
            </Panel>
          )}

          {/* STEP 2: SELECT TYPE */}
          {step === 2 && (
            <Panel title="Step 2: Select Transport & Load Type">
              <div className="space-y-6">
                <Field label="Transport Type">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TRANSPORT.map((t) => (
                      <button key={t} type="button" onClick={() => set("transport", t)}
                        className={`h-16 rounded-md border text-sm font-semibold flex flex-col justify-center items-center gap-1 transition-all ${
                          form.transport === t ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border hover:bg-[var(--surface-2)]"
                        }`}>
                        <span className="text-xs uppercase font-mono tracking-wider">Transport</span>
                        <span className="text-base">{t}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                  <Field label="Type of load">
                    <Select value={form.loadType} onChange={(e) => set("loadType", e.target.value)} className="w-full">
                      {LOAD_TYPES.map((l) => <option key={l}>{l}</option>)}
                    </Select>
                  </Field>
                  <Field label="Special Notes">
                    <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Special handling, temp…" className="w-full" />
                  </Field>
                </div>
              </div>
            </Panel>
          )}

          {/* STEP 3: SELECT PORT & ROUTE */}
          {step === 3 && (
            <Panel title={`Step 3: Select Location & Route (Filtered: ${form.country})`}>
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {form.transport === "Road" ? (
                    <>
                      <Field label="Origin City">
                        <Select value={form.origin} onChange={(e) => set("origin", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.cities || []).map((c) => <option key={c}>{c}</option>)}
                        </Select>
                      </Field>
                      <Field label="Destination City">
                        <Select value={form.destination} onChange={(e) => set("destination", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.cities || []).map((c) => <option key={c}>{c}</option>)}
                        </Select>
                      </Field>
                    </>
                  ) : form.transport === "Train" ? (
                    <>
                      <Field label="Origin Train Station">
                        <Select value={form.origin} onChange={(e) => set("origin", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.stations || []).map((s) => <option key={s}>{s}</option>)}
                        </Select>
                      </Field>
                      <Field label="Destination Train Station">
                        <Select value={form.destination} onChange={(e) => set("destination", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.stations || []).map((s) => <option key={s}>{s}</option>)}
                        </Select>
                      </Field>
                    </>
                  ) : form.transport === "Air" ? (
                    <>
                      <Field label="Origin Airport">
                        <Select value={form.origin} onChange={(e) => set("origin", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.airports || []).map((a) => (
                            <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Destination Airport">
                        <Select value={form.destination} onChange={(e) => set("destination", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.airports || []).map((a) => (
                            <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
                          ))}
                        </Select>
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Origin Port">
                        <Select value={form.origin} onChange={(e) => set("origin", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.ports || []).map((p) => <option key={p}>{p}</option>)}
                        </Select>
                      </Field>
                      <Field label="Destination Port">
                        <Select value={form.destination} onChange={(e) => set("destination", e.target.value)} className="w-full">
                          {(META_DIRECTORIES[form.country]?.ports || []).map((p) => <option key={p}>{p}</option>)}
                        </Select>
                      </Field>
                    </>
                  )}
                </div>

                <Field label="Active Route (Filtered)">
                  <Select value={form.route} onChange={(e) => set("route", e.target.value)} className="w-full">
                    {(ROUTES_BY_COUNTRY[form.country] || []).map((r) => <option key={r}>{r}</option>)}
                  </Select>
                </Field>
              </div>
            </Panel>
          )}

          {/* STEP 4: SELECT INCOTERM */}
          {step === 4 && (
            <Panel title="Step 4: Select Incoterm">
              <div className="space-y-4">
                <Field label="Select Incoterm (Rules of trade)">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {INCOTERMS.map((i) => (
                      <button key={i} type="button" onClick={() => set("incoterm", i)}
                        className={`h-11 rounded-md border text-sm font-mono font-semibold transition-all ${
                          form.incoterm === i ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border hover:bg-[var(--surface-2)]"
                        }`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="mt-4 p-3 bg-[var(--surface-2)] border border-border rounded-md text-xs text-muted-foreground">
                  <strong>Selected: {form.incoterm}</strong> — All shipment responsibilities between seller and buyer will be calculated under {form.incoterm} parameters.
                </div>
              </div>
            </Panel>
          )}

          {/* STEP 5: AGENT AUTO ASSIGNED */}
          {step === 5 && (
            <Panel title="Step 5: Agent Auto-Assignment & Summary">
              <div className="space-y-5">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary grid place-items-center font-bold text-lg text-primary-foreground font-display">
                    {autoAssignedAgent.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-primary uppercase tracking-wider">Auto-Assigned Agent</div>
                    <div className="font-semibold text-lg text-foreground mt-0.5">{autoAssignedAgent}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Assigned based on country <strong>{form.country}</strong>, city <strong>{form.city}</strong>, transport mode <strong>{form.transport}</strong>, and origin <strong>{form.origin}</strong>.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--surface-2)] border border-border rounded-lg">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Final Summary Details</div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-muted-foreground">Country & City</dt>
                      <dd className="font-semibold">{COUNTRY_FLAGS[form.country]} {form.country} · {form.city}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-muted-foreground">Transport</dt>
                      <dd className="font-semibold">{form.transport}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-muted-foreground">Origin</dt>
                      <dd className="font-semibold">{form.origin}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-muted-foreground">Destination</dt>
                      <dd className="font-semibold">{form.destination}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-muted-foreground">Incoterm</dt>
                      <dd className="font-semibold font-mono">{form.incoterm}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase text-muted-foreground">Load Type</dt>
                      <dd className="font-semibold">{form.loadType}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Panel>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-6">
            <Btn type="button" variant="ghost" onClick={prevStep} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Btn>
            {step < 5 ? (
              <Btn type="button" onClick={nextStep} className="gap-1.5">
                Next <ChevronRight className="h-4 w-4" />
              </Btn>
            ) : (
              <Btn type="submit" disabled={submitting} className="min-w-[120px]">
                {submitting ? "Submitting…" : "Confirm Booking"}
              </Btn>
            )}
          </div>
        </div>

        {/* SIDEBAR EVIDENCE ATTACHMENTS & REAL-TIME SUMMARY */}
        <div className="space-y-6">
          <Panel title="Evidence attachments">
            <div className="space-y-4">
              <Field label="BOE document">
                {!boe ? (
                  <label className="flex flex-col items-center justify-center gap-2 h-24 rounded-md border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <span className="text-[11px] text-muted-foreground">Upload BOE PDF</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setBoe(e.target.files?.[0] ?? null)} />
                  </label>
                ) : <FileChip name={boe.name} onRemove={() => setBoe(null)} icon={FileText} />}
              </Field>
              <Field label="PIC photo">
                {!pic ? (
                  <label className="flex flex-col items-center justify-center gap-2 h-24 rounded-md border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <span className="text-[11px] text-muted-foreground">Upload PIC image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPic(e.target.files?.[0] ?? null)} />
                  </label>
                ) : <FileChip name={pic.name} onRemove={() => setPic(null)} icon={ImageIcon} />}
              </Field>
            </div>
          </Panel>

          <Panel title="Summary Panel">
            <dl className="text-sm space-y-2">
              <Row k="Customer" v={form.customer || "—"} />
              <Row k="Country" v={form.country} />
              <Row k="City" v={form.city} />
              <Row k="Transport" v={form.transport} />
              <Row k="Origin" v={form.origin} />
              <Row k="Destination" v={form.destination} />
              <Row k="Incoterm" v={form.incoterm} />
              <Row k="Load Type" v={form.loadType} />
              <Row k="Auto Agent" v={autoAssignedAgent} />
            </dl>
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
      <dd className="text-right truncate max-w-[60%] font-medium">{v}</dd>
    </div>
  );
}