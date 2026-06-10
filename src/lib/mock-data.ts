export const REGIONS = [
  { code: "IR", name: "Iran", flag: "🇮🇷", currency: "IRR", users: 12480, bookings: 842, active: true },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR", users: 18230, bookings: 1204, active: true },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", users: 9120, bookings: 1580, active: true },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", users: 4310, bookings: 320, active: true },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "TRY", users: 7820, bookings: 612, active: true },
  { code: "GCC", name: "GCC", flag: "🌐", currency: "USD", users: 15440, bookings: 1890, active: true },
  { code: "RU", name: "Russia", flag: "🇷🇺", currency: "RUB", users: 6210, bookings: 488, active: false },
];

export const REVENUE_SERIES = [
  { month: "Jul", revenue: 184000 },
  { month: "Aug", revenue: 212000 },
  { month: "Sep", revenue: 198000 },
  { month: "Oct", revenue: 246000 },
  { month: "Nov", revenue: 274000 },
  { month: "Dec", revenue: 318000 },
  { month: "Jan", revenue: 342000 },
  { month: "Feb", revenue: 388000 },
  { month: "Mar", revenue: 412000 },
  { month: "Apr", revenue: 468000 },
  { month: "May", revenue: 524000 },
  { month: "Jun", revenue: 612000 },
];

export const BOOKINGS_BY_TYPE = [
  { name: "Road", value: 4820, color: "var(--primary)" },
  { name: "Train", value: 1640, color: "var(--accent-lime)" },
  { name: "Airport", value: 980, color: "var(--secondary)" },
  { name: "Seaport", value: 2210, color: "var(--success)" },
];

const FIRST = ["Reza", "Ali", "Amir", "Omar", "Hassan", "Yusuf", "Khalid", "Ahmed", "Mehmet", "Ivan", "Sara", "Nadia", "Layla", "Fatima", "Zara", "Sergei"];
const LAST = ["Karimi", "Ahmadi", "Rahimi", "Al-Saud", "Khan", "Yilmaz", "Volkov", "Petrov", "Naidoo", "Botha", "Hosseini", "Mansouri", "Aydin", "Kaya"];
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

let _seed = 1;
function seeded() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }
const srand = <T,>(a: T[]) => a[Math.floor(seeded() * a.length)];

export type UserKind = "Networked" | "System";
export type UserStatus = "Active" | "Suspended" | "Pending";
export interface User {
  id: string; name: string; phone: string; region: string; kind: UserKind;
  role: string; subRole?: string;
  status: UserStatus; joined: string; avatar: string; email: string; walletBalance: number; rating: number; trips: number;
}

export const USERS: User[] = Array.from({ length: 48 }, (_, i) => {
  const first = srand(FIRST), last = srand(LAST);
  const name = `${first} ${last}`;
  const isNetworked = i % 2 === 0;
  const kind: UserKind = isNetworked ? "Networked" : "System";
  
  let role = "";
  let subRole = "";
  
  if (isNetworked) {
    const netRoles = ["Logistic Broker", "Port Agent", "Custom Agent", "Logistics Partner"];
    role = netRoles[i % netRoles.length];
    if (role === "Logistics Partner") {
      subRole = ["Road", "Rail", "Sea", "Air"][i % 4];
    }
  } else {
    const sysRoles = ["Driver", "Agent", "Admin", "Shipping"];
    role = sysRoles[i % sysRoles.length];
    if (role === "Driver") {
      subRole = ["Truck by type", "Container", "Compressor", "Pickup"][i % 4];
    } else if (role === "Agent") {
      subRole = ["Port", "Logistics", "Warehouse", "Survey", "Insurance"][i % 5];
    } else if (role === "Admin") {
      subRole = ["Supervisor", "Accounts", "Operations", "Relations", "Ship", "Project"][i % 6];
    } else if (role === "Shipping") {
      subRole = ["Liners", "NVOCC", "Feeder", "Spot"][i % 4];
    }
  }
  
  const status = srand(["Active", "Active", "Active", "Pending", "Suspended"] as UserStatus[]);
  const region = srand(REGIONS).name;
  return {
    id: `USR-${(10234 + i).toString()}`,
    name, kind, role, subRole, status, region,
    phone: `+${Math.floor(seeded() * 90 + 10)} ${Math.floor(seeded() * 900 + 100)} ${Math.floor(seeded() * 9000 + 1000)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@trans8.io`,
    joined: `2025-${String(Math.floor(seeded() * 12) + 1).padStart(2, "0")}-${String(Math.floor(seeded() * 28) + 1).padStart(2, "0")}`,
    avatar: `${first[0]}${last[0]}`,
    walletBalance: Math.floor(seeded() * 12000),
    rating: +(3.5 + seeded() * 1.5).toFixed(1),
    trips: Math.floor(seeded() * 240),
  };
});

export type ShipType = "Road" | "Train" | "Air" | "Sea";
export type BookingStatus = "Pending" | "Confirmed" | "In Transit" | "Delivered" | "Cancelled";
const CITIES = ["Tehran", "Dubai", "Karachi", "Istanbul", "Moscow", "Cape Town", "Riyadh", "Doha", "Lahore", "Ankara", "Shiraz", "Jeddah", "Bandar Abbas", "Mashhad"];
export interface Booking {
  id: string; customer: string; driver: string; type: ShipType; origin: string; destination: string;
  status: BookingStatus; date: string; amount: number; cargo: string; weight: string;
  containerType?: "FCL" | "LCL" | "Bulk"; containerId?: string;
}

