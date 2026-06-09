import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, Input, Select, Table, THead, TH, TR, TD, Field } from "@/components/admin/ui";
import { NOTIFICATIONS_SENT, REGIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/content/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Movers Admin" }] }),
  component: NotifsPage,
});

const REACH: Record<string, number> = { "All Users": 73610, Customers: 52810, "Truck Owners": 18230, Warehouses: 412 };

function NotifsPage() {
  const [history, setHistory] = useState(NOTIFICATIONS_SENT);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [target, setTarget] = useState("All Users");
  const [region, setRegion] = useState("Global");
  const reach = REACH[target] ?? 0;

  const send = (scheduled?: boolean) => {
    if (!title || !msg) { toast.error("Title and message are required"); return; }
    setHistory([{ id: Date.now(), title, target, date: new Date().toISOString().slice(0, 10), reach }, ...history]);
    toast.success(scheduled ? `Scheduled for ${region}` : `Sent to ${reach.toLocaleString()} ${target} in ${region}`);
    setTitle(""); setMsg("");
  };

  return (
    <AdminLayout>
      <PageHeader title="Notifications" subtitle="Broadcast announcements & in-app alerts" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Compose" className="lg:col-span-2">
          <div className="space-y-3">
            <Field label="Title"><Input className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" /></Field>
            <Field label="Message">
              <textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-border rounded-md p-2 text-sm focus:outline-none focus:border-primary" placeholder="Write your message…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target">
                <Select className="w-full" value={target} onChange={(e) => setTarget(e.target.value)}>
                  {Object.keys(REACH).map((k) => <option key={k}>{k}</option>)}
                </Select>
              </Field>
              <Field label="Region">
                <Select className="w-full" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>Global</option>{REGIONS.map((r) => <option key={r.code}>{r.name}</option>)}
                </Select>
              </Field>
            </div>
            <div className="flex gap-2 pt-2">
              <Btn onClick={() => send(false)}>Send Now</Btn>
              <Btn variant="secondary" onClick={() => send(true)}>Schedule</Btn>
            </div>
          </div>
        </Panel>
        <Panel title="Reach Estimate">
          <div className="font-mono text-4xl text-[var(--accent-lime)]">{reach.toLocaleString()}</div>
          <div className="text-xs font-mono text-muted-foreground uppercase mt-1">recipients</div>
          <div className="mt-4 pt-4 border-t border-border text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Push</span><span className="font-mono">{Math.floor(reach * 0.93).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">In-app</span><span className="font-mono">{reach.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-mono">{Math.floor(reach * 0.74).toLocaleString()}</span></div>
          </div>
        </Panel>
      </div>
      <Panel title="History">
        <Table>
          <THead><TR><TH>Title</TH><TH>Target</TH><TH>Date</TH><TH className="text-right">Reach</TH></TR></THead>
          <tbody>{history.map((n) => (
            <TR key={n.id}><TD className="font-medium">{n.title}</TD>
              <TD className="text-xs font-mono uppercase text-muted-foreground">{n.target}</TD>
              <TD className="font-mono text-xs">{n.date}</TD>
              <TD className="text-right font-mono">{n.reach.toLocaleString()}</TD></TR>
          ))}</tbody>
        </Table>
      </Panel>
    </AdminLayout>
  );
}