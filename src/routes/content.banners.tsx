import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Modal, Field, Input } from "@/components/admin/ui";
import { Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/content/banners")({
  head: () => ({ meta: [{ title: "Banners — Movers Admin" }] }),
  component: BannersPage,
});

interface Banner { id: number; title: string; status: string }
function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(
    ["Eid Promo 2026", "UAE Free-zone discount", "Sea freight rate drop", "Karachi-Dubai express", "Winter trucking"]
      .map((t, i) => ({ id: i + 1, title: t, status: i % 3 === 0 ? "Pending" : "Active" }))
  );
  const [editing, setEditing] = useState<Banner | null>(null);
  const [draft, setDraft] = useState("");
  const open = (b?: Banner) => { setEditing(b ?? { id: 0, title: "", status: "Pending" }); setDraft(b?.title ?? ""); };
  const save = () => {
    if (!draft.trim()) { toast.error("Title required"); return; }
    if (editing!.id === 0) {
      const id = Math.max(0, ...banners.map((b) => b.id)) + 1;
      setBanners([{ id, title: draft, status: "Pending" }, ...banners]);
      toast.success("Banner created");
    } else {
      setBanners(banners.map((b) => b.id === editing!.id ? { ...b, title: draft } : b));
      toast.success("Banner updated");
    }
    setEditing(null);
  };
  const del = (id: number) => { setBanners(banners.filter((b) => b.id !== id)); toast.success("Banner deleted"); };

  return (
    <AdminLayout>
      <PageHeader title="Banners" subtitle={`${banners.length} marketing banners`} actions={<Btn onClick={() => open()}>+ New Banner</Btn>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => (
          <Panel key={b.id}>
            <div className="h-28 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-primary/30 to-[var(--surface-2)] border-b border-border grid place-items-center">
              <ImageIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="flex items-center justify-between"><div className="font-display font-bold">{b.title}</div><StatusBadge status={b.status} /></div>
            <div className="flex gap-2 mt-3"><Btn variant="secondary" className="flex-1" onClick={() => open(b)}>Edit</Btn><Btn variant="danger" onClick={() => del(b.id)}>Delete</Btn></div>
          </Panel>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Banner" : "New Banner"}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        <Field label="Banner title"><Input className="w-full" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Campaign title" /></Field>
      </Modal>
    </AdminLayout>
  );
}