import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/courses - Add a new course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, description } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: "Course name and category are required." },
        { status: 400 }
      );
    }

    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    // Check if ID exists
    let uniqueId = baseSlug;
    const existing = await prisma.course.findUnique({ where: { id: uniqueId } });
    if (existing) {
      uniqueId = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newCourse = await prisma.course.create({
      data: {
        id: uniqueId,
        name: name.trim(),
        category: category.trim(),
        description: description ? description.trim() : "",
      },
      include: { plans: true },
    });

    return NextResponse.json({
      success: true,
      message: "Course created successfully!",
      course: {
        id: newCourse.id,
        name: newCourse.name,
        category: newCourse.category,
        description: newCourse.description || "",
        plans: [],
      },
    });
  } catch (error: any) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

