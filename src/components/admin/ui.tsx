import type { ReactNode } from "react";

/* Status Badge */
export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-[var(--surface-3)] text-muted-foreground border-border";
  if (["active", "completed", "delivered", "on trip"].includes(s)) cls = "bg-primary/15 text-[var(--accent-lime)] border-primary/30";
  else if (["pending", "confirmed", "idle"].includes(s)) cls = "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30";
  else if (["suspended", "failed", "cancelled"].includes(s)) cls = "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30";
  else if (["in transit", "loaded", "at port"].includes(s)) cls = "bg-[var(--info)]/15 text-[var(--info)] border-[var(--info)]/30";
  else if (["maintenance"].includes(s)) cls = "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider border ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
      {status}
    </span>
  );
}

/* Card */
export function Panel({ title, action, children, className = "" }: {
  title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`bg-[var(--surface-1)] border border-border rounded-lg ${className}`}>
      {title && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider">{title}</h3>
          {action}
        </header>
      )}
      <div className={title ? "p-5" : "p-5"}>{children}</div>
    </section>
  );
}

/* Page Header */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wide leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* Buttons */
export function Btn({
  children, variant = "primary", className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const base = "inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-secondary",
    secondary: "border border-primary text-primary hover:bg-primary/10",
    danger: "border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)]",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest}>{children}</button>;
}

/* Input */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 bg-[var(--surface-2)] border border-border rounded-md px-3 text-sm placeholder:text-[#666] focus:outline-none focus:border-primary transition-colors ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`h-9 bg-[var(--surface-2)] border border-border rounded-md px-3 text-sm focus:outline-none focus:border-primary transition-colors ${rest.className || ""}`}
    >
      {children}
    </select>
  );
}

/* Tabs */
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="border-b border-border flex gap-1 mb-5 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2.5 text-sm font-medium relative transition-colors whitespace-nowrap ${
            active === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t}
          {active === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
        </button>
      ))}
    </div>
  );
}

/* Table primitives */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-[var(--surface-2)] sticky top-0">{children}</thead>;
}
export function TH({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground ${className}`}>{children}</th>;
}
export function TR({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-t border-border hover:bg-[var(--surface-3)] transition-colors ${className}`}>{children}</tr>;
}
export function TD({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

/* Avatar */
export function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center text-xs font-display font-bold shrink-0"
    >
      {initials}
    </div>
  );
}

/* Toggle */
export function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={`h-5 w-9 rounded-full relative transition-colors duration-200 ${on ? "bg-primary" : "bg-[var(--surface-3)]"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

/* Drawer */
export function Drawer({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full sm:w-[480px] bg-[var(--surface-1)] border-l border-border h-full overflow-y-auto animate-in slide-in-from-right duration-200">
        <header className="sticky top-0 bg-[var(--surface-1)] border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* Modal (centered dialog) */
export function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface-1)] border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <header className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* Field helper */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}