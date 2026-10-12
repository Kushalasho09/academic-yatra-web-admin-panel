import { NextRequest, NextResponse } from "next/server";
import { getBlogById, updateBlog, deleteBlog } from "@/lib/blogService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blog = await getBlogById(params.id);
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateBlog(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Blog not found or could not be updated" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ok = await deleteBlog(params.id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete blog" },
      { status: 500 }
    );
  }
}
