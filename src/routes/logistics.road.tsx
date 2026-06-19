import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/road")({
  head: () => ({ meta: [{ title: "Road Shipments — Movers Admin" }] }),
  component: RoadPage,
});

function RoadPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Road");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  return (
    <AdminLayout>
      <PageHeader title="Road Shipments" subtitle={`${rows.length} truck movements across all regions`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All cities</option>
            {meta.cities.map((c) => <option key={c}>{c}</option>)}
          </Select>
        )}
      </div>

      <BookingsView type="Road" idLabel="Trip" locationFilter={city || country} />
    </AdminLayout>
  );
}