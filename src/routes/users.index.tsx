import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Panel, PageHeader, StatusBadge, Btn, Avatar, Tabs, Input, Select, Drawer, Table, THead, TH, TR, TD, Modal, Field } from "@/components/admin/ui";
import { USERS, REGIONS, BOOKINGS, formatMoney, type User } from "@/lib/mock-data";
import { Search, Download, User as UserIcon, UploadCloud, Trash2, CheckCircle, ShieldAlert, Award, FileText, UserCheck, ShieldCheck, ArrowLeft, Landmark, CreditCard, ExternalLink, Calendar, MapPin, Briefcase } from "lucide-react";
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
  assignedFacilityType?: "Port" | "Warehouse" | "Company" | "None";
  assignedFacilityName?: string;
  kycStatus?: "Pending" | "Verified" | "Rejected";
  kycIdType?: "Passport" | "National ID" | "Driver License";
  kycIdNumber?: string;
  kycNotes?: string;
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
    "Logistics Companies Agent",
    "Broker Agent",
    "Regional Agent",
    "Insurance Agent"
  ],
  Admin: [
    "Global Administrator",
    "Regional Security Officer"
  ]
};

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-[var(--surface-1)] border rounded-lg p-4 transition-colors ${highlight ? "border-[var(--warning)]/50 bg-[var(--warning)]/5" : "border-border"}`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-2xl font-bold mt-1 ${highlight ? "text-[var(--warning)]" : ""}`}>{value}</div>
    </div>
  );
}

