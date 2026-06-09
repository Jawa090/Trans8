# Movers — Logistics OS Admin Panel

A premium, enterprise-grade admin console for global logistics, shipping, and freight operations. Designed with rich aesthetics, data-dense dashboards, and smooth transitions, built on top of modern React, Vite, and TanStack Start.

---

## 🚀 Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React-based SSR framework with type-safe routing and state-management)
- **Styling**: Tailwind CSS v4 & custom HSL/oklch theme tokens
- **Type Safety**: TypeScript & Zod schemas
- **Icons**: Lucide React
- **Build System**: Vite & LightningCSS
- **State Management**: TanStack Query (React Query) & Context API

---

## 📁 Project Structure

```
Trnas8/
├── src/
│   ├── assets/              # Static assets and design files
│   ├── components/
│   │   ├── admin/           # Admin layouts, tables, and page shells
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── bookings-view.tsx
│   │   │   └── ui.tsx       # Custom admin dashboard primitives
│   │   └── ui/              # Primitive shadcn/ui components (radix-based)
│   ├── hooks/               # Custom reusable React hooks (e.g. use-mobile)
│   ├── lib/                 # Core logic, utilities, and mock data
│   │   ├── auth.tsx         # Context-based authentication
│   │   ├── mock-data.ts     # Rich mock datasets for logistics simulations
│   │   └── utils.ts         # Utility functions (cn class merger)
│   ├── routes/              # Type-safe file-based router pages
│   │   ├── index.tsx        # Overview Dashboard (Overview, stats, operations)
│   │   ├── tracking.tsx     # Real-time Shipment & Vehicle Tracking Map
│   │   ├── fleet.*.tsx      # Fleet Management (Vehicles, Containers, Bulk)
│   │   ├── operations.*.tsx # Operations Management (Bids, Loads, Trips)
│   │   ├── finance.*.tsx    # Finance Desk (Payouts, Commissions, Gateways)
│   │   ├── users.*.tsx      # User Management (Customers, Truck Owners, Warehouses)
│   │   ├── settings.*.tsx   # System Controls (Admins, Regions, Languages)
│   │   └── __root.tsx       # Main HTML Shell & Layout Config
│   ├── router.tsx           # TanStack Router instance creation
│   ├── server.ts            # SSR error-handling wrapper and server entry point
│   ├── start.ts             # Client-side hydration script
│   └── styles.css           # Global CSS and custom Design System configuration
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.ts           # Bundler and custom plugin setup
```

---

## ⚡ Development & Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
Launches the hot-reloading development server:
```bash
npm run dev
```

### 3. Build for Production
Compiles client and server bundles:
```bash
npm run build
```

### 4. Code Quality
Run formatting and linting:
```bash
npm run format   # Prettier code formatting
npm run lint     # ESLint code analysis
```

---

## 🎨 Design System & Aesthetics

Our styling resides in `src/styles.css`, configured using **Tailwind CSS v4** and structured around a high-end dark industrial theme (Movers Dark Theme):

- **Harmonious Palette**: Uses custom HSL/oklch colors (`--primary`, `--surface-1`, `--accent-lime`) for smooth gradients and cohesive elements.
- **Premium Typography**: Features *Barlow Condensed* for headers and display elements, *DM Sans* for body copy, and *JetBrains Mono* for tabular/numerical data.
- **Micro-Animations**: Hover states, smooth animations (e.g. custom `.shimmer` utility), and responsive active indicators make the admin panel feel alive and responsive.
- **Data Density**: Designed to maximize readable dashboard space while maintaining visual elegance and ease of navigation.
