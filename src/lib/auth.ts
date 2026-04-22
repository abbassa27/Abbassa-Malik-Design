// src/lib/auth.ts
// NEW FEATURE START (v3 — Dashboard Auth)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-prod";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "abbassamalik";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

function useDevPassword(): boolean {
  return !ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH.includes("placeholder");
}

/** When no bcrypt hash: allow ADMIN_USERNAME plus common legacy aliases so local login matches the on-screen hint. */
function devUsernameOk(username: string): boolean {
  const u = username.trim();
  if (u === ADMIN_USERNAME.trim()) return true;
  if (u === "abbassa" || u === "abbassamalik") return true;
  return false;
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (useDevPassword()) {
    return password === "admin123" && devUsernameOk(username);
  }

  if (username.trim() !== ADMIN_USERNAME.trim()) return false;

  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return jwt.sign(
    { admin: true, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
// أضف الدالة الجديدة هنا:
export function verifyAdminToken(token: string): boolean {
  return verifyToken(token);
}
// NEW FEATURE END (v3)
