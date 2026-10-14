"use client";

import React from "react";
import { Monitor, Smartphone, ShieldAlert, ExternalLink } from "lucide-react";

export default function MobileGuard() {
  return (
    <div className="lg:hidden fixed inset-0 z-[99999] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
      <div className="max-w-md w-full my-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Academic Yatra Admin</span>
        </div>

        {/* Visual Graphic */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex items-center justify-center">
            <Monitor className="w-10 h-10 text-emerald-400" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-white font-heading">
            Admin Panel Cannot Be Viewed on Mobile
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            You must need to use a PC or Laptop to access this workspace.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Managing articles, rich text formatting, and database controls require a desktop screen for full security and productivity.
          </p>
        </div>

        {/* Requirements Card */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left space-y-2.5 text-xs text-slate-400 shadow-inner">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Supported Devices</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-400">
            <li>Desktop Computer, Laptop, or Mac</li>
            <li>Minimum screen resolution: <strong>1024px width</strong></li>
          </ul>
        </div>

        {/* Action Button to Public Website */}
        <div className="pt-2">
          <a
            href="http://localhost:3000"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40"
          >
            <span>Go to Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-[10px] text-slate-500">
          &copy; {new Date().getFullYear()} Academic Yatra &bull; Admin Security Guard
        </p>
      </div>
    </div>
  );
}
