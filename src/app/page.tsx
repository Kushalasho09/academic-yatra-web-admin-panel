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
} from "lucide-react";
import { BlogPost } from "@/lib/blogService";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const fetchDashboardData = async () => {
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
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Dashboard Overview"
        description="Monitor articles, publication status, and database synchronization"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              title="Refresh dashboard metrics"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/blogs/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-950/10 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Write Blog Post</span>
            </Link>
          </div>
        }
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Blogs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Articles
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalBlogs}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Across {Object.keys(categoryCounts).length} unique categories
              </p>
            </div>
          </div>

          {/* Card 2: Published Blogs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Published Live
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-blue-600 tracking-tight">
                {publishedBlogs}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on academicyatra.com
              </p>
            </div>
          </div>

          {/* Card 3: Drafts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Drafts in Review
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {draftBlogs}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {draftBlogs === 0 ? "All posts published" : "Ready to be finalized"}
              </p>
            </div>
          </div>

          {/* Card 4: Total Views */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Reader Views
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Eye className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalViews.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Organic student readers
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: (Left: Recent Articles List) | (Right: DB Hub & Categories) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Recent Articles (2 Cols wide) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  Recent Articles
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Articles authored and scheduled for public reading
                </p>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>View all articles</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {loading ? (
                <div className="p-10 text-center text-slate-400 text-xs">
                  Loading articles...
                </div>
              ) : blogs.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No blog articles created yet.</p>
                  <Link
                    href="/blogs/new"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Write First Article
                  </Link>
                </div>
              ) : (
                blogs.slice(0, 5).map((blog) => (
                  <div
                    key={blog.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {blog.coverImage ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {blog.category}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {blog.readTime || "5 min read"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm hover:text-emerald-600 transition-colors truncate">
                          {blog.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          By {blog.author} &bull; {blog.views} views
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        title="Click to toggle publish status"
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          blog.isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {blog.isPublished ? "Live" : "Draft"}
                      </button>

                      <Link
                        href={`/blogs/edit/${blog.id}`}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                      >
                        Edit
                      </Link>

                      <a
                        href={`http://localhost:3000/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview on live site"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-center">
              <Link
                href="/blogs"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5"
              >
                <span>Manage all {totalBlogs} articles & filter by categories</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: DB Health Hub & Category Breakdown */}
          <div className="space-y-6">
            {/* Database Health Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      dbStatus?.connected
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <Database className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Database Engine
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      MySQL & Prisma ORM
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dbStatus?.connected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {dbStatus?.connected ? "Connected" : "Setup Required"}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-2">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Database Host:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {dbStatus?.config?.host || "localhost"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Database Name:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {dbStatus?.config?.database || "academic_yatra_db"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Active Fallback:</span>
                  <span className="font-semibold text-emerald-700">
                    Local JSON Store (Safe)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/settings"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Configure Hostinger MySQL</span>
                </Link>
                <p className="text-[11px] text-slate-400 text-center leading-tight">
                  Zero downtime. Articles work with or without active MySQL.
                </p>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Categories Distribution
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {Object.keys(categoryCounts).length} Topics
                </span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const percentage = Math.round((count / (totalBlogs || 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{cat}</span>
                        <span className="text-slate-400 font-mono">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/blogs"
                className="text-xs font-semibold text-emerald-600 hover:underline block text-center pt-2"
              >
                Filter Articles by Category &rarr;
              </Link>
            </div>

            {/* Quick Live Preview Banner */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Public Site Live
                </span>
                <span className="text-[10px] font-mono text-emerald-300">
                  :3000
                </span>
              </div>
              <h4 className="font-bold text-sm">
                Academic Yatra Student Portal
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test and verify how students view published articles on the frontend.
              </p>
              <a
                href="http://localhost:3000/blogs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
              >
                <span>Open Blog Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
