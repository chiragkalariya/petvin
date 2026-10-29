import { Metadata } from "next";
import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager";

export const metadata: Metadata = {
  title: "Site & Print Settings | Admin Dashboard",
  description: "Configure dynamic company details, bank accounts, GST/PAN numbers, and invoice defaults.",
};

export default function SettingsPage() {
  return <SiteSettingsManager />;
}
