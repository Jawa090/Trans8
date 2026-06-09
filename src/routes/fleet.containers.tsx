import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Table, THead, TH, TR, TD, Tabs, Input, Select } from "@/components/admin/ui";
import { CONTAINERS } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/fleet/containers")({
  head: () => ({ meta: [{ title: "Containers — Movers Admin" }] }),
  component: () => {
    const [tab, setTab] = useState("All");
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const rows = useMemo(() => CONTAINERS.filter((c) => {
      if (tab !== "All" && c.mode !== tab) return false;
      if (status && c.status !== status) return false;
      if (q && !`${c.id} ${c.port} ${c.owner}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }), [tab, q, status]);
    return (
      <AdminLayout>
        <PageHeader title="Container Management" subtitle={`${rows.length} units tracked`} />
        <Tabs tabs={["All", "FCL", "LCL", "Bulk"]} active={tab} onChange={setTab} />
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, port, owner…" className="w-full pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option><option>At Port</option><option>Loaded</option><option>In Transit</option><option>Delivered</option>
          </Select>
        </div>
        <Table>
          <THead><TR><TH>Container ID</TH><TH>Type</TH><TH>Mode</TH><TH>Status</TH><TH>Load</TH><TH>Port</TH><TH>Owner</TH></TR></THead>
          <tbody>{rows.map((c) => (
            <TR key={c.id}><TD className="font-mono text-xs text-primary">{c.id}</TD>
              <TD className="font-mono text-xs">{c.type}</TD>
              <TD><span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] border border-border">{c.mode}</span></TD>
              <TD><StatusBadge status={c.status} /></TD>
              <TD className="font-mono">{c.load}</TD><TD>{c.port}</TD><TD>{c.owner}</TD></TR>
          ))}</tbody>
        </Table>
      </AdminLayout>
    );
  },
});