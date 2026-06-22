import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select, Input } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/train")({
  head: () => ({ meta: [{ title: "Train Cargo — TRANS8 Admin" }] }),
  component: TrainPage,
});

function TrainPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Train");
  const [country, setCountry] = useState("");
  const [station, setStation] = useState("");
  const [stationSearch, setStationSearch] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  const filteredStations = useMemo(() => {
    if (!meta) return [];
    return meta.stations.filter((s) =>
      s.toLowerCase().includes(stationSearch.toLowerCase())
    );
  }, [meta, stationSearch]);

  return (
    <AdminLayout>
      <PageHeader title="Train Cargo" subtitle={`${rows.length} rail consignments across the network`} />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setStation(""); setStationSearch(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <>
            <Input 
              value={stationSearch} 
              onChange={(e) => {
                setStationSearch(e.target.value);
                if (station && !e.target.value) setStation("");
              }} 
              placeholder="Type to search station..." 
              className="w-48"
            />
            <Select value={station} onChange={(e) => setStation(e.target.value)}>
              <option value="">All stations</option>
              {filteredStations.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </>
        )}
      </div>

      <BookingsView type="Train" idLabel="Consignment" locationFilter={station || country} />
    </AdminLayout>
  );
}