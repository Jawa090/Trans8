import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel, PageHeader, StatusBadge, Btn, Avatar, Tabs, Input, Select, Drawer, Table, THead, TH, TR, TD, Modal, Field } from "@/components/admin/ui";
import { USERS, REGIONS, BOOKINGS, formatMoney, type User } from "@/lib/mock-data";
import { Search, Download, User as UserIcon, UploadCloud, Trash2, CheckCircle, ShieldAlert, Award, FileText, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useCountries } from "@/lib/countries-store";

export const Route = createFileRoute("/users/")({
  head: () => ({ meta: [{ title: "Users & Compliance — TRANS8 Admin" }] }),
  component: UsersPage,
});

interface ExtendedUser extends User {
  invitedBy?: string;
  background?: string;
  complianceApproved?: boolean;
}

const USERS_STORAGE_KEY = "trans8_users_database_persistent";

const ROLE_CLASSES = ["Manager", "Supervisor", "Area Manager", "Agent", "Admin"] as const;

const SPECIFIC_ROLES = {
  Manager: [
    "Content Manager",
    "Operation Manager",
    "Account Manager",
    "Broker Manager",
    "Compliance Manager",
    "Relationship Manager",
    "I.T Manager"
  ],
  Supervisor: [
    "Brokers Supervisor",
    "Ports Supervisor",
    "Agents Supervisor",
    "Bookings Supervisor",
    "WareHouse Supervisor",
    "Tenders Supervisor"
  ],
  "Area Manager": [
    "Area Manager"
  ],
  Agent: [
    "Port Agent",
    "Custom Agent",
    "Warehouse Agent",
    "Logistic Companies Agent",
    "Broker Agent",
    "Regional Insurance Agent"
  ],
  Admin: [
    "Global Administrator",
    "Regional Security Officer"
  ]
};

