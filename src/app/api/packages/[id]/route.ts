import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PUT /api/packages/[id] - Update an existing package
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      name,
      description,
      price,
      numericPrice,
      monthlyRate,
      validityText,
      badge,
      isFeatured,
      features,
    } = body;

    // Limit to max 5 inclusions
    const cleanFeatures = (Array.isArray(features) ? features : [])
      .slice(0, 5)
      .map((f: any) => {
        if (typeof f === "object" && f.text) {
          return {
            text: String(f.text).trim().slice(0, 50),
            included: f.included !== false,
          };
        }
        const text = String(f).trim().slice(0, 50);
        const isExcluded = text.toLowerCase().startsWith("no ");
        return { text, included: !isExcluded };
      })
      .filter((item: any) => item.text.length > 0);

    const updatedPlan = await prisma.coursePlan.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(price && { price: price.trim() }),
        ...(numericPrice !== undefined && { numericPrice: Number(numericPrice) }),
        ...(monthlyRate !== undefined && { period: monthlyRate ? monthlyRate.trim() : "—" }),
        ...(validityText !== undefined && { validityText: validityText ? validityText.trim() : "—" }),
        ...(badge !== undefined && { badge: badge ? badge.trim() : null }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(features !== undefined && { features: JSON.stringify(cleanFeatures) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Package updated successfully!",
      plan: {
        id: updatedPlan.id,
        courseId: updatedPlan.courseId,
        name: updatedPlan.name,
        description: updatedPlan.description || "",
        price: updatedPlan.price,
        numericPrice: updatedPlan.numericPrice,
        monthlyRate: updatedPlan.period || "—",
        validityText: updatedPlan.validityText || "—",
        badge: updatedPlan.badge || undefined,
        isFeatured: updatedPlan.isFeatured,
        features: cleanFeatures,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/packages/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/packages/[id] - Delete a package
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.coursePlan.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Package deleted successfully!" });
  } catch (error: any) {
    console.error("DELETE /api/packages/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
