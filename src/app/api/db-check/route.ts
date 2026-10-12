import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  let host = "Unknown";
  let port = "3306";
  let database = "Unknown";
  let user = "Unknown";

  try {
    if (dbUrl) {
      // Regex or URL parse: mysql://USER:PASSWORD@HOST:PORT/DATABASE
      const parsed = new URL(dbUrl);
      host = parsed.hostname;
      port = parsed.port || "3306";
      database = parsed.pathname.replace(/^\//, "");
      user = parsed.username;
    }
  } catch {
    // If URL parsing fails, extract roughly
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/([^?]+)/);
    if (match) {
      user = match[1];
      host = match[3];
      port = match[4] || "3306";
      database = match[5];
    }
  }

  const startTime = Date.now();
  let isConnected = false;
  let latencyMs = 0;
  let errorMessage: string | null = null;
  let tableCounts: Record<string, number> = {};

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout after 3000ms")), 3000)
      ),
    ]);
    latencyMs = Date.now() - startTime;
    isConnected = true;

    try {
      const blogCount = await prisma.blog.count();
      tableCounts["Blog"] = blogCount;
    } catch {
      tableCounts["Blog"] = 0;
    }
  } catch (err: any) {
    latencyMs = Date.now() - startTime;
    isConnected = false;
    errorMessage = err.message || "Failed to establish TCP connection with MySQL server.";
  }

  return NextResponse.json({
    success: true,
    connected: isConnected,
    latencyMs: isConnected ? latencyMs : null,
    config: {
      host,
      port,
      database,
      user,
      configuredUrl: dbUrl ? dbUrl.replace(/:([^@]+)@/, ":••••••••@") : "Not set",
    },
    tables: isConnected ? tableCounts : null,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  });
}
