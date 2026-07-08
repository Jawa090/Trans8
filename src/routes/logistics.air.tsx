import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Select, Input, Btn, Modal, Field } from "@/components/admin/ui";
import { BookingsView } from "@/components/admin/bookings-view";
import { BOOKINGS } from "@/lib/mock-data";
import { useCountries } from "@/lib/countries-store";
import { toast } from "sonner";
import { Globe2 } from "lucide-react";

export const Route = createFileRoute("/logistics/air")({
  head: () => ({ meta: [{ title: "Airport Cargo — TRANS8 Admin" }] }),
  component: AirPage,
});

function AirPage() {
  const rows = BOOKINGS.filter((b) => b.type === "Air");
  const { countries, addCountry } = useCountries();
  const [country, setCountry] = useState("");
  const [airport, setAirport] = useState("");
  const [airportSearch, setAirportSearch] = useState("");

  // Add country modal state
  const [addCountryOpen, setAddCountryOpen] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryFlag, setNewCountryFlag] = useState("🇸🇦");
  const [newCities, setNewCities] = useState("Riyadh, Jeddah, Dammam");
  const [newPorts, setNewPorts] = useState("Jeddah Port, King Abdulaziz Port");
  const [newAirports, setNewAirports] = useState("RUH:King Khalid International,JED:King Abdulaziz International");
  const [newStations, setNewStations] = useState("Riyadh Central Station, Dammam Station");

  const countryKeys = Object.keys(countries);
  const meta = country ? countries[country] : null;

  const filteredAirports = useMemo(() => {
    if (!meta) return [];
    return meta.airports.filter((a) =>
      `${a.code} ${a.name} ${a.type}`.toLowerCase().includes(airportSearch.toLowerCase())
    );
  }, [meta, airportSearch]);

  const handleAddCountry = () => {
    if (!newCountryName.trim()) {
      toast.error("Country name is required");
      return;
    }
    if (countries[newCountryName.trim()]) {
      toast.error("Country already exists in database");
      return;
    }

    // Parse input fields
    const citiesList = newCities.split(",").map(s => s.trim()).filter(Boolean);
    const portsList = newPorts.split(",").map(s => s.trim()).filter(Boolean);
    const stationsList = newStations.split(",").map(s => s.trim()).filter(Boolean);
    const airportsList = newAirports.split(",").map(s => {
      const parts = s.trim().split(":");
      const code = parts[0]?.trim() || "APT";
      const name = parts[1]?.trim() || `${code} Airport`;
      return { code, name, type: "International" as const };
    }).filter(a => a.code);

    addCountry(newCountryName.trim(), {
      flag: newCountryFlag.trim() || "🌐",
      cities: citiesList.length > 0 ? citiesList : ["Capital City"],
      ports: portsList,
      airports: airportsList,
      stations: stationsList
    });

    toast.success(`Successfully expanded TRANS8 Land & Air network to ${newCountryName}!`);
    setCountry(newCountryName.trim());
    setAddCountryOpen(false);

    // Reset form fields
    setNewCountryName("");
    setNewCountryFlag("🇸🇦");
    setNewCities("Riyadh, Jeddah, Dammam");
    setNewPorts("Jeddah Port, King Abdulaziz Port");
    setNewAirports("RUH:King Khalid International,JED:King Abdulaziz International");
    setNewStations("Riyadh Central Station, Dammam Station");
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="Airport Cargo" 
        subtitle={`${rows.length} air freight shipments across the network`} 
        actions={
          <Btn onClick={() => setAddCountryOpen(true)}>
            <Globe2 className="h-4 w-4 mr-1" /> + Expand to MENA
          </Btn>
        }
      />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={country} onChange={(e) => { setCountry(e.target.value); setAirport(""); setAirportSearch(""); }}>
          <option value="">All countries</option>
          {countryKeys.map((c) => (
            <option key={c} value={c}>
              {countries[c].flag} {c}
            </option>
          ))}
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

      {/* Expand to MENA Modal */}
      <Modal 
        open={addCountryOpen} 
        onClose={() => setAddCountryOpen(false)} 
        title="Expand Logistics to MENA Region"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAddCountryOpen(false)}>Cancel</Btn>
            <Btn onClick={handleAddCountry}>Add Country & Routes</Btn>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="text-xs text-muted-foreground bg-[var(--surface-2)] p-3 border border-border rounded-md">
            Enter country parameters to provision land, air, and sea routes in the new territory.
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Country Name">
                <Input 
                  value={newCountryName} 
                  onChange={(e) => setNewCountryName(e.target.value)} 
                  placeholder="e.g. Saudi Arabia" 
                  className="w-full"
                />
              </Field>
            </div>
            <div>
              <Field label="Flag Emoji">
                <Input 
                  value={newCountryFlag} 
                  onChange={(e) => setNewCountryFlag(e.target.value)} 
                  placeholder="🇸🇦" 
                  className="w-full text-center"
                />
              </Field>
            </div>
          </div>
          <Field label="Cities (comma-separated)">
            <Input 
              value={newCities} 
              onChange={(e) => setNewCities(e.target.value)} 
              placeholder="e.g. Riyadh, Jeddah, Dammam" 
              className="w-full"
            />
          </Field>
          <Field label="Seaports (comma-separated)">
            <Input 
              value={newPorts} 
              onChange={(e) => setNewPorts(e.target.value)} 
              placeholder="e.g. Jeddah Islamic Port, King Abdulaziz Port" 
              className="w-full"
            />
          </Field>
          <Field label="Airports (comma-separated format: CODE:Name)">
            <Input 
              value={newAirports} 
              onChange={(e) => setNewAirports(e.target.value)} 
              placeholder="e.g. RUH:King Khalid, JED:King Abdulaziz" 
              className="w-full"
            />
          </Field>
          <Field label="Train Stations (comma-separated)">
            <Input 
              value={newStations} 
              onChange={(e) => setNewStations(e.target.value)} 
              placeholder="e.g. Riyadh Station, Dammam Station" 
              className="w-full"
            />
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
}