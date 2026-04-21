// # NEW FEATURE START - Client Dashboard
import { useState, useRef, useEffect, useCallback } from "react";
import {
  BookOpen,
  Upload,
  Image,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Package,
  ChevronRight,
  X,
  Eye,
  ArrowLeft,
  Lock,
  Mail,
  Loader2,
  Inbox,
  RefreshCw,
  MessageCircle,
  Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  plan: string;
  bookTitle: string;
  status: "pending" | "in_progress" | "completed" | "revision";
  createdAt: string;
  files: UploadedFile[];
  deliverables: Deliverable[];
  instructions: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string; // In production: secure CDN URL
  uploadedAt: string;
}

interface Deliverable {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// ─── Storage Helpers (simulated secure storage) ───────────────────────────────
const STORAGE_KEY = "abbassa_client_orders";

function loadOrders(email: string): Order[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${email}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(email: string, orders: Order[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${email}`, JSON.stringify(orders));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    pending: { label: "Pending Review", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Clock },
    in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: RefreshCw },
    completed: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle },
    revision: { label: "Revision", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: AlertCircle },
  };
  const { label, color, icon: Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (name: string, email: string) => void }) {
  const [form, setForm] = useState({ name: "", email: "", code: "" });
  const [step, setStep] = useState<"email" | "verify">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Simulate: in production use real email OTP
  const [sentCode] = useState("123456");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep("verify");
    // In production: POST /api/send-otp { email }
    console.log("OTP would be sent to:", form.email, "· Demo code: 123456");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    if (form.code !== sentCode) {
      setLoading(false);
      setError("Invalid code. Try 123456 for this demo.");
      return;
    }
    setLoading(false);
    onLogin(form.name, form.email);
  };

  return (
    <div className="min-h-screen bg-[#060b18] flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 justify-center mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="leading-none">
            <p className="font-bold text-white text-lg tracking-tight">Abbassa Malik</p>
            <p className="text-amber-400 text-[10px] font-semibold tracking-widest uppercase">Client Portal</p>
          </div>
        </a>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
          {step === "email" ? (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-amber-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-2">Client Dashboard</h1>
                <p className="text-slate-400 text-sm">Sign in to track your orders and download your files</p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Your Name</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                      placeholder="you@example.com" />
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Sending…" : "Send Verification Code →"}
                </button>
              </form>
              <p className="text-center text-slate-600 text-xs mt-5">
                🔒 Secure · No password needed · Code expires in 10 min
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("email")} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="text-xl font-extrabold text-white mb-2">Check Your Email</h2>
                <p className="text-slate-400 text-sm">
                  We sent a 6-digit code to <span className="text-white font-semibold">{form.email}</span>
                </p>
                <p className="text-amber-400 text-xs mt-2">Demo: use code <strong>123456</strong></p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <input required type="text" maxLength={6} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-mono text-center tracking-[0.5em] placeholder:text-slate-700 focus:outline-none focus:border-amber-500/40 transition-colors"
                  placeholder="······" />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Verifying…" : "Verify & Enter Dashboard →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New Order Form ───────────────────────────────────────────────────────────
function NewOrderForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (order: Omit<Order, "id" | "status" | "deliverables">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ bookTitle: "", plan: "", instructions: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    // Convert files to UploadedFile objects (in production: upload to secure storage)
    const uploadedFiles: UploadedFile[] = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f), // In production: secure CDN URL after upload
      uploadedAt: new Date().toISOString(),
    }));

    onSubmit({
      bookTitle: form.bookTitle,
      plan: form.plan,
      instructions: form.instructions,
      files: uploadedFiles,
      createdAt: new Date().toISOString(),
    });
  };

  const fmt = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0d1225] border border-white/10 rounded-3xl p-8 w-full max-w-2xl my-4 shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-extrabold text-white mb-1">Submit New Order</h2>
        <p className="text-slate-400 text-sm mb-6">Upload your book files and brief</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Book Title *</label>
              <input required type="text" value={form.bookTitle} onChange={e => setForm({ ...form, bookTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                placeholder="My Book Title" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Service Plan *</label>
              <select required value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-colors appearance-none">
                <option value="" className="bg-[#0d1225]">Select plan…</option>
                <option value="Starter — $29" className="bg-[#0d1225]">Starter — $29</option>
                <option value="Professional — $79" className="bg-[#0d1225]">Professional — $79</option>
                <option value="Publisher — $149" className="bg-[#0d1225]">Publisher — $149</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Design Brief / Instructions</label>
            <textarea rows={3} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
              placeholder="Describe your vision, genre, style preferences, colors, references…" />
          </div>

          {/* Drop Zone */}
          <div>
            <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Book Files & Images *</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-amber-500/60 bg-amber-500/5" : "border-white/10 hover:border-amber-500/30 hover:bg-white/[0.02]"}`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragOver ? "text-amber-400" : "text-slate-600"}`} />
              <p className="text-white font-semibold text-sm mb-1">Drop book images or files here</p>
              <p className="text-slate-500 text-xs">JPG, PNG, PDF, DOCX, EPUB — up to 100MB each</p>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                accept=".pdf,.doc,.docx,.epub,.jpg,.jpeg,.png,.psd,.ai,.zip" />
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
                    {f.type.startsWith("image/") ? <Image className="w-4 h-4 text-amber-400 shrink-0" /> : <FileText className="w-4 h-4 text-violet-400 shrink-0" />}
                    <span className="text-white text-sm flex-1 truncate">{f.name}</span>
                    <span className="text-slate-500 text-xs shrink-0">{fmt(f.size)}</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400 transition-colors">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={submitting || files.length === 0}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {submitting ? "Submitting…" : "Submit Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const fmt = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0d1225] border border-white/10 rounded-3xl p-8 w-full max-w-2xl my-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{order.bookTitle}</h2>
            <p className="text-slate-400 text-sm">{order.plan}</p>
          </div>
          <div className="ml-auto"><StatusBadge status={order.status} /></div>
        </div>

        {order.instructions && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Instructions</p>
            <p className="text-slate-300 text-sm leading-relaxed">{order.instructions}</p>
          </div>
        )}

        {/* Your uploaded files */}
        {order.files.length > 0 && (
          <div className="mb-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Your Files ({order.files.length})</p>
            <div className="space-y-2">
              {order.files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
                  {f.type?.startsWith("image/") ? <Image className="w-4 h-4 text-amber-400 shrink-0" /> : <FileText className="w-4 h-4 text-violet-400 shrink-0" />}
                  <span className="text-white text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-slate-500 text-xs shrink-0">{fmt(f.size)}</span>
                  <span className="text-slate-600 text-xs shrink-0">{fmtDate(f.uploadedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliverables from admin */}
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Deliverables {order.deliverables.length > 0 ? `(${order.deliverables.length})` : ""}
          </p>
          {order.deliverables.length === 0 ? (
            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Your completed files will appear here once ready</p>
            </div>
          ) : (
            <div className="space-y-2">
              {order.deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3">
                  <Download className="w-4 h-4 text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{d.name}</p>
                    <p className="text-slate-500 text-xs">{fmt(d.size)} · {fmtDate(d.uploadedAt)}</p>
                  </div>
                  <a href={d.url} download={d.name}
                    className="shrink-0 bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5">
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-slate-600 text-xs mt-5">Order ID: {order.id} · Created {fmtDate(order.createdAt)}</p>
      </div>
    </div>
  );
}


// # NEW FEATURE START - Messages / Chat (client ↔ admin)
import { clientApi, type Message as ApiMessage } from "../lib/api";

function ChatPanel({ order, userEmail, onClose }: {
  order: Order; userEmail: string; userName: string; onClose: () => void;
}) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await clientApi.getMessages(order.id, userEmail);
      setMessages(msgs);
    } catch {
      setMessages((order.messages ?? []) as unknown as ApiMessage[]);
    }
  }, [order.id, userEmail, order.messages]);

  useEffect(() => { loadMessages(); const iv = setInterval(loadMessages, 8000); return () => clearInterval(iv); }, [loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const msg = await clientApi.sendMessage(order.id, userEmail, content);
      setMessages(prev => [...prev, msg]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), orderId: order.id, clientId: "", sender: "CLIENT", content, read: false, createdAt: new Date().toISOString() }]);
    } finally { setSending(false); }
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#0d1225] border border-white/10 rounded-3xl w-full max-w-lg flex flex-col h-[80vh] max-h-[600px] shadow-2xl">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{order.bookTitle}</p>
            <p className="text-slate-500 text-xs">Messages with Abbassa Malik</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No messages yet — start the conversation!</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={"flex " + (msg.sender === "CLIENT" ? "justify-end" : "justify-start")}>
              <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 " + (msg.sender === "CLIENT" ? "bg-amber-500/20 border border-amber-500/20" : "bg-white/[0.06] border border-white/10")}>
                <p className={"text-xs font-bold mb-1 " + (msg.sender === "CLIENT" ? "text-amber-400" : "text-violet-400")}>{msg.sender === "CLIENT" ? "You" : "Abbassa Malik"}</p>
                <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                <p className="text-slate-600 text-xs mt-1">{fmtTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="px-6 py-4 border-t border-white/[0.07] shrink-0 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors"
            placeholder="Type a message…" />
          <button type="submit" disabled={sending || !input.trim()} className="bg-amber-500 hover:bg-amber-400 text-white p-3 rounded-xl transition-all disabled:opacity-50 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
// # NEW FEATURE END - Messages / Chat

// ─── Main Client Dashboard ─────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  // # NEW FEATURE START - chat state
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  // # NEW FEATURE END

  // # NEW FEATURE START - Load from DB with localStorage fallback
  const loadOrdersFromDB = useCallback(async (email: string) => {
    try {
      const dbOrders = await clientApi.getOrders(email);
      if (Array.isArray(dbOrders)) {
        const normalized = dbOrders.map((o: Record<string, unknown>) => ({
          ...o,
          status: (o.status as string).toLowerCase(),
        })) as Order[];
        setOrders(normalized);
        saveOrders(email, normalized);
        return;
      }
    } catch { /* DB unavailable */ }
    setOrders(loadOrders(email));
  }, []);
  // # NEW FEATURE END

  useEffect(() => {
    const saved = sessionStorage.getItem("abbassa_client_user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      // # NEW FEATURE START
      loadOrdersFromDB(u.email);
      // # NEW FEATURE END
    }
  }, [loadOrdersFromDB]);

  const handleLogin = (name: string, email: string) => {
    const u = { name, email };
    sessionStorage.setItem("abbassa_client_user", JSON.stringify(u));
    setUser(u);
    setOrders(loadOrders(email));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("abbassa_client_user");
    setUser(null);
    setOrders([]);
  };

  const handleNewOrder = (data: Omit<Order, "id" | "status" | "deliverables">) => {
    if (!user) return;
    const order: Order = {
      ...data,
      id: `ORD-${Date.now()}`,
      status: "pending",
      deliverables: [],
    };
    const updated = [...orders, order];
    setOrders(updated);
    saveOrders(user.email, updated);
    setShowNewOrder(false);
    setOrderCreated(true);
    setTimeout(() => setOrderCreated(false), 4000);
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    inProgress: orders.filter(o => o.status === "in_progress").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#060b18] text-white">
      {/* Background orbs */}
      <div className="fixed top-0 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 -right-32 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07091a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-white text-sm tracking-tight">Abbassa Malik</p>
              <p className="text-amber-400 text-[10px] font-semibold tracking-widest uppercase">Client Portal</p>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <User className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-white text-sm font-semibold">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Success toast */}
        {orderCreated && (
          <div className="fixed top-6 right-6 z-50 bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Order Submitted!</p>
              <p className="text-slate-400 text-xs">I'll review your files and respond within 24h.</p>
            </div>
          </div>
        )}

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Welcome back, {user.name} 👋</h1>
            <p className="text-slate-400 text-sm mt-1">Track your orders and download completed files</p>
          </div>
          <button onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 whitespace-nowrap">
            <Upload className="w-4 h-4" />
            New Order
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, color: "text-white", bg: "bg-white/[0.03]", border: "border-white/[0.07]" },
            { label: "Pending", value: stats.pending, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
            { label: "In Progress", value: stats.inProgress, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
            { label: "Completed", value: stats.completed, color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4`}>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.07] flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold">Your Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">No orders yet</h3>
              <p className="text-slate-500 text-sm mb-6">Submit your first order to get started</p>
              <button onClick={() => setShowNewOrder(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-all hover:shadow-lg hover:shadow-amber-500/30">
                <Upload className="w-4 h-4" />
                Submit Your First Order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {orders.map(order => (
                <button key={order.id} onClick={() => setSelectedOrder(order)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors text-left group">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{order.bookTitle}</p>
                    <p className="text-slate-500 text-xs">{order.plan} · {fmtDate(order.createdAt)}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {order.deliverables.length > 0 && (
                      <span className="text-green-400 text-xs font-bold bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
                        {order.deliverables.length} file{order.deliverables.length > 1 ? "s" : ""} ready
                      </span>
                    )}
                    {/* # NEW FEATURE START - message button */}
                    <button
                      onClick={e => { e.stopPropagation(); setChatOrder(order); }}
                      className="flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors text-xs border border-white/10 hover:border-amber-500/30 rounded-lg px-2.5 py-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Chat</span>
                    </button>
                    {/* # NEW FEATURE END */}
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Back link */}
        <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mt-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to main site
        </a>
      </main>

      {showNewOrder && <NewOrderForm onSubmit={handleNewOrder} onCancel={() => setShowNewOrder(false)} />}
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}
// # NEW FEATURE END - Client Dashboard
