import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!validMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file format. Please upload JPG, PNG, WEBP, GIF, or SVG images.",
        },
        { status: 400 }
      );
    }

    // Maximum file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 10MB limit. Please choose a smaller image.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename & create unique filename
    const originalExt = path.extname(file.name) || ".png";
    const cleanBaseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `${cleanBaseName || "article-image"}-${uniqueId}${originalExt.toLowerCase()}`;

    // 1. Save to admin panel public/uploads
    const adminUploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(adminUploadDir)) {
      await fs.mkdir(adminUploadDir, { recursive: true });
    }
    const adminFilePath = path.join(adminUploadDir, finalFilename);
    await fs.writeFile(adminFilePath, buffer);

    // 2. Also mirror copy to main academic-yatra-web public/uploads if sibling folder exists
    try {
      const webPublicDir = path.join(process.cwd(), "..", "academic-yatra-web", "public");
      if (existsSync(webPublicDir)) {
        const webUploadDir = path.join(webPublicDir, "uploads");
        if (!existsSync(webUploadDir)) {
          await fs.mkdir(webUploadDir, { recursive: true });
        }
        await fs.writeFile(path.join(webUploadDir, finalFilename), buffer);
      }
    } catch (mirrorErr) {
      console.warn("Could not mirror image to web project:", mirrorErr);
    }

    // Public URL path
    const fileUrl = `/uploads/${finalFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: finalFilename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Image upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload image. Please try again.",
      },
      { status: 500 }
    );
  }
}
