"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Database,
  ExternalLink,
  ShieldCheck,
  Radio,
  ChevronRight,
  PlusCircle,
  ShoppingBag,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    name: "Blog Articles",
    href: "/blogs",
    icon: FileText,
    badge: "Active",
    description: "Publish & Organize",
  },
  {
    name: "Student Purchases",
    href: "/orders",
    icon: ShoppingBag,
    badge: "Live",
    description: "Orders & Enrolled Students",
  },
  {
    name: "Database Settings",
    href: "/settings",
    icon: Database,
    description: "Hostinger & MySQL",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/db-check")
      .then((res) => res.json())
      .then((data) => {
        setDbConnected(data.connected);
      })
      .catch(() => setDbConnected(false));
  }, []);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 text-slate-300 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/70">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/95 p-1 flex items-center justify-center shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform overflow-hidden">
            <Image
              src="/images/academic_yatra_emblem.png"
              alt="Academic Yatra"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight leading-tight">
                Academic Yatra
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Portal Navigation
        </div>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-emerald-400"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-emerald-700 text-emerald-100"
                      : "bg-slate-800 text-emerald-400 border border-slate-700/60"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Quick Blog Create CTA in Sidebar */}
        <div className="pt-4 px-2">
          <Link
            href="/blogs/new"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-all group shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
            <span>Write New Article</span>
          </Link>
        </div>

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Live Sites
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span>Public Website</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-750">
            :3000
          </span>
        </a>
      </nav>

      {/* Database Status Footer Widget */}
      <div className="p-3.5 border-t border-slate-800/70">
        <Link
          href="/settings"
          className="block p-3 bg-slate-800/50 hover:bg-slate-800/90 rounded-xl border border-slate-750 text-xs transition-colors group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbConnected === true
                    ? "bg-emerald-400 animate-pulse"
                    : dbConnected === false
                    ? "bg-amber-400"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-slate-200 font-semibold text-[11px]">
                {dbConnected === true
                  ? "MySQL Connected"
                  : dbConnected === false
                  ? "Local Store (DB Setup)"
                  : "Checking DB..."}
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {dbConnected === true
              ? "Prisma client synced to Hostinger/local MySQL."
              : "Click to configure Hostinger MySQL connection."}
          </p>
        </Link>
      </div>
    </aside>
  );
}