export const BOOKINGS: Booking[] = Array.from({ length: 60 }, (_, i) => {
  const type = srand(["Road", "Road", "Road", "Sea", "Air", "Train"] as ShipType[]);
  const status = srand(["Pending", "Confirmed", "In Transit", "In Transit", "Delivered", "Delivered", "Cancelled"] as BookingStatus[]);
  let origin = srand(CITIES); let destination = srand(CITIES);
  while (destination === origin) destination = srand(CITIES);
  return {
    id: `BK-${(20418 + i).toString()}`,
    customer: `${srand(FIRST)} ${srand(LAST)}`,
    driver: `${srand(FIRST)} ${srand(LAST)}`,
    type, status, origin, destination,
    date: `2026-0${Math.floor(seeded() * 6) + 1}-${String(Math.floor(seeded() * 28) + 1).padStart(2, "0")}`,
    amount: Math.floor(seeded() * 18000) + 800,
    cargo: srand(["Electronics", "Textiles", "Machinery", "Food & Beverage", "Auto Parts", "Construction Mat.", "Pharmaceuticals"]),
    weight: `${(seeded() * 28 + 0.5).toFixed(1)} t`,
    containerType: type === "Sea" ? srand(["FCL", "LCL", "Bulk"] as const) : undefined,
    containerId: type === "Sea" ? `MSCU-${Math.floor(seeded() * 9000000 + 1000000)}` : undefined,
  };
});

export const TRANSACTIONS = Array.from({ length: 30 }, (_, i) => ({
  id: `TXN-${(70112 + i).toString()}`,
  user: `${srand(FIRST)} ${srand(LAST)}`,
  type: srand(["Payment", "Payout", "Refund", "Commission"]),
  gateway: srand(["Stripe", "bKash", "Razorpay", "Flutterwave", "Paystack", "SSLCommerz", "Paypal"]),
  amount: Math.floor(seeded() * 8400) + 50,
  status: srand(["Completed", "Completed", "Pending", "Failed"]),
  date: `2026-06-${String(Math.floor(seeded() * 4) + 1).padStart(2, "0")}`,
}));

export const VEHICLES = Array.from({ length: 18 }, (_, i) => ({
  id: `VH-${(3041 + i).toString()}`,
  type: srand(["20ft Container Truck", "40ft Flatbed", "Refrigerated Trailer", "Tanker", "Tipper", "Curtain Side"]),
  plate: `${srand(["DXB", "THR", "KHI", "IST", "MOW"])}-${Math.floor(seeded() * 90000 + 10000)}`,
  owner: `${srand(FIRST)} ${srand(LAST)}`,
  status: srand(["On Trip", "Idle", "Maintenance"]),
  lastTrip: `${srand(CITIES)} → ${srand(CITIES)}`,
  capacity: `${Math.floor(seeded() * 30 + 5)} t`,
}));

export const CONTAINERS = Array.from({ length: 22 }, (_, i) => ({
  id: `MSCU-${Math.floor(seeded() * 9000000 + 1000000)}`,
  type: srand(["20ft", "40ft", "Bulk"]),
  status: srand(["At Port", "Loaded", "In Transit", "Delivered"]),
  load: `${Math.floor(seeded() * 28 + 1)} t`,
  port: srand(["Bandar Abbas", "Jebel Ali", "Karachi", "Istanbul", "Durban"]),
  owner: `${srand(FIRST)} ${srand(LAST)}`,
  mode: srand(["FCL", "LCL", "Bulk"]),
}));

export const NOTIFICATIONS_SENT = [
  { id: 1, title: "System maintenance window", target: "All Users", date: "2026-06-02", reach: 78420 },
  { id: 2, title: "New commission rates for UAE", target: "Truck Owners", date: "2026-05-30", reach: 4310 },
  { id: 3, title: "Eid promotional rates live", target: "Customers", date: "2026-05-28", reach: 52810 },
  { id: 4, title: "Warehouse onboarding update", target: "Warehouses", date: "2026-05-22", reach: 412 },
];

export const LANGUAGES = [
  { code: "en", name: "English", native: "English", on: true, locked: true },
  { code: "fa", name: "Farsi", native: "فارسی", on: true, locked: false },
  { code: "ur", name: "Urdu", native: "اردو", on: true, locked: false },
  { code: "ar", name: "Arabic", native: "العربية", on: true, locked: false },
  { code: "tr", name: "Turkish", native: "Türkçe", on: true, locked: false },
  { code: "ru", name: "Russian", native: "Русский", on: false, locked: false },
  { code: "fr", name: "French", native: "Français", on: false, locked: false },
  { code: "sw", name: "Swahili", native: "Kiswahili", on: false, locked: false },
  { code: "hi", name: "Hindi", native: "हिन्दी", on: false, locked: false },
  { code: "zh", name: "Chinese", native: "中文", on: false, locked: false },
  { code: "de", name: "German", native: "Deutsch", on: false, locked: false },
  { code: "es", name: "Spanish", native: "Español", on: false, locked: false },
  { code: "pt", name: "Portuguese", native: "Português", on: false, locked: false },
];

export const PAYMENT_GATEWAYS = [
  { name: "Stripe", on: true }, { name: "bKash", on: true }, { name: "Paypal", on: false },
  { name: "Razorpay", on: true }, { name: "Flutterwave", on: true }, { name: "Paystack", on: false },
  { name: "SSLCommerz", on: true },
];

export const ADMIN_USERS = [
  { id: "AD-001", name: "Yusuf Karimi", email: "yusuf@movers.io", role: "Super Admin", lastActive: "2 min ago" },
  { id: "AD-002", name: "Layla Hosseini", email: "layla@movers.io", role: "Operations", lastActive: "1 hr ago" },
  { id: "AD-003", name: "Ivan Volkov", email: "ivan@movers.io", role: "Finance", lastActive: "Yesterday" },
  { id: "AD-004", name: "Nadia Mansouri", email: "nadia@movers.io", role: "Support", lastActive: "3 hr ago" },
];

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}