import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_COURSE_PACKAGES } from "@/lib/coursePackagesData";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/packages - Get all courses and their packages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldReset = searchParams.get("reset") === "true";

    if (shouldReset) {
      await prisma.coursePlan.deleteMany({});
      await prisma.course.deleteMany({});

      for (const course of INITIAL_COURSE_PACKAGES) {
        await prisma.course.create({
          data: {
            id: course.id,
            name: course.name,
            category: course.category,
            description: course.description,
            plans: {
              create: course.plans.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                numericPrice: p.numericPrice,
                period: p.monthlyRate || "—",
                validityText: p.validityText,
                badge: p.badge || (p.isFeatured ? "POPULAR" : null),
                isFeatured: Boolean(p.isFeatured || p.badge?.toLowerCase().includes("popular")),
                description: p.description || getSubtitleFallback(p.name),
                features: JSON.stringify(
                  p.features.map((f: any) => {
                    if (typeof f === "object" && f.text) return f;
                    const text = String(f);
                    const isExcluded = text.toLowerCase().startsWith("no ");
                    return { text, included: !isExcluded };
                  }).slice(0, 5)
                ),
              })),
            },
          },
        });
      }
    }

    const dbCourses = await prisma.course.findMany({
      include: {
        plans: {
          orderBy: { numericPrice: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (dbCourses.length === 0) {
      for (const course of INITIAL_COURSE_PACKAGES) {
        await prisma.course.create({
          data: {
            id: course.id,
            name: course.name,
            category: course.category,
            description: course.description,
            plans: {
              create: course.plans.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                numericPrice: p.numericPrice,
                period: p.monthlyRate || "—",
                validityText: p.validityText,
                badge: p.badge || (p.isFeatured ? "POPULAR" : null),
                isFeatured: Boolean(p.isFeatured || p.badge?.toLowerCase().includes("popular")),
                description: p.description || getSubtitleFallback(p.name),
                features: JSON.stringify(
                  p.features.map((f: any) => {
                    if (typeof f === "object" && f.text) return f;
                    const text = String(f);
                    const isExcluded = text.toLowerCase().startsWith("no ");
                    return { text, included: !isExcluded };
                  }).slice(0, 5)
                ),
              })),
            },
          },
        });
      }
      const reseeded = await prisma.course.findMany({
        include: { plans: true },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ success: true, courses: formatCourses(reseeded) }, { headers: corsHeaders });
    }

    return NextResponse.json({ success: true, courses: formatCourses(dbCourses) }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("GET /api/packages error:", error);
    return NextResponse.json(
      { success: false, error: error.message, courses: INITIAL_COURSE_PACKAGES },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/packages - Add a new package to a course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseId,
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

    if (!courseId || !name || !price || numericPrice === undefined) {
      return NextResponse.json(
        { success: false, error: "Course, package name, and price are required." },
        { status: 400 }
      );
    }

    // Limit to exactly max 5 key inclusions
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

    const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newPlan = await prisma.coursePlan.create({
      data: {
        id: planId,
        courseId,
        name: name.trim(),
        description: description ? description.trim() : getSubtitleFallback(name),
        price: price.trim(),
        numericPrice: Number(numericPrice),
        period: monthlyRate ? monthlyRate.trim() : "—",
        validityText: validityText ? validityText.trim() : "—",
        badge: isFeatured ? "POPULAR" : (badge ? badge.trim() : null),
        isFeatured: Boolean(isFeatured),
        features: JSON.stringify(cleanFeatures),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Package created successfully!",
      plan: {
        id: newPlan.id,
        courseId: newPlan.courseId,
        name: newPlan.name,
        description: newPlan.description || "",
        price: newPlan.price,
        numericPrice: newPlan.numericPrice,
        monthlyRate: newPlan.period || "—",
        validityText: newPlan.validityText || "—",
        badge: newPlan.badge || undefined,
        isFeatured: newPlan.isFeatured,
        features: cleanFeatures,
      },
    });
  } catch (error: any) {
    console.error("POST /api/packages error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function getSubtitleFallback(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("self")) return "Self-paced language foundation";
  if (lower.includes("+") || lower.includes("plus")) return "Full master preparation";
  if (lower.includes("champ")) return "Perfect to get started";
  if (lower.includes("live")) return "Interactive instructor coaching";
  return "Comprehensive course training";
}

function formatCourses(courses: any[]) {
  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description || "",
    plans: (c.plans || []).map((p: any) => {
      let parsedFeatures: Array<{ text: string; included: boolean }> = [];
      try {
        const raw = JSON.parse(p.features || "[]");
        if (Array.isArray(raw)) {
          parsedFeatures = raw.slice(0, 5).map((f: any) => {
            if (typeof f === "object" && f.text) {
              return { text: String(f.text), included: f.included !== false };
            }
            const text = String(f);
            const isExcluded = text.toLowerCase().startsWith("no ");
            return { text, included: !isExcluded };
          });
        }
      } catch {
        parsedFeatures = p.features ? [{ text: p.features, included: true }] : [];
      }
      return {
        id: p.id,
        courseId: p.courseId,
        name: p.name,
        description: p.description || getSubtitleFallback(p.name),
        price: p.price,
        numericPrice: p.numericPrice,
        monthlyRate: p.period || "—",
        validityText: p.validityText || "—",
        badge: p.badge || undefined,
        isFeatured: p.isFeatured || p.badge?.toLowerCase().includes("popular"),
        features: parsedFeatures,
      };
    }),
  }));
}
