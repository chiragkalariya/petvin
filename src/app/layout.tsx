import type { Metadata } from "next";
import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans", weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://petvinfebtech.com"),
  title: {
    default: "Petvin Febtech | Laser Cutting & Sheet Metal Fabrication in Ahmedabad",
    template: "%s | Petvin Febtech",
  },
  description:
    "Petvin Febtech provides precision fiber laser cutting, CNC bending and custom sheet metal fabrication in Ahmedabad for MS, SS and aluminium. Prototype to bulk production.",
  openGraph: {
    title: "Petvin Febtech | Laser Cutting & Sheet Metal Fabrication in Ahmedabad",
    description:
      "Precision fiber laser cutting, CNC bending and custom sheet metal fabrication in Ahmedabad for MS, SS and aluminium.",
    url: "https://petvinfebtech.com",
    siteName: "Petvin Febtech",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petvin Febtech | Laser Cutting & Sheet Metal Fabrication",
    description:
      "Precision fiber laser cutting, CNC bending and custom sheet metal fabrication in Ahmedabad for MS, SS and aluminium.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-body">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#22262B", color: "#EDEEF0", border: "1px solid #383D44" },
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