function UsersPage() {
  const { countries } = useCountries();
  const [usersList, setUsersList] = useState<ExtendedUser[]>([]);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [roleClassFilter, setRoleClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<ExtendedUser | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  
  const [draftRoleClass, setDraftRoleClass] = useState<keyof typeof SPECIFIC_ROLES>("Agent");
  const [draftSpecificRole, setDraftSpecificRole] = useState("Port Agent");
  
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    phone: "",
    region: "UAE",
    city: "Dubai",
    invitedBy: "Yusuf Karimi",
    background: "",
    activity: "Customs Dispatch & Auditing"
  });

  // Load persistent users
  useEffect(() => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      try {
        setUsersList(JSON.parse(stored));
      } catch (e) {
        setUsersList(USERS.map(u => ({ ...u, complianceApproved: true })));
      }
    } else {
      const seeded = USERS.map(u => {
        // Map old roles to new ones to populate system
        let mappedRole = u.role;
        if (u.role === "Driver") mappedRole = "Logistics Partner";
        return {
          ...u,
          role: mappedRole,
          complianceApproved: true,
          invitedBy: "System Onboarding",
          background: "Legacy user seeded during initial platform deployment."
        };
      });
      setUsersList(seeded);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
    }
  }, []);

  const saveUsers = (newList: ExtendedUser[]) => {
    setUsersList(newList);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newList));
  };

  const handleOpenInvite = () => {
    setDraft({
      name: "",
      email: "",
      phone: "",
      region: "UAE",
      city: "Dubai",
      invitedBy: "Yusuf Karimi",
      background: "",
      activity: "Customs Dispatch & Auditing"
    });
    setDraftRoleClass("Agent");
    setDraftSpecificRole("Port Agent");
    setPhotoPreview("");
    setInviteOpen(true);
  };

  const citiesForRegion = useMemo(() => {
    return countries[draft.region]?.cities || [];
  }, [countries, draft.region]);

  const handleRegionChange = (newRegion: string) => {
    const defaultCity = countries[newRegion]?.cities[0] || "";
    setDraft(d => ({
      ...d,
      region: newRegion,
      city: defaultCity
    }));
  };

  // Helper: Count agents of this specific type in a region to enforce cap
  const getAgentTypeCount = (reg: string, roleName: string) => {
    return usersList.filter(u => u.region === reg && u.role === roleName && u.status !== "Suspended").length;
  };

  // Warning check when filling draft
  const currentAgentTypeCapCount = useMemo(() => {
    if (draftRoleClass !== "Agent") return 0;
    return getAgentTypeCount(draft.region, draftSpecificRole);
  }, [usersList, draft.region, draftRoleClass, draftSpecificRole]);

  const filtered = useMemo(() => {
    return usersList.filter((u) => {
      // Tabs
      if (tab === "Networked Users" && u.kind !== "Networked") return false;
      if (tab === "System Users" && u.kind !== "System") return false;
      if (tab === "Pending Compliance" && u.status !== "Pending") return false;

      // Search query
      if (q && !`${u.name} ${u.id} ${u.role} ${u.city} ${u.activity} ${u.invitedBy}`.toLowerCase().includes(q.toLowerCase())) return false;
      
      // Select Filters
      if (regionFilter && u.region !== regionFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (roleClassFilter) {
        const isRoleInClass = SPECIFIC_ROLES[roleClassFilter as keyof typeof SPECIFIC_ROLES]?.includes(u.role);
        if (!isRoleInClass) return false;
      }
      return true;
    });
  }, [usersList, tab, q, regionFilter, statusFilter, roleClassFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const stats = useMemo(() => {
    return {
      total: usersList.length,
      active: usersList.filter(u => u.status === "Active").length,
      pending: usersList.filter(u => u.status === "Pending").length,
      suspended: usersList.filter(u => u.status === "Suspended").length
    };
  }, [usersList]);

  const handleInvite = () => {
    if (!draft.name || !draft.email) {
      toast.error("Name and Email are required");
      return;
    }

    // Role classification
    const isNetworked = draftRoleClass === "Agent";

    // Enforce 3 agent cap per category per region
    if (draftRoleClass === "Agent" && currentAgentTypeCapCount >= 3) {
      toast.error(`Cap Reached: There are already ${currentAgentTypeCapCount} agents of type "${draftSpecificRole}" in ${draft.region}. Compliance requires a separate executive waiver.`);
      return;
    }

    const newUser: ExtendedUser = {
      id: `USR-${Math.floor(Math.random() * 90000 + 10000)}`,
      name: draft.name,
      email: draft.email,
      phone: draft.phone || "+971 50 123 4567",
      region: draft.region,
      city: draft.city,
      kind: isNetworked ? "Networked" : "System",
      role: draftSpecificRole,
      activity: draft.activity || `${draftSpecificRole} Dispatch`,
      photo: photoPreview || `https://api.dicebear.com/7.x/adventurer/svg?seed=${draft.name}`,
      status: "Pending", // Starts as Pending for compliance review
      joined: new Date().toISOString().split("T")[0],
      avatar: draft.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      walletBalance: 0,
      rating: 5.0,
      trips: 0,
      invitedBy: draft.invitedBy,
      background: draft.background || "Standard background check initiated upon invite.",
      complianceApproved: false
    };

    const updated = [newUser, ...usersList];
    saveUsers(updated);
    setInviteOpen(false);
    toast.success(`User ${draft.name} invited. Review required in compliance queue.`);
  };

  const handleApproveCompliance = (id: string) => {
    const updated = usersList.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: "Active" as const,
          complianceApproved: true,
          notes: "Approved by Compliance Officer."
        };
      }
      return u;
    });
    saveUsers(updated);
    toast.success("User compliance checks approved and active status granted.");
    if (drawer && drawer.id === id) {
      setDrawer({
        ...drawer,
        status: "Active" as const,
        complianceApproved: true
      });
    }
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="Users & Compliance" 
        subtitle="Operational role classes, invited-by references, and compliance approval queues"
        actions={<>
          <Btn variant="secondary" onClick={() => toast.success(`Exported ${filtered.length} users to CSV`)}><Download className="h-4 w-4" />Export</Btn>
          <Btn onClick={handleOpenInvite}>+ Invite & Onboard User</Btn>
        </>} 
      />

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI label="Total Registered Users" value={String(stats.total)} />
        <KPI label="Active Operations" value={String(stats.active)} />
        <KPI label="Pending Compliance" value={String(stats.pending)} highlight={stats.pending > 0} />
        <KPI label="Suspended Accounts" value={String(stats.suspended)} />
      </div>

      <Tabs 
        tabs={["All", "Networked Users", "System Users", "Pending Compliance"]} 
        active={tab} 
        onChange={(t) => { setTab(t); setPage(1); }} 
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, role, invited by..." className="w-full pl-9" />
        </div>
        <Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">All regions</option>
          {Object.keys(countries).map((cName) => (
            <option key={cName} value={cName}>{countries[cName].flag} {cName}</option>
          ))}
        </Select>
        <Select value={roleClassFilter} onChange={(e) => setRoleClassFilter(e.target.value)}>
          <option value="">All Role Classes</option>
          {ROLE_CLASSES.map(rc => (
            <option key={rc} value={rc}>{rc}s</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </Select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30">
            <span className="text-xs font-mono">{selected.length} selected</span>
            <Btn variant="danger" className="h-7 px-2 text-xs"
              onClick={() => {
                saveUsers(usersList.map(u => selected.includes(u.id) ? { ...u, status: "Suspended" as const } : u));
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
            <TH>User / Reference</TH>
            <TH>Region / City</TH>
            <TH>Role Class / Role</TH>
            <TH>Compliance Status</TH>
            <TH>Status</TH>
            <TH>Joined</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <tbody>
          {paged.map((u) => (
            <TR key={u.id} className={u.status === "Pending" ? "bg-amber-500/5 hover:bg-amber-500/10" : ""}>
              <TD><input type="checkbox" className="accent-[var(--primary)]" checked={selected.includes(u.id)}
                onChange={(e) => setSelected(e.target.checked ? [...selected, u.id] : selected.filter((s) => s !== u.id))} /></TD>
              <TD>
                <div className="flex items-center gap-3">
                  <Avatar initials={u.avatar} photo={u.photo} />
                  <div>
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground flex gap-1.5 items-center">
                      <span className="font-mono">{u.id}</span>
                      {u.invitedBy && (
                        <span className="text-primary-foreground/70 bg-primary/10 px-1 rounded text-[9px]">Ref: {u.invitedBy}</span>
                      )}
                    </div>
                  </div>
                </div>
              </TD>
              <TD className="text-xs">
                <div className="flex items-center gap-1">
                  <span>{countries[u.region]?.flag || "🌐"}</span>
                  <span>{u.region}</span>
                </div>
                <div className="text-muted-foreground">{u.city}</div>
              </TD>
              <TD>
                <div className="text-xs font-semibold text-foreground uppercase font-mono">{u.role}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{u.activity}</div>
              </TD>
              <TD>
                {u.complianceApproved ? (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase font-semibold">Approved</span>
                ) : (
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase font-semibold animate-pulse">Pending Review</span>
                )}
              </TD>
              <TD><StatusBadge status={u.status} /></TD>
              <TD className="font-mono text-xs text-muted-foreground">{u.joined}</TD>
              <TD>
                <div className="flex gap-1">
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDrawer(u)}>View</Btn>
                  {u.status === "Pending" && (
                    <Btn className="h-7 px-2 text-xs bg-amber-500 text-black hover:bg-amber-600" onClick={() => handleApproveCompliance(u.id)}>Approve</Btn>
                  )}
                  {u.status !== "Pending" && (
                    <Btn variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => {
                      const nextStatus = u.status === "Active" ? "Suspended" : "Active";
                      saveUsers(usersList.map(item => item.id === u.id ? { ...item, status: nextStatus } : item));
                      toast.success(`${u.name} status updated to ${nextStatus}`);
                    }}>Toggle Status</Btn>
                  )}
                </div>
              </TD>
            </TR>
          ))}
          {paged.length === 0 && (
            <TR>
              <TD colSpan={8} className="text-center text-muted-foreground py-10 font-mono">
                No users found in this category.
              </TD>
            </TR>
          )}
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
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input className="w-full" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@trans8.io" />
            </Field>
            <Field label="Phone">
              <Input className="w-full" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="e.g. +971 50 123 4567" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <Select className="w-full" value={draft.region} onChange={(e) => handleRegionChange(e.target.value)}>
                {Object.keys(countries).map((cName) => (
                  <option key={cName} value={cName}>{countries[cName].flag} {cName}</option>
                ))}
              </Select>
            </Field>
            <Field label="City">
              <Select className="w-full" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
                {citiesForRegion.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role Classification">
              <Select 
                className="w-full" 
                value={draftRoleClass} 
                onChange={(e) => {
                  const val = e.target.value as any;
                  setDraftRoleClass(val);
                  setDraftSpecificRole(SPECIFIC_ROLES[val][0]);
                }}
              >
                {ROLE_CLASSES.map(rc => (
                  <option key={rc} value={rc}>{rc}</option>
                ))}
              </Select>
            </Field>
            <Field label="Specific Assigned Role">
              <Select 
                className="w-full" 
                value={draftSpecificRole} 
                onChange={(e) => setDraftSpecificRole(e.target.value)}
              >
                {SPECIFIC_ROLES[draftRoleClass].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Select>
            </Field>
          </div>

          {draftRoleClass === "Agent" && (
            <div className={`p-3 rounded-lg border text-xs font-mono ${
              currentAgentTypeCapCount >= 3 ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-primary/10 border-primary/20 text-muted-foreground"
            }`}>
              <span>Active Agent Count for Category in Region: </span>
              <strong className="text-foreground">{currentAgentTypeCapCount} / 3 Cap</strong>
              {currentAgentTypeCapCount >= 3 && (
                <p className="mt-1 text-[10px] text-red-500">Warning: Limit reached. System cannot add a 4th agent without compliance waiver.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Invited By (Reference)">
              <Input className="w-full" value={draft.invitedBy} onChange={(e) => setDraft({ ...draft, invitedBy: e.target.value })} placeholder="e.g. Yusuf Karimi" />
            </Field>
            <Field label="Specific Activity">
              <Input className="w-full" value={draft.activity} onChange={(e) => setDraft({ ...draft, activity: e.target.value })} placeholder="e.g. Customs Clearance" />
            </Field>
          </div>

          <Field label="Background & Credentials Overview">
            <Input className="w-full" value={draft.background} onChange={(e) => setDraft({ ...draft, background: e.target.value })} placeholder="Provide verified background information or certifications..." />
          </Field>

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
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={drawer.status} />
                  {drawer.complianceApproved ? (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Compliance Active</span>
                  ) : (
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono uppercase font-semibold animate-pulse">Compliance Review</span>
                  )}
                </div>
              </div>
            </div>

            {/* Compliance approval actions */}
            {!drawer.complianceApproved && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <ShieldAlert className="h-4 w-4" /> Compliance Check Required
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  This user requires credential verification, background audits, and invitation approvals.
                </p>
                <div className="pt-1 flex gap-2">
                  <Btn size="sm" className="bg-amber-500 text-black hover:bg-amber-600 text-[10px] h-7 px-2" onClick={() => handleApproveCompliance(drawer.id)}>
                    <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve & Activate
                  </Btn>
                  <Btn size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-[10px] h-7 px-2" onClick={() => {
                    saveUsers(usersList.map(u => u.id === drawer.id ? { ...u, status: "Suspended" } : u));
                    setDrawer(null);
                    toast.success("User rejected and account suspended.");
                  }}>
                    Reject
                  </Btn>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Account Category" value={drawer.kind} />
              <Stat label="Detailed Role" value={drawer.role} />
              <Stat label="Specific Activity" value={drawer.activity} />
              <Stat label="Region / Country" value={drawer.region} />
              <Stat label="City" value={drawer.city} />
              <Stat label="Wallet" value={formatMoney(drawer.walletBalance)} />
              <Stat label="Trips / Actions" value={String(drawer.trips)} />
              <Stat label="Rating Score" value={`★ ${drawer.rating}`} />
              {drawer.invitedBy && (
                <Stat label="Invited / Referred By" value={drawer.invitedBy} />
              )}
            </div>

            {drawer.background && (
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Background Overview
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed italic">{drawer.background}</p>
              </div>
            )}

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Operational Documents</div>
              <div className="bg-[var(--surface-2)] border border-border rounded-md p-3 space-y-2">
                <Row k="ID Credentials & Passport" v={<StatusBadge status="Active" />} />
                <Row k="Invitation Reference & Consent" v={drawer.complianceApproved ? <StatusBadge status="Active" /> : <StatusBadge status="Pending" />} />
                <Row k="Professional Certifications" v={<StatusBadge status="Active" />} />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Recent Dispatched Loads</div>
              <ul className="space-y-1.5">
                {BOOKINGS.slice(0, 3).map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-xs bg-[var(--surface-2)] border border-border rounded p-2">
                    <span className="font-mono text-primary">{b.id}</span>
                    <span className="text-muted-foreground truncate mx-2">{b.origin} → {b.destination}</span>
                    <span className="font-mono">{formatMoney(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-border">
              <Btn className="flex-1" onClick={() => toast(`Editing ${drawer.name}…`)}>Edit Details</Btn>
              <Btn variant="secondary" className="flex-1" onClick={() => toast.success(`Audit notification dispatched to ${drawer.name}`)}>Notify Audit</Btn>
              <Btn variant="danger" onClick={() => {
                saveUsers(usersList.map(item => item.id === drawer.id ? { ...item, status: "Suspended" } : item));
                toast.success(`${drawer.name} account suspended`);
                setDrawer(null);
              }}>Suspend</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-[var(--surface-1)] border rounded-lg p-4 transition-colors ${
      highlight ? "border-amber-500/40 bg-amber-500/5 animate-pulse" : "border-border"
    }`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${highlight ? "text-amber-400" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-xs font-semibold text-foreground mt-1 break-words">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{k}</span>{v}</div>;
}
