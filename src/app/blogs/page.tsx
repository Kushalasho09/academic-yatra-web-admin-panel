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
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Blog Articles Management"
        description="Publish, organize, filter, and schedule articles for students and learners"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBlogs}
              title="Refresh list"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/blogs/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Blog</span>
            </Link>
          </div>
        }
      />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Top Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Blogs
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {totalCount}
              </h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Published Live
              </span>
              <h4 className="text-xl font-extrabold text-emerald-600 mt-0.5">
                {publishedCount}
              </h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Drafts in Review
              </span>
              <h4 className="text-xl font-extrabold text-amber-600 mt-0.5">
                {draftCount}
              </h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Views
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {totalViews.toLocaleString()}
              </h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Filter & Controls Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, topic, author, tags, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 hover:bg-white transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === "ALL"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setSelectedStatus("PUBLISHED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === "PUBLISHED"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                onClick={() => setSelectedStatus("DRAFT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === "DRAFT"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>

            {/* Layout switch & Sort */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="views">Most Views</option>
                <option value="title">Title (A-Z)</option>
              </select>

              <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode("table")}
                  title="Table view"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Topic:
            </span>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content: Table or Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center text-slate-400 text-xs shadow-sm">
            Loading articles...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">
              No matching articles found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No blogs match your search or category filter. Try clearing filters or create a new blog post.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                  setSelectedStatus("ALL");
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors mr-2"
              >
                Clear Filters
              </button>
              <Link
                href="/blogs/new"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                Write New Blog
              </Link>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Article & Topic</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">Read Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Reader Views</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {filteredBlogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Title & Cover & Slug */}
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-start gap-3">
                          {/* Clickable Thumbnail to Edit */}
                          <Link
                            href={`/blogs/edit/${blog.id}`}
                            title="Click to edit article"
                            className="shrink-0 group"
                          >
                            {blog.coverImage ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group-hover:ring-2 group-hover:ring-emerald-500/40 transition-all">
                                <img
                                  src={blog.coverImage}
                                  alt={blog.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:ring-2 group-hover:ring-emerald-500/40 transition-all">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </Link>

                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-block">
                              {blog.category}
                            </span>
                            <Link
                              href={`/blogs/edit/${blog.id}`}
                              title="Click to edit article"
                              className="font-semibold text-slate-900 text-sm hover:text-emerald-600 transition-colors line-clamp-1 block"
                            >
                              {blog.title}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                              <span className="truncate">/{blog.slug}</span>
                              <button
                                onClick={() => copySlug(blog.slug)}
                                title="Copy public link"
                                className="text-slate-400 hover:text-slate-600 transition-colors"
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
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {blog.author}
                      </td>

                      {/* Read Time */}
                      <td className="py-4 px-4 text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{blog.readTime || "5 min read"}</span>
                        </span>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePublish(blog.id, blog.isPublished)}
                          title="Click to toggle publish status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                            blog.isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {blog.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 text-center font-bold text-slate-800">
                        {blog.views.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <a
                          href={`http://localhost:3000/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Preview on live site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-block transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/blogs/edit/${blog.id}`}
                          title="Edit article"
                          className="px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(blog)}
                          title="Delete article"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 inline-block transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
              >
                {/* Cover Image */}
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 shadow-sm backdrop-blur-sm uppercase tracking-wider">
                      {blog.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleTogglePublish(blog.id, blog.isPublished)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-sm transition-all ${
                        blog.isPublished
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800/90 text-slate-200"
                      }`}
                    >
                      {blog.isPublished ? "Live" : "Draft"}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blog.readTime || "5 min read"}
                      </span>
                      <span>&bull;</span>
                      <span>By {blog.author}</span>
                    </div>

                    <Link
                      href={`/blogs/edit/${blog.id}`}
                      title="Click to edit article"
                      className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors line-clamp-2 block"
                    >
                      {blog.title}
                    </Link>

                    {blog.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {blog.views} reads
                    </span>

                    <div className="flex items-center gap-1">
                      <a
                        href={`http://localhost:3000/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View Live"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/blogs/edit/${blog.id}`}
                        title="Edit Article"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(blog)}
                        title="Delete Article"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
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
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
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