function UsersPage() {
  const { countries } = useCountries();
  const [usersList, setUsersList] = useState<ExtendedUser[]>([]);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [roleClassFilter, setRoleClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  
  // Selection of user for full-page profile view
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
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
    activity: "Customs Dispatch & Auditing",
    assignedFacilityType: "None" as any,
    assignedFacilityName: "",
    kycIdType: "Passport" as any,
    kycIdNumber: "",
    kycNotes: ""
  });

  // Edit user state
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<ExtendedUser | null>(null);
  const [editRoleClass, setEditRoleClass] = useState<keyof typeof SPECIFIC_ROLES>("Agent");

  // Load persistent users
  useEffect(() => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      try {
        setUsersList(JSON.parse(stored));
      } catch (e) {
        initDefaultUsers();
      }
    } else {
      initDefaultUsers();
    }
    
    // Check for query parameter profileId to automatically display the profile detail
    const params = new URLSearchParams(window.location.search);
    const profId = params.get("profileId");
    if (profId) {
      setSelectedProfileId(profId);
    }
  }, []);

  const initDefaultUsers = () => {
    const seeded = USERS.map((u, i) => {
      let mappedRole = u.role;
      if (u.role === "Driver") mappedRole = "Logistics Partner";
      
      // Seed initial KYC/Assignments
      const facilityTypes: Array<"Port" | "Warehouse" | "Company" | "None"> = ["Port", "Warehouse", "Company", "None"];
      const facilityNames = ["Jebel Ali Terminal 2", "Al-Maktoum Hub 1", "TransGlobal Logistics", ""];
      const fType = facilityTypes[i % 4];
      
      return {
        ...u,
        role: mappedRole,
        complianceApproved: true,
        invitedBy: i === 0 ? undefined : "System Onboarding",
        background: "Legacy user seeded during initial platform deployment.",
        assignedFacilityType: fType,
        assignedFacilityName: fType !== "None" ? facilityNames[i % 4] : "",
        kycStatus: "Verified" as const,
        kycIdType: "Passport" as const,
        kycIdNumber: `PP-${78024 + i}`,
        kycNotes: "Seeded verification verified automatically."
      };
    });
    setUsersList(seeded);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
  };

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
      activity: "Customs Dispatch & Auditing",
      assignedFacilityType: "None",
      assignedFacilityName: "",
      kycIdType: "Passport",
      kycIdNumber: "",
      kycNotes: ""
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

  const getAgentTypeCount = (reg: string, roleName: string) => {
    return usersList.filter(u => u.region === reg && u.role === roleName && u.status !== "Suspended").length;
  };

  const currentAgentTypeCapCount = useMemo(() => {
    if (draftRoleClass !== "Agent") return 0;
    return getAgentTypeCount(draft.region, draftSpecificRole);
  }, [usersList, draft.region, draftRoleClass, draftSpecificRole]);

  // Validation engine for compliance constraints
  const validateConstraints = (userId: string | null, region: string, role: string) => {
    // 1. Area Manager limit: 1 per region
    if (role === "Area Manager") {
      const existing = usersList.find(
        (u) => u.region === region && u.role === "Area Manager" && u.status !== "Suspended" && u.id !== userId
      );
      if (existing) {
        toast.error(`Compliance Denied: There is already an Area Manager (${existing.name}) in ${region}. Only 1 Area Manager is allowed per region.`);
        return false;
      }
    }

    // 2. Agent cap: maximum 3 per specific agent type per region
    const isAgent = SPECIFIC_ROLES.Agent.includes(role);
    if (isAgent) {
      const activeCount = usersList.filter(
        (u) => u.region === region && u.role === role && u.status !== "Suspended" && u.id !== userId
      ).length;
      if (activeCount >= 3) {
        toast.error(`Compliance Denied: Region ${region} already contains the maximum of ${activeCount} agents of type "${role}". Executive waiver required.`);
        return false;
      }
    }
    return true;
  };

  const handleInvite = () => {
    if (!draft.name || !draft.email) {
      toast.error("Name and Email are required");
      return;
    }

    if (!draft.invitedBy) {
      toast.error("An existing user reference (Invited By) is required for compliance registry.");
      return;
    }

    if (!validateConstraints(null, draft.region, draftSpecificRole)) {
      return;
    }

    const isNetworked = draftRoleClass === "Agent";

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
      status: "Pending", // compliance verification queue
      joined: new Date().toISOString().split("T")[0],
      avatar: draft.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      walletBalance: 0,
      rating: 5.0,
      trips: 0,
      invitedBy: draft.invitedBy,
      background: draft.background || "Standard background check initiated upon invite.",
      complianceApproved: false,
      assignedFacilityType: draft.assignedFacilityType,
      assignedFacilityName: draft.assignedFacilityType !== "None" ? draft.assignedFacilityName : "",
      kycStatus: "Pending",
      kycIdType: draft.kycIdType,
      kycIdNumber: draft.kycIdNumber,
      kycNotes: draft.kycNotes || "Pending review of uploaded documents."
    };

    const updated = [newUser, ...usersList];
    saveUsers(updated);
    setInviteOpen(false);
    toast.success(`Invitation successfully dispatched. Account ${draft.name} is added to the Compliance review queue.`);
  };

  const handleEditOpen = (user: ExtendedUser) => {
    setEditUser(user);
    // Find matching role class
    let rc: keyof typeof SPECIFIC_ROLES = "Agent";
    for (const key of Object.keys(SPECIFIC_ROLES) as Array<keyof typeof SPECIFIC_ROLES>) {
      if (SPECIFIC_ROLES[key].includes(user.role)) {
        rc = key;
        break;
      }
    }
    setEditRoleClass(rc);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editUser) return;
    if (!editUser.name || !editUser.email) {
      toast.error("Name and Email are required");
      return;
    }

    if (!validateConstraints(editUser.id, editUser.region, editUser.role)) {
      return;
    }

    const updated = usersList.map(u => u.id === editUser.id ? editUser : u);
    saveUsers(updated);
    setEditOpen(false);
    toast.success(`User profile ${editUser.name} updated successfully.`);
    
    // Sync profile page if open
    if (selectedProfileId === editUser.id) {
      // Profile view automatically pulls updated value from usersList
    }
  };

  const handleApproveCompliance = (id: string) => {
    const updated = usersList.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: "Active" as const,
          complianceApproved: true,
          kycStatus: "Verified" as const,
          notes: "Approved by Compliance Officer."
        };
      }
      return u;
    });
    saveUsers(updated);
    toast.success("User compliance checks approved and active status granted.");
  };

  // Transactions ledger list loaded for user
  const userTransactions = useMemo(() => {
    if (!selectedProfileId) return [];
    const profileUser = usersList.find(u => u.id === selectedProfileId);
    if (!profileUser) return [];
    
    const storedTx = localStorage.getItem("trans8_transactions_persistent");
    const allTx = storedTx ? JSON.parse(storedTx) : [];
    
    // Seed default transactions if not in storage, but merge them
    const mergedTx = [...allTx];
    const userTx = mergedTx.filter(t => t.user.toLowerCase() === profileUser.name.toLowerCase());
    
    // Fallback: If no matches, return some filtered mock data linked to this name
    if (userTx.length === 0) {
      return [
        { id: "TXN-89021", user: profileUser.name, type: "Commission", gateway: "SDK Finance (Primary)", amount: 450, status: "Completed", date: "2026-06-20" },
        { id: "TXN-89022", user: profileUser.name, type: "Payment", gateway: "Bank Transfer", amount: 1200, status: "Completed", date: "2026-06-18" },
        { id: "TXN-89023", user: profileUser.name, type: "Refund", gateway: "Crypto (USDT/ETH)", amount: 150, status: "Failed", date: "2026-06-15" }
      ];
    }
    return userTx;
  }, [selectedProfileId, usersList]);

  const filtered = useMemo(() => {
    return usersList.filter((u) => {
      if (tab === "Networked Users" && u.kind !== "Networked") return false;
      if (tab === "System Users" && u.kind !== "System") return false;
      if (tab === "Pending Compliance" && u.status !== "Pending") return false;

      if (q && !`${u.name} ${u.id} ${u.role} ${u.city} ${u.activity} ${u.invitedBy}`.toLowerCase().includes(q.toLowerCase())) return false;
      
      if (regionFilter && u.region !== regionFilter) return false;
      if (cityFilter && !u.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (activityFilter && !u.activity.toLowerCase().includes(activityFilter.toLowerCase())) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (roleClassFilter) {
        const isRoleInClass = SPECIFIC_ROLES[roleClassFilter as keyof typeof SPECIFIC_ROLES]?.includes(u.role);
        if (!isRoleInClass) return false;
      }
      return true;
    });
  }, [usersList, tab, q, regionFilter, statusFilter, roleClassFilter, cityFilter, activityFilter]);

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

  // Profile User helper
  const profileUserObj = useMemo(() => {
    return usersList.find(u => u.id === selectedProfileId) || null;
  }, [selectedProfileId, usersList]);

  // -------------------------------------------------------------
  // FULL PROFILE VIEW SUB-RENDER
  // -------------------------------------------------------------
  if (selectedProfileId && profileUserObj) {
    const u = profileUserObj;
    return (
      <AdminLayout>
        <div className="mb-4">
          <button 
            onClick={() => setSelectedProfileId(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Users List
          </button>
        </div>

        <PageHeader 
          title="User Profile Detail" 
          subtitle={`Administrative & KYC profile for ID: ${u.id}`}
          actions={
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => handleEditOpen(u)}>Edit Profile Details</Btn>
              {u.status === "Pending" && (
                <Btn className="bg-amber-500 text-black hover:bg-amber-600" onClick={() => handleApproveCompliance(u.id)}>Approve Compliance</Btn>
              )}
              {u.status !== "Suspended" ? (
                <Btn variant="danger" onClick={() => {
                  saveUsers(usersList.map(item => item.id === u.id ? { ...item, status: "Suspended" } : item));
                  toast.error(`${u.name} account suspended.`);
                }}>Suspend User</Btn>
              ) : (
                <Btn className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  saveUsers(usersList.map(item => item.id === u.id ? { ...item, status: "Active" } : item));
                  toast.success(`${u.name} account re-activated.`);
                }}>Re-Activate User</Btn>
              )}
            </div>
          }
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel: Header Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Panel className="text-center py-6">
              <div className="relative inline-block mx-auto mb-4">
                <div className="flex justify-center">
                  <Avatar initials={u.avatar} photo={u.photo} size={96} />
                </div>
                <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${
                  u.status === "Active" ? "bg-[var(--accent-lime)]" : u.status === "Pending" ? "bg-amber-500" : "bg-[var(--danger)]"
                }`} />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">{u.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{u.email}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <StatusBadge status={u.status} />
                {u.complianceApproved ? (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase font-semibold">Compliance Approved</span>
                ) : (
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono uppercase font-semibold animate-pulse">Awaiting Compliance Review</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-border/80 text-left">
                <div className="bg-[var(--surface-2)] p-2.5 rounded border border-border">
                  <div className="text-[9px] font-mono uppercase text-muted-foreground">Joined Date</div>
                  <div className="text-xs font-semibold mt-1 font-mono text-foreground">{u.joined || "2026-01-10"}</div>
                </div>
                <div className="bg-[var(--surface-2)] p-2.5 rounded border border-border">
                  <div className="text-[9px] font-mono uppercase text-muted-foreground">Wallet Balance</div>
                  <div className="text-xs font-semibold mt-1 font-mono text-[var(--accent-lime)]">{formatMoney(u.walletBalance)}</div>
                </div>
              </div>
            </Panel>

            <Panel title="Referrer & Onboarding Details">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Invited By (Referrer)</span>
                  {u.invitedBy ? (
                    <button 
                      onClick={() => {
                        const referrer = usersList.find(ref => ref.name.toLowerCase() === u.invitedBy?.toLowerCase());
                        if (referrer) {
                          setSelectedProfileId(referrer.id);
                          toast.info(`Navigated to referrer: ${referrer.name}`);
                        } else {
                          toast.error(`Referrer "${u.invitedBy}" not found in current database.`);
                        }
                      }}
                      className="font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {u.invitedBy} <ExternalLink className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-muted-foreground italic">None (Global Administrator)</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Onboarding Status</span>
                  <span className="font-semibold text-foreground">{u.complianceApproved ? "Completed" : "Review Stage"}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-mono uppercase text-muted-foreground block mb-1">Compliance Notes & Audit Record</span>
                  <div className="p-2.5 rounded bg-[var(--surface-2)] border border-border text-muted-foreground font-mono text-[11px] leading-relaxed">
                    {u.background || "No credential overview provided."}
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Right Panel: Tabs for details */}
          <div className="lg:col-span-2 space-y-6">
            <Panel title="Agent Assignment & Capabilities">
              <div className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground">Role Class</div>
                    <div className="text-sm font-semibold mt-1 text-foreground">{u.kind}</div>
                  </div>
                  <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground">Specific Assigned Role</div>
                    <div className="text-sm font-semibold mt-1 text-foreground">{u.role}</div>
                  </div>
                  <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground">Assigned Region</div>
                    <div className="text-sm font-semibold mt-1 text-foreground">{u.region}</div>
                  </div>
                  <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground">Operating City</div>
                    <div className="text-sm font-semibold mt-1 text-foreground">{u.city}</div>
                  </div>
                </div>

                <div className="p-3 bg-[var(--surface-2)] border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Assigned Facility (Compliance Constraint)</span>
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-semibold uppercase">1-Assignment Limit Enforced</span>
                  </div>
                  
                  {u.assignedFacilityType && u.assignedFacilityType !== "None" ? (
                    <div className="flex items-center gap-3 p-2 bg-black/20 rounded border border-border mt-1">
                      <div className="h-8 w-8 rounded bg-primary/20 text-primary grid place-items-center font-bold">
                        {u.assignedFacilityType[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{u.assignedFacilityName}</div>
                        <div className="text-[10px] text-muted-foreground">Assigned {u.assignedFacilityType} · No other tasks allowed</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-black/10 rounded border border-dashed border-border/80 text-center text-muted-foreground italic text-xs">
                      No active Port, Warehouse, or Corporate Company assigned to this agent.
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Note: To prevent multi-tasking and conflicts of interest, administrators are prohibited from assigning an agent to more than one logistics entity.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="KYC Verification Profile">
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-[var(--surface-2)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">KYC Status</span>
                    <strong className="text-sm text-foreground">{u.kycStatus || "Unverified"}</strong>
                  </div>
                  {u.kycStatus === "Verified" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-semibold bg-emerald-500/15 px-2 py-1 rounded-full">
                      <ShieldCheck className="h-3.5 w-3.5" /> ID VERIFIED
                    </span>
                  ) : u.kycStatus === "Rejected" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--danger)] font-semibold bg-[var(--danger)]/15 px-2 py-1 rounded-full">
                      <ShieldAlert className="h-3.5 w-3.5" /> REJECTED / AUDIT FAILURE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-500 font-semibold bg-amber-500/15 px-2 py-1 rounded-full animate-pulse">
                      <ShieldAlert className="h-3.5 w-3.5" /> PENDING CREDENTIAL AUDIT
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--surface-2)] p-3 rounded border border-border">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground">ID Type Submitted</div>
                    <div className="text-xs font-semibold mt-1 text-foreground">{u.kycIdType || "Passport"}</div>
                  </div>
                  <div className="bg-[var(--surface-2)] p-3 rounded border border-border">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground">ID Document Serial No.</div>
                    <div className="text-xs font-semibold mt-1 font-mono text-foreground">{u.kycIdNumber || "Not Provided"}</div>
                  </div>
                </div>

                <div className="bg-[var(--surface-2)] border border-border rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Verification Audit Logs</div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{u.kycNotes || "No verification audits logged yet."}</p>
                </div>
              </div>
            </Panel>

            <Panel title="Wallet Transaction History & Ledger">
              <Table>
                <THead>
                  <TR>
                    <TH>Txn ID</TH>
                    <TH>Type</TH>
                    <TH>Gateway</TH>
                    <TH>Date Logged</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Amount</TH>
                  </TR>
                </THead>
                <tbody>
                  {userTransactions.map((t) => (
                    <TR key={t.id}>
                      <TD className="font-mono text-xs text-primary font-semibold">{t.id}</TD>
                      <TD className="text-xs font-mono uppercase text-muted-foreground">{t.type}</TD>
                      <TD className="text-xs">{t.gateway}</TD>
                      <TD className="font-mono text-xs text-muted-foreground">{t.date}</TD>
                      <TD><StatusBadge status={t.status} /></TD>
                      <TD className="text-right font-mono text-[var(--accent-lime)] font-bold">{formatMoney(t.amount)}</TD>
                    </TR>
                  ))}
                  {userTransactions.length === 0 && (
                    <TR>
                      <TD colSpan={6} className="text-center text-muted-foreground py-6 font-mono">
                        No transactions registered under this user's wallet.
                      </TD>
                    </TR>
                  )}
                </tbody>
              </Table>
            </Panel>
          </div>
        </div>

        {/* -------------------------------------------------------------
            EDIT USER MODAL WITHIN PROFILE
           ------------------------------------------------------------- */}
        {editUser && (
          <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Profile: ${editUser.name}`}
            footer={<><Btn variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Btn><Btn onClick={handleEditSave}>Save Updates</Btn></>}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <Field label="Full Name">
                <Input className="w-full" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              </Field>
              
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <Input className="w-full" type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input className="w-full" value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Region">
                  <Select className="w-full" value={editUser.region} onChange={(e) => {
                    const reg = e.target.value;
                    const defCity = countries[reg]?.cities[0] || "";
                    setEditUser({ ...editUser, region: reg, city: defCity });
                  }}>
                    {Object.keys(countries).map((cName) => (
                      <option key={cName} value={cName}>{countries[cName].flag} {cName}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="City">
                  <Select className="w-full" value={editUser.city} onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}>
                    {(countries[editUser.region]?.cities || []).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Role Classification">
                  <Select 
                    className="w-full" 
                    value={editRoleClass} 
                    onChange={(e) => {
                      const val = e.target.value as keyof typeof SPECIFIC_ROLES;
                      setEditRoleClass(val);
                      setEditUser({ ...editUser, role: SPECIFIC_ROLES[val][0] });
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
                    value={editUser.role} 
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    {SPECIFIC_ROLES[editRoleClass].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Specific Activity">
                <Input className="w-full" value={editUser.activity} onChange={(e) => setEditUser({ ...editUser, activity: e.target.value })} />
              </Field>

              {/* Assignment constraint fields */}
              <div className="border border-border p-3.5 rounded-lg bg-[var(--surface-2)]">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2">Assigned Logistics Facility</h5>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Facility Type">
                    <Select className="w-full" value={editUser.assignedFacilityType || "None"} onChange={(e) => {
                      const val = e.target.value as any;
                      setEditUser({ ...editUser, assignedFacilityType: val, assignedFacilityName: val === "None" ? "" : editUser.assignedFacilityName });
                    }}>
                      <option value="None">None</option>
                      <option value="Port">Port Gateway</option>
                      <option value="Warehouse">Warehouse Depot</option>
                      <option value="Company">Logistics Company</option>
                    </Select>
                  </Field>
                  {editUser.assignedFacilityType && editUser.assignedFacilityType !== "None" && (
                    <Field label="Facility Name">
                      <Input className="w-full" value={editUser.assignedFacilityName || ""} onChange={(e) => setEditUser({ ...editUser, assignedFacilityName: e.target.value })} placeholder="e.g. Jebel Ali Port" />
                    </Field>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic leading-snug">
                  Rule constraint: Setting this will strictly assign this agent to one facility.
                </p>
              </div>

              {/* KYC details editable by Admin */}
              <div className="border border-border p-3.5 rounded-lg bg-[var(--surface-2)]">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2">KYC & Verification Status</h5>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="ID Type">
                    <Select className="w-full" value={editUser.kycIdType || "Passport"} onChange={(e) => setEditUser({ ...editUser, kycIdType: e.target.value as any })}>
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID</option>
                      <option value="Driver License">Driver License</option>
                    </Select>
                  </Field>
                  <Field label="ID Number">
                    <Input className="w-full" value={editUser.kycIdNumber || ""} onChange={(e) => setEditUser({ ...editUser, kycIdNumber: e.target.value })} placeholder="e.g. N-190248" />
                  </Field>
                </div>
                <Field label="KYC Status">
                  <Select className="w-full" value={editUser.kycStatus || "Pending"} onChange={(e) => setEditUser({ ...editUser, kycStatus: e.target.value as any })}>
                    <option value="Pending">Pending Audit</option>
                    <option value="Verified">Verified & Active</option>
                    <option value="Rejected">Rejected</option>
                  </Select>
                </Field>
                <div className="mt-3">
                  <Field label="Compliance Audit Log Notes">
                    <Input className="w-full" value={editUser.kycNotes || ""} onChange={(e) => setEditUser({ ...editUser, kycNotes: e.target.value })} />
                  </Field>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    );
  }

  // -------------------------------------------------------------
  // LIST VIEW RENDERS BY DEFAULT
  // -------------------------------------------------------------
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
        <Input 
          value={cityFilter} 
          onChange={(e) => setCityFilter(e.target.value)} 
          placeholder="Filter by city…" 
          className="w-40"
        />
        <Input 
          value={activityFilter} 
          onChange={(e) => setActivityFilter(e.target.value)} 
          placeholder="Filter by activity…" 
          className="w-44"
        />
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
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {paged.map((u) => (
            <TR key={u.id} className={u.status === "Pending" ? "bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer" : "cursor-pointer"} onClick={() => setSelectedProfileId(u.id)}>
              <TD onClick={(e) => e.stopPropagation()}><input type="checkbox" className="accent-[var(--primary)]" checked={selected.includes(u.id)}
                onChange={(e) => setSelected(e.target.checked ? [...selected, u.id] : selected.filter((s) => s !== u.id))} /></TD>
              <TD>
                <div className="flex items-center gap-3">
                  <Avatar initials={u.avatar} photo={u.photo} />
                  <div>
                    <div className="font-medium text-foreground hover:text-primary hover:underline">{u.name}</div>
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
              <TD className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedProfileId(u.id)}>Profile</Btn>
                  <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleEditOpen(u)}>Edit</Btn>
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
                No users found matching current filters.
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
                  const val = e.target.value as keyof typeof SPECIFIC_ROLES;
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

          {/* New assignments & KYC input in onboarding invite */}
          <div className="border border-border p-3.5 rounded-lg bg-[var(--surface-2)]">
            <h5 className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2">Facility Assignment & KYC</h5>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Facility Assignment">
                <Select className="w-full" value={draft.assignedFacilityType} onChange={(e) => setDraft({ ...draft, assignedFacilityType: e.target.value as any })}>
                  <option value="None">None</option>
                  <option value="Port">Port Gateway</option>
                  <option value="Warehouse">Warehouse Depot</option>
                  <option value="Company">Logistics Company</option>
                </Select>
              </Field>
              {draft.assignedFacilityType !== "None" && (
                <Field label="Facility Name">
                  <Input className="w-full" value={draft.assignedFacilityName} onChange={(e) => setDraft({ ...draft, assignedFacilityName: e.target.value })} placeholder="e.g. Jebel Ali Port" />
                </Field>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Field label="KYC ID Type">
                <Select className="w-full" value={draft.kycIdType} onChange={(e) => setDraft({ ...draft, kycIdType: e.target.value as any })}>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver License">Driver License</option>
                </Select>
              </Field>
              <Field label="KYC ID Number">
                <Input className="w-full" value={draft.kycIdNumber} onChange={(e) => setDraft({ ...draft, kycIdNumber: e.target.value })} placeholder="e.g. PP-91024" />
              </Field>
            </div>
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

      {/* Edit User Modal */}
      {editUser && (
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Profile: ${editUser.name}`}
          footer={<><Btn variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Btn><Btn onClick={handleEditSave}>Save Updates</Btn></>}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Field label="Full Name">
              <Input className="w-full" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
            </Field>
            
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <Input className="w-full" type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input className="w-full" value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Region">
                <Select className="w-full" value={editUser.region} onChange={(e) => {
                  const reg = e.target.value;
                  const defCity = countries[reg]?.cities[0] || "";
                  setEditUser({ ...editUser, region: reg, city: defCity });
                }}>
                  {Object.keys(countries).map((cName) => (
                    <option key={cName} value={cName}>{countries[cName].flag} {cName}</option>
                  ))}
                </Select>
              </Field>
              <Field label="City">
                <Select className="w-full" value={editUser.city} onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}>
                  {(countries[editUser.region]?.cities || []).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Role Classification">
                <Select 
                  className="w-full" 
                  value={editRoleClass} 
                  onChange={(e) => {
                    const val = e.target.value as keyof typeof SPECIFIC_ROLES;
                    setEditRoleClass(val);
                    setEditUser({ ...editUser, role: SPECIFIC_ROLES[val][0] });
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
                  value={editUser.role} 
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                >
                  {SPECIFIC_ROLES[editRoleClass].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Specific Activity">
              <Input className="w-full" value={editUser.activity} onChange={(e) => setEditUser({ ...editUser, activity: e.target.value })} />
            </Field>

            <div className="border border-border p-3.5 rounded-lg bg-[var(--surface-2)]">
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2">Assigned Logistics Facility</h5>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Facility Type">
                  <Select className="w-full" value={editUser.assignedFacilityType || "None"} onChange={(e) => {
                    const val = e.target.value as any;
                    setEditUser({ ...editUser, assignedFacilityType: val, assignedFacilityName: val === "None" ? "" : editUser.assignedFacilityName });
                  }}>
                    <option value="None">None</option>
                    <option value="Port">Port Gateway</option>
                    <option value="Warehouse">Warehouse Depot</option>
                    <option value="Company">Logistics Company</option>
                  </Select>
                </Field>
                {editUser.assignedFacilityType && editUser.assignedFacilityType !== "None" && (
                  <Field label="Facility Name">
                    <Input className="w-full" value={editUser.assignedFacilityName || ""} onChange={(e) => setEditUser({ ...editUser, assignedFacilityName: e.target.value })} placeholder="e.g. Jebel Ali Port" />
                  </Field>
                )}
              </div>
            </div>

            <div className="border border-border p-3.5 rounded-lg bg-[var(--surface-2)]">
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2">KYC & Verification Status</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="ID Type">
                  <Select className="w-full" value={editUser.kycIdType || "Passport"} onChange={(e) => setEditUser({ ...editUser, kycIdType: e.target.value as any })}>
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver License">Driver License</option>
                  </Select>
                </Field>
                <Field label="ID Number">
                  <Input className="w-full" value={editUser.kycIdNumber || ""} onChange={(e) => setEditUser({ ...editUser, kycIdNumber: e.target.value })} placeholder="e.g. N-190248" />
                </Field>
              </div>
              <Field label="KYC Status">
                <Select className="w-full" value={editUser.kycStatus || "Pending"} onChange={(e) => setEditUser({ ...editUser, kycStatus: e.target.value as any })}>
                  <option value="Pending">Pending Audit</option>
                  <option value="Verified">Verified & Active</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </Field>
              <div className="mt-3">
                <Field label="Compliance Audit Log Notes">
                  <Input className="w-full" value={editUser.kycNotes || ""} onChange={(e) => setEditUser({ ...editUser, kycNotes: e.target.value })} />
                </Field>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
