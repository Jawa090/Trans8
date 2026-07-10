import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: () => <Outlet />,
});

export function SettingsTabs({ active }: { active: "general" | "regions" | "languages" | "admins" }) {
  const tabs = [
    { id: "general", label: "App Settings", to: "/settings" },
    { id: "regions", label: "Regions", to: "/settings/regions" },
    { id: "languages", label: "Languages", to: "/settings/languages" },
    { id: "admins", label: "Admin Users", to: "/settings/admins" },
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