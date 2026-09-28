import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { APP_CONFIG } from "@/config/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header />
          <main className="flex-1 bg-slate-950">{children}</main>
        </div>
      </body>
    </html>
  );
}
