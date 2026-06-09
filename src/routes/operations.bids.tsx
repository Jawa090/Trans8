import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Avatar, Btn } from "@/components/admin/ui";
import { BOOKINGS, USERS, formatMoney } from "@/lib/mock-data";

export const Route = createFileRoute("/operations/bids")({
  head: () => ({ meta: [{ title: "Bids — Movers Admin" }] }),
  component: BidsPage,
});

function BidsPage() {
    const loads = BOOKINGS.filter((b) => b.status === "Pending").slice(0, 5);
    const owners = USERS.filter((u) => u.kind === "Truck Owner");
    const [awarded, setAwarded] = useState<Record<string, string>>({});
    const [skipped, setSkipped] = useState<Record<string, string[]>>({});
    return (
      <AdminLayout>
        <PageHeader title="Bids Management" subtitle="Open bidding pools across pending load requests" />
        <div className="space-y-4">
          {loads.map((b, i) => (
            <Panel key={b.id} title={<><span className="font-mono text-primary">{b.id}</span> · {b.origin} → {b.destination}</>}
              action={<StatusBadge status={awarded[b.id] ? "Confirmed" : "Pending"} />}>
              <div className="text-xs text-muted-foreground mb-3">{b.cargo} · {b.weight} · target {formatMoney(b.amount)}</div>
              <div className="space-y-2">
                {owners.slice(i, i + 3).filter((o) => !(skipped[b.id] ?? []).includes(o.id)).map((o, j) => (
                  <div key={o.id} className={`flex items-center gap-3 p-2.5 border rounded-md ${awarded[b.id] === o.id ? "bg-primary/10 border-primary/40" : "bg-[var(--surface-2)] border-border"}`}>
                    <Avatar initials={o.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{o.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">★ {o.rating} · {o.trips} trips</div>
                    </div>
                    <div className="font-mono text-[var(--accent-lime)] text-sm">{formatMoney(b.amount * (0.85 + j * 0.05))}</div>
                    {awarded[b.id] === o.id ? (
                      <span className="text-[10px] font-mono uppercase text-[var(--accent-lime)]">Awarded ✓</span>
                    ) : (
                      <>
                        <Btn className="h-7 px-3 text-xs" disabled={!!awarded[b.id]}
                          onClick={() => { setAwarded({ ...awarded, [b.id]: o.id }); toast.success(`Awarded ${b.id} to ${o.name}`); }}>Award</Btn>
                        <Btn variant="ghost" className="h-7 px-2 text-xs"
                          onClick={() => { setSkipped({ ...skipped, [b.id]: [...(skipped[b.id] ?? []), o.id] }); toast(`Skipped ${o.name}`); }}>Skip</Btn>
                      </>
                    )}
                  </div>
                ))}
                {owners.slice(i, i + 3).filter((o) => !(skipped[b.id] ?? []).includes(o.id)).length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">All bids skipped on this load</div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </AdminLayout>
    );
}