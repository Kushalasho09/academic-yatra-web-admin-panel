"use client";

import { useState, useEffect, useMemo } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  Tag,
  Search,
  Layers,
  Sparkles,
  Edit3,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Check,
  X,
  CreditCard,
  Clock,
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Eye,
  Sliders,
  Flame,
} from "lucide-react";

export interface InclusionItem {
  text: string;
  included: boolean;
}

export interface AdminPlanItem {
  id: string;
  courseId?: string;
  name: string;
  description?: string;
  price: string;
  numericPrice: number;
  monthlyRate?: string;
  validityText: string;
  badge?: string;
  isFeatured?: boolean;
  theme?: "mint" | "lime" | "lavender";
  features: InclusionItem[];
}

export interface AdminCourse {
  id: string;
  name: string;
  category: "Language Preparation" | "Test Preparation" | "Skill Catalyst";
  description?: string;
  plans: AdminPlanItem[];
}

export default function PackagesPricingPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [packageModal, setPackageModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    courseId: string;
    courseName: string;
    planId?: string;
  }>({
    isOpen: false,
    mode: "add",
    courseId: "",
    courseName: "",
  });

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Package (With Live Preview)
  const [pkgForm, setPkgForm] = useState<{
    name: string;
    subtitle: string;
    price: string;
    numericPrice: number;
    monthlyRate: string;
    validityText: string;
    isPopular: boolean;
    badgeText: string;
    theme: "mint" | "lime" | "lavender";
    features: InclusionItem[];
    newFeatureText: string;
    newFeatureIncluded: boolean;
  }>({
    name: "",
    subtitle: "",
    price: "",
    numericPrice: 0,
    monthlyRate: "",
    validityText: "6 Months Validity",
    isPopular: false,
    badgeText: "POPULAR",
    theme: "mint",
    features: [],
    newFeatureText: "",
    newFeatureIncluded: true,
  });

  // Course Form State
  const [courseForm, setCourseForm] = useState<{
    name: string;
    category: "Language Preparation" | "Test Preparation" | "Skill Catalyst";
    description: string;
  }>({
    name: "",
    category: "Language Preparation",
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch courses from DB
  const fetchCourses = async (reset = false) => {
    try {
      setLoading(true);
      const url = reset ? "/api/packages?reset=true" : "/api/packages";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.courses) {
        // Normalize plans features to InclusionItem[]
        const normalized = data.courses.map((c: any) => ({
          ...c,
          plans: (c.plans || []).map((p: any) => ({
            ...p,
            description: p.description || getSubtitleFallback(p.name),
            isFeatured: Boolean(p.isFeatured || p.badge?.toLowerCase().includes("popular")),
            theme: determineTheme(p.name, p.badge, p.isFeatured),
            features: (p.features || []).slice(0, 5).map((f: any) => {
              if (typeof f === "object" && f.text) {
                return { text: String(f.text), included: f.included !== false };
              }
              const str = String(f);
              const isExcluded = str.toLowerCase().startsWith("no ");
              return { text: str, included: !isExcluded };
            }),
          })),
        }));
        setCourses(normalized);
        if (reset) showToast("Database reset to exact PDF Master Catalog!");
      } else {
        throw new Error(data.error || "Failed to load courses");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error loading course packages: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  function determineTheme(name: string, badge?: string, isFeatured?: boolean): "mint" | "lime" | "lavender" {
    if (isFeatured || badge?.toLowerCase().includes("popular")) return "lime";
    const lower = name.toLowerCase();
    if (lower.includes("champ") && !lower.includes("+")) return "lavender";
    return "mint";
  }

  function getSubtitleFallback(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("self")) return "Self-paced language foundation";
    if (lower.includes("+") || lower.includes("plus")) return "Full master preparation";
    if (lower.includes("champ")) return "Perfect to get started";
    if (lower.includes("live")) return "Interactive instructor coaching";
    return "Comprehensive course training";
  }

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat =
        selectedCategory === "ALL" || c.category === selectedCategory;
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.plans.some(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.price.toLowerCase().includes(search.toLowerCase()) ||
            p.validityText.toLowerCase().includes(search.toLowerCase()) ||
            p.features.some((f) =>
              f.text.toLowerCase().includes(search.toLowerCase())
            )
        );
      return matchCat && matchSearch;
    });
  }, [courses, search, selectedCategory]);

  // Aggregate Stats
  const totalCourses = courses.length;
  const totalPlans = courses.reduce((acc, c) => acc + c.plans.length, 0);
  const allPrices = courses.flatMap((c) => c.plans.map((p) => p.numericPrice));
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  // Open Add Package Modal
  const handleOpenAddPackage = (courseId: string, courseName: string) => {
    setPkgForm({
      name: "",
      subtitle: "Comprehensive course training",
      price: "₹19,999",
      numericPrice: 19999,
      monthlyRate: "₹3,333",
      validityText: "6 Months Validity",
      isPopular: false,
      badgeText: "POPULAR",
      theme: "mint",
      features: [
        { text: "60 Sectional Tests", included: true },
        { text: "15 Mock Tests", included: true },
        { text: "20+ Hours Video Lessons", included: true },
        { text: "500+ Grammar & Vocabulary Lessons", included: true },
        { text: "No Live Lectures", included: false },
      ],
      newFeatureText: "",
      newFeatureIncluded: true,
    });
    setPackageModal({
      isOpen: true,
      mode: "add",
      courseId,
      courseName,
    });
  };

  // Open Edit Package Modal
  const handleOpenEditPackage = (
    courseId: string,
    courseName: string,
    plan: AdminPlanItem
  ) => {
    const isPop = Boolean(plan.isFeatured || plan.badge?.toLowerCase().includes("popular"));
    setPkgForm({
      name: plan.name,
      subtitle: plan.description || getSubtitleFallback(plan.name),
      price: plan.price,
      numericPrice: plan.numericPrice,
      monthlyRate: (plan.monthlyRate || "—").replace(/\/m.*$/gi, "").trim(),
      validityText: plan.validityText || "6 Months Validity",
      isPopular: isPop,
      badgeText: plan.badge || (isPop ? "POPULAR" : ""),
      theme: plan.theme || (isPop ? "lime" : "mint"),
      features: [...plan.features].slice(0, 5),
      newFeatureText: "",
      newFeatureIncluded: true,
    });
    setPackageModal({
      isOpen: true,
      mode: "edit",
      courseId,
      courseName,
      planId: plan.id,
    });
  };

  // Add bullet point (Max 5 items limit)
  const handleAddFeature = () => {
    if (!pkgForm.newFeatureText.trim()) return;
    if (pkgForm.features.length >= 5) {
      alert("Maximum 5 key inclusions allowed so package cards stay clean and balanced.");
      return;
    }
    // Truncate to max 45 chars
    const trimmed = pkgForm.newFeatureText.trim().slice(0, 45);
    setPkgForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        { text: trimmed, included: prev.newFeatureIncluded },
      ],
      newFeatureText: "",
      newFeatureIncluded: true,
    }));
  };

  // Remove bullet point
  const handleRemoveFeature = (index: number) => {
    setPkgForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Toggle included / excluded for an item
  const handleToggleFeatureIncluded = (index: number) => {
    setPkgForm((prev) => {
      const updated = [...prev.features];
      updated[index] = {
        ...updated[index],
        included: !updated[index].included,
      };
      return { ...prev, features: updated };
    });
  };

  // Update text of bullet point
  const handleUpdateFeatureText = (index: number, val: string) => {
    setPkgForm((prev) => {
      const updated = [...prev.features];
      updated[index] = {
        ...updated[index],
        text: val.slice(0, 45), // Enforce 45 chars max
      };
      return { ...prev, features: updated };
    });
  };

  // Submit Package Form
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.name.trim() || !pkgForm.price.trim()) {
      alert("Please provide both Package Name and Total Price.");
      return;
    }

    try {
      setSubmitting(true);
      const isEdit = packageModal.mode === "edit";
      const url = isEdit
        ? `/api/packages/${packageModal.planId}`
        : "/api/packages";
      const method = isEdit ? "PUT" : "POST";

      const cleanNumeric =
        pkgForm.numericPrice ||
        Number(pkgForm.price.replace(/[^0-9.]/g, "")) ||
        0;

      const formattedPrice = pkgForm.price.startsWith("₹")
        ? pkgForm.price
        : `₹${Number(cleanNumeric).toLocaleString("en-IN")}`;

      const formattedMonthly = pkgForm.monthlyRate.trim()
        ? (pkgForm.monthlyRate.includes("/m") ? pkgForm.monthlyRate : `${pkgForm.monthlyRate}/m`)
        : "—";

      const payload = {
        courseId: packageModal.courseId,
        name: pkgForm.name.trim(),
        description: pkgForm.subtitle.trim(),
        price: formattedPrice,
        numericPrice: cleanNumeric,
        monthlyRate: formattedMonthly,
        validityText: pkgForm.validityText.trim() || "—",
        badge: pkgForm.isPopular ? (pkgForm.badgeText.trim() || "POPULAR") : (pkgForm.badgeText.trim() || null),
        isFeatured: pkgForm.isPopular,
        features: pkgForm.features.slice(0, 5),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save package");

      showToast(
        isEdit
          ? `Updated "${pkgForm.name}" successfully!`
          : `Added new package "${pkgForm.name}" to ${packageModal.courseName}!`
      );

      setPackageModal((prev) => ({ ...prev, isOpen: false }));
      await fetchCourses();
    } catch (err: any) {
      console.error(err);
      alert("Error saving package: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Package
  const handleDeletePackage = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete package "${planName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/packages/${planId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast(`Deleted package "${planName}".`);
      await fetchCourses();
    } catch (err: any) {
      console.error(err);
      alert("Error deleting package: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim()) {
      alert("Course name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast(`Created course "${courseForm.name}"!`);
      setCourseModalOpen(false);
      setCourseForm({
        name: "",
        category: "Language Preparation",
        description: "",
      });
      await fetchCourses();
    } catch (err: any) {
      console.error(err);
      alert("Error creating course: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      <AdminHeader
        title="Course Packages & Pricing"
        description="Official Academic Yatra Product & Pricing Guide. Manage pricing tiers, monthly rates, validity, and key inclusions with live website preview."
        action={
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (
                  confirm(
                    "Reset all course packages in the database back to the exact PDF master catalog?"
                  )
                ) {
                  fetchCourses(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Reset all courses & plans to original PDF pricing guide"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="whitespace-nowrap">Reset to PDF Defaults</span>
            </button>
            <button
              onClick={() => setCourseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Add New Course</span>
            </button>
          </div>
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Courses
              </span>
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCourses}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active programs in catalog
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Packages
              </span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalPlans}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Configured package tiers
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Lowest Package
              </span>
              <Tag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{minPrice.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Test Your English (15 Days)
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Highest Package
              </span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{maxPrice.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              French Basic to TEF (16 Months)
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Programs" },
              { id: "Language Preparation", label: "Language Preparation" },
              { id: "Test Preparation", label: "Test Preparation" },
              { id: "Skill Catalyst", label: "Skill Catalyst" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course, pack or inclusions..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">
              Loading course packages from database...
            </p>
            <p className="text-xs text-slate-400">
              Synchronizing with Hostinger MySQL server
            </p>
          </div>
        )}

        {/* COURSES LIST */}
        {!loading && filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No matching courses found
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
              }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading &&
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Course Header Banner */}
              <div className="p-5 md:px-6 md:py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-white tracking-tight">
                        {course.name}
                      </h2>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                        {course.category}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-400">
                        ({course.plans.length}{" "}
                        {course.plans.length === 1 ? "Pack" : "Packs"})
                      </span>
                    </div>
                    {course.description && (
                      <p className="text-xs text-slate-400 mt-0.5 max-w-2xl line-clamp-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddPackage(course.id, course.name)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Package</span>
                </button>
              </div>

              {/* Course Packages Grid matching Website SubscriptionCard style */}
              <div className="p-5 md:p-6 bg-slate-50/40">
                {course.plans.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    <p className="text-xs text-slate-500 font-medium">
                      No packages added for this course yet.
                    </p>
                    <button
                      onClick={() => handleOpenAddPackage(course.id, course.name)}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      + Add the first package
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {course.plans.map((plan) => {
                      const isPopular = Boolean(
                        plan.isFeatured || plan.badge?.toLowerCase().includes("popular")
                      );
                      const boxThemeClass = isPopular
                        ? "bg-[#F8F9E4] border border-lime-200/90"
                        : plan.theme === "lavender"
                        ? "bg-[#F7EEF5] border border-pink-200/80"
                        : "bg-[#F0F9EE] border border-emerald-100/90";

                      const cleanMonthly = (plan.monthlyRate || "—")
                        .replace(/\/m.*$/gi, "")
                        .replace(/^₹/gi, "")
                        .trim();

                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-[28px] p-6 bg-white border flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl text-left ${
                            isPopular
                              ? "border-lime-400 ring-2 ring-lime-300/60 shadow-lime-500/10"
                              : "border-slate-200/90"
                          }`}
                        >
                          {/* Top Floating Badge */}
                          {isPopular && (
                            <div className="absolute -top-3 right-5 z-10">
                              <span className="inline-block bg-[#D4F938] text-slate-950 text-[11px] font-black px-3.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider select-none">
                                {plan.badge || "POPULAR"}
                              </span>
                            </div>
                          )}

                          <div>
                            {/* Card Header & Controls */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-xl text-slate-900 tracking-tight leading-snug">
                                  {plan.name}
                                </h3>
                                <p className="text-xs text-slate-400 font-normal mt-0.5">
                                  {plan.description || "Comprehensive preparation"}
                                </p>
                              </div>

                              {/* Edit & Delete Action buttons */}
                              <div className="flex items-center gap-1 shrink-0 bg-slate-100/80 p-1 rounded-xl">
                                <button
                                  onClick={() =>
                                    handleOpenEditPackage(course.id, course.name, plan)
                                  }
                                  title="Edit Package"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePackage(plan.id, plan.name)
                                  }
                                  title="Delete Package"
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Price Block */}
                            <div className="mt-4 mb-3">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                  {cleanMonthly && cleanMonthly !== "—"
                                    ? `₹${cleanMonthly}`
                                    : plan.price}
                                </span>
                                {cleanMonthly && cleanMonthly !== "—" && (
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    / MONTH
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium mt-1">
                                Total: {plan.price} (incl. 18% GST) • {plan.validityText}
                              </p>
                            </div>

                            {/* Tinted Features Box (Max 5 items, matching screenshot) */}
                            <div className={`rounded-2xl p-4 my-3.5 ${boxThemeClass}`}>
                              <div className="space-y-2.5">
                                {plan.features.slice(0, 5).map((feature, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    {feature.included ? (
                                      <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-rose-100 border border-rose-300 text-rose-500 flex items-center justify-center shrink-0">
                                        <X className="w-2.5 h-2.5 stroke-[3.5]" />
                                      </div>
                                    )}
                                    <span
                                      className={`leading-snug truncate ${
                                        feature.included
                                          ? "text-slate-700 font-medium"
                                          : "text-slate-400 font-normal line-through"
                                      }`}
                                    >
                                      {feature.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Footer EMI & Button */}
                          <div className="pt-2 mt-auto">
                            <div
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[11px] font-medium text-center mb-2.5 select-none ${
                                isPopular
                                  ? "bg-[#F8F9E4] border border-lime-300/80 text-slate-800"
                                  : "bg-slate-50 border border-slate-200/90 text-slate-600"
                              }`}
                            >
                              <CreditCard className="w-3.5 h-3.5 text-[#ED7E23] shrink-0 stroke-[2.5]" />
                              <span>
                                <strong className="font-bold text-slate-900">
                                  EMI Available
                                </strong>{" "}
                                • Easy Monthly Plans
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                handleOpenEditPackage(course.id, course.name, plan)
                              }
                              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                isPopular
                                  ? "bg-[#D4F938] hover:bg-[#cbf133] text-slate-950 font-black shadow-lime-500/20"
                                  : "bg-slate-900 hover:bg-slate-800 text-white"
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Package Settings</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
      </main>

      {/* MODAL: ADD / EDIT PACKAGE WITH LIVE PREVIEW */}
      {packageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {packageModal.mode === "edit"
                      ? "Edit Course Package"
                      : "Add New Package"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Course:{" "}
                    <span className="font-semibold text-blue-400">
                      {packageModal.courseName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Interactive Live Preview Active</span>
                </span>
                <button
                  onClick={() =>
                    setPackageModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split 2 Columns (Left: Form, Right: Live Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* LEFT COLUMN: FORM CONTROLS (7 Cols) */}
              <form
                id="package-form"
                onSubmit={handleSavePackage}
                className="lg:col-span-7 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto"
              >
                {/* Popular Toggle Highlight */}
                <div className="p-3.5 rounded-2xl bg-lime-50/80 border border-lime-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Mark as Popular Plan
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Highlights with lime border, popular badge & lime CTA button
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgForm.isPopular}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPkgForm((prev) => ({
                          ...prev,
                          isPopular: checked,
                          badgeText: checked ? "POPULAR" : "",
                          theme: checked ? "lime" : "mint",
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                  </label>
                </div>

                {/* Package Name & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pack / Tier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgForm.name}
                      onChange={(e) =>
                        setPkgForm({ ...pkgForm, name: e.target.value })
                      }
                      placeholder="e.g. Champion Pack +"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={pkgForm.subtitle}
                      onChange={(e) =>
                        setPkgForm({ ...pkgForm, subtitle: e.target.value })
                      }
                      placeholder="e.g. Full master preparation"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Pricing: Monthly Rate & Total Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Price / Month (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgForm.monthlyRate}
                      onChange={(e) =>
                        setPkgForm({ ...pkgForm, monthlyRate: e.target.value })
                      }
                      placeholder="e.g. 4,833 or ₹4,833"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Total Price (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgForm.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = Number(val.replace(/[^0-9.]/g, "")) || 0;
                        setPkgForm({
                          ...pkgForm,
                          price: val,
                          numericPrice: num,
                        });
                      }}
                      placeholder="e.g. ₹28,999 or 28999"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Validity Period & Inclusions Theme */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Validity Period *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgForm.validityText}
                      onChange={(e) =>
                        setPkgForm({ ...pkgForm, validityText: e.target.value })
                      }
                      placeholder="e.g. 6 Months Validity"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Inclusions Box Color
                    </label>
                    <select
                      value={pkgForm.theme}
                      onChange={(e) =>
                        setPkgForm({
                          ...pkgForm,
                          theme: e.target.value as "mint" | "lime" | "lavender",
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium bg-white"
                    >
                      <option value="mint">Mint Green (Standard)</option>
                      <option value="lavender">Soft Pink / Lavender</option>
                      <option value="lime">Lime Light (Popular)</option>
                    </select>
                  </div>
                </div>

                {/* KEY INCLUSIONS MANAGER: STRICTLY LIMITED TO 5 ITEMS */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                        Key Inclusions
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Limited to 5 bullet points max (max 45 chars per point)
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        pkgForm.features.length >= 5
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {pkgForm.features.length} / 5 Max
                    </span>
                  </div>

                  {/* Add New Inclusion Input */}
                  {pkgForm.features.length < 5 ? (
                    <div className="flex flex-col sm:flex-row gap-2 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setPkgForm((prev) => ({
                              ...prev,
                              newFeatureIncluded: !prev.newFeatureIncluded,
                            }))
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            pkgForm.newFeatureIncluded
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300 line-through"
                          }`}
                          title="Click to toggle Included (✓) or Excluded (✗)"
                        >
                          {pkgForm.newFeatureIncluded ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" /> Included
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 stroke-[3]" /> Not Included
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          maxLength={45}
                          value={pkgForm.newFeatureText}
                          onChange={(e) =>
                            setPkgForm({
                              ...pkgForm,
                              newFeatureText: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          placeholder="e.g. 100 Hours of Live Lectures (max 45 chars)..."
                          className="w-full pr-14 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                          {pkgForm.newFeatureText.length}/45
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        Add Point
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Limit reached: Maximum 5 key inclusions to maintain
                        visual harmony and prevent congestion.
                      </span>
                    </div>
                  )}

                  {/* Bullet Points List */}
                  <div className="space-y-2">
                    {pkgForm.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-200 transition-all hover:bg-slate-100/60"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleFeatureIncluded(idx)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            feat.included
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-rose-100 text-rose-600 border border-rose-300"
                          }`}
                          title="Click to toggle Included / Strikethrough"
                        >
                          {feat.included ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </button>

                        <div className="flex-1 relative">
                          <input
                            type="text"
                            maxLength={45}
                            value={feat.text}
                            onChange={(e) =>
                              handleUpdateFeatureText(idx, e.target.value)
                            }
                            className={`w-full pr-12 text-xs border-none bg-transparent focus:outline-none ${
                              feat.included
                                ? "text-slate-800 font-medium"
                                : "text-slate-400 line-through"
                            }`}
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono">
                            {feat.text.length}/45
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove inclusion"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              {/* RIGHT COLUMN: LIVE CARD PREVIEW (5 Cols) */}
              <div className="lg:col-span-5 p-6 bg-slate-100/70 flex flex-col items-center justify-center border-t lg:border-t-0">
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Website Live Card Preview
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Real-time
                    </span>
                  </div>

                  {/* PREVIEW SUBSCRIPTION CARD (Matching Screenshot exactly) */}
                  <div
                    className={`relative rounded-[32px] p-6 sm:p-7 bg-white border flex flex-col justify-between transition-all duration-300 shadow-lg text-left ${
                      pkgForm.isPopular
                        ? "border-lime-400 ring-2 ring-lime-300 shadow-lime-500/10"
                        : "border-slate-200/90"
                    }`}
                  >
                    {/* Floating Straight Popular Badge */}
                    {pkgForm.isPopular && (
                      <div className="absolute -top-3 right-5 z-10">
                        <span className="inline-block bg-[#D4F938] text-slate-950 text-[11px] font-black px-3.5 py-0.5 rounded-full shadow-xs select-none uppercase tracking-wider">
                          {pkgForm.badgeText || "POPULAR"}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight leading-snug">
                          {pkgForm.name || "Package Name"}
                        </h3>
                        <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                          {pkgForm.subtitle || "Package Subtitle Description"}
                        </p>
                      </div>

                      {/* Monthly Price Block */}
                      <div className="mt-5 mb-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                            {pkgForm.monthlyRate.startsWith("₹")
                              ? pkgForm.monthlyRate
                              : `₹${pkgForm.monthlyRate || "2,316"}`}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                            / MONTH
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1.5">
                          Total: {pkgForm.price || "₹13,899"} (incl. 18% GST) •{" "}
                          {pkgForm.validityText || "6 Months Validity"}
                        </p>
                      </div>

                      {/* Tinted Features Box (Max 5 Inclusions) */}
                      <div
                        className={`rounded-2xl p-4 sm:p-5 my-4 border ${
                          pkgForm.isPopular || pkgForm.theme === "lime"
                            ? "bg-[#F8F9E4] border-lime-200/80"
                            : pkgForm.theme === "lavender"
                            ? "bg-[#F7EEF5] border-pink-200/70"
                            : "bg-[#F0F9EE] border-emerald-100/80"
                        }`}
                      >
                        <div className="space-y-2.5">
                          {pkgForm.features.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-2">
                              No inclusions added yet.
                            </p>
                          ) : (
                            pkgForm.features.slice(0, 5).map((f, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 text-xs sm:text-[13px]"
                              >
                                {f.included ? (
                                  <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-rose-100 border border-rose-300 text-rose-500 flex items-center justify-center shrink-0">
                                    <X className="w-2.5 h-2.5 stroke-[3.5]" />
                                  </div>
                                )}
                                <span
                                  className={`leading-snug truncate ${
                                    f.included
                                      ? "text-slate-700 font-medium"
                                      : "text-slate-400 font-normal line-through"
                                  }`}
                                >
                                  {f.text}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EMI Notice & Buy Now CTA */}
                    <div className="pt-2 mt-auto">
                      <div
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[11px] font-medium text-center mb-2.5 select-none ${
                          pkgForm.isPopular
                            ? "bg-[#F8F9E4] border border-lime-300/90 text-slate-800"
                            : "bg-slate-50 border border-slate-200/90 text-slate-600"
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#ED7E23] shrink-0 stroke-[2.5]" />
                        <span>
                          <strong className="font-bold text-slate-900">
                            EMI Available
                          </strong>{" "}
                          • Easy Monthly Plans
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center transition-all shadow-sm ${
                          pkgForm.isPopular
                            ? "bg-[#D4F938] text-slate-950 font-black shadow-lime-500/20"
                            : "bg-[#111827] text-white"
                        }`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Changes will sync instantly to Hostinger database and website.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPackageModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="package-form"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {packageModal.mode === "edit"
                      ? "Save & Publish Changes"
                      : "Create & Publish Package"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW COURSE */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Add New Course
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create a new course to add pricing packages under
                </p>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                  placeholder="e.g. GRE General, Spanish A1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={courseForm.category}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      category: e.target
                        .value as "Language Preparation" | "Test Preparation" | "Skill Catalyst",
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                >
                  <option value="Language Preparation">
                    Language Preparation
                  </option>
                  <option value="Test Preparation">Test Preparation</option>
                  <option value="Skill Catalyst">Skill Catalyst</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief overview of this course..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
