import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select, Input } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/road")({
  head: () => ({ meta: [{ title: "Road Shipments — TRANS8 Admin" }] }),
  component: RoadPage,
});

function RoadPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Road");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  const filteredCities = useMemo(() => {
    if (!meta) return [];
    return meta.cities.filter((c) =>
      c.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [meta, citySearch]);

  return (
    <AdminLayout>
      <PageHeader title="Road Shipments" subtitle={`${rows.length} truck movements across all regions`} />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); setCitySearch(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <>
            <Input 
              value={citySearch} 
              onChange={(e) => {
                setCitySearch(e.target.value);
                if (city && !e.target.value) setCity("");
              }} 
              placeholder="Type to search city..." 
              className="w-48"
            />
            <Select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {filteredCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </>
        )}
      </div>

      <BookingsView type="Road" idLabel="Trip" locationFilter={city || country} />
    </AdminLayout>
  );
}
