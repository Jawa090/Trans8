import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, Table, THead, TH, TR, TD, Btn, Input, Select, Panel, Drawer } from "@/components/admin/ui";
import { TRANSACTIONS, formatMoney } from "@/lib/mock-data";
import { toCsv, downloadFile, csvFilename, printReceipt } from "@/lib/export-utils";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/finance/")({
  head: () => ({ meta: [{ title: "Wallet Transactions — TRANS8 Admin" }] }),
  component: () => {
    const [q, setQ] = useState("");
    const [gw, setGw] = useState("");
    const [st, setSt] = useState("");
    const [selectedTx, setSelectedTx] = useState<(typeof TRANSACTIONS)[number] | null>(null);

    const rows = useMemo(() => TRANSACTIONS.filter((t) => {
      if (q && !`${t.id} ${t.user}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (gw && t.gateway !== gw) return false;
      if (st && t.status !== st) return false;
      return true;
    }), [q, gw, st]);

    return (
      <AdminLayout>
        <PageHeader title="Wallet Transactions" subtitle="Search and monitor all wallet credits, debits and gateway transactions" />
        
        <div className="flex gap-2 mb-4">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transaction ID or user" className="flex-1 min-w-[220px]" />
          <Select value={gw} onChange={(e) => setGw(e.target.value)}>
            <option value="">All gateways</option>
            <option>SDK Finance (Primary)</option>
            <option>Bank Transfer</option>
            <option>Crypto (USDT/ETH)</option>
          </Select>
          <Select value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">Any status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Txn ID</TH>
              <TH>User</TH>
              <TH>Type</TH>
              <TH>Gateway</TH>
              <TH>Date</TH>
              <TH>Status</TH>
              <TH className="text-right">Amount</TH>
              <TH></TH>
            </TR>
          </THead>
          <tbody>
            {rows.map((t) => (
              <TR key={t.id} className="cursor-pointer" onClick={() => setSelectedTx(t)}>
                <TD className="font-mono text-xs text-primary">{t.id}</TD>
                <TD>{t.user}</TD>
                <TD className="text-xs font-mono uppercase text-muted-foreground">{t.type}</TD>
                <TD>{t.gateway}</TD>
                <TD className="font-mono text-xs">{t.date}</TD>
                <TD><StatusBadge status={t.status} /></TD>
                <TD className="text-right font-mono">{formatMoney(t.amount)}</TD>
                <TD className="text-right">
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedTx(t); }}>
                    History
                  </Btn>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>

        <Drawer open={!!selectedTx} onClose={() => setSelectedTx(null)} title={selectedTx ? `Transaction ${selectedTx.id}` : ""}>
          {selectedTx && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{selectedTx.type}</div>
                  <div className="text-lg font-display font-bold mt-1">{selectedTx.id}</div>
                </div>
                <StatusBadge status={selectedTx.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">User</div>
                  <div className="text-sm font-medium mt-1">{selectedTx.user}</div>
                </div>
                <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Amount</div>
                  <div className="text-sm font-mono text-[var(--accent-lime)] font-bold mt-1">{formatMoney(selectedTx.amount)}</div>
                </div>
                <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Gateway</div>
                  <div className="text-sm font-medium mt-1">{selectedTx.gateway}</div>
                </div>
                <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Date</div>
                  <div className="text-sm font-medium mt-1">{selectedTx.date}</div>
                </div>
              </div>

              <Panel title="Transaction History">
                <ol className="relative border-l border-border ml-2 space-y-3 pl-4">
                  <li className="text-xs relative">
                    <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="font-medium text-foreground">{selectedTx.type} initiated</div>
                    <div className="text-muted-foreground font-mono">{selectedTx.date} · {selectedTx.gateway}</div>
                  </li>
                  <li className="text-xs relative">
                    <span className={`absolute -left-[5px] h-2.5 w-2.5 rounded-full ${selectedTx.status !== "Failed" ? "bg-primary" : "bg-[var(--surface-3)]"}`} />
                    <div className="font-medium">Gateway processed</div>
                    <div className="text-muted-foreground font-mono">Awaiting confirmation</div>
                  </li>
                  <li className="text-xs relative">
                    <span className={`absolute -left-[5px] h-2.5 w-2.5 rounded-full ${selectedTx.status === "Completed" ? "bg-primary" : "bg-[var(--surface-3)]"}`} />
                    <div className={`font-medium ${selectedTx.status === "Completed" ? "text-foreground" : "text-muted-foreground"}`}>
                      {selectedTx.status === "Completed" ? "Completed — Wallet credited" : selectedTx.status === "Failed" ? "Failed — Reversed" : "Pending settlement"}
                    </div>
                    <div className="text-muted-foreground font-mono">
                      {selectedTx.status === "Completed" ? "Funds settled to user wallet" : selectedTx.status === "Failed" ? "Transaction reversed" : "Awaiting final confirmation"}
                    </div>
                  </li>
                </ol>
              </Panel>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Btn className="flex-1" onClick={() => {
                  const csv = toCsv([
                    { ID: selectedTx.id, User: selectedTx.user, Type: selectedTx.type, Gateway: selectedTx.gateway, Amount: selectedTx.amount, Status: selectedTx.status, Date: selectedTx.date }
                  ], ["ID", "User", "Type", "Gateway", "Amount", "Status", "Date"]);
                  downloadFile(csv, csvFilename(`TXN_${selectedTx.id}`));
                  toast.success(`CSV exported: ${selectedTx.id}`);
                }}>
                  <Download className="h-4 w-4" /> Export CSV
                </Btn>
                <Btn variant="secondary" className="flex-1" onClick={() => {
                  const w = printReceipt(`Transaction ${selectedTx.id}`, [
                    { label: "Transaction ID", value: selectedTx.id },
                    { label: "User", value: selectedTx.user },
                    { label: "Type", value: selectedTx.type },
                    { label: "Gateway", value: selectedTx.gateway },
                    { label: "Amount", value: formatMoney(selectedTx.amount) },
                    { label: "Status", value: selectedTx.status },
                    { label: "Date", value: selectedTx.date },
                  ]);
                  if (w) toast.success("Receipt opened for printing / PDF save");
                  else toast.error("Popup blocked — allow popups to print receipts");
                }}>
                  <FileText className="h-4 w-4" /> Save PDF
                </Btn>
                <Btn variant="danger" className="flex-1" onClick={() => toast.success(`Refund initiated for ${selectedTx.id}`)}>Refund</Btn>
              </div>
            </div>
          )}
        </Drawer>
      </AdminLayout>
    );
  },
});
