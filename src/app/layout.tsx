import type { Metadata } from "next";
import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { OrganizationSchema, LocalBusinessSchema } from "@/components/seo/Schema";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans", weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://petvinfebtech.com"),
  title: {
    default: "Petvin Febtech | Laser Cutting & CNC Bending in Ahmedabad",
    template: "%s | Petvin Febtech",
  },
  description:
    "Petvin Febtech provides precision fiber laser cutting, CNC bending and custom sheet metal fabrication in Ahmedabad for MS, SS, and aluminium. Prototype to bulk production.",
  keywords: [
    "laser cutting ahmedabad",
    "fiber laser cutting",
    "CNC bending ahmedabad",
    "sheet metal fabrication",
    "custom metal enclosures",
    "industrial brackets manufacturing",
    "press brake bending Gujarat",
    "metal laser job work ahmedabad",
  ],
  authors: [{ name: "Petvin Febtech", url: "https://petvinfebtech.com" }],
  creator: "Petvin Febtech",
  publisher: "Petvin Febtech",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://petvinfebtech.com",
  },
  openGraph: {
    title: "Petvin Febtech | Laser Cutting & Sheet Metal Fabrication in Ahmedabad",
    description:
      "Precision 3kW fiber laser cutting, 160T CNC bending and custom sheet metal fabrication in Ahmedabad for MS, SS and aluminium.",
    url: "https://petvinfebtech.com",
    siteName: "Petvin Febtech",
    images: [
      {
        url: "/images/hero_laser_cutting.jpg",
        width: 1200,
        height: 630,
        alt: "Petvin Febtech Precision Laser Cutting & CNC Bending",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petvin Febtech | Precision Laser Cutting & CNC Bending",
    description:
      "Precision 3kW fiber laser cutting, 160T CNC bending and custom sheet metal fabrication in Ahmedabad.",
    images: ["/images/hero_laser_cutting.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <OrganizationSchema />
        <LocalBusinessSchema />
      </head>
      <body className="font-body bg-bg text-ink min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#171A21", color: "#FFFFFF", border: "1px solid #252932" },
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener("wheel",function(e){if(document.activeElement&&document.activeElement.type==="number"){document.activeElement.blur();}},{passive:true});`,
          }}
        />
      </body>
    </html>
  );
}
