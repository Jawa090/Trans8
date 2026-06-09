import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth, DEMO_ACCOUNTS } from "@/lib/auth";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — TRANS8" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@trans8.io");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Welcome back");
      navigate({ to: "/" });
    }, 350);
  };

  const useDemo = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-[var(--surface-1)] border-r border-border relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center bg-primary rounded-md"><Truck className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <div className="font-display font-bold text-xl tracking-wider">TRANS8</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Logistics OS</div>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-display font-bold leading-tight uppercase tracking-wide">Global logistics,<br/>orchestrated.</h2>
          <p className="text-muted-foreground mt-4 max-w-md">Brokers, transporters, customs agents and clients — one operational fabric across road, rail, sea and air.</p>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">© 2026 TRANS8 · All systems operational</div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-display font-bold uppercase tracking-wide">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Access your role-based dashboard.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 bg-[var(--surface-2)] border border-border rounded-md px-3 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 bg-[var(--surface-2)] border border-border rounded-md px-3 text-sm focus:outline-none focus:border-primary" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium hover:bg-secondary transition-colors disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Demo accounts · click to fill</div>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.email} onClick={() => useDemo(a.email, a.password)}
                  className="flex items-center justify-between text-left p-3 rounded-md border border-border bg-[var(--surface-1)] hover:border-primary transition-colors">
                  <div>
                    <div className="text-sm font-medium">{a.user.role}</div>
                    <div className="text-xs text-muted-foreground font-mono">{a.email}</div>
                  </div>
                  <code className="text-[11px] text-muted-foreground font-mono">{a.password}</code>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">← Back to app</Link></div>
        </div>
      </div>
    </div>
  );
}