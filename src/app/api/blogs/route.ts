import { NextRequest, NextResponse } from "next/server";
import { getBlogs, createBlog } from "@/lib/blogService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL"; // "ALL" | "PUBLISHED" | "DRAFT"

    let blogs = await getBlogs();

    if (search) {
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.category.toLowerCase().includes(search) ||
          (b.tags && b.tags.toLowerCase().includes(search)) ||
          b.author.toLowerCase().includes(search) ||
          b.slug.toLowerCase().includes(search)
      );
    }

    if (category !== "ALL") {
      blogs = blogs.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status === "PUBLISHED") {
      blogs = blogs.filter((b) => b.isPublished);
    } else if (status === "DRAFT") {
      blogs = blogs.filter((b) => !b.isPublished);
    }

    return NextResponse.json({
      success: true,
      data: blogs,
      total: blogs.length,
      publishedCount: blogs.filter((b) => b.isPublished).length,
      draftCount: blogs.filter((b) => !b.isPublished).length,
    });
  } catch (error: any) {
    console.error("API GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    let slug = body.slug;
    if (!slug) {
      slug = body.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    const created = await createBlog({
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content,
      coverImage: body.coverImage || null,
      author: body.author || "Academic Yatra Team",
      category: body.category || "Study Abroad",
      tags: body.tags || null,
      readTime: body.readTime || "5 min read",
      isPublished: body.isPublished ?? true,
      views: body.views ?? 0,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("API POST /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}
