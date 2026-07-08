import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role =
  | "Super Admin"
  | "Broker"
  | "Transporter"
  | "Custom Agent"
  | "Client"
  // Managers
  | "Content Manager"
  | "Operation Manager"
  | "Account Manager"
  | "Broker Manager"
  | "Compliance Manager"
  | "Relationship Manager"
  | "I.T Manager"
  // Supervisors
  | "Brokers Supervisor"
  | "Ports Supervisor"
  | "Agents Supervisor"
  | "Bookings Supervisor"
  | "WareHouse Supervisor"
  | "Tenders Supervisor"
  // Area Manager
  | "Area Manager"
  // Agents
  | "Port Agent"
  | "Warehouse Agent"
  | "Logistic Companies Agent"
  | "Broker Agent"
  | "Regional Insurance Agent";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
  initials: string;
}

export const DEMO_ACCOUNTS: { email: string; password: string; user: AuthUser }[] = [
  // Core Roles
  { email: "admin@trans8.io",      password: "admin123",      user: { email: "admin@trans8.io",      name: "Yusuf Karimi",   role: "Super Admin",  initials: "YK" } },
  { email: "broker@trans8.io",     password: "broker123",     user: { email: "broker@trans8.io",     name: "Layla Hosseini", role: "Broker",       initials: "LH" } },
  { email: "transporter@trans8.io",password: "transport123",  user: { email: "transporter@trans8.io",name: "Ivan Volkov",    role: "Transporter",  initials: "IV" } },
  { email: "customs@trans8.io",    password: "customs123",    user: { email: "customs@trans8.io",    name: "Omar Al-Saud",   role: "Custom Agent", initials: "OA" } },
  { email: "client@trans8.io",     password: "client123",     user: { email: "client@trans8.io",     name: "Nadia Mansouri", role: "Client",       initials: "NM" } },

  // Managers
  { email: "compliance.mgr@trans8.io", password: "compliance123", user: { email: "compliance.mgr@trans8.io", name: "Fatimah Al-Farsi", role: "Compliance Manager", initials: "FF" } },
  { email: "operation.mgr@trans8.io",  password: "operation123",  user: { email: "operation.mgr@trans8.io",  name: "Karim Al-Hassan",   role: "Operation Manager",  initials: "KH" } },
  { email: "it.mgr@trans8.io",         password: "it123",         user: { email: "it.mgr@trans8.io",         name: "Zayd Yazdi",        role: "I.T Manager",         initials: "ZY" } },
  
  // Supervisors
  { email: "ports.sup@trans8.io",    password: "ports123",    user: { email: "ports.sup@trans8.io",    name: "Haroon Rashid",    role: "Ports Supervisor",    initials: "HR" } },
  { email: "bookings.sup@trans8.io", password: "bookings123", user: { email: "bookings.sup@trans8.io", name: "Amir Khan",       role: "Bookings Supervisor", initials: "AK" } },
  
  // Area Manager
  { email: "area.mgr@trans8.io",     password: "area123",     user: { email: "area.mgr@trans8.io",     name: "Sarah Botha",      role: "Area Manager",        initials: "SB" } },
  
  // Agents
  { email: "port.agent@trans8.io",   password: "agent123",    user: { email: "port.agent@trans8.io",   name: "Siddique Shah",    role: "Port Agent",          initials: "SS" } },
  { email: "insurance.agent@trans8.io", password: "agent123", user: { email: "insurance.agent@trans8.io", name: "Mariam Naidoo",  role: "Regional Insurance Agent", initials: "MN" } },
];

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "trans8.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
      else setUser(DEMO_ACCOUNTS[0].user); // default to Super Admin so existing screens work
    } catch {/* ignore */}
  }, []);

  const login: AuthCtx["login"] = (email, password) => {
    // 1. Try static demo accounts
    const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (match) {
      setUser(match.user);
      try { localStorage.setItem(KEY, JSON.stringify(match.user)); } catch {/* ignore */}
      return { ok: true };
    }

    // 2. Try persistent database for newly invited/onboarded users
    try {
      const storedUsers = localStorage.getItem("trans8_users_database_persistent");
      if (storedUsers) {
        const list = JSON.parse(storedUsers);
        const found = list.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          // Check compliance check status
          if (found.status === "Pending" || !found.complianceApproved) {
            return { ok: false, error: "Access Denied: This account is pending Compliance Team Approval." };
          }
          if (found.status === "Suspended") {
            return { ok: false, error: "Access Denied: This account has been Suspended." };
          }

          // Default password for invited users is 'password123'
          if (password !== "password123") {
            return { ok: false, error: "Invalid credentials. Use 'password123' for invited users." };
          }

          const authUser: AuthUser = {
            email: found.email,
            name: found.name,
            role: found.role as Role,
            initials: found.avatar || found.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
          };

          setUser(authUser);
          localStorage.setItem(KEY, JSON.stringify(authUser));
          return { ok: true };
        }
      }
    } catch (e) {
      console.error(e);
    }

    return { ok: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch {/* ignore */}
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) return { user: DEMO_ACCOUNTS[0].user, login: () => ({ ok: true }), logout: () => {} };
  return v;
}

