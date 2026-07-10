import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, StatusBadge, Avatar, Btn, Tabs } from "@/components/admin/ui";
import { BOOKINGS, USERS, formatMoney } from "@/lib/mock-data";
import { Truck, Clock, Award, Users, Gavel } from "lucide-react";

export const Route = createFileRoute("/operations/bids")({
  head: () => ({ meta: [{ title: "Tenders — TRANS8" }] }),
  component: TenderPage,
});

const CARRIER_NAMES = [
  "Al Faris Transport", "Karimi Logistics", "Khan Trucking", "Yilmaz Hafriyat",
  "Naidoo Freight", "Botha Carriers", "Aydin Loji", "Petrov Cargo",
  "Rahimi Express", "Zahid & Sons", "Mansouri Logistics", "Gulf Haulage"
];

const VEHICLE_TYPES = ["40ft Container Trailer", "Refrigerated Trailer", "Flatbed", "Chemical Tanker", "Box Truck", "Curtain Side"];
const ESTIMATED_TRANSIT = ["2 days", "3 days", "4 days", "5 days", "6 days", "7 days"];

interface Bid {
  carrierId: string;
  carrierName: string;
  vehicle: string;
  bidAmount: number;
  rating: number;
  trips: number;
  estTransit: string;
  insurance: boolean;
  photo: string;
}

