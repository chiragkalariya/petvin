import type { Metadata } from "next";
import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans", weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Petvin Febtech — Precision Laser Cutting & CNC Bending",
  description:
    "Petvin Febtech provides precision laser cutting and CNC press brake bending for automotive, furniture, electrical enclosure, and signage industries.",
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
      </body>
    </html>
  );
}
