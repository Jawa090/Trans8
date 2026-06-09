import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Modal, Field, Input } from "@/components/admin/ui";

interface Faq { id: number; q: string; a: string }
const SEED: Faq[] = [
  { id: 1, q: "How does the bidding process work for carriers?", a: "Carriers can place bids on open load requests. The admin or customer awards the best bid." },
  { id: 2, q: "What payment methods are supported in UAE?", a: "Stripe, Razorpay, and bank transfer are supported in the UAE region." },
  { id: 3, q: "How are commissions calculated per region?", a: "Commission is configured per region and shipment type in Finance → Commission." },
  { id: 4, q: "Can I track sea freight containers in real-time?", a: "Yes, AIS-based vessel tracking is enabled for FCL and LCL containers." },
  { id: 5, q: "How do I onboard a new warehouse partner?", a: "Use Users → Warehouses → Register, then submit verification documents for approval." },
];

export const Route = createFileRoute("/content/help")({
  head: () => ({ meta: [{ title: "FAQ & Help — Movers Admin" }] }),
  component: HelpPage,
});

function HelpPage() {
  const [faqs, setFaqs] = useState<Faq[]>(SEED);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [draft, setDraft] = useState({ q: "", a: "" });
  const open = (f?: Faq) => { setEditing(f ?? { id: 0, q: "", a: "" }); setDraft({ q: f?.q ?? "", a: f?.a ?? "" }); };
  const save = () => {
    if (!draft.q.trim()) { toast.error("Question required"); return; }
    if (editing!.id === 0) {
      const id = Math.max(0, ...faqs.map((x) => x.id)) + 1;
      setFaqs([...faqs, { id, ...draft }]); toast.success("Article published");
    } else {
      setFaqs(faqs.map((x) => x.id === editing!.id ? { ...x, ...draft } : x)); toast.success("Article updated");
    }
    setEditing(null);
  };
  const del = (id: number) => { setFaqs(faqs.filter((x) => x.id !== id)); toast.success("Article deleted"); };
  return (
    <AdminLayout>
      <PageHeader title="FAQ & Help" subtitle={`${faqs.length} published articles`} actions={<Btn onClick={() => open()}>+ New Article</Btn>} />
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <Panel key={f.id}>
            <div className="flex items-start gap-4">
              <div className="font-mono text-primary text-sm">Q{String(i + 1).padStart(2, "0")}</div>
              <div className="flex-1">
                <div className="font-display font-bold text-base">{f.q}</div>
                <div className="text-sm text-muted-foreground mt-1">{f.a}</div>
              </div>
              <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => open(f)}>Edit</Btn>
              <Btn variant="danger" className="h-7 px-2 text-xs" onClick={() => del(f.id)}>Delete</Btn>
            </div>
          </Panel>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Article" : "New Article"}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        <div className="space-y-3">
          <Field label="Question"><Input className="w-full" value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} /></Field>
          <Field label="Answer">
            <textarea rows={4} value={draft.a} onChange={(e) => setDraft({ ...draft, a: e.target.value })}
              className="w-full bg-[var(--surface-2)] border border-border rounded-md p-2 text-sm focus:outline-none focus:border-primary" />
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}