/* Role-based route visibility for the sidebar */
export const ROLE_ALLOWED_ROUTES: Record<Role, "all" | string[]> = {
  "Super Admin": "all",
  
  // Standard Roles
  Broker:        ["/", "/tracking", "/broker-commission", "/load-request", "/bookings"],
  Transporter:   ["/", "/tracking", "/operations/trips", "/fleet/vehicles", "/logistics/road", "/ports"],
  "Custom Agent":["/", "/tracking", "/agents", "/ports", "/access"],
  Client:        ["/", "/tracking", "/load-request"],

  // Managers
  "Compliance Manager": ["/", "/users", "/ports", "/access", "/settings/regions"],
  "Operation Manager":  ["/", "/tracking", "/bookings", "/operations/trips", "/operations/loads", "/operations/bids", "/fleet/vehicles", "/fleet/containers", "/logistics/road", "/logistics/train", "/logistics/air", "/logistics/sea"],
  "I.T Manager":         "all",
  "Account Manager":    ["/", "/finance", "/finance/payouts", "/finance/gateways", "/finance/commission"],
  "Broker Manager":     ["/", "/tracking", "/broker-commission", "/bookings", "/operations/loads"],
  "Content Manager":    ["/", "/content/banners", "/content/notifications", "/content/help", "/content/pages"],
  "Relationship Manager":["/", "/users", "/content/help"],

  // Supervisors
  "Brokers Supervisor":   ["/", "/tracking", "/broker-commission", "/bookings"],
  "Ports Supervisor":     ["/", "/ports", "/fleet/containers", "/logistics/sea"],
  "Agents Supervisor":    ["/", "/agents", "/users"],
  "Bookings Supervisor":  ["/", "/bookings", "/operations/trips", "/operations/loads"],
  "WareHouse Supervisor": ["/", "/users", "/fleet/containers"],
  "Tenders Supervisor":   ["/", "/operations/bids"],

  // Area Managers
  "Area Manager": ["/", "/tracking", "/users", "/ports", "/logistics/road", "/logistics/train", "/logistics/air", "/logistics/sea", "/settings/regions"],

  // Agents
  "Port Agent":                ["/", "/ports", "/fleet/containers", "/logistics/sea"],
  "Warehouse Agent":           ["/", "/users", "/fleet/containers"],
  "Logistic Companies Agent":  ["/", "/logistics/road", "/logistics/train", "/fleet/vehicles"],
  "Broker Agent":              ["/", "/broker-commission", "/bookings"],
  "Regional Insurance Agent":  ["/", "/users"]
};

export function canAccess(role: Role, path: string) {
  const allow = ROLE_ALLOWED_ROUTES[role];
  if (allow === "all") return true;
  return allow.includes(path);
}