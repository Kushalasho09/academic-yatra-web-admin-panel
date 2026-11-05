"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { BlogPost } from "@/lib/blogService";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  X,
  CheckCircle2,
  Tag,
  User,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
} from "lucide-react";

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "views" | "title">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Compute categories dynamically from existing blogs + presets
  const categories = useMemo(() => {
    const defaultCats = ["Study Abroad", "Test Prep", "Languages", "Skill Catalyst", "Visa & Admissions"];
    const found = Array.from(new Set([...defaultCats, ...blogs.map((b) => b.category)]));
    return found;
  }, [blogs]);

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((b) => {
        const matchesSearch =
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.category.toLowerCase().includes(search.toLowerCase()) ||
          (b.tags && b.tags.toLowerCase().includes(search.toLowerCase())) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.slug.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === "ALL" ||
          b.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesStatus =
          selectedStatus === "ALL" ||
          (selectedStatus === "PUBLISHED" && b.isPublished) ||
          (selectedStatus === "DRAFT" && !b.isPublished);

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "views") return (b.views || 0) - (a.views || 0);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [blogs, search, selectedCategory, selectedStatus, sortBy]);

  // Quick toggle publish/draft
  const handleTogglePublish = async (id: string, current: boolean) => {
    // optimistic update
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPublished: !current } : b))
    );

    try {
      await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
    } catch (e) {
      console.error("Failed to toggle publish status:", e);
      // rollback
      fetchBlogs();
    }
  };

  // Confirm delete handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(data.error || "Failed to delete article");
      }
    } catch (e) {
      alert("Error deleting article");
    } finally {
      setIsDeleting(false);
    }
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(`https://academicyatra.com/blogs/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Metrics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = blogs.filter((b) => !b.isPublished).length;
  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen text-slate-900">
      <AdminHeader
        title="Blog Articles Management"
        description="Publish, organize, filter, and schedule articles for students and learners"
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchBlogs}
              disabled={loading}
              title="Refresh articles"
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
              <span>Write New Blog</span>
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
                {totalCount}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Across {categories.length} topics
              </p>
            </div>
          </div>

          {/* Card 2: Published Live */}
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
                {publishedCount}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live on academicyatra.com/blogs
              </p>
            </div>
          </div>

          {/* Card 3: Drafts in Review */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Drafts in Review
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight font-heading">
                {draftCount}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                Unpublished editorial drafts
              </p>
            </div>
          </div>

          {/* Card 4: Total Views */}
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

        {/* Filter and Search Bar Row */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title, topic, author, tags, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 h-10 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Controls: Status, Sort & Layout Switcher - 100% Pixel Aligned */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Status Pills */}
              <div className="h-10 flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ALL")}
                  className={`h-full px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    selectedStatus === "ALL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("PUBLISHED")}
                  className={`h-full px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    selectedStatus === "PUBLISHED"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Published ({publishedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("DRAFT")}
                  className={`h-full px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    selectedStatus === "DRAFT"
                      ? "bg-white text-amber-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Drafts ({draftCount})
                </button>
              </div>

              {/* Sort Dropdown - Exact Aligned */}
              <div className="relative h-10 flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none h-full pl-3 pr-8 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  <option value="newest">Newest First</option>
                  <option value="views">Most Viewed</option>
                  <option value="title">Alphabetical</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Layout Switcher - Exact Aligned */}
              <div className="h-10 flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`h-full px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`h-full px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Topics Category Navigation Pills */}
          <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Topic:</span>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading and Empty States */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs font-medium">Loading published articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-16 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No articles match criteria</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, topic filter, or publish status.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
              }}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW - High Craft Unslop Architecture */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Article &amp; Topic</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">Read Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reader Views</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBlogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Article & Topic */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          {blog.coverImage ? (
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                              <BookOpen className="w-5 h-5 text-slate-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1">
                              {blog.category}
                            </span>
                            <Link
                              href={`/blogs/edit/${blog.id}`}
                              className="font-bold text-slate-900 block hover:text-emerald-600 transition-colors line-clamp-1"
                            >
                              {blog.title}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]" title={blog.slug}>
                                /{blog.slug}
                              </span>
                              <button
                                type="button"
                                onClick={() => copySlug(blog.slug)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                title="Copy public URL"
                              >
                                {copiedSlug === blog.slug ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {blog.author}
                      </td>

                      {/* Read Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{blog.readTime || "5 min read"}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(blog.id, blog.isPublished)}
                          title="Click to toggle publish status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            blog.isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              blog.isPublished ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span>{blog.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Reader Views */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800 font-bold">
                        {blog.views.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`http://localhost:3000/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer"
                            title="Preview on live site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Link
                            href={`/blogs/edit/${blog.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-colors"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(blog)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW - High Craft Unslop Architecture */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Image Cover */}
                <div className="relative h-44 bg-slate-100 w-full overflow-hidden">
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  {/* Top Status & Category Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 shadow-xs border border-white/80 backdrop-blur-xs">
                      {blog.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(blog.id, blog.isPublished)}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border backdrop-blur-xs cursor-pointer ${
                        blog.isPublished
                          ? "bg-emerald-500/95 text-white border-emerald-400"
                          : "bg-slate-900/90 text-white border-slate-800"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${blog.isPublished ? "bg-white" : "bg-amber-400"}`} />
                      <span>{blog.isPublished ? "Live" : "Draft"}</span>
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{blog.readTime || "5 min read"}</span>
                      </span>
                      <span>•</span>
                      <span>By {blog.author}</span>
                    </div>

                    <Link
                      href={`/blogs/edit/${blog.id}`}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors line-clamp-2 block leading-snug"
                    >
                      {blog.title}
                    </Link>

                    {blog.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 font-mono">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{blog.views} views</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <a
                        href={`http://localhost:3000/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/blogs/edit/${blog.id}`}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(blog)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Blog Article?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{deleteTarget.title}"</strong>? This will remove the article from the website and database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
