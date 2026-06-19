import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/sea")({
  head: () => ({ meta: [{ title: "Sea Port — Movers Admin" }] }),
  component: SeaPage,
});

function SeaPage() {
  const [country, setCountry] = useState("");
  const [port, setPort] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  return (
    <AdminLayout>
      <PageHeader title="Sea Port" subtitle="FCL · LCL container operations across all seaports" />

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setPort(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <Select value={port} onChange={(e) => setPort(e.target.value)}>
            <option value="">All ports</option>
            {meta.ports.map((p) => <option key={p}>{p}</option>)}
          </Select>
        )}
      </div>

      <BookingsView type="Sea" idLabel="Booking" showContainer locationFilter={port || country} />
    </AdminLayout>
  );
}