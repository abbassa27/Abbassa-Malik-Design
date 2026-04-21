// NEW FEATURE START (v3 — Dashboard Storage)
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve("./uploads");

const ORDERS_FILE = path.join(UPLOAD_DIR, "_orders.json");

export interface OrderFile {
  id: string;       // uuid
  filename: string; // original name
  storedAs: string; // name on disk
  size: number;
  uploadedAt: string;
  uploadedBy: "client" | "admin";
  mimeType: string;
}

export interface Order {
  id: string;
  plan: string;
  amount: string;
  authorName: string;
  bookTitle: string;
  genre: string;
  email: string;
  synopsis: string;
  instructions: string;
  status: "pending" | "in_progress" | "completed" | "delivered";
  createdAt: string;
  updatedAt: string;
  files: OrderFile[];         // client uploads
  deliverables: OrderFile[];  // admin uploads
  adminNotes: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readOrders(): Order[] {
  ensureDir(UPLOAD_DIR);
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")) as Order[];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  ensureDir(UPLOAD_DIR);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function getAllOrders(): Order[] {
  return readOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | null {
  return readOrders().find((o) => o.id === id) || null;
}

export function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt" | "files" | "deliverables" | "status" | "adminNotes">): Order {
  const orders = readOrders();
  const order: Order = {
    ...data,
    id: uuidv4(),
    status: "pending",
    files: [],
    deliverables: [],
    adminNotes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  writeOrders(orders);
  return order;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() };
  writeOrders(orders);
  return orders[idx];
}

export function addFileToOrder(
  orderId: string,
  file: Omit<OrderFile, "id" | "uploadedAt">,
  type: "client" | "admin"
): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  const fileRecord: OrderFile = {
    ...file,
    id: uuidv4(),
    uploadedAt: new Date().toISOString(),
    uploadedBy: type,
  };

  if (type === "client") {
    orders[idx].files.push(fileRecord);
  } else {
    orders[idx].deliverables.push(fileRecord);
  }
  orders[idx].updatedAt = new Date().toISOString();
  writeOrders(orders);
  return orders[idx];
}

export function getOrderUploadDir(orderId: string): string {
  const dir = path.join(UPLOAD_DIR, orderId);
  ensureDir(dir);
  return dir;
}

export function getUploadDir(): string {
  ensureDir(UPLOAD_DIR);
  return UPLOAD_DIR;
}
// NEW FEATURE END (v3)
