import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AdminSidebar from "@/components/layout/AdminSidebar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Academic Yatra - Admin Panel",
  description: "Management Console for Academic Yatra Blog Articles & Database",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex antialiased font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50/50">
          {children}
        </div>
      </body>
    </html>
  );
}
