"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import RichTextEditor from "@/components/editor/RichTextEditor";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Clock,
  Tag,
  AlertCircle,
  FileText,
  ExternalLink,
  UploadCloud,
  Loader2,
  Trash2,
} from "lucide-react";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Study Abroad");
  const [author, setAuthor] = useState("Academic Yatra Team");
  const [tags, setTags] = useState("");
  const [readTime, setReadTime] = useState("5 min read");
  const [isPublished, setIsPublished] = useState(true);
  const [views, setViews] = useState(0);

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/blogs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const b = data.data;
          setTitle(b.title || "");
          setSlug(b.slug || "");
          setExcerpt(b.excerpt || "");
          setContent(b.content || "");
          setCoverImage(b.coverImage || "");
          setCategory(b.category || "Study Abroad");
          setAuthor(b.author || "Academic Yatra Team");
          setTags(b.tags || "");
          setReadTime(b.readTime || "5 min read");
          setIsPublished(b.isPublished ?? true);
          setViews(b.views || 0);
        } else {
          setErrorMsg("Blog post not found.");
        }
      })
      .catch((e) => setErrorMsg("Failed to load blog data"))
      .finally(() => setLoading(false));
  }, [id]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Please fill in both title and content.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          coverImage: coverImage.trim() || null,
          category,
          author: author.trim(),
          tags: tags.trim() || null,
          readTime: readTime.trim(),
          isPublished,
          views,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update article");
      }

      setSuccessMsg(true);
      setTimeout(() => {
        router.push("/blogs");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Error updating article");
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Edit Blog Article" />
        <div className="p-16 text-center text-slate-400 text-xs">
          Loading article data...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        sticky={false}
        title="Edit Blog Article"
        description={`Updating "${title}" (ID: ${id})`}
        action={
          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:3000/blogs/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live</span>
            </a>
            <Link
              href="/blogs"
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>
        }
      />

      <main className="p-8 max-w-6xl mx-auto w-full flex-1">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Article updated successfully! Redirecting to blogs list...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  URL Slug
                </label>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400">/blogs/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none text-emerald-700 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Short Excerpt / SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Body editor */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Article Body *
                  </label>

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
                    placeholder="Edit your article body here... Use H1, H2, H3 buttons, insert tables with university fees, and format links seamlessly."
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

          {/* Right Column (Sticky so action buttons are always reachable) */}
          <div className="space-y-6 lg:sticky lg:top-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 text-sm">
                Publish Status & Actions
              </h3>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isPublished ? "Article is Published" : "Article is Draft"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {isPublished ? "Live for students on web" : "Hidden until published"}
                  </span>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Article Details
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Study Abroad">Study Abroad</option>
                  <option value="Test Prep">Test Prep</option>
                  <option value="Languages">Languages</option>
                  <option value="Skill Catalyst">Skill Catalyst</option>
                  <option value="Visa & Admissions">Visa & Admissions</option>
                  <option value="Career Guidance">Career Guidance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Views
                </label>
                <input
                  type="number"
                  value={views}
                  onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

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
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {coverImage && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                    <img
                      src={coverImage}
                      alt="Cover"
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
