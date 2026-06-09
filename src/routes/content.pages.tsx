import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Table, THead, TH, TR, TD, StatusBadge, Btn, Modal, Field, Input, Select } from "@/components/admin/ui";

type Page = { slug: string; title: string; updated: string; status: string; body?: string };

const SEED: Page[] = [
  { slug: "/about", title: "About Movers", updated: "2026-05-12", status: "Active", body: "Global logistics, reimagined." },
  { slug: "/terms", title: "Terms of Service", updated: "2026-04-21", status: "Active", body: "Lorem ipsum." },
  { slug: "/privacy", title: "Privacy Policy", updated: "2026-04-21", status: "Active", body: "We respect your data." },
  { slug: "/carriers", title: "For Carriers", updated: "2026-03-08", status: "Active", body: "Join the Movers network." },
  { slug: "/coverage", title: "Coverage Areas", updated: "2026-02-14", status: "Pending", body: "Now serving 7 regions." },
];

export const Route = createFileRoute("/content/pages")({
  head: () => ({ meta: [{ title: "Pages — Movers Admin" }] }),
  component: PagesAdmin,
});

function today() { return new Date().toISOString().slice(0, 10); }

function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>(SEED);
  const [edit, setEdit] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);

  function save(p: Page, isNew: boolean) {
    if (!p.slug.startsWith("/") || !p.title.trim()) { toast.error("Slug must start with / and title is required"); return; }
    if (isNew) {
      if (pages.some((x) => x.slug === p.slug)) { toast.error("Slug already exists"); return; }
      setPages([{ ...p, updated: today() }, ...pages]);
      toast.success(`Page ${p.slug} created`);
      setCreating(false);
    } else {
      setPages(pages.map((x) => x.slug === p.slug ? { ...p, updated: today() } : x));
      toast.success(`Page ${p.slug} updated`);
      setEdit(null);
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Pages" subtitle={`${pages.length} CMS pages`}
        actions={<Btn onClick={() => setCreating(true)}>+ New Page</Btn>} />
      <Table>
        <THead><TR><TH>Slug</TH><TH>Title</TH><TH>Updated</TH><TH>Status</TH><TH></TH></TR></THead>
        <tbody>{pages.map((p) => (
          <TR key={p.slug}>
            <TD className="font-mono text-xs text-primary">{p.slug}</TD>
            <TD className="font-medium">{p.title}</TD>
            <TD className="font-mono text-xs">{p.updated}</TD>
            <TD><StatusBadge status={p.status} /></TD>
            <TD className="text-right">
              <div className="flex gap-1 justify-end">
                <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEdit(p)}>Edit</Btn>
                <Btn variant="danger" className="h-7 px-2 text-xs" onClick={() => {
                  setPages(pages.filter((x) => x.slug !== p.slug));
                  toast.success(`Deleted ${p.slug}`);
                }}>Delete</Btn>
              </div>
            </TD>
          </TR>
        ))}</tbody>
      </Table>

      {edit && <PageEditor page={edit} onClose={() => setEdit(null)} onSave={(p) => save(p, false)} />}
      {creating && <PageEditor page={{ slug: "/", title: "", updated: today(), status: "Active", body: "" }} isNew onClose={() => setCreating(false)} onSave={(p) => save(p, true)} />}
    </AdminLayout>
  );
}

function PageEditor({ page, isNew, onClose, onSave }: { page: Page; isNew?: boolean; onClose: () => void; onSave: (p: Page) => void }) {
  const [draft, setDraft] = useState<Page>(page);
  return (
    <Modal open onClose={onClose} title={isNew ? "New Page" : `Edit ${page.slug}`}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSave(draft)}>Save</Btn></>}>
      <div className="space-y-3">
        <Field label="Slug"><Input className="w-full" value={draft.slug} disabled={!isNew}
          onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="/path" /></Field>
        <Field label="Title"><Input className="w-full" value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
        <Field label="Status"><Select className="w-full" value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
          <option>Active</option><option>Pending</option><option>Suspended</option>
        </Select></Field>
        <Field label="Body"><textarea rows={5} value={draft.body ?? ""} onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          className="w-full bg-[var(--surface-2)] border border-border rounded-md p-2 text-sm focus:outline-none focus:border-primary" /></Field>
      </div>
    </Modal>
  );
}