import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Super Admin" | "Broker" | "Transporter" | "Custom Agent" | "Client";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
  initials: string;
}

export const DEMO_ACCOUNTS: { email: string; password: string; user: AuthUser }[] = [
  { email: "admin@trans8.io",      password: "admin123",      user: { email: "admin@trans8.io",      name: "Yusuf Karimi",   role: "Super Admin",  initials: "YK" } },
  { email: "broker@trans8.io",     password: "broker123",     user: { email: "broker@trans8.io",     name: "Layla Hosseini", role: "Broker",       initials: "LH" } },
  { email: "transporter@trans8.io",password: "transport123",  user: { email: "transporter@trans8.io",name: "Ivan Volkov",    role: "Transporter",  initials: "IV" } },
  { email: "customs@trans8.io",    password: "customs123",    user: { email: "customs@trans8.io",    name: "Omar Al-Saud",   role: "Custom Agent", initials: "OA" } },
  { email: "client@trans8.io",     password: "client123",     user: { email: "client@trans8.io",     name: "Nadia Mansouri", role: "Client",       initials: "NM" } },
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
    const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!match) return { ok: false, error: "Invalid email or password" };
    setUser(match.user);
    try { localStorage.setItem(KEY, JSON.stringify(match.user)); } catch {/* ignore */}
    return { ok: true };
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
  Broker:        ["/", "/tracking", "/broker-commission", "/load-request", "/bookings"],
  Transporter:   ["/", "/tracking", "/operations/trips", "/fleet/vehicles", "/logistics/road", "/ports"],
  "Custom Agent":["/", "/tracking", "/agents", "/ports", "/access"],
  Client:        ["/", "/tracking", "/load-request"],
};

export function canAccess(role: Role, path: string) {
  const allow = ROLE_ALLOWED_ROUTES[role];
  if (allow === "all") return true;
  return allow.includes(path);
}