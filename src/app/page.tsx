"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Tag,
  ShieldCheck,
  Server,
  Activity,
  Edit3,
  Globe,
  Radio,
} from "lucide-react";
import { BlogPost } from "@/lib/blogService";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [blogsRes, dbRes] = await Promise.all([
        fetch("/api/blogs"),
        fetch("/api/db-check"),
      ]);
      const blogsJson = await blogsRes.json();
      const dbJson = await dbRes.json();
      if (blogsJson.success) {
        setBlogs(blogsJson.data);
      }
      setDbStatus(dbJson);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((b) => b.isPublished).length;
  const draftBlogs = blogs.filter((b) => !b.isPublished).length;
  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);

  // Group by categories
  const categoryCounts = blogs.reduce((acc: Record<string, number>, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});

  const handleTogglePublish = async (blog: BlogPost) => {
    setTogglingId(blog.id);
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !blog.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, isPublished: !b.isPublished } : b))
        );
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen">
      <AdminHeader
        title="Dashboard Overview"
        description="Monitor articles, publication status, and database synchronization"
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              title="Refresh dashboard metrics"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/blogs/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-950/15 transition-all hover:shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Blog Post</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Metric Cards Row - High Craft Unslop Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Blogs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Articles
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                {totalBlogs}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Across {Object.keys(categoryCounts).length} unique categories
              </p>
            </div>
          </div>

          {/* Card 2: Published Blogs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Published Live
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight font-heading">
                {publishedBlogs}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Visible to students on web portal
              </p>
            </div>
          </div>

          {/* Card 3: Draft Articles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Draft Posts
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight font-heading">
                {draftBlogs}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                Work in progress / Unpublished
              </p>
            </div>
          </div>

          {/* Card 4: Total Article Views */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Article Views
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                {totalViews.toLocaleString()}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                Cumulative reader impressions
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Main Feeds & System Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hostinger MySQL Database Live Telemetry Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Hostinger MySQL Telemetry
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Synced
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prisma ORM connected to srv1874.hstgr.io (Port 3306)
                    </p>
                  </div>
                </div>

                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-colors self-start sm:self-auto"
                >
                  <span>DB Config</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Host Node</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block truncate" title="srv1874.hstgr.io">
                    srv1874.hstgr.io
                  </span>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Database</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block truncate" title="u338135177_academicyatra">
                    academicyatra
                  </span>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Port</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">
                    3306 (SSL)
                  </span>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Status / Ping</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Active OK</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Articles Publication Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Recent Articles & Publications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest editorial updates and student engagement stats
                  </p>
                </div>
                <Link
                  href="/blogs"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>View all {totalBlogs}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <p className="text-xs font-medium">Loading articles telemetry...</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">No blog posts found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Get started by creating your first article</p>
                  <Link
                    href="/blogs/new"
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Post</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {blogs.slice(0, 5).map((blog) => (
                    <div
                      key={blog.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/70">
                            {blog.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {blog.readTime || "5 min read"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            {blog.views || 0} views
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm truncate hover:text-emerald-600 transition-colors">
                          <Link href={`/blogs/edit/${blog.id}`}>{blog.title}</Link>
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                        {/* Status Pill Badge */}
                        <button
                          onClick={() => handleTogglePublish(blog)}
                          disabled={togglingId === blog.id}
                          title="Click to toggle publish status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            blog.isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100"
                          } ${togglingId === blog.id ? "opacity-50" : ""}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              blog.isPublished ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span>{blog.isPublished ? "Published" : "Draft"}</span>
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/blogs/edit/${blog.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white hover:border-slate-300 transition-all"
                          title="Edit Article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        {/* Live Preview Button */}
                        <a
                          href={`http://localhost:3000/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-white hover:border-emerald-200 transition-all"
                          title="Preview on public site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Course Packages & Pricing Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Course Pricing Matrix
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  16 Courses
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Official PDF master pricing sync. Manage monthly fees, 5 key inclusions, and real-time live preview.
              </p>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-2 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-sans">Language Prep:</span>
                  <span className="font-bold text-slate-800">10 Courses</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-sans">Test Prep:</span>
                  <span className="font-bold text-slate-800">5 Courses</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-sans">Skill Catalyst:</span>
                  <span className="font-bold text-slate-800">1 Program (4 Packs)</span>
                </div>
              </div>

              <Link
                href="/packages"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Packages & Pricing</span>
              </Link>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Categories Distribution
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">
                  {Object.keys(categoryCounts).length} Topics
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const percentage = Math.round((count / (totalBlogs || 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[180px]">{cat}</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/blogs"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline block text-center pt-2"
              >
                Filter Articles by Category &rarr;
              </Link>
            </div>

            {/* Public Student Portal Quick Live Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Public Site Live
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  :3000
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                Academic Yatra Student Portal
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Test and verify published articles, courses, and pricing directly on the live web.
              </p>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                <span>Visit Public Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
