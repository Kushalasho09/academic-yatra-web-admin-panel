import { NextRequest, NextResponse } from "next/server";
import { getOrders, getOrderStats, createOrder } from "@/lib/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const environment = searchParams.get("environment") || undefined;
    const includeStats = searchParams.get("stats") === "true";

    const orders = await getOrders({ search, status, environment });
    const stats = includeStats ? await getOrderStats() : null;

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
      count: orders.length,
    });
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.studentName || !body.studentEmail || !body.courseName || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: studentName, studentEmail, courseName, amount",
        },
        { status: 400 }
      );
    }

    const order = await createOrder(body);

    return NextResponse.json({
      success: true,
      message: "Order successfully recorded in database.",
      data: order,
    });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
