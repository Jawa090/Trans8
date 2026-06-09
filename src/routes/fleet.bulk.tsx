import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Table, THead, TH, TR, TD, Input, Select } from "@/components/admin/ui";
import { CONTAINERS } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/fleet/bulk")({
  head: () => ({ meta: [{ title: "Bulk Loads — Movers Admin" }] }),
  component: () => {
    const all = useMemo(() => CONTAINERS.filter((c) => c.mode === "Bulk"), []);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const rows = all.filter((c) => {
      if (status && c.status !== status) return false;
      if (q && !`${c.id} ${c.port} ${c.owner}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return (
      <AdminLayout>
        <PageHeader title="Bulk Load Management" subtitle={`${all.length} bulk consignments`} />
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, port, owner…" className="w-full pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option><option>At Port</option><option>Loaded</option><option>In Transit</option><option>Delivered</option>
          </Select>
        </div>
        <Table>
          <THead><TR><TH>Ref</TH><TH>Port</TH><TH>Load</TH><TH>Owner</TH><TH>Status</TH></TR></THead>
          <tbody>{rows.map((c) => (
            <TR key={c.id}><TD className="font-mono text-xs text-primary">{c.id}</TD>
              <TD>{c.port}</TD><TD className="font-mono">{c.load}</TD><TD>{c.owner}</TD>
              <TD><StatusBadge status={c.status} /></TD></TR>
          ))}</tbody>
        </Table>
      </AdminLayout>
    );
  },
});