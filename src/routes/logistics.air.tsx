import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select, Input } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/air")({
  head: () => ({ meta: [{ title: "Airport Cargo — TRANS8 Admin" }] }),
  component: AirPage,
});

function AirPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Air");
  const [country, setCountry] = useState("");
  const [airport, setAirport] = useState("");
  const [airportSearch, setAirportSearch] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  const filteredAirports = useMemo(() => {
    if (!meta) return [];
    return meta.airports.filter((a) =>
      `${a.code} ${a.name} ${a.type}`.toLowerCase().includes(airportSearch.toLowerCase())
    );
  }, [meta, airportSearch]);

  return (
    <AdminLayout>
      <PageHeader title="Airport Cargo" subtitle={`${rows.length} air freight shipments across the network`} />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setAirport(""); setAirportSearch(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <>
            <Input 
              value={airportSearch} 
              onChange={(e) => {
                setAirportSearch(e.target.value);
                if (airport && !e.target.value) setAirport("");
              }} 
              placeholder="Type to search airport..." 
              className="w-48"
            />
            <Select value={airport} onChange={(e) => setAirport(e.target.value)}>
              <option value="">All airports</option>
              {filteredAirports.map((a) => (
                <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
              ))}
            </Select>
          </>
        )}
      </div>

      <BookingsView type="Air" idLabel="AWB" locationFilter={airport || country} />
    </AdminLayout>
  );
}