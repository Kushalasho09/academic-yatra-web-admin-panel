"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  INITIAL_COURSE_PACKAGES,
  CoursePackage,
  PlanItem,
} from "@/lib/coursePackagesData";
import {
  Tag,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LayoutGrid,
  List,
  Filter,
  Check,
  X,
  CreditCard,
  Clock,
  GraduationCap,
  Percent,
  ShieldCheck,
  TrendingUp,
  Sliders,
} from "lucide-react";

export default function PackagesPricingPage() {
  const [courses, setCourses] = useState<CoursePackage[]>(INITIAL_COURSE_PACKAGES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editingPlan, setEditingPlan] = useState<{
    courseId: string;
    courseName: string;
    plan: PlanItem;
  } | null>(null);

  // Form state for edit modal
  const [modalForm, setModalForm] = useState<{
    fullCost: number;
    monthlyRate: number;
    months: number;
    duration: string;
    tagline: string;
    popular: boolean;
  }>({
    fullCost: 0,
    monthlyRate: 0,
    months: 6,
    duration: "",
    tagline: "",
    popular: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat =
        selectedCategory === "ALL" || c.category === selectedCategory;
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        c.plans.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [courses, search, selectedCategory]);

  // Aggregate stats
  const totalCourses = courses.length;
  const totalPlans = courses.reduce((acc, c) => acc + c.plans.length, 0);
  const allPrices = courses.flatMap((c) => c.plans.map((p) => p.fullCost));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // Handle open edit modal
  const handleOpenEdit = (courseId: string, courseName: string, plan: PlanItem) => {
    setEditingPlan({ courseId, courseName, plan });
    setModalForm({
      fullCost: plan.fullCost,
      monthlyRate: plan.monthlyRate,
      months: plan.months,
      duration: plan.duration,
      tagline: plan.tagline,
      popular: plan.popular,
    });
  };

  // Handle save modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== editingPlan.courseId) return c;
        return {
          ...c,
          plans: c.plans.map((p) => {
            if (p.id !== editingPlan.plan.id) return p;
            return {
              ...p,
              fullCost: Number(modalForm.fullCost),
              formattedPrice: Number(modalForm.fullCost).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              monthlyRate: Number(modalForm.monthlyRate),
              months: Number(modalForm.months),
              formattedMonthlyRate: Number(modalForm.monthlyRate).toLocaleString("en-IN"),
              duration: modalForm.duration,
              tagline: modalForm.tagline,
              popular: modalForm.popular,
            };
          }),
        };
      })
    );

    showToast(`Updated ${editingPlan.plan.name} price to ₹${Number(modalForm.fullCost).toLocaleString("en-IN")}!`);
    setEditingPlan(null);
  };

  // Reset to initial
  const handleResetDefaults = () => {
    if (confirm("Reset all course packages and pricing back to initial defaults?")) {
      setCourses(INITIAL_COURSE_PACKAGES);
      showToast("All package prices reset to defaults.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <AdminHeader
        title="Packages & Pricing Management"
        description="Review, filter, and adjust course enrollment fees, flexible EMI tenures, and plan features."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive UI Active</span>
            </div>
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
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Courses</span>
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCourses}</div>
            <p className="text-[11px] text-slate-400 mt-1">Across 3 Education Verticals</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Plans</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalPlans}</div>
            <p className="text-[11px] text-slate-400 mt-1">Configured pricing tiers</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Lowest Plan</span>
              <Tag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">₹{minPrice.toLocaleString("en-IN")}</div>
            <p className="text-[11px] text-slate-400 mt-1">Career Essentials Pro</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Highest Plan</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">₹{maxPrice.toLocaleString("en-IN")}</div>
            <p className="text-[11px] text-slate-400 mt-1">German A1+A2 (10 Months)</p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Programs" },
              { id: "Language Preparation", label: "Language Prep (9)" },
              { id: "Test Preparation", label: "Test Prep (5)" },
              { id: "Skill Catalyst", label: "Skill Catalyst (4)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & View Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search package or plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode("cards")}
                title="Card View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "cards"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No course packages match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing your search query or selecting &quot;All Programs&quot; to view all 17 courses.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "cards" ? (
          // CARD VIEW
          <div className="space-y-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Course Header Banner */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 to-transparent">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900">{course.name}</h2>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {course.studentsCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                  </div>

                  <a
                    href={`https://academicyatra.com/${course.verticalSlug}/${course.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50/60 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition-colors shrink-0 self-start sm:self-center"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Plans Grid */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                        plan.popular
                          ? "bg-gradient-to-b from-emerald-50/40 via-white to-white border-emerald-300 shadow-sm ring-1 ring-emerald-400/20"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase block">
                              {plan.packType}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{plan.name}</h3>
                          </div>
                          {plan.popular && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs shrink-0 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Popular
                            </span>
                          )}
                        </div>

                        {/* Price Badge */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl font-extrabold text-slate-900 font-mono">
                              ₹{plan.formattedPrice}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {plan.duration}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                            <span className="text-slate-600 font-medium">
                              ₹{plan.formattedMonthlyRate}/m • {plan.months} mos
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                              18% GST Incl.
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 italic">&ldquo;{plan.tagline}&rdquo;</p>

                        {/* Features List */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Included Perks:
                          </span>
                          {plan.features.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 mt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(course.id, course.name, plan)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Pricing & Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // TABLE VIEW
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Course Program</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Plan Name</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Total Fee</th>
                    <th className="py-3.5 px-4">Monthly Rate</th>
                    <th className="py-3.5 px-4">Popular</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.flatMap((course) =>
                    course.plans.map((plan, planIdx) => (
                      <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {planIdx === 0 ? course.name : <span className="text-slate-400 pl-2">↳</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {course.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{plan.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{plan.duration}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          ₹{plan.formattedPrice}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          ₹{plan.formattedMonthlyRate}/m ({plan.months}m)
                        </td>
                        <td className="py-3.5 px-4">
                          {plan.popular ? (
                            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Yes
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(course.id, course.name, plan)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Pricing Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {editingPlan.courseName}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Pricing: {editingPlan.plan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalForm.fullCost}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      setModalForm((prev) => ({
                        ...prev,
                        fullCost: cost,
                        monthlyRate: prev.months > 0 ? Math.round(cost / prev.months) : cost,
                      }));
                    }}
                    className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Includes 18% GST</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration / Validity
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.duration}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    placeholder="e.g. 6 Months Access"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Rate (₹/month)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalForm.monthlyRate}
                    onChange={(e) =>
                      setModalForm((prev) => ({
                        ...prev,
                        monthlyRate: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Installment Months
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    required
                    value={modalForm.months}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setModalForm((prev) => ({
                        ...prev,
                        months: m,
                        monthlyRate: m > 0 ? Math.round(prev.fullCost / m) : prev.fullCost,
                      }));
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Subtext
                </label>
                <input
                  type="text"
                  value={modalForm.tagline}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, tagline: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Mark as Popular Plan</span>
                  <span className="text-[10px] text-slate-500">
                    Displays highlighted green gradient and &quot;POPULAR&quot; badge
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={modalForm.popular}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, popular: e.target.checked }))
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  Apply & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
