import { NextResponse } from "next/server";
import { hisabKitabApi } from "@/lib/hisabKitab";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await hisabKitabApi.getCompanyDetails();
    return NextResponse.json({
      success: true,
      message: "HisabKitab API connected successfully!",
      company: response?.data || response,
    });
  } catch (error: any) {
    console.error("HisabKitab connection check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to HisabKitab API.",
      },
      { status: 500 }
    );
  }
}
