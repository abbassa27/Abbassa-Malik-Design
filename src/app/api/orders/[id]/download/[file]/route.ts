// NEW FEATURE START (v3 — Secure File Download)
import { NextRequest, NextResponse } from "next/server";
import { getOrderById, getOrderUploadDir } from "@/lib/storage";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; file: string } }
) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const isAdmin = !!adminToken && !!verifyAdminToken(adminToken);

  const order = getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Clients can only download deliverables; admins can download everything
  const allFiles = isAdmin
    ? [...order.files, ...order.deliverables]
    : order.deliverables;

  const fileRecord = allFiles.find((f) => f.storedAs === params.file);
  if (!fileRecord) {
    return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
  }

  // Prevent path traversal
  const uploadDir = getOrderUploadDir(params.id);
  const filePath = path.resolve(path.join(uploadDir, params.file));
  if (!filePath.startsWith(path.resolve(uploadDir))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File missing on server" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": fileRecord.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileRecord.filename}"`,
      "Content-Length": String(fileRecord.size),
    },
  });
}
// NEW FEATURE END (v3)