function generateBids(loadAmount: number, seed: number): Bid[] {
  const cnt = 4 + (seed % 3); // 4-6 bidders per load
  return Array.from({ length: cnt }, (_, j) => {
    const idx = (seed + j * 7) % CARRIER_NAMES.length;
    const discount = 0.78 + (j * (seed % 5)) / 100;
    return {
      carrierId: `CR-${4000 + seed * 10 + j}`,
      carrierName: CARRIER_NAMES[idx],
      vehicle: VEHICLE_TYPES[(seed + j) % VEHICLE_TYPES.length],
      bidAmount: Math.round(loadAmount * discount),
      rating: +(3.8 + ((seed + j) % 12) * 0.1).toFixed(1),
      trips: 40 + ((seed * 7 + j * 13) % 300),
      estTransit: ESTIMATED_TRANSIT[(seed + j) % ESTIMATED_TRANSIT.length],
      insurance: (seed + j) % 3 !== 0,
      photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=carrier${seed}${j}`
    };
  });
}

const AWARDED_HISTORY: { id: string; load: string; carrier: string; amount: number; date: string }[] = [
  { id: "AW-101", load: "BK-20418", carrier: "Al Faris Transport", amount: 8900, date: "2026-06-15" },
  { id: "AW-102", load: "BK-20419", carrier: "Karimi Logistics", amount: 12400, date: "2026-06-14" },
  { id: "AW-103", load: "BK-20420", carrier: "Khan Trucking", amount: 6500, date: "2026-06-12" },
  { id: "AW-104", load: "BK-20422", carrier: "Naidoo Freight", amount: 15800, date: "2026-06-10" },
];

function TenderPage() {
  const [tab, setTab] = useState("Open Tenders");
  const loads = useMemo(() => BOOKINGS.filter((b) => b.status === "Pending"), []);
  const [awarded, setAwarded] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Record<string, string[]>>({});

  const stats = useMemo(() => ({
    open: loads.length,
    activeBidders: loads.reduce((s, b, i) => s + generateBids(b.amount, parseInt(b.id.replace(/\D/g, ""))).length, 0),
    awarded: AWARDED_HISTORY.length,
    avgBid: loads.reduce((s, b, i) => s + generateBids(b.amount, parseInt(b.id.replace(/\D/g, "")))[0]?.bidAmount || 0, 0) / loads.length,
  }), [loads]);

  return (
    <AdminLayout>
      <PageHeader
        title="Tender & Bidding Operations"
        subtitle={`${stats.open} active pools · ${stats.activeBidders} competitive bids · ${stats.awarded} finalized contracts`}
      />

      <Tabs tabs={["Open Tenders", "Awarded History"]} active={tab} onChange={setTab} />

      {tab === "Open Tenders" && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Stat icon={Gavel} label="Open Pools" value={String(stats.open)} />
            <Stat icon={Users} label="Active Tenders" value={String(stats.activeBidders)} />
            <Stat icon={Award} label="Awarded" value={String(stats.awarded)} />
            <Stat icon={Clock} label="Avg Tender" value={formatMoney(Math.round(stats.avgBid))} />
          </div>

          <div className="space-y-5">
            {loads.slice(0, 8).map((b, i) => {
              const seed = parseInt(b.id.replace(/\D/g, ""), 10) || i;
              const bids = generateBids(b.amount, seed);
              const aw = awarded[b.id];
              return (
                <Panel key={b.id} title={<><span className="font-mono text-primary">Request No. {b.id}</span> · {b.origin} → {b.destination}</>}
                  action={<StatusBadge status={aw ? "Confirmed" : "Pending"} />}>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span>{b.cargo}</span>
                    {b.hsCode && (
                      <span className="text-[10px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-primary font-mono font-semibold">
                        HS {b.hsCode}
                      </span>
                    )}
                    <span className="text-border">|</span>
                    <span className="font-mono">{b.weight}</span>
                    <span className="text-border">|</span>
                    <span>Target Budget: <span className="font-mono text-[var(--accent-lime)]">{formatMoney(b.amount)}</span></span>
                  </div>
                  <div className="space-y-2.5">
                    {bids.filter((o) => !(skipped[b.id] ?? []).includes(o.carrierId)).map((o) => (
                      <div key={o.carrierId} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${aw === o.carrierId ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30" : "bg-[var(--surface-2)] border-border hover:border-primary/30"}`}>
                        <Avatar initials={o.carrierName.split(" ").map((p) => p[0]).join("").slice(0, 2)} photo={o.photo} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{o.carrierName}</div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono text-muted-foreground">
                            <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{o.vehicle}</span>
                            <span>★ {o.rating}</span>
                            <span>{o.trips} trips</span>
                            <span>{o.estTransit}</span>
                            {o.insurance && <span className="text-[var(--accent-lime)]">Insured ✓</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm text-[var(--accent-lime)] font-bold">{formatMoney(o.bidAmount)}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{((o.bidAmount / b.amount) * 100 - 100).toFixed(1)}% vs target</div>
                        </div>
                        {aw === o.carrierId ? (
                          <span className="text-[10px] font-mono uppercase text-[var(--accent-lime)] font-bold px-2 py-1 rounded bg-primary/20">Awarded ✓</span>
                        ) : (
                          <div className="flex gap-1">
                            <Btn className="h-8 px-3 text-xs" disabled={!!aw}
                              onClick={() => {
                                setAwarded({ ...awarded, [b.id]: o.carrierId });
                                toast.success(`Tender successfully awarded for Request ${b.id} to ${o.carrierName}`);
                                toast.info(`Email Notification Triggered: Contract dispatched to ${o.carrierName.toLowerCase().replace(/\s+/g, "")}@trans8-partners.net`);
                              }}>
                              Award
                            </Btn>
                            <Btn variant="ghost" className="h-8 px-2 text-xs" disabled={!!aw}
                              onClick={() => { setSkipped({ ...skipped, [b.id]: [...(skipped[b.id] ?? []), o.carrierId] }); toast(`Tender carrier skipped for ${o.carrierName}`); }}>
                              Skip
                            </Btn>
                          </div>
                        )}
                      </div>
                    ))}
                    {bids.filter((o) => !(skipped[b.id] ?? []).includes(o.carrierId)).length === 0 && (
                      <div className="text-center text-xs text-muted-foreground py-6 border-2 border-dashed border-border rounded-lg">
                        All offers dismissed on this tender
                      </div>
                    )}
                    {aw && (
                      <div className="mt-2 p-2 bg-[var(--surface-2)] border border-[var(--accent-lime)]/30 rounded-md text-xs text-center font-mono text-[var(--accent-lime)]">
                        ✓ Tender awarded — carrier notified via automated email, contract pending signature
                      </div>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>
        </>
      )}

      {tab === "Awarded History" && (
        <Panel title="Recent Awarded Tenders">
          <div className="space-y-3">
            {AWARDED_HISTORY.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-[var(--surface-2)] border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar initials={a.carrier.split(" ").map((p) => p[0]).join("").slice(0, 2)} size={36} />
                  <div>
                    <div className="font-medium text-sm">{a.carrier}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">Request No: {a.load} · {a.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-[var(--accent-lime)] font-bold">{formatMoney(a.amount)}</div>
                  <StatusBadge status="Completed" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </AdminLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-1)] border border-border rounded-lg p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-md bg-primary/15 text-primary grid place-items-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}