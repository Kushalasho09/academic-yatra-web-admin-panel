"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  sticky?: boolean;
}

export default function AdminHeader({
  title,
  description,
  action,
  sticky = true,
}: AdminHeaderProps) {
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    loading: boolean;
  }>({
    connected: false,
    loading: true,
  });

  useEffect(() => {
    fetch("/api/db-check")
      .then((r) => r.json())
      .then((d) => setDbStatus({ connected: !!d.connected, loading: false }))
      .catch(() => setDbStatus({ connected: false, loading: false }));
  }, []);

  return (
    <header className={`bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-8 py-4 transition-all ${sticky ? "sticky top-0 z-20" : "relative z-10"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {action}

          {/* Database indicator pill */}
          <Link
            href="/settings"
            title="Click to view database settings"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              dbStatus.loading
                ? "bg-slate-50 border-slate-200 text-slate-500"
                : dbStatus.connected
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70"
                : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/70"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus.loading
                  ? "bg-slate-400"
                  : dbStatus.connected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <Database
              className={`w-3.5 h-3.5 ${
                dbStatus.connected ? "text-emerald-600" : "text-amber-600"
              }`}
            />
            <span>
              {dbStatus.loading
                ? "Checking DB..."
                : dbStatus.connected
                ? "MySQL Connected"
                : "DB Offline (Local Store)"}
            </span>
          </Link>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-emerald-500/20">
              AY
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">
                Academic Yatra
              </span>
              <span className="text-[10px] text-slate-500 block">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
