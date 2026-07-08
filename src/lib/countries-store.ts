import { useState, useEffect } from "react";

export interface AirportMeta {
  code: string;
  name: string;
  type: "International" | "Domestic";
}

export interface CountryMeta {
  cities: string[];
  ports: string[];
  airports: AirportMeta[];
  stations: string[];
  flag: string;
}

export const DEFAULT_COUNTRIES: Record<string, CountryMeta> = {
  UAE: {
    flag: "🇦🇪",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Fujairah", "Ajman", "RAK", "Al Ain"],
    ports: ["Jebel Ali Port", "Khalifa Port", "Port Rashid", "Zayed Port", "Sharjah Port", "Fujairah Port"],
    airports: [
      { code: "DXB", name: "Dubai International Airport", type: "International" },
      { code: "AUH", name: "Zayed International Airport", type: "International" },
      { code: "SHJ", name: "Sharjah International Airport", type: "International" },
      { code: "FJR", name: "Fujairah International Airport", type: "International" },
      { code: "AJM", name: "Ajman Airport", type: "Domestic" },
      { code: "RKT", name: "Ras Al Khaimah Airport", type: "Domestic" },
      { code: "AAN", name: "Al Ain International Airport", type: "Domestic" }
    ],
    stations: ["Dubai Central Station", "Abu Dhabi Station", "Sharjah Station", "Fujairah Station", "Ajman Station", "RAK Station", "Al Ain Station"]
  },
  Pakistan: {
    flag: "🇵🇰",
    cities: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Hyderabad", "Sialkot", "Gujranwala"],
    ports: ["Port of Karachi", "Port Qasim", "Gwadar Port"],
    airports: [
      { code: "KHI", name: "Jinnah International Airport", type: "International" },
      { code: "LHE", name: "Allama Iqbal International Airport", type: "International" },
      { code: "ISB", name: "Islamabad International Airport", type: "International" },
      { code: "PEW", name: "Bacha Khan International Airport", type: "International" },
      { code: "UET", name: "Quetta International Airport", type: "Domestic" },
      { code: "MUX", name: "Multan International Airport", type: "Domestic" },
      { code: "LYP", name: "Faisalabad Airport", type: "Domestic" },
      { code: "HDD", name: "Hyderabad Airport", type: "Domestic" },
      { code: "SKT", name: "Sialkot International Airport", type: "International" },
      { code: "GJR", name: "Gujranwala Airport", type: "Domestic" }
    ],
    stations: ["Karachi Cantt Station", "Lahore Junction Station", "Islamabad Station", "Peshawar Cantt Station", "Quetta Station", "Multan Cantt Station", "Faisalabad Station", "Hyderabad Station", "Sialkot Station", "Gujranwala Station"]
  },
  Iran: {
    flag: "🇮🇷",
    cities: ["Tehran", "Mashhad", "Isfahan", "Shiraz", "Tabriz", "Ahvaz", "Bandar Abbas", "Chabahar", "Bushehr", "Zahedan"],
    ports: ["Bandar Abbas Port", "Chabahar Port", "Bushehr Port", "Bandar Imam Khomeini Port", "Anzali Port"],
    airports: [
      { code: "IKA", name: "Imam Khomeini International Airport", type: "International" },
      { code: "MHD", name: "Mashhad International Airport", type: "International" },
      { code: "IFN", name: "Isfahan International Airport", type: "Domestic" },
      { code: "SYZ", name: "Shiraz International Airport", type: "International" },
      { code: "TBZ", name: "Tabriz International Airport", type: "Domestic" },
      { code: "AWZ", name: "Ahvaz Airport", type: "Domestic" },
      { code: "BND", name: "Bandar Abbas Airport", type: "Domestic" },
      { code: "ZBR", name: "Chabahar Airport", type: "Domestic" },
      { code: "BUZ", name: "Bushehr Airport", type: "Domestic" },
      { code: "ZAH", name: "Zahedan Airport", type: "Domestic" }
    ],
    stations: ["Tehran Station", "Mashhad Station", "Isfahan Station", "Shiraz Station", "Tabriz Station", "Ahvaz Station", "Bandar Abbas Station", "Chabahar Station", "Bushehr Station", "Zahedan Station"]
  },
  "South Africa": {
    flag: "🇿🇦",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Richards Bay", "East London"],
    ports: ["Port of Durban", "Port of Cape Town", "Port of Port Elizabeth", "Richards Bay Port", "Saldanha Bay Port"],
    airports: [
      { code: "JNB", name: "O.R. Tambo International Airport", type: "International" },
      { code: "CPT", name: "Cape Town International Airport", type: "International" },
      { code: "DUR", name: "King Shaka International Airport", type: "International" },
      { code: "PRY", name: "Wonderboom Airport", type: "Domestic" },
      { code: "PLZ", name: "Chief Dawid Stuurman Airport", type: "Domestic" },
      { code: "RCB", name: "Richards Bay Airport", type: "Domestic" },
      { code: "ELS", name: "East London Airport", type: "Domestic" }
    ],
    stations: ["Johannesburg Park Station", "Cape Town Station", "Durban Station", "Pretoria Station", "Port Elizabeth Station", "Richards Bay Station", "East London Station"]
  },
  Turkey: {
    flag: "🇹🇷",
    cities: ["Istanbul", "Ankara", "Izmir", "Mersin", "Trabzon", "Gaziantep", "Adana", "Bursa", "Antalya", "Iskenderun"],
    ports: ["Port of Istanbul", "Port of Mersin", "Port of Izmir", "Port of Iskenderun", "Port of Trabzon"],
    airports: [
      { code: "IST", name: "Istanbul Airport", type: "International" },
      { code: "ESB", name: "Ankara Esenboga Airport", type: "International" },
      { code: "ADB", name: "Izmir Adnan Menderes Airport", type: "International" },
      { code: "MRN", name: "Mersin Airport", type: "Domestic" },
      { code: "TZX", name: "Trabzon Airport", type: "Domestic" },
      { code: "GZT", name: "Gaziantep Oguzeli Airport", type: "International" },
      { code: "ADA", name: "Adana Sakirpasa Airport", type: "Domestic" },
      { code: "YEI", name: "Yenisehir Airport", type: "Domestic" },
      { code: "AYT", name: "Antalya Airport", type: "International" },
      { code: "ISR", name: "Iskenderun Airport", type: "Domestic" }
    ],
    stations: ["Istanbul Sirkeci Station", "Ankara Central Station", "Izmir Alsancak Station", "Mersin Station", "Trabzon Station", "Gaziantep Station", "Adana Station", "Bursa Station", "Antalya Station", "Iskenderun Station"]
  },
  India: {
    flag: "🇮🇳",
    cities: ["Mumbai", "Delhi", "Chennai", "Kolkata", "Ahmedabad", "Mundra", "Surat", "Cochin", "Bangalore", "Hyderabad"],
    ports: ["JNPT Port", "Chennai Port", "Mundra Port", "Kolkata Port", "Cochin Port", "Kandla Port"],
    airports: [
      { code: "BOM", name: "Chhatrapati Shivaji Maharaj Airport", type: "International" },
      { code: "DEL", name: "Indira Gandhi International Airport", type: "International" },
      { code: "MAA", name: "Chennai International Airport", type: "International" },
      { code: "CCU", name: "Netaji Subhash Chandra Bose Airport", type: "International" },
      { code: "AMD", name: "Sardar Vallabhbhai Patel Airport", type: "Domestic" },
      { code: "MUN", name: "Mundra Airport", type: "Domestic" },
      { code: "STV", name: "Surat Airport", type: "Domestic" },
      { code: "COK", name: "Cochin Airport", type: "Domestic" },
      { code: "BLR", name: "Kempegowda International Airport", type: "International" },
      { code: "HYD", name: "Rajiv Gandhi International Airport", type: "International" }
    ],
    stations: ["Mumbai Central Station", "New Delhi Station", "Chennai Central Station", "Howrah Junction", "Ahmedabad Station", "Mundra Station", "Surat Station", "Cochin Station", "KSR Bengaluru Station", "Secunderabad Junction"]
  }
};

const STORAGE_KEY = "trans8_countries_database";

export function getCountriesDatabase(): Record<string, CountryMeta> {
  if (typeof window === "undefined") return DEFAULT_COUNTRIES;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COUNTRIES));
    return DEFAULT_COUNTRIES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_COUNTRIES;
  }
}

export function saveCountriesDatabase(data: Record<string, CountryMeta>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("countries_updated"));
}

export function addCountryToDatabase(name: string, meta: CountryMeta) {
  const db = getCountriesDatabase();
  db[name] = meta;
  saveCountriesDatabase(db);
}

export function useCountries() {
  const [db, setDb] = useState<Record<string, CountryMeta>>(getCountriesDatabase);

  useEffect(() => {
    const handleUpdate = () => {
      setDb(getCountriesDatabase());
    };
    window.addEventListener("countries_updated", handleUpdate);
    return () => {
      window.removeEventListener("countries_updated", handleUpdate);
    };
  }, []);

  return {
    countries: db,
    addCountry: (name: string, meta: CountryMeta) => addCountryToDatabase(name, meta)
  };
}
