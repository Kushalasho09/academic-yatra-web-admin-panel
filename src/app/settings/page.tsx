"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  Database,
  CheckCircle2,
  Copy,
  Server,
  Key,
  ShieldAlert,
  Terminal,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileCode,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom connection string generator state
  const [hostInput, setHostInput] = useState("srv123.hstgr.io");
  const [portInput, setPortInput] = useState("3306");
  const [userInput, setUserInput] = useState("u123456789_admin");
  const [passInput, setPassInput] = useState("YourStrongPassword123");
  const [dbNameInput, setDbNameInput] = useState("u123456789_academic_db");
  const [showPassword, setShowPassword] = useState(false);

  const generatedUrl = `DATABASE_URL="mysql://${encodeURIComponent(
    userInput
  )}:${encodeURIComponent(passInput)}@${hostInput}:${portInput}/${dbNameInput}"`;

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/db-check");
      const data = await res.json();
      setDbData(data);
    } catch (e) {
      console.error("DB check failed:", e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchema = `-- Academic Yatra MySQL Schema
CREATE TABLE IF NOT EXISTS \`Blog\` (
  \`id\` VARCHAR(191) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`excerpt\` TEXT NULL,
  \`content\` LONGTEXT NOT NULL,
  \`coverImage\` VARCHAR(1000) NULL,
  \`author\` VARCHAR(100) NOT NULL DEFAULT 'Academic Yatra Team',
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'Study Abroad',
  \`tags\` VARCHAR(255) NULL,
  \`readTime\` VARCHAR(50) NULL DEFAULT '5 min read',
  \`isPublished\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`views\` INT NOT NULL DEFAULT 0,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`Blog_slug_key\` (\`slug\`),
  KEY \`Blog_category_idx\` (\`category\`),
  KEY \`Blog_isPublished_idx\` (\`isPublished\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`AdminUser\` (
  \`id\` VARCHAR(191) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`passwordHash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`AdminUser_email_key\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Database & Hostinger System Settings"
        description="Verify real-time database connectivity and configure your free Hostinger MySQL connection"
        action={
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`}
            />
            <span>{isChecking ? "Testing Connection..." : "Test Connection"}</span>
          </button>
        }
      />

      <main className="p-8 max-w-6xl mx-auto w-full space-y-8 flex-1">
        {/* Section 1: Live Status & Diagnostics Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  dbData?.connected
                    ? "bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50"
                    : "bg-amber-50 text-amber-600 ring-4 ring-amber-50"
                }`}
              >
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">
                    MySQL Connection Status
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      dbData?.connected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {dbData?.connected ? "Connected & Synced" : "Action Required / Offline"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prisma ORM Client &bull; Driver: mysql2
                  {dbData?.latencyMs ? ` &bull; Ping Latency: ${dbData.latencyMs}ms` : ""}
                </p>
              </div>
            </div>

            <div>
              <button
                onClick={checkConnection}
                disabled={isChecking}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`}
                />
                <span>Test MySQL Connection Now</span>
              </button>
            </div>
          </div>

          {/* Current Config Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Database Host
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 truncate block mt-0.5">
                {dbData?.config?.host || "localhost"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Port
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                {dbData?.config?.port || "3306"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Database Name
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 truncate block mt-0.5">
                {dbData?.config?.database || "academic_yatra_db"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Storage Fallback
              </span>
              <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                JSON File (Zero Downtime)
              </span>
            </div>
          </div>

          {/* If Disconnected Diagnostic Box */}
          {!dbData?.connected && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>MySQL server is currently unreachable with the current .env settings</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Your admin panel is operating in <strong>Safe Fallback Mode</strong> using the local JSON data store. All articles you write, edit, publish, and delete are saved safely. To connect your live Hostinger MySQL database, follow the 4-step setup guide below.
              </p>
              {dbData?.error && (
                <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200 font-mono text-[11px] text-amber-900 overflow-x-auto">
                  {dbData.error.trim()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Step-by-Step Hostinger Connection Guide */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                How to Connect Hostinger MySQL Database (Step-by-Step Guide)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hostinger provides free MySQL databases with all web hosting plans. Follow these steps to connect:
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="p-4.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="font-bold text-xs text-slate-900">
                  Create MySQL Database in Hostinger hPanel
                </h4>
              </div>
              <div className="pl-8 text-xs text-slate-600 space-y-1 leading-relaxed">
                <p>
                  1. Log in to your Hostinger Account &rarr; Click <strong>Websites</strong> &rarr; Click <strong>Manage</strong> next to your domain.
                </p>
                <p>
                  2. In the left menu, go to <strong>Databases &rarr; Management</strong>.
                </p>
                <p>
                  3. Under <strong>Create a New MySQL Database and Database User</strong>:
                </p>
                <ul className="list-disc pl-5 text-[11px] text-slate-500 space-y-0.5">
                  <li>Enter <strong>Database name</strong> (e.g., <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">academic_db</code>)</li>
                  <li>Enter <strong>Username</strong> (e.g., <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">academic_user</code>)</li>
                  <li>Enter a strong <strong>Password</strong> (save this password!)</li>
                </ul>
                <p className="pt-1">
                  4. Click <strong>Create</strong>. Hostinger will create the database.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>Enable "Remote MySQL" in Hostinger (Crucial Step!)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Important
                  </span>
                </h4>
              </div>
              <div className="pl-8 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  By default, Hostinger blocks outside computers from connecting to its MySQL database. To allow connections:
                </p>
                <p>
                  1. In Hostinger hPanel left menu, click <strong>Databases &rarr; Remote MySQL</strong>.
                </p>
                <p>
                  2. Under <strong>IP (IPv4 or IPv6)</strong>, enter: <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">%</code> (the percent symbol allows connections from any IP).
                </p>
                <p>
                  3. In the <strong>Database</strong> dropdown, select your newly created database.
                </p>
                <p>
                  4. Click <strong>Create</strong>. Note the <strong>Host/IP</strong> Hostinger displays on this page (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">srv123.hstgr.io</code> or your server IP).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h4 className="font-bold text-xs text-slate-900">
                  Update your `.env` File
                </h4>
              </div>
              <div className="pl-8 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Open the <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-800">.env</code> file in this admin panel directory:
                </p>
                <div className="p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] flex items-center justify-between">
                  <span>/Volumes/SSD/kushal_flutter/academic-yatra/academic-yatra-web-admin-panel/.env</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Use the Interactive Generator below to generate your exact connection string!
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <h4 className="font-bold text-xs text-slate-900">
                  Create Tables (Import SQL into phpMyAdmin)
                </h4>
              </div>
              <div className="pl-8 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  In Hostinger hPanel &rarr; Click <strong>Enter phpMyAdmin</strong> next to your database &rarr; Click the <strong>SQL</strong> tab &rarr; Paste the schema from the box below and click <strong>Go</strong>!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Interactive Connection String Builder */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Interactive `.env` String Generator
              </h3>
              <p className="text-xs text-slate-500">
                Fill in your Hostinger credentials to generate your ready-to-paste DATABASE_URL
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Host / Server IP</label>
              <input
                type="text"
                value={hostInput}
                onChange={(e) => setHostInput(e.target.value)}
                placeholder="srv123.hstgr.io or 195.35.x.x"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Database Name</label>
              <input
                type="text"
                value={dbNameInput}
                onChange={(e) => setDbNameInput(e.target.value)}
                placeholder="u123456789_academic_db"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Database Username</label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="u123456789_admin"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-bold text-slate-700">Database Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Password from Hostinger"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Port (Default 3306)</label>
              <input
                type="text"
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
                placeholder="3306"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Generated Result Box */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Generated Line to Paste into `.env`:
            </span>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
              <span className="truncate pr-3">{generatedUrl}</span>
              <button
                onClick={() => copyText(generatedUrl, "env")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-sans font-semibold shrink-0 transition-colors"
              >
                {copiedKey === "env" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy String</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: SQL Schema Script Viewer with 1-Click Copy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4.5 h-4.5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  MySQL Database Schema SQL
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to copy and paste into phpMyAdmin SQL console
                </p>
              </div>
            </div>

            <button
              onClick={() => copyText(sqlSchema, "sql")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              {copiedKey === "sql" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Schema!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
            {sqlSchema}
          </pre>
        </div>

        {/* Section 5: Terminal Commands Reference */}
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl shadow-sm space-y-4 border border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Developer Terminal Reference</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">
                Admin Panel Dev
              </span>
              <span className="text-emerald-400">npm run dev</span>
              <span className="text-slate-400 block text-[10px] font-sans mt-0.5">
                Port 3001
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">
                Push Prisma to MySQL
              </span>
              <span className="text-emerald-400">npx prisma db push</span>
              <span className="text-slate-400 block text-[10px] font-sans mt-0.5">
                Syncs schema directly
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">
                Open Prisma Studio
              </span>
              <span className="text-emerald-400">npx prisma studio</span>
              <span className="text-slate-400 block text-[10px] font-sans mt-0.5">
                Visual DB browser
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
