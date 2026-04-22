// NEW FEATURE START (v4 — File Upload with Prisma logging)
import { NextRequest, NextResponse } from "next/server";
import { getOrderById, addClientFile, addAdminFile, logEvent } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs";

const MAX_SIZE_MB = 50;
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/epub+zip",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
];

function getOrderUploadDir(orderId: string): string {
  const UPLOAD_DIR = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve("./uploads");
  const dir = path.join(UPLOAD_DIR, orderId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const isAdmin = !!adminToken && !!verifyAdminToken(adminToken);

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = getOrderUploadDir(orderId);
    const savedFiles = [];

    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds ${MAX_SIZE_MB}MB limit` }, { status: 413 });
      }
      if (!ALLOWED_MIME.includes(file.type)) {
        return NextResponse.json({ error: `File type ${file.type} is not allowed` }, { status: 415 });
      }

      const ext = path.extname(file.name).toLowerCase();
      const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

      const fileData = { filename: file.name, storedAs: safeName, size: file.size, mimeType: file.type };

      if (isAdmin) {
        await addAdminFile(orderId, fileData);
        await logEvent(orderId, "admin_uploaded", "admin", { filename: file.name, size: file.size });
      } else {
        await addClientFile(orderId, fileData);
        await logEvent(orderId, "client_uploaded", "client", { filename: file.name, size: file.size });
      }

      savedFiles.push({ filename: file.name, storedAs: safeName });
    }

    return NextResponse.json({ success: true, files: savedFiles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
// NEW FEATURE END (v4)
