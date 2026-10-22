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
        { course: "IELTS General", plan: "Self-Prep Pack", amount: 13899 },
        { course: "PTE Academic", plan: "Champion Pack", amount: 25999 },
        { course: "SAT Master Track", plan: "Champion Pack +", amount: 29999 },
      ];

      const randomStudent = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomCourse = sampleCourses[Math.floor(Math.random() * sampleCourses.length)];
      const randomEmail = `${randomStudent.toLowerCase().replace(/\s+/g, ".")}${Math.floor(
        Math.random() * 900 + 100
      )}@example.com`;
      const randomPhone = `98${Math.floor(Math.random() * 90000000 + 10000000)}`;

      const testPayload = {
        studentName: randomStudent,
        studentEmail: randomEmail,
        studentPhone: randomPhone,
        studentCountryCode: "+91",
        courseName: randomCourse.course,
        planName: randomCourse.plan,
        category: "Language Preparation",
        amount: randomCourse.amount,
        validityText: "6 Months Access Included",
        razorpayPaymentId: `pay_test_${Date.now().toString(36)}`,
        razorpayOrderId: `order_test_${Date.now().toString(36)}`,
        razorpaySignature: "simulated_test_signature_valid",
        paymentStatus: "SUCCESS",
        environment: "TEST",
        hisabkitabStatus: "SYNCED",
        hisabkitabInvoiceId: `INV-${Date.now().toString().slice(-5)}`,
        hisabkitabReceiptId: `RCP-${Date.now().toString().slice(-5)}`,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminHeader
        title="Student Purchases & Enrollments"
        description="Real-time database tracking of course plans, Razorpay payments, test/live transactions, and HisabKitab ERP sync."
      />

      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Live Revenue */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-black text-white font-heading">
                ₹{(stats?.liveRevenue || 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>From {stats?.liveCount || 0} Live Purchases</span>
              </p>
            </div>
          </div>

          {/* Card 2: Enrolled Students */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Students Enrolled
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-black text-white font-heading">
                {stats?.uniqueStudents || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Unique student accounts
              </p>
            </div>
          </div>

          {/* Card 3: Successful Orders */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Successful Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-black text-white font-heading">
                {stats?.successfulCount || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {stats?.failedCount || 0} failed / abandoned
              </p>
            </div>
          </div>

          {/* Card 4: Test Transactions */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Test Sandbox Volume
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <FlaskConical className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-black text-amber-400 font-heading">
                ₹{(stats?.testRevenue || 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{stats?.testCount || 0} Sandbox Transactions</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, email, phone, course, or Razorpay ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/70 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={filteredOrders.length === 0}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/70 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateTestOrder}
                disabled={isSimulating}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
              >
                <FlaskConical className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "Simulating..." : "+ Add Sample Test Order"}</span>
              </button>
            </div>
          </div>

          {/* Environment & Status Filter Pills */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Environment Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800/80">
              <button
                type="button"
                onClick={() => setEnvFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  envFilter === "ALL"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All Environments ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setEnvFilter("LIVE")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  envFilter === "LIVE"
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Live Payments ({orders.filter((o) => o.environment === "LIVE").length})</span>
              </button>
              <button
                type="button"
                onClick={() => setEnvFilter("TEST")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  envFilter === "TEST"
                    ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FlaskConical className="w-3 h-3 text-amber-400" />
                <span>Test Payments ({orders.filter((o) => o.environment === "TEST").length})</span>
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Status:</span>
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "ALL", label: "All Statuses" },
                    { id: "SUCCESS", label: "Success" },
                    { id: "FAILED", label: "Failed" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      statusFilter === s.id
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Student</th>
                  <th scope="col" className="px-4 py-3.5">Course &amp; Plan</th>
                  <th scope="col" className="px-4 py-3.5">Amount</th>
                  <th scope="col" className="px-4 py-3.5">Payment Mode</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Razorpay IDs</th>
                  <th scope="col" className="px-4 py-3.5">HisabKitab ERP</th>
                  <th scope="col" className="px-4 py-3.5">Date &amp; Time</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-body">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Loading purchase records from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white">No purchases found</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {search
                            ? "No orders matched your search criteria."
                            : "No transactions have been recorded yet. You can click '+ Add Sample Test Order' above to test the viewer."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSuccess = order.paymentStatus === "SUCCESS";
                    const isLive = order.environment === "LIVE";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* 1. Student Name & Contact */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{order.studentName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{order.studentEmail}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <a
                                href={`https://wa.me/${(order.studentCountryCode || "+91").replace(/\+/g, "")}${order.studentPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline"
                              >
                                {order.studentCountryCode || "+91"} {order.studentPhone}
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* 2. Course & Plan */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="flex flex-col items-start gap-1 min-w-[150px]">
                            <div className="font-bold text-white text-xs sm:text-sm leading-snug">
                              {order.courseName}
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] font-semibold whitespace-nowrap">
                              {order.planName.replace(/\s+Plan$/i, "")}
                            </span>
                            {order.validityText && (
                              <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                {order.validityText.replace(/Access\s+Portal\s+Access/i, "Portal Access")}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-sm font-black text-white font-heading">
                            ₹{order.amount.toLocaleString("en-IN")}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {order.currency || "INR"} (Incl. GST)
                          </span>
                        </td>

                        {/* 4. Payment Mode (Live vs Test Payment) */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold tracking-wide uppercase">
                              <Zap className="w-3 h-3 text-emerald-400" />
                              <span>Live Payment</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold tracking-wide uppercase">
                              <FlaskConical className="w-3 h-3 text-amber-400" />
                              <span>Test Payment</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Payment Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3" />
                              <span>SUCCESS</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                              <XCircle className="w-3 h-3" />
                              <span>{order.paymentStatus}</span>
                            </span>
                          )}
                        </td>

                        {/* 6. Razorpay IDs */}
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          <div className="space-y-1">
                            {order.razorpayPaymentId ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-300 truncate max-w-[120px]">
                                  {order.razorpayPaymentId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(order.razorpayPaymentId!, `${order.id}-pay`)
                                  }
                                  className="text-slate-500 hover:text-white cursor-pointer"
                                  title="Copy Payment ID"
                                >
                                  {copiedId === `${order.id}-pay` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600">No Payment ID</span>
                            )}
                            {order.razorpayOrderId && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                Ord: {order.razorpayOrderId}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 7. HisabKitab Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {order.hisabkitabStatus === "SYNCED" ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3" />
                                <span>SYNCED</span>
                              </span>
                              {order.hisabkitabInvoiceId && (
                                <div className="text-[10px] font-mono text-slate-400">
                                  Inv: {order.hisabkitabInvoiceId}
                                </div>
                              )}
                            </div>
                          ) : order.hisabkitabStatus === "FAILED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3" />
                              <span>SYNC FAILED</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              {order.hisabkitabStatus || "PENDING"}
                            </span>
                          )}
                        </td>

                        {/* 8. Timestamp */}
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                          <div>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* 9. Action Button */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ORDER DETAILS MODAL                                                       */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                    Purchase Details: {selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recorded {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs sm:text-sm text-left">
              {/* Payment Mode Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  selectedOrder.environment === "LIVE"
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : "bg-amber-950/40 border-amber-500/30 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold">
                  {selectedOrder.environment === "LIVE" ? (
                    <Zap className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <FlaskConical className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {selectedOrder.environment === "LIVE"
                      ? "Verified Live Payment (Real Bank Transaction)"
                      : "Test Mode Transaction (Sandbox / Mock Payment)"}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-black uppercase tracking-wider">
                  {selectedOrder.paymentStatus}
                </span>
              </div>

              {/* Student Information Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  Student Profile &amp; Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Full Name:</span>
                    <span className="text-white font-semibold">{selectedOrder.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address:</span>
                    <span className="text-white font-semibold font-mono">
                      {selectedOrder.studentEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone Number:</span>
                    <span className="text-white font-semibold font-mono">
                      {selectedOrder.studentCountryCode || "+91"} {selectedOrder.studentPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WhatsApp Connect:</span>
                    <a
                      href={`https://wa.me/${(selectedOrder.studentCountryCode || "+91").replace(/\+/g, "")}${selectedOrder.studentPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Course & Order Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Course &amp; Enrollment Details
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Course Name:</span>
                    <span className="font-bold text-white">{selectedOrder.courseName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Package Plan:</span>
                    <span className="font-bold text-emerald-400">{selectedOrder.planName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Access Duration:</span>
                    <span className="text-slate-300">
                      {selectedOrder.validityText || "Portal Access Included"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">GST Tax:</span>
                    <span className="text-slate-300">18% (Included in total)</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-bold text-white">
                    <span>Total Amount Paid:</span>
                    <span className="text-base font-extrabold text-emerald-400 font-heading">
                      ₹{selectedOrder.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gateway & Accounting Logs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  Payment Gateway &amp; ERP Sync Logs
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Razorpay Payment ID:</span>
                    <span className="text-white">{selectedOrder.razorpayPaymentId || "None"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Razorpay Order ID:</span>
                    <span className="text-white">{selectedOrder.razorpayOrderId || "None"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>HisabKitab Sync Status:</span>
                    <span className="text-blue-400 font-bold">
                      {selectedOrder.hisabkitabStatus || "PENDING"}
                    </span>
                  </div>
                  {selectedOrder.hisabkitabInvoiceId && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>HisabKitab Invoice Ref:</span>
                      <span className="text-white">{selectedOrder.hisabkitabInvoiceId}</span>
                    </div>
                  )}
                  {selectedOrder.failureReason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      Failure Reason: {selectedOrder.failureReason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
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
