import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, UserCircle, Truck, Warehouse, ClipboardList, Route as RouteIcon,
  PackageSearch, Gavel, Train, Plane, Ship, Car, Container, Layers, Wallet, ArrowLeftRight,
  CreditCard, Percent, Image as ImageIcon, Bell, HelpCircle, FileText, Globe2, Languages,
  Settings, ShieldCheck, ChevronLeft, ChevronRight, Search, Menu, MapPin, ClipboardPlus,
  UsersRound, Wallet2, LogOut, Anchor, KeyRound, type LucideIcon,
} from "lucide-react";
import logoAsset from "@/assets/tlogo2.jpg.jpeg";
import { useAuth, canAccess, type Role } from "@/lib/auth";
import { toast } from "sonner";

interface NavItem { label: string; to: string; icon: LucideIcon; }
interface NavGroup { label: string; items: NavItem[]; }

const NAV: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }] },
  { label: "Shipments", items: [
    { label: "Shipment Tracking", to: "/tracking", icon: MapPin },
    { label: "New Tender Request", to: "/load-request", icon: ClipboardPlus },
    { label: "Ports", to: "/ports", icon: Anchor },
  ]},
  { label: "Network", items: [
    { label: "Agents & Territories", to: "/agents", icon: UsersRound },
    { label: "Broker Commission", to: "/broker-commission", icon: Wallet2 },
    { label: "Users & Access", to: "/access", icon: KeyRound },
  ]},
  { label: "Users", items: [
    { label: "All Users", to: "/users", icon: Users },
    { label: "Networked Users", to: "/users/customers", icon: UserCircle },
    { label: "System Users", to: "/users/truck-owners", icon: Truck },
    { label: "Warehouses", to: "/users/warehouses", icon: Warehouse },
  ]},
  { label: "Operations", items: [
    { label: "All Bookings", to: "/bookings", icon: ClipboardList },
    { label: "Active Trips", to: "/operations/trips", icon: RouteIcon },
    { label: "Tender Requests", to: "/operations/loads", icon: PackageSearch },
    { label: "Tender Management", to: "/operations/bids", icon: Gavel },
  ]},
  { label: "Logistics", items: [
    { label: "Road Shipments", to: "/logistics/road", icon: Truck },
    { label: "Train Cargo", to: "/logistics/train", icon: Train },
    { label: "Airport Cargo", to: "/logistics/air", icon: Plane },
    { label: "Sea Port", to: "/logistics/sea", icon: Ship },
  ]},
  { label: "Fleet", items: [
    { label: "Vehicles", to: "/fleet/vehicles", icon: Car },
    { label: "Container Mgmt", to: "/fleet/containers", icon: Container },
    { label: "Bulk Load Mgmt", to: "/fleet/bulk", icon: Layers },
  ]},
  { label: "Finance", items: [
    { label: "Wallet Txns", to: "/finance", icon: Wallet },
    { label: "Payouts", to: "/finance/payouts", icon: ArrowLeftRight },
    { label: "Gateways", to: "/finance/gateways", icon: CreditCard },
    { label: "Commission", to: "/finance/commission", icon: Percent },
  ]},
  { label: "Content", items: [
    { label: "Banners", to: "/content/banners", icon: ImageIcon },
    { label: "Notifications", to: "/content/notifications", icon: Bell },
    { label: "FAQ & Help", to: "/content/help", icon: HelpCircle },
    { label: "Pages", to: "/content/pages", icon: FileText },
  ]},
  { label: "Settings", items: [
    { label: "Regions", to: "/settings/regions", icon: Globe2 },
    { label: "Languages", to: "/settings/languages", icon: Languages },
    { label: "App Settings", to: "/settings", icon: Settings },
    { label: "Admin Users", to: "/settings/admins", icon: ShieldCheck },
  ]},
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const role = (user?.role ?? "Super Admin") as Role;

  const visibleNav = NAV
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(role, i.to)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-[var(--sidebar)] border-r border-border transition-all duration-200 ${collapsed ? "w-16" : "w-[280px]"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logoAsset} alt="TRANS8" className="h-8 w-8 object-contain shrink-0 rounded-md" />
            {!collapsed && (
              <div className="leading-none">
                <div className="font-display font-bold text-lg tracking-wider">TRANS8</div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">LOGISTICS OS</div>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {visibleNav.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <div className="px-5 mb-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/70">
                  {group.label}
                </div>
              )}
              <ul>
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                          active
                            ? "text-primary bg-[var(--surface-2)]"
                            : "text-foreground/70 hover:text-foreground hover:bg-[var(--surface-2)]"
                        }`}
                      >
                        {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />}
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        {!collapsed && (
          <div className="border-t border-border p-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Signed in as <span className="text-primary">{role}</span>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <TopBar onMenu={() => setCollapsed((c) => !c)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const initials = user?.initials ?? "YK";
  const name = user?.name ?? "Yusuf Karimi";
  const role = user?.role ?? "Super Admin";

  const doLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border flex items-center px-4 md:px-6 gap-3">
      <button onClick={onMenu} className="md:hidden text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search bookings, users, vehicles… (⌘K)"
          className="w-full h-9 bg-[var(--surface-2)] border border-border rounded-md pl-9 pr-3 text-sm placeholder:text-[#666] focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-2)] border border-border">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-lime)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-lime)]" />
          </span>
          <span className="text-xs font-mono text-muted-foreground">SYSTEM OPERATIONAL</span>
        </div>
        <button className="relative h-9 w-9 grid place-items-center rounded-md bg-[var(--surface-2)] border border-border hover:border-primary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center rounded-full bg-primary text-[10px] font-mono font-bold">7</span>
        </button>
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center text-sm font-display font-bold">
              {initials}
            </div>
            <div className="hidden lg:block leading-tight text-left">
              <div className="text-sm font-medium">{name}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{role}</div>
            </div>
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 z-50 bg-[var(--surface-1)] border border-border rounded-md shadow-xl overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border">
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{role}</div>
                </div>
                <button onClick={doLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[var(--surface-2)]">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}