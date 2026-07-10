import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/finance")({
  component: () => <Outlet />,
});

export function FinanceTabs({ active }: { active: "wallet" | "payouts" | "gateways" | "commission" | "billing" }) {
  const tabs = [
    { id: "wallet", label: "Wallet Transactions", to: "/finance" },
    { id: "payouts", label: "Payouts & Settlements", to: "/finance/payouts" },
    { id: "gateways", label: "Payment Gateways", to: "/finance/gateways" },
    { id: "commission", label: "Commission Structures", to: "/finance/commission" },
    { id: "billing", label: "Billing & Logs", to: "/finance/billing" },
  ];
  return (
    <div className="border-b border-border flex gap-1 mb-6 overflow-x-auto">
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          className={`px-4 py-2.5 text-sm font-medium relative transition-colors whitespace-nowrap ${
            active === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
          {active === t.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
        </Link>
      ))}
    </div>
  );
}