import { AuthProvider } from "@/components/layout/AuthProvider";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
