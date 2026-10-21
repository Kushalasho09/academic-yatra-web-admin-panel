/**
 * HisabKitab Third-Party API Client
 * Documentation: https://zqki873xwy.apidog.io/
 */

const HISABKITAB_BASE_URL =
  process.env.HISABKITAB_BASE_URL || "https://api.hisabkitab.co";
const HISABKITAB_API_KEY = process.env.HISABKITAB_API_KEY || "";

interface HisabKitabRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function hisabKitabFetch<T = any>(
  endpoint: string,
  options: HisabKitabRequestOptions = {}
): Promise<T> {
  if (!HISABKITAB_API_KEY) {
    throw new Error(
      "HISABKITAB_API_KEY is missing. Please set HISABKITAB_API_KEY in your .env file."
    );
  }

  // Format URL path (e.g., /third-party/sale-transactions)
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const urlPath = cleanEndpoint.startsWith("/third-party")
    ? cleanEndpoint
    : `/third-party${cleanEndpoint}`;

  const url = new URL(urlPath, HISABKITAB_BASE_URL);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ApiKey: HISABKITAB_API_KEY,
    "api-key": HISABKITAB_API_KEY,
    Authorization: `Bearer ${HISABKITAB_API_KEY}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `HisabKitab API error: ${response.status} ${response.statusText}`
    );
  }

  return data as T;
}

export const hisabKitabApi = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) =>
    hisabKitabFetch<T>(endpoint, { method: "GET", params }),

  post: <T = any>(endpoint: string, body?: any) =>
    hisabKitabFetch<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    hisabKitabFetch<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, params?: Record<string, any>) =>
    hisabKitabFetch<T>(endpoint, { method: "DELETE", params }),

  // High-level domain methods
  getCompanyDetails: () => hisabKitabFetch("/company-details"),
  getLedgers: (params?: Record<string, any>) =>
    hisabKitabFetch("/ledgers", { params }),
  getItems: (params?: Record<string, any>) =>
    hisabKitabFetch("/items", { params }),
  getSaleTransactions: (params?: Record<string, any>) =>
    hisabKitabFetch("/sale-transactions", { params }),
  getNextInvoiceNumber: () =>
    hisabKitabFetch("/sale-transactions/next-invoice-number"),
  createSaleTransaction: (body: any) =>
    hisabKitabFetch("/sale-transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getReceiptTransactions: (params?: Record<string, any>) =>
    hisabKitabFetch("/receipt-transactions", { params }),
  createReceipt: (body: any) =>
    hisabKitabFetch("/receipt-transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

