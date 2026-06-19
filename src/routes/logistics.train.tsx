import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/train")({
  head: () => ({ meta: [{ title: "Train Cargo — Movers Admin" }] }),
  component: TrainPage,
});

function TrainPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Train");
  const [country, setCountry] = useState("");
  const [station, setStation] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  return (
    <AdminLayout>
      <PageHeader title="Train Cargo" subtitle={`${rows.length} rail consignments across the network`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setStation(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <Select value={station} onChange={(e) => setStation(e.target.value)}>
            <option value="">All stations</option>
            {meta.stations.map((s) => <option key={s}>{s}</option>)}
          </Select>
        )}
      </div>

      <BookingsView type="Train" idLabel="Consignment" locationFilter={station || country} />
    </AdminLayout>
  );
}