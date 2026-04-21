// src/lib/auth.ts
// NEW FEATURE START (v3 — Dashboard Auth)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-prod";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "abbassamalik";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  // Check username first
  if (username !== ADMIN_USERNAME) return false;

  // If no hash configured, use default dev password
  if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH.includes("placeholder")) {
    return password === "admin123";
  }

  // Compare with bcrypt hash
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
// NEW FEATURE END (v3)
