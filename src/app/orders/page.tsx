"use client";

import { useEffect, useState, useMemo } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { OrderRecord } from "@/lib/orderService";
import {
  ShoppingBag,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone,
  BookOpen,
  Receipt,
  Download,
  Filter,
  Eye,
  X,
  ExternalLink,
  FlaskConical,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default function OrdersListPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [envFilter, setEnvFilter] = useState<"ALL" | "LIVE" | "TEST">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "FAILED" | "CANCELLED">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?stats=true");
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
        setStats(json.stats || null);
      }
    } catch (err) {
      console.error("Failed fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Env filter
      if (envFilter !== "ALL" && o.environment !== envFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== "ALL" && o.paymentStatus !== statusFilter) {
        return false;
      }
      // Search
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        const matchesName = o.studentName.toLowerCase().includes(s);
        const matchesEmail = o.studentEmail.toLowerCase().includes(s);
        const matchesPhone = o.studentPhone.toLowerCase().includes(s);
        const matchesCourse = o.courseName.toLowerCase().includes(s);
        const matchesPlan = o.planName.toLowerCase().includes(s);
        const matchesPaymentId = o.razorpayPaymentId?.toLowerCase().includes(s);
        const matchesOrderId = o.razorpayOrderId?.toLowerCase().includes(s);
        return (
          matchesName ||
          matchesEmail ||
          matchesPhone ||
          matchesCourse ||
          matchesPlan ||
          matchesPaymentId ||
          matchesOrderId
        );
      }
      return true;
    });
  }, [orders, envFilter, statusFilter, search]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = [
      "Order ID",
      "Date",
      "Student Name",
      "Email",
      "Phone",
      "Course",
      "Plan",
      "Amount (INR)",
      "Environment",
      "Payment Status",
      "Razorpay Payment ID",
      "Razorpay Order ID",
      "HisabKitab Status",
      "Invoice ID",
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString("en-IN"),
      `"${o.studentName}"`,
      o.studentEmail,
      `"${o.studentCountryCode || "+91"} ${o.studentPhone}"`,
      `"${o.courseName}"`,
      `"${o.planName}"`,
      o.amount,
      o.environment,
      o.paymentStatus,
      o.razorpayPaymentId || "-",
      o.razorpayOrderId || "-",
      o.hisabkitabStatus || "-",
      o.hisabkitabInvoiceId || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `academic_yatra_purchases_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate a test order
  const handleSimulateTestOrder = async () => {
    setIsSimulating(true);
    try {
      const sampleNames = [
        "Rahul Sharma",
        "Priya Patel",
        "Aarav Mehta",
        "Ananya Verma",
        "Vikramaditya Roy",
      ];
      const sampleCourses = [
        { course: "IELTS Academic", plan: "Champion Pack +", amount: 28999 },
        { course: "French Language Programs", plan: "Basic & A1 (1 timing)", amount: 31999 },
        { course: "German Language Programs", plan: "Basic, A1 & A2", amount: 42999 },
        { course: "PTE Academic", plan: "Live Class", amount: 9499 },
        { course: "Shorter GRE", plan: "Champion Pack", amount: 53999 },
      ];

      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomCourse = sampleCourses[Math.floor(Math.random() * sampleCourses.length)];
      const randomPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
      const randomEmail = `${randomName.toLowerCase().replace(/\s+/g, ".")}@example.com`;

      const payload = {
        studentName: randomName,
        studentEmail: randomEmail,
        studentPhone: randomPhone,
        courseId: randomCourse.course.toLowerCase().replace(/\s+/g, "-"),
        courseName: randomCourse.course,
        planId: randomCourse.plan.toLowerCase().replace(/\s+/g, "-"),
        planName: randomCourse.plan,
        amount: randomCourse.amount,
        validityText: "6 Months Access",
        razorpayPaymentId: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
        razorpayOrderId: `order_test_${Math.random().toString(36).substring(2, 10)}`,
        razorpaySignature: "simulated_signature",
        paymentStatus: "SUCCESS",
        environment: "TEST",
        hisabkitabStatus: "SYNCED",
        hisabkitabInvoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (e) {
      console.error("Simulation failed:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen text-slate-900">
      <AdminHeader
        title="Student Purchases & Enrollments"
        description="Real-time database tracking of course plans, Razorpay payments, test/live transactions, and HisabKitab ERP sync"
      />

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Metric Cards Row - High Craft Unslop Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Live Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Live Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                ₹{(stats?.liveRevenue || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                From {stats?.liveOrdersCount || 0} Live Purchases
              </p>
            </div>
          </div>

          {/* Card 2: Students Enrolled */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Students Enrolled
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                {stats?.totalStudents || 0}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                Unique student accounts
              </p>
            </div>
          </div>

          {/* Card 3: Successful Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Successful Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight font-heading">
                {stats?.successfulOrders || 0}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
                {stats?.failedOrders || 0} failed / abandoned
              </p>
            </div>
          </div>

          {/* Card 4: Test Sandbox Volume */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Test Sandbox Volume
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <FlaskConical className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-700 tracking-tight font-heading">
                ₹{(stats?.testRevenue || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                {stats?.testOrdersCount || 0} Sandbox Transactions
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
                placeholder="Search by student name, email, phone, course, or Razorpay ID..."
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

            {/* Quick Actions - Exact Aligned */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                title="Refresh orders ledger"
                className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin text-emerald-600" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={filteredOrders.length === 0}
                className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateTestOrder}
                disabled={isSimulating}
                className="h-10 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FlaskConical className={`w-3.5 h-3.5 text-amber-400 ${isSimulating ? "animate-bounce" : ""}`} />
                <span>{isSimulating ? "Creating..." : "+ Add Sample Test Order"}</span>
              </button>
            </div>
          </div>

          {/* Sub Filters: Environment & Status Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Environment Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Environment:</span>
              <button
                onClick={() => setEnvFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  envFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                All Environments ({orders.length})
              </button>
              <button
                onClick={() => setEnvFilter("LIVE")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  envFilter === "LIVE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Payments ({stats?.liveOrdersCount || 0})
              </button>
              <button
                onClick={() => setEnvFilter("TEST")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  envFilter === "TEST"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Test Sandbox ({stats?.testOrdersCount || 0})
              </button>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Status:</span>
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("SUCCESS")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "SUCCESS"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setStatusFilter("FAILED")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "FAILED"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Failed
              </button>
            </div>
          </div>
        </div>

        {/* Orders Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs font-medium">Loading transaction ledger...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No purchases found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No transactions match your current search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Student</th>
                    <th className="py-3.5 px-4">Course & Plan</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Environment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Gateway IDs</th>
                    <th className="py-3.5 px-4">ERP Sync</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredOrders.map((order) => {
                    const isSuccess = order.paymentStatus === "SUCCESS";
                    const isFailed = order.paymentStatus === "FAILED";
                    const isLive = order.environment === "LIVE";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Student Info */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {order.studentName ? order.studentName.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate hover:text-emerald-600 transition-colors">
                                {order.studentName}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {order.studentEmail}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {order.studentCountryCode || "+91"} {order.studentPhone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Course & Plan */}
                        <td className="py-3.5 px-4">
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 block truncate">
                              {order.courseName}
                            </span>
                            <span className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {order.planName}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {order.validityText || "6 Months Access"}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold font-mono text-sm text-slate-900 block">
                            ₹{order.amount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            incl. 18% GST
                          </span>
                        </td>

                        {/* Environment */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              LIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              SANDBOX
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              SUCCESS
                            </span>
                          ) : isFailed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              FAILED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                              {order.paymentStatus || "PENDING"}
                            </span>
                          )}
                        </td>

                        {/* Gateway IDs */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {order.razorpayPaymentId ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-700 max-w-[110px] truncate" title={order.razorpayPaymentId}>
                                {order.razorpayPaymentId}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(order.razorpayPaymentId!, order.id);
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                title="Copy Payment ID"
                              >
                                {copiedId === order.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* ERP Sync */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {order.hisabkitabStatus === "SYNCED" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              <Receipt className="w-3 h-3 text-blue-500" />
                              SYNCED
                            </span>
                          ) : order.hisabkitabStatus === "FAILED" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              SYNC FAILED
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              {order.hisabkitabStatus || "SKIPPED"}
                            </span>
                          )}
                        </td>

                        {/* Details Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer"
                            title="View Full Order Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* High-Craft Unslop Slide-Over / Modal Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Order Details & Invoice
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    ID: {selectedOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Student Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Student Contact Information
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-900">{selectedOrder.studentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Email Address:</span>
                    <a
                      href={`mailto:${selectedOrder.studentEmail}`}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      {selectedOrder.studentEmail}
                    </a>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Phone Number:</span>
                    <span className="font-mono text-slate-800">
                      {selectedOrder.studentCountryCode || "+91"} {selectedOrder.studentPhone}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Direct WhatsApp:</span>
                    <a
                      href={`https://wa.me/${(selectedOrder.studentCountryCode || "+91").replace(
                        "+",
                        ""
                      )}${selectedOrder.studentPhone}?text=Hi%20${encodeURIComponent(
                        selectedOrder.studentName
                      )},%20this%20is%20Academic%20Yatra%20Admissions.`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Course & Order Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Course &amp; Enrollment Details
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Course Name:</span>
                    <span className="font-bold text-slate-900">{selectedOrder.courseName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Package Plan:</span>
                    <span className="font-bold text-emerald-700">{selectedOrder.planName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Access Duration:</span>
                    <span className="text-slate-700">
                      {selectedOrder.validityText || "Portal Access Included"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">GST Tax:</span>
                    <span className="text-slate-700">18% (Included in total)</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="text-base font-extrabold text-emerald-600 font-heading">
                      ₹{selectedOrder.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gateway & Accounting Logs */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Payment Gateway &amp; ERP Sync Logs
                </span>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Razorpay Payment ID:</span>
                    <span className="text-slate-800">{selectedOrder.razorpayPaymentId || "None"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Razorpay Order ID:</span>
                    <span className="text-slate-800">{selectedOrder.razorpayOrderId || "None"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>HisabKitab Sync Status:</span>
                    <span className="text-blue-700 font-bold">
                      {selectedOrder.hisabkitabStatus || "PENDING"}
                    </span>
                  </div>
                  {selectedOrder.hisabkitabInvoiceId && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>HisabKitab Invoice Ref:</span>
                      <span className="text-slate-800">{selectedOrder.hisabkitabInvoiceId}</span>
                    </div>
                  )}
                  {selectedOrder.failureReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      Failure Reason: {selectedOrder.failureReason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
