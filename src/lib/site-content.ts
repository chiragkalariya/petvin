export const SITE = {
  name: "Petvin Febtech",
  tagline: "Precision Laser Cutting & CNC Bending",
  phone: "+91 9624889080",
  email: "petvinfebtech@gmail",
  address: "239, Vivekanand Industrial Park, Kubadthal Road, opp. Arya Industrial Estate, Kubadthal, Ahmedabad, Gujarat 382433",
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About Us" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#industries", label: "Industries" },
  { href: "/our-work", label: "Our Work" },
  { href: "/#process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export const MACHINE_SPECS = [
  { label: "Fiber Laser Cutter", value: "3 kW" },
  { label: "CNC Press Brake", value: "160 Ton" },
  { label: "Materials", value: "MS / SS / AL" },
  { label: "Turnaround", value: "Prototype → Bulk" },
];

export const CAPABILITIES = [
  {
    num: "01",
    title: "Laser Cutting",
    description: "High precision 3kW fiber laser cutting for MS, SS, Aluminium & more.",
    image: "/images/cap_laser_cutting.jpg",
    link: "/laser-cutting",
  },
  {
    num: "02",
    title: "CNC Bending",
    description: "160 Ton CNC press brake for accurate & consistent bending.",
    image: "/images/cap_cnc_bending.jpg",
    link: "/cnc-bending",
  },
  {
    num: "03",
    title: "Custom Fabrication",
    description: "End-to-end fabrication solutions tailored to your requirements.",
    image: "/images/cap_custom_fabrication.jpg",
    link: "/custom-metal-fabrication",
  },
  {
    num: "04",
    title: "Prototype to Bulk",
    description: "From prototype to high volume production — we deliver excellence.",
    image: "/images/cap_prototype_bulk.jpg",
    link: "/sheet-metal-fabrication",
  },
];

export const ABOUT_PILLARS = [
  {
    title: "Precision",
    desc: "High accuracy in every detail",
    icon: "Target",
  },
  {
    title: "Quality",
    desc: "Strict quality control at every stage",
    icon: "ShieldCheck",
  },
  {
    title: "Speed",
    desc: "On-time delivery, every time",
    icon: "Gauge",
  },
  {
    title: "Reliability",
    desc: "Trusted by industries across India",
    icon: "Award",
  },
];

export const PROCESS_STEPS = [
  {
    num: "01",
    title: "Inquiry",
    description: "Send us your drawing or requirements",
    icon: "MessageSquare",
  },
  {
    num: "02",
    title: "Quote",
    description: "We review & provide the best quote",
    icon: "FileSpreadsheet",
  },
  {
    num: "03",
    title: "Laser Cutting",
    description: "Precision cutting with advanced fiber laser",
    icon: "Zap",
  },
  {
    num: "04",
    title: "CNC Bending",
    description: "Accurate bending with CNC press brake",
    icon: "Layers",
  },
  {
    num: "05",
    title: "Quality Check",
    description: "Strict quality inspection for perfect output",
    icon: "ShieldCheck",
  },
  {
    num: "06",
    title: "Dispatch",
    description: "Safe packaging & on-time delivery",
    icon: "Truck",
  },
];

export const MACHINES = [
  {
    id: "laser",
    title: "3 KW FIBER LASER CUTTER",
    image: "/images/machine_fiber_laser.jpg",
    specs: [
      { label: "Power", value: "3 KW Power" },
      { label: "Material", value: "MS / SS / AL" },
      { label: "Capacity", value: "Up to 16mm" },
    ],
  },
  {
    id: "press-brake",
    title: "160 TON CNC PRESS BRAKE",
    image: "/images/machine_press_brake.jpg",
    specs: [
      { label: "Tonnage", value: "160 Ton" },
      { label: "Length", value: "2500mm" },
      { label: "Precision", value: "High Accuracy" },
    ],
  },
];

export const INDUSTRIES = [
  { name: "Automotive", icon: "CarFront" },
  { name: "Furniture & Interiors", icon: "Armchair" },
  { name: "Electrical Enclosures", icon: "Cpu" },
  { name: "HVAC", icon: "Wind" },
  { name: "Architecture & Railings", icon: "Building2" },
  { name: "Signage & Display", icon: "MonitorPlay" },
];

// Portfolio categories and items now live in the database (PortfolioCategory /
// PortfolioItem models) and are managed from /admin/portfolio -- see
// prisma/seed.ts for the initial sample data.
