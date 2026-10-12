import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  author: string;
  category: string;
  tags: string | null;
  readTime: string | null;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "blogs.json");

// Read from JSON file
function readBlogsFromFile(): BlogPost[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading blogs file:", err);
    return [];
  }
}

// Write to JSON file
function writeBlogsToFile(blogs: BlogPost[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing blogs file:", err);
  }
}

// Check if MySQL is currently responsive
let isMySqlAvailable: boolean | null = null;
let lastCheckTime = 0;

async function checkMySql(): Promise<boolean> {
  const now = Date.now();
  if (isMySqlAvailable !== null && now - lastCheckTime < 10000) {
    return isMySqlAvailable;
  }
  try {
    // Quick test query with timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      ),
    ]);
    isMySqlAvailable = true;
  } catch {
    isMySqlAvailable = false;
  }
  lastCheckTime = now;
  return isMySqlAvailable;
}

export async function getBlogs(): Promise<BlogPost[]> {
  const hasDb = await checkMySql();
  if (hasDb) {
    try {
      const records = await prisma.blog.findMany({
        orderBy: { createdAt: "desc" },
      });
      return records.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("Falling back to local file store:", e);
    }
  }
  const blogs = readBlogsFromFile();
  return blogs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const hasDb = await checkMySql();
  if (hasDb) {
    try {
      const r = await prisma.blog.findUnique({ where: { id } });
      if (r) {
        return {
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Falling back to file store for blog:", e);
    }
  }
  const blogs = readBlogsFromFile();
  return blogs.find((b) => b.id === id) || null;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const hasDb = await checkMySql();
  if (hasDb) {
    try {
      const r = await prisma.blog.findUnique({ where: { slug } });
      if (r) {
        return {
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Falling back to file store for blog:", e);
    }
  }
  const blogs = readBlogsFromFile();
  return blogs.find((b) => b.slug === slug) || null;
}

export async function createBlog(
  input: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "views"> & {
    views?: number;
  }
): Promise<BlogPost> {
  const id = `blog-${Date.now()}`;
  const now = new Date().toISOString();
  const newBlog: BlogPost = {
    id,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    content: input.content,
    coverImage: input.coverImage || null,
    author: input.author || "Academic Yatra Team",
    category: input.category || "Study Abroad",
    tags: input.tags || null,
    readTime: input.readTime || "5 min read",
    isPublished: input.isPublished ?? true,
    views: input.views ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  const hasDb = await checkMySql();
  if (hasDb) {
    try {
      const created = await prisma.blog.create({
        data: {
          title: newBlog.title,
          slug: newBlog.slug,
          excerpt: newBlog.excerpt,
          content: newBlog.content,
          coverImage: newBlog.coverImage,
          author: newBlog.author,
          category: newBlog.category,
          tags: newBlog.tags,
          readTime: newBlog.readTime,
          isPublished: newBlog.isPublished,
          views: newBlog.views,
        },
      });
      // also keep local file in sync
      const blogs = readBlogsFromFile();
      writeBlogsToFile([newBlog, ...blogs]);
      return {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("DB insert failed, saving to file:", e);
    }
  }

  const blogs = readBlogsFromFile();
  // Ensure slug uniqueness
  if (blogs.some((b) => b.slug === newBlog.slug)) {
    newBlog.slug = `${newBlog.slug}-${Date.now().toString().slice(-4)}`;
  }
  const updated = [newBlog, ...blogs];
  writeBlogsToFile(updated);
  return newBlog;
}

export async function updateBlog(
  id: string,
  input: Partial<BlogPost>
): Promise<BlogPost | null> {
  const hasDb = await checkMySql();
  if (hasDb) {
    try {
      const updated = await prisma.blog.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
          ...(input.content !== undefined && { content: input.content }),
          ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
          ...(input.author !== undefined && { author: input.author }),
          ...(input.category !== undefined && { category: input.category }),
          ...(input.tags !== undefined && { tags: input.tags }),
          ...(input.readTime !== undefined && { readTime: input.readTime }),
          ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
          ...(input.views !== undefined && { views: input.views }),
        },
      });
      // Also sync file
      const blogs = readBlogsFromFile();
      const idx = blogs.findIndex((b) => b.id === id);
      if (idx !== -1) {
        blogs[idx] = {
          ...blogs[idx],
          ...input,
          updatedAt: updated.updatedAt.toISOString(),
        };
        writeBlogsToFile(blogs);
      }
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("DB update failed, saving to file:", e);
    }
  }

  const blogs = readBlogsFromFile();
  const index = blogs.findIndex((b) => b.id === id);
  if (index === -1) return null;

  blogs[index] = {
    ...blogs[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  writeBlogsToFile(blogs);
  return blogs[index];
}

export async function deleteBlog(id: string): Promise<boolean> {
  const hasDb = await checkMySql();
  if (hasDb) {
    try {
      await prisma.blog.delete({ where: { id } });
    } catch (e) {
      console.warn("DB delete failed, proceeding with file deletion:", e);
    }
  }

  const blogs = readBlogsFromFile();
  const filtered = blogs.filter((b) => b.id !== id);
  if (filtered.length !== blogs.length) {
    writeBlogsToFile(filtered);
    return true;
  }
  return false;
}

export async function togglePublishBlog(id: string): Promise<BlogPost | null> {
  const current = await getBlogById(id);
  if (!current) return null;
  return updateBlog(id, { isPublished: !current.isPublished });
}
