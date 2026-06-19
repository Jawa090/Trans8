import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/air")({
  head: () => ({ meta: [{ title: "Airport Cargo — Movers Admin" }] }),
  component: AirPage,
});

function AirPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Air");
  const [country, setCountry] = useState("");
  const [airport, setAirport] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  return (
    <AdminLayout>
      <PageHeader title="Airport Cargo" subtitle={`${rows.length} air freight shipments across the network`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setAirport(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <Select value={airport} onChange={(e) => setAirport(e.target.value)}>
            <option value="">All airports</option>
            {meta.airports.map((a) => (
              <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
            ))}
          </Select>
        )}
      </div>

      <BookingsView type="Air" idLabel="AWB" locationFilter={airport || country} />
    </AdminLayout>
  );
}