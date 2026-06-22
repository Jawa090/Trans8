import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select, Input } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { META_DIRECTORIES } from "./load-request";

export const Route = createFileRoute("/logistics/sea")({
  head: () => ({ meta: [{ title: "Sea Port — TRANS8 Admin" }] }),
  component: SeaPage,
});

function SeaPage() {
  const [country, setCountry] = useState("");
  const [port, setPort] = useState("");
  const [portSearch, setPortSearch] = useState("");

  const countries = Object.keys(META_DIRECTORIES);
  const meta = country ? META_DIRECTORIES[country] : null;

  const filteredPorts = useMemo(() => {
    if (!meta) return [];
    return meta.ports.filter((p) =>
      p.toLowerCase().includes(portSearch.toLowerCase())
    );
  }, [meta, portSearch]);

  return (
    <AdminLayout>
      <PageHeader title="Sea Port" subtitle="FCL · LCL container operations across all seaports" />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setPort(""); setPortSearch(""); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </Select>
        {meta && (
          <>
            <Input 
              value={portSearch} 
              onChange={(e) => {
                setPortSearch(e.target.value);
                if (port && !e.target.value) setPort("");
              }} 
              placeholder="Type to search port..." 
              className="w-48"
            />
            <Select value={port} onChange={(e) => setPort(e.target.value)}>
              <option value="">All ports</option>
              {filteredPorts.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </>
        )}
      </div>

      <BookingsView type="Sea" idLabel="Booking" showContainer locationFilter={port || country} />
    </AdminLayout>
  );
}