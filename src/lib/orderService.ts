import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

export interface OrderRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCountryCode?: string;
  courseId?: string | null;
  courseName: string;
  planId?: string | null;
  planName: string;
  category?: string | null;
  amount: number;
  currency: string;
  validityText?: string | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  razorpaySignature?: string | null;
  paymentStatus: "SUCCESS" | "FAILED" | "CANCELLED";
  environment: "TEST" | "LIVE";
  failureReason?: string | null;
  hisabkitabStatus?: "SYNCED" | "FAILED" | "SKIPPED" | "PENDING" | null;
  hisabkitabInvoiceId?: string | null;
  hisabkitabReceiptId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderInput = Omit<OrderRecord, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "orders.json");

// Read from JSON fallback file
function readOrdersFromFile(): OrderRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading orders file:", err);
    return [];
  }
}

// Write to JSON fallback file
function writeOrdersToFile(orders: OrderRecord[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing orders file:", err);
  }
}

// Check if MySQL is currently responsive with short cache
let isMySqlAvailable: boolean | null = null;
let lastCheckTime = 0;

async function checkMySql(): Promise<boolean> {
  const now = Date.now();
  if (isMySqlAvailable !== null && now - lastCheckTime < 10000) {
    return isMySqlAvailable;
  }
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 2500)
      ),
    ]);
    isMySqlAvailable = true;
    lastCheckTime = now;
    return true;
  } catch {
    isMySqlAvailable = false;
    lastCheckTime = now;
    return false;
  }
}

/**
 * Create a new student order/purchase
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  const now = new Date().toISOString();
  const id = input.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Determine environment if not explicitly set
  let environment = input.environment;
  if (!environment) {
    if (
      (input.razorpayPaymentId && input.razorpayPaymentId.includes("test")) ||
      (input.razorpayOrderId && input.razorpayOrderId.includes("test"))
    ) {
      environment = "TEST";
    } else {
      environment = "LIVE";
    }
  }

  const newOrder: OrderRecord = {
    id,
    studentName: input.studentName,
    studentEmail: input.studentEmail,
    studentPhone: input.studentPhone,
    studentCountryCode: input.studentCountryCode || "+91",
    courseId: input.courseId || null,
    courseName: input.courseName,
    planId: input.planId || null,
    planName: (input.planName || "").replace(/\s+Plan$/i, ""),
    category: input.category || null,
    amount: Number(input.amount),
    currency: input.currency || "INR",
    validityText: input.validityText || null,
    razorpayPaymentId: input.razorpayPaymentId || null,
    razorpayOrderId: input.razorpayOrderId || null,
    razorpaySignature: input.razorpaySignature || null,
    paymentStatus: input.paymentStatus || "SUCCESS",
    environment,
    failureReason: input.failureReason || null,
    hisabkitabStatus: input.hisabkitabStatus || "PENDING",
    hisabkitabInvoiceId: input.hisabkitabInvoiceId || null,
    hisabkitabReceiptId: input.hisabkitabReceiptId || null,
    notes: input.notes || null,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };

  // 1. Always write to JSON fallback immediately
  try {
    const fileOrders = readOrdersFromFile();
    const existingIdx = fileOrders.findIndex((o) => o.id === id);
    if (existingIdx >= 0) {
      fileOrders[existingIdx] = newOrder;
    } else {
      fileOrders.unshift(newOrder);
    }
    writeOrdersToFile(fileOrders);
  } catch (fErr) {
    console.error("Failed writing order to JSON fallback:", fErr);
  }

  // 2. Write to MySQL if available
  const hasMySql = await checkMySql();
  if (hasMySql) {
    try {
      await prisma.order.upsert({
        where: { id },
        update: {
          studentName: newOrder.studentName,
          studentEmail: newOrder.studentEmail,
          studentPhone: newOrder.studentPhone,
          studentCountryCode: newOrder.studentCountryCode || "+91",
          courseId: newOrder.courseId,
          courseName: newOrder.courseName,
          planId: newOrder.planId,
          planName: newOrder.planName,
          category: newOrder.category,
          amount: newOrder.amount,
          currency: newOrder.currency,
          validityText: newOrder.validityText,
          razorpayPaymentId: newOrder.razorpayPaymentId,
          razorpayOrderId: newOrder.razorpayOrderId,
          razorpaySignature: newOrder.razorpaySignature,
          paymentStatus: newOrder.paymentStatus,
          environment: newOrder.environment,
          failureReason: newOrder.failureReason,
          hisabkitabStatus: newOrder.hisabkitabStatus,
          hisabkitabInvoiceId: newOrder.hisabkitabInvoiceId,
          hisabkitabReceiptId: newOrder.hisabkitabReceiptId,
          notes: newOrder.notes,
        },
        create: {
          id: newOrder.id,
          studentName: newOrder.studentName,
          studentEmail: newOrder.studentEmail,
          studentPhone: newOrder.studentPhone,
          studentCountryCode: newOrder.studentCountryCode || "+91",
          courseId: newOrder.courseId,
          courseName: newOrder.courseName,
          planId: newOrder.planId,
          planName: newOrder.planName,
          category: newOrder.category,
          amount: newOrder.amount,
          currency: newOrder.currency,
          validityText: newOrder.validityText,
          razorpayPaymentId: newOrder.razorpayPaymentId,
          razorpayOrderId: newOrder.razorpayOrderId,
          razorpaySignature: newOrder.razorpaySignature,
          paymentStatus: newOrder.paymentStatus,
          environment: newOrder.environment,
          failureReason: newOrder.failureReason,
          hisabkitabStatus: newOrder.hisabkitabStatus,
          hisabkitabInvoiceId: newOrder.hisabkitabInvoiceId,
          hisabkitabReceiptId: newOrder.hisabkitabReceiptId,
          notes: newOrder.notes,
          createdAt: new Date(newOrder.createdAt),
        },
      });
    } catch (dbErr) {
      console.error("Order DB insertion error:", dbErr);
    }
  }

  return newOrder;
}

/**
 * Fetch all orders with optional filtering
 */
export async function getOrders(options?: {
  status?: string;
  environment?: string;
  search?: string;
}): Promise<OrderRecord[]> {
  const hasMySql = await checkMySql();

  let orders: OrderRecord[] = [];

  if (hasMySql) {
    try {
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      });
      orders = dbOrders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        paymentStatus: o.paymentStatus as any,
        environment: o.environment as any,
        hisabkitabStatus: o.hisabkitabStatus as any,
      }));

      // Always merge fallback JSON orders if any missed MySQL write during connection drops
      try {
        const fileOrders = readOrdersFromFile();
        const dbIdSet = new Set(orders.map((o) => o.id));
        const missingInDb = fileOrders.filter((fo) => !dbIdSet.has(fo.id));
        if (missingInDb.length > 0) {
          orders = [...orders, ...missingInDb].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          // Sync missing orders into MySQL in background
          (async () => {
            for (const mo of missingInDb) {
              try {
                await prisma.order.upsert({
                  where: { id: mo.id },
                  update: {},
                  create: {
                    id: mo.id,
                    studentName: mo.studentName,
                    studentEmail: mo.studentEmail,
                    studentPhone: mo.studentPhone,
                    studentCountryCode: mo.studentCountryCode || "+91",
                    courseId: mo.courseId,
                    courseName: mo.courseName,
                    planId: mo.planId,
                    planName: mo.planName,
                    category: mo.category,
                    amount: Number(mo.amount),
                    currency: mo.currency || "INR",
                    validityText: mo.validityText,
                    razorpayPaymentId: mo.razorpayPaymentId,
                    razorpayOrderId: mo.razorpayOrderId,
                    razorpaySignature: mo.razorpaySignature,
                    paymentStatus: mo.paymentStatus || "SUCCESS",
                    environment: mo.environment || "TEST",
                    failureReason: mo.failureReason,
                    hisabkitabStatus: mo.hisabkitabStatus || "SYNCED",
                    hisabkitabInvoiceId: mo.hisabkitabInvoiceId,
                    hisabkitabReceiptId: mo.hisabkitabReceiptId,
                    notes: mo.notes,
                    createdAt: new Date(mo.createdAt),
                  },
                });
              } catch (_) {}
            }
          })();
        }
      } catch (fErr) {
        console.warn("JSON fallback merge notice:", fErr);
      }
    } catch (err) {
      console.error("MySQL query failed, falling back to JSON:", err);
      orders = readOrdersFromFile();
    }
  } else {
    orders = readOrdersFromFile();
  }

  // Filter in memory
  if (options?.status && options.status !== "ALL") {
    orders = orders.filter((o) => o.paymentStatus === options.status);
  }

  if (options?.environment && options.environment !== "ALL") {
    orders = orders.filter((o) => o.environment === options.environment);
  }

  if (options?.search && options.search.trim()) {
    const s = options.search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.studentName.toLowerCase().includes(s) ||
        o.studentEmail.toLowerCase().includes(s) ||
        o.studentPhone.toLowerCase().includes(s) ||
        o.courseName.toLowerCase().includes(s) ||
        o.planName.toLowerCase().includes(s) ||
        (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(s)) ||
        (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(s))
    );
  }

  return orders;
}

/**
 * Get aggregate statistics across all orders
 */
export async function getOrderStats() {
  const allOrders = await getOrders();

  const totalOrders = allOrders.length;
  const successfulOrders = allOrders.filter((o) => o.paymentStatus === "SUCCESS");
  const failedOrders = allOrders.filter((o) => o.paymentStatus !== "SUCCESS");

  const liveOrders = allOrders.filter((o) => o.environment === "LIVE");
  const testOrders = allOrders.filter((o) => o.environment === "TEST");

  const liveRevenue = liveOrders
    .filter((o) => o.paymentStatus === "SUCCESS")
    .reduce((sum, o) => sum + o.amount, 0);

  const testRevenue = testOrders
    .filter((o) => o.paymentStatus === "SUCCESS")
    .reduce((sum, o) => sum + o.amount, 0);

  const uniqueStudents = new Set(allOrders.map((o) => o.studentEmail.toLowerCase())).size;

  return {
    totalOrders,
    successfulCount: successfulOrders.length,
    failedCount: failedOrders.length,
    liveCount: liveOrders.length,
    testCount: testOrders.length,
    liveRevenue,
    testRevenue,
    uniqueStudents,
  };
}
