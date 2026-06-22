import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel, PageHeader, StatusBadge, Btn, Avatar, Tabs, Input, Select, Drawer, Table, THead, TH, TR, TD, Modal, Field } from "@/components/admin/ui";
import { USERS, REGIONS, BOOKINGS, formatMoney, type User } from "@/lib/mock-data";
import { Search, Download, User as UserIcon, UploadCloud, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Users — TRANS8 Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [usersList, setUsersList] = useState<User[]>(USERS);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    phone: "",
    region: "UAE",
    city: "Dubai",
    role: "Logistic Broker",
    activity: "Freight Tendering",
  });

  const handleOpenInvite = () => {
    setDraft({
      name: "",
      email: "",
      phone: "",
      region: "UAE",
      city: "Dubai",
      role: "Logistic Broker",
      activity: "Freight Tendering",
    });
    setPhotoPreview("");
    setInviteOpen(true);
  };

  // Map Region selection to country key for META_DIRECTORIES
  const currentRegionKey = useMemo(() => {
    if (draft.region.includes("UAE")) return "UAE";
    if (draft.region.includes("Pakistan")) return "Pakistan";
    if (draft.region.includes("Iran")) return "Iran";
    if (draft.region.includes("South Africa")) return "South Africa";
    if (draft.region.includes("Turkey")) return "Turkey";
    if (draft.region.includes("India")) return "India";
    return "UAE";
  }, [draft.region]);

  const citiesForRegion = useMemo(() => {
    return META_DIRECTORIES[currentRegionKey]?.cities || [];
  }, [currentRegionKey]);

  // Handle region change in draft
  const handleRegionChange = (newRegion: string) => {
    let mappingKey = "UAE";
    if (newRegion.includes("UAE")) mappingKey = "UAE";
    else if (newRegion.includes("Pakistan")) mappingKey = "Pakistan";
    else if (newRegion.includes("Iran")) mappingKey = "Iran";
    else if (newRegion.includes("South Africa")) mappingKey = "South Africa";
    else if (newRegion.includes("Turkey")) mappingKey = "Turkey";
    else if (newRegion.includes("India")) mappingKey = "India";

    const defaultCity = META_DIRECTORIES[mappingKey]?.cities[0] || "Dubai";
    setDraft({
      ...draft,
      region: newRegion,
      city: defaultCity
    });
  };

  const filtered = useMemo(() => usersList.filter((u) => {
    if (tab === "Networked Users" && u.kind !== "Networked") return false;
    if (tab === "System Users" && u.kind !== "System") return false;
    if (q && !`${u.name} ${u.id} ${u.role} ${u.city} ${u.activity}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (region && u.region !== region) return false;
    if (status && u.status !== status) return false;
    return true;
  }), [usersList, tab, q, region, status]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const handleInvite = () => {
    if (!draft.name || !draft.email) {
      toast.error("Name and Email are required");
      return;
    }
    const isNetworked = [
      "Logistic Broker", 
      "Port Agent", 
      "Custom Agent", 
      "Road Logistics Partner", 
      "Rail Logistics Partner", 
      "Sea Logistics Partner", 
      "Air Logistics Partner", 
      "Driver", 
      "Warehouse", 
      "Survey Agent"
    ].includes(draft.role);

    const newUser: User = {
      id: `USR-${Math.floor(Math.random() * 90000 + 10000)}`,
      name: draft.name,
      email: draft.email,
      phone: draft.phone || "+971 50 123 4567",
      region: draft.region,
      city: draft.city,
      kind: isNetworked ? "Networked" : "System",
      role: draft.role,
      activity: draft.activity,
      photo: photoPreview || `https://api.dicebear.com/7.x/adventurer/svg?seed=${draft.name}`,
      status: "Active",
      joined: new Date().toISOString().split("T")[0],
      avatar: draft.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      walletBalance: 0,
      rating: 5.0,
      trips: 0
    };

    setUsersList([newUser, ...usersList]);
    setInviteOpen(false);
    toast.success(`Invited user ${draft.name} as ${draft.role}`);
  };

  return (
    <AdminLayout>
      <PageHeader title="Users" subtitle={`${filtered.length} accounts across the network`}
        actions={<>
          <Btn variant="secondary" onClick={() => toast.success(`Exported ${filtered.length} users to CSV`)}><Download className="h-4 w-4" />Export</Btn>
          <Btn onClick={handleOpenInvite}>+ Invite User</Btn>
        </>} />

      <Tabs tabs={["All", "Networked Users", "System Users"]} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, role, city, activity..." className="w-full pl-9" />
        </div>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </Select>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30">
            <span className="text-xs font-mono">{selected.length} selected</span>
            <Btn variant="danger" className="h-7 px-2 text-xs"
              onClick={() => {
                setUsersList(usersList.map(u => selected.includes(u.id) ? { ...u, status: "Suspended" as const } : u));
                toast.success(`Suspended ${selected.length} users`);
                setSelected([]);
              }}>Suspend</Btn>
            <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelected([])}>Clear</Btn>
          </div>
        )}
      </div>

      <Table>
        <THead>
          <TR>
            <TH><input type="checkbox" className="accent-[var(--primary)]" onChange={(e) => setSelected(e.target.checked ? paged.map((u) => u.id) : [])} /></TH>
            <TH>User</TH>
            <TH>Region / City</TH>
            <TH>Role / Activity</TH>
            <TH>Phone</TH>
            <TH>Status</TH>
            <TH>Joined</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <tbody>
          {paged.map((u) => (
            <TR key={u.id}>
              <TD><input type="checkbox" className="accent-[var(--primary)]" checked={selected.includes(u.id)}
                onChange={(e) => setSelected(e.target.checked ? [...selected, u.id] : selected.filter((s) => s !== u.id))} /></TD>
              <TD>
                <div className="flex items-center gap-3">
                  <Avatar initials={u.avatar} photo={u.photo} />
                  <div>
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{u.id}</div>
                  </div>
                </div>
              </TD>
              <TD className="text-xs">
                <div>{u.region}</div>
                <div className="text-muted-foreground">{u.city}</div>
              </TD>
              <TD>
                <div className="text-xs font-semibold text-foreground uppercase font-mono">{u.role}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{u.activity}</div>
              </TD>
              <TD className="font-mono text-xs">{u.phone}</TD>
              <TD><StatusBadge status={u.status} /></TD>
              <TD className="font-mono text-xs text-muted-foreground">{u.joined}</TD>
              <TD>
                <div className="flex gap-1">
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDrawer(u)}>View</Btn>
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => {
                    const nextStatus = u.status === "Active" ? "Suspended" : "Active";
                    setUsersList(usersList.map(item => item.id === u.id ? { ...item, status: nextStatus } : item));
                    toast.success(`${u.name} status updated to ${nextStatus}`);
                  }}>Toggle Status</Btn>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="text-xs font-mono text-muted-foreground">
          Page {page} / {totalPages} · {filtered.length} results
        </div>
        <div className="flex gap-1">
          <Btn variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</Btn>
          <Btn variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</Btn>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite & Onboard User"
        footer={<><Btn variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Btn><Btn onClick={handleInvite}>Create & Invite</Btn></>}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Full Name">
            <Input className="w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Leila Yazdi" />
          </Field>
          <Field label="Email">
            <Input className="w-full" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@trans8.io" />
          </Field>
          <Field label="Phone">
            <Input className="w-full" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="e.g. +971 50 123 4567" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <Select className="w-full" value={draft.region} onChange={(e) => handleRegionChange(e.target.value)}>
                {REGIONS.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
              </Select>
            </Field>
            <Field label="City">
              <Select className="w-full" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
                {citiesForRegion.map((city) => <option key={city} value={city}>{city}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <Select className="w-full" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                <option value="Logistic Broker">Logistic Broker</option>
                <option value="Port Agent">Port Agent</option>
                <option value="Custom Agent">Custom Agent</option>
                <option value="Road Logistics Partner">Road Logistics Partner</option>
                <option value="Rail Logistics Partner">Rail Logistics Partner</option>
                <option value="Sea Logistics Partner">Sea Logistics Partner</option>
                <option value="Air Logistics Partner">Air Logistics Partner</option>
                <option value="Driver">Driver</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Survey Agent">Survey Agent</option>
                <option value="Admin">Admin</option>
              </Select>
            </Field>
            <Field label="Specific Activity">
              <Input className="w-full" value={draft.activity} onChange={(e) => setDraft({ ...draft, activity: e.target.value })} placeholder="e.g. Customs Clearance" />
            </Field>
          </div>

          <Field label="Profile Photo Upload">
            <div className="flex gap-4 items-center p-3 bg-[var(--surface-2)] border border-border rounded-lg">
              <div className="h-16 w-16 bg-[var(--surface-3)] rounded border border-border overflow-hidden flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }} 
                  className="hidden" 
                  id="profile-photo-upload" 
                />
                <div className="flex gap-2">
                  <Btn 
                    type="button" 
                    variant="secondary" 
                    onClick={() => document.getElementById("profile-photo-upload")?.click()}
                    className="h-8 text-xs"
                  >
                    <UploadCloud className="h-3.5 w-3.5 mr-1" /> Choose File
                  </Btn>
                  {photoPreview && (
                    <Btn 
                      type="button" 
                      variant="danger" 
                      onClick={() => setPhotoPreview("")}
                      className="h-8 px-2 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Btn>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5">PNG, JPG or SVG. Max 2MB.</div>
              </div>
            </div>
          </Field>
        </div>
      </Modal>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name}>
        {drawer && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={drawer.avatar} photo={drawer.photo} size={64} />
              <div>
                <div className="text-lg font-display font-bold text-foreground">{drawer.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{drawer.email}</div>
                <div className="mt-1"><StatusBadge status={drawer.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Category" value={drawer.kind} />
              <Stat label="Role" value={drawer.role} />
              <Stat label="Specific Activity" value={drawer.activity} />
              <Stat label="Region" value={drawer.region} />
              <Stat label="City" value={drawer.city} />
              <Stat label="Wallet" value={formatMoney(drawer.walletBalance)} />
              <Stat label="Trips" value={String(drawer.trips)} />
              <Stat label="Rating" value={`★ ${drawer.rating}`} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Verification</div>
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3 space-y-2">
                <Row k="ID Document" v={<StatusBadge status="Active" />} />
                <Row k="Address Proof" v={<StatusBadge status="Pending" />} />
                <Row k="Vehicle Reg." v={<StatusBadge status="Active" />} />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Recent Bookings</div>
              <ul className="space-y-1.5">
                {BOOKINGS.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-xs bg-[var(--surface-2)] border border-border rounded p-2">
                    <span className="font-mono text-primary">{b.id}</span>
                    <span className="text-muted-foreground truncate mx-2">{b.origin} → {b.destination}</span>
                    <span className="font-mono">{formatMoney(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Btn className="flex-1" onClick={() => toast(`Editing ${drawer.name}…`)}>Edit</Btn>
              <Btn variant="secondary" className="flex-1" onClick={() => toast.success(`Notification sent to ${drawer.name}`)}>Notify</Btn>
              <Btn variant="danger" onClick={() => {
                setUsersList(usersList.map(item => item.id === drawer.id ? { ...item, status: "Suspended" } : item));
                toast.success(`${drawer.name} suspended`);
                setDrawer(null);
              }}>Suspend</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold text-foreground mt-1">{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{k}</span>{v}</div>;
}