export const SITE = {
  name: "Shreeji Enterprise",
  tagline: "Precision Laser Cutting & CNC Bending",
  phone: "+91 00000 00000",
  email: "info@shreejienterprise.com",
  address: "Add your workshop address here",
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
};

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Capabilities" },
  { href: "/our-work", label: "Our Work" },
  { href: "/contact", label: "Contact" },
];

export const MACHINE_SPECS = [
  { label: "Fiber Laser Cutter", value: "190 kW" },
  { label: "CNC Press Brake", value: "175 Ton" },
  { label: "Materials", value: "MS / SS / AL" },
  { label: "Turnaround", value: "Prototype → Bulk" },
];

export const CAPABILITIES = [
  {
    num: "01",
    title: "Laser Cutting",
    description:
      "High-precision cutting on our 190 kW fiber laser — clean edges, tight tolerances, minimal material waste.",
  },
  {
    num: "02",
    title: "CNC Bending",
    description:
      "175-ton press brake for accurate, repeatable bends on brackets, panels, and enclosures of any complexity.",
  },
  {
    num: "03",
    title: "Custom Fabrication",
    description:
      "Send us a drawing or a sample part — we'll cut, bend, and finish it to spec, start to finish.",
  },
  {
    num: "04",
    title: "Prototype & Bulk",
    description:
      "Same process whether you need one part to test a design or a thousand for production.",
  },
];

export const INDUSTRIES = [
  "Automotive",
  "Furniture & Interiors",
  "Electrical Enclosures",
  "Signage & Display",
  "HVAC & Ducting",
  "Architecture & Railings",
];

export const PROCESS_STEPS = [
  {
    num: "01",
    title: "Inquiry & Drawing Review",
    description: "Send your drawing, DXF, or sample. We review material, thickness, and quantity.",
  },
  {
    num: "02",
    title: "Quote & Confirmation",
    description: "We cost the job and send a clear quote — material, cutting, and bending broken out.",
  },
  {
    num: "03",
    title: "Laser Cutting",
    description: "Parts are cut on the fiber laser to exact dimensions.",
  },
  {
    num: "04",
    title: "CNC Bending",
    description: "Cut parts move straight to the press brake for final forming.",
  },
  {
    num: "05",
    title: "Quality Check & Dispatch",
    description: "Every batch is checked against spec before it leaves the shop.",
  },
];

// Portfolio categories and items now live in the database (PortfolioCategory /
// PortfolioItem models) and are managed from /admin/portfolio -- see
// prisma/seed.ts for the initial sample data.
