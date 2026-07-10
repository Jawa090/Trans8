import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Table, THead, TH, TR, TD, Btn, Input, Select } from "@/components/admin/ui";
import { BOOKINGS, formatMoney } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/operations/loads")({
  head: () => ({ meta: [{ title: "Load Requests — Movers Admin" }] }),
  component: () => {
    const all = useMemo(() => BOOKINGS.filter((b) => b.status === "Pending"), []);
    const [q, setQ] = useState("");
    const [type, setType] = useState("");
    const loads = all.filter((b) => {
      if (type && b.type !== type) return false;
      if (q && !`${b.id} ${b.customer} ${b.cargo} ${b.origin} ${b.destination}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return (
      <AdminLayout>
        <PageHeader title="Tender Requests" subtitle={`${all.length} requests awaiting carrier assignment`} />
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Request No., customer, cargo, route…" className="w-full pl-9" />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All modes</option><option>Road</option><option>Train</option><option>Air</option><option>Sea</option>
          </Select>
        </div>
        <Table>
          <THead><TR><TH>Request No.</TH><TH>Customer</TH><TH>Cargo</TH><TH>Route</TH><TH>Mode</TH><TH>Weight</TH><TH>Posted</TH><TH className="text-right">Budget</TH><TH></TH></TR></THead>
          <tbody>
            {loads.map((b) => (
              <TR key={b.id}>
                <TD className="font-mono text-xs text-primary">{b.id}</TD>
                <TD className="font-medium">{b.customer}</TD>
                <TD>{b.cargo}</TD>
                <TD className="text-xs text-muted-foreground">{b.origin} → {b.destination}</TD>
                <TD className="text-xs font-mono uppercase">{b.type}</TD>
                <TD className="font-mono">{b.weight}</TD>
                <TD className="font-mono text-xs">{b.date}</TD>
                <TD className="text-right font-mono text-[var(--accent-lime)]">{formatMoney(b.amount)}</TD>
                <TD>
                  <Link to="/operations/bids" className="text-xs text-primary hover:underline">Open Tenders →</Link>
                </TD>
              </TR>
            ))}
            {loads.length === 0 && <TR><TD className="text-center text-muted-foreground py-10">No tender requests match these filters</TD></TR>}
          </tbody>
        </Table>
      </AdminLayout>
    );
  },
});