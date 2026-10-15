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

    const fileType = file.type.toLowerCase();
    if (!validMimeTypes.includes(fileType)) {
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

    // Generate Base64 Data URL
    // This works 100% reliably on Vercel, serverless, and local environments
    // without requiring read-only filesystem writes or external cloud storage!
    const base64DataUrl = `data:${fileType};base64,${buffer.toString("base64")}`;

    // Clean unique filename
    const originalExt = path.extname(file.name) || ".png";
    const cleanBaseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `${cleanBaseName || "article-image"}-${uniqueId}${originalExt.toLowerCase()}`;

    // Best-effort local file write (only if running locally in writable environment)
    if (process.env.NODE_ENV === "development") {
      try {
        const adminUploadDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(adminUploadDir)) {
          await fs.mkdir(adminUploadDir, { recursive: true });
        }
        await fs.writeFile(path.join(adminUploadDir, finalFilename), buffer);

        // Also mirror copy to sibling academic-yatra-web public/uploads if present
        const webPublicDir = path.join(process.cwd(), "..", "academic-yatra-web", "public");
        if (existsSync(webPublicDir)) {
          const webUploadDir = path.join(webPublicDir, "uploads");
          if (!existsSync(webUploadDir)) {
            await fs.mkdir(webUploadDir, { recursive: true });
          }
          await fs.writeFile(path.join(webUploadDir, finalFilename), buffer);
        }
      } catch (fsErr) {
        // Silently catch and ignore any serverless/read-only filesystem errors
        console.warn("Local disk write skipped (read-only environment):", fsErr);
      }
    }

    // Return the portable Base64 Data URL
    return NextResponse.json({
      success: true,
      url: base64DataUrl,
      filename: finalFilename,
      size: file.size,
      mimeType: fileType,
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
