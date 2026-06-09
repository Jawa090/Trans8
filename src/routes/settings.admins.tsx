import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Table, THead, TH, TR, TD, Avatar, Btn, Modal, Field, Input, Select } from "@/components/admin/ui";
import { ADMIN_USERS } from "@/lib/mock-data";

const ROLES = ["Super Admin", "Operations", "Finance", "Support"];

export const Route = createFileRoute("/settings/admins")({
  head: () => ({ meta: [{ title: "Admin Users — Movers Admin" }] }),
  component: AdminsPage,
});

function AdminsPage() {
  const [list, setList] = useState(ADMIN_USERS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", role: "Operations" });
  const invite = () => {
    if (!draft.name || !draft.email) { toast.error("Name and email required"); return; }
    setList([{ id: `AD-${String(list.length + 1).padStart(3, "0")}`, name: draft.name, email: draft.email, role: draft.role, lastActive: "Just now" }, ...list]);
    toast.success(`Invitation sent to ${draft.email}`);
    setOpen(false); setDraft({ name: "", email: "", role: "Operations" });
  };
  const remove = (id: string) => { setList(list.filter((a) => a.id !== id)); toast.success("Admin removed"); };
  return (
    <AdminLayout>
      <PageHeader title="Admin Users" subtitle={`${list.length} team members`} actions={<Btn onClick={() => setOpen(true)}>+ Invite Admin</Btn>} />
      <Table>
        <THead><TR><TH>Admin</TH><TH>Email</TH><TH>Role</TH><TH>Last Active</TH><TH></TH></TR></THead>
        <tbody>{list.map((a) => (
          <TR key={a.id}>
            <TD><div className="flex items-center gap-3"><Avatar initials={a.name.split(" ").map((p) => p[0]).join("")} /><span className="font-medium">{a.name}</span></div></TD>
            <TD className="font-mono text-xs">{a.email}</TD>
            <TD><span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-[var(--accent-lime)] border border-primary/30">{a.role}</span></TD>
            <TD className="text-xs text-muted-foreground">{a.lastActive}</TD>
            <TD><div className="flex gap-1 justify-end">
              <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast(`Editing ${a.name}…`)}>Edit</Btn>
              <Btn variant="danger" className="h-7 px-2 text-xs" onClick={() => remove(a.id)}>Remove</Btn>
            </div></TD>
          </TR>
        ))}</tbody>
      </Table>
      <Modal open={open} onClose={() => setOpen(false)} title="Invite Admin"
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={invite}>Send Invite</Btn></>}>
        <div className="space-y-3">
          <Field label="Name"><Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label="Email"><Input className="w-full" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@movers.io" /></Field>
          <Field label="Role"><Select className="w-full" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Select></Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}