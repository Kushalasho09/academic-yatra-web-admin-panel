"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import RichTextEditor from "@/components/editor/RichTextEditor";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Eye,
  Clock,
  Tag,
  AlertCircle,
  FileText,
  UploadCloud,
  Loader2,
  Trash2,
} from "lucide-react";

const SAMPLE_COVERS = [
  {
    name: "Germany Campus",
    url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Students Studying",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Tech & Coding",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Paris / Europe",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80",
  },
];

export default function CreateBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Study Abroad");
  const [author, setAuthor] = useState("Academic Yatra Editorial");
  const [tags, setTags] = useState("");
  const [readTime, setReadTime] = useState("5 min read");
  const [isPublished, setIsPublished] = useState(true);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCoverUploadError("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCoverUploadError("Cover image cannot exceed 10MB limit.");
      return;
    }

    setIsUploadingCover(true);
    setCoverUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      setCoverImage(data.url);
    } catch (err: any) {
      // Automatic client-side fallback
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Url = reader.result as string;
          if (base64Url) {
            setCoverImage(base64Url);
          }
        };
        reader.onerror = () => {
          setCoverUploadError(err.message || "Failed to upload image");
        };
        reader.readAsDataURL(file);
      } catch {
        setCoverUploadError(err.message || "Failed to upload image");
      }
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  // Auto generate slug from title unless manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter an article title.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please write the article content.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          coverImage: coverImage.trim() || null,
          category,
          author: author.trim() || "Academic Yatra Team",
          tags: tags.trim() || null,
          readTime: readTime.trim() || "5 min read",
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create blog article");
      }

      router.push("/blogs");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save blog post. Please check the fields.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        sticky={false}
        title="Write New Blog Article"
        description="Craft SEO-rich content that immediately synchronizes to the Academic Yatra portal"
        action={
          <Link
            href="/blogs"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
        }
      />

      <main className="p-8 max-w-6xl mx-auto w-full flex-1">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column: Content Editor (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Guide to German Student Visa 2026"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlugManual(!slugManual)}
                    className="text-[10px] text-emerald-600 hover:underline font-medium"
                  >
                    {slugManual ? "Reset Auto-Slug" : "Customize Slug"}
                  </button>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400">/blogs/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManual(true);
                    }}
                    placeholder="article-url-slug"
                    className="bg-transparent flex-1 focus:outline-none text-emerald-700 font-semibold"
                  />
                </div>
              </div>

              {/* Short Excerpt */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Short Excerpt / SEO Meta Description
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {excerpt.length}/200 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={220}
                  placeholder="A concise 1-2 sentence summary for Google search results and blog listing cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Content Editor with Write / Preview Tabs */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Article Body *
                  </label>

                  {/* Write vs Preview Toggle */}
                  <div className="flex items-center p-0.5 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "write"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        activeTab === "preview"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                </div>

                {activeTab === "write" ? (
                  <RichTextEditor
                    value={content}
                    onChange={(html) => setContent(html)}
                    placeholder="Write your article body here... Use H1, H2, H3 buttons, insert tables with university fees, and format links seamlessly."
                  />
                ) : (
                  <div className="min-h-[380px] p-6 rounded-2xl border border-slate-200 bg-white blog-rich-content text-sm leading-relaxed overflow-x-auto shadow-2xs">
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <p className="text-slate-400 italic">No content typed yet. Switch back to Write mode to craft your article.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Publishing & Meta Settings (Sticky so action buttons are always reachable) */}
          <div className="space-y-6 lg:sticky lg:top-4">
            {/* Publish Action Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 text-sm">
                Publishing Status
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isPublished ? "Publish Immediately" : "Save as Draft"}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isPublished
                        ? "Visible on academicyatra.com right away"
                        : "Hidden from students until published"}
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/10 transition-all disabled:opacity-50 hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? "Saving Article..."
                      : isPublished
                      ? "Save & Publish Article"
                      : "Save Draft"}
                  </span>
                </button>
              </div>
            </div>

            {/* Category & Read Time & Author Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Article Metadata
              </h3>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Topic / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Study Abroad">Study Abroad</option>
                  <option value="Test Prep">Test Prep (IELTS / TOEFL)</option>
                  <option value="Languages">Languages (German / French)</option>
                  <option value="Skill Catalyst">Skill Catalyst & AI</option>
                  <option value="Visa & Admissions">Visa & Admissions</option>
                  <option value="Career Guidance">Career Guidance</option>
                </select>
              </div>

              {/* Author */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Author Byline
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Academic Yatra Team"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Estimated Read Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" /> Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Germany, IELTS, Visa, Admission"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.split(",").map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Cover Image
                </h3>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              {coverUploadError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{coverUploadError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Upload from Computer CTA */}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-700 text-xs font-semibold cursor-pointer transition-all shadow-2xs">
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Uploading Image...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      <span>Upload from Computer</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingCover}
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>

                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">
                    Or paste link
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {/* Sample Presets */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Or select sample cover:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_COVERS.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => setCoverImage(sample.url)}
                        className="text-[11px] p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-left truncate transition-colors"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview of image */}
                {coverImage && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
