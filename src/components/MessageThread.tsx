"use client";
// NEW FEATURE START (v4 — MessageThread Component)
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, RefreshCw } from "lucide-react";

interface Msg {
  id: string;
  sender: "client" | "admin";
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface MessageThreadProps {
  orderId: string;
  viewerRole: "client" | "admin";
}

export default function MessageThread({ orderId, viewerRole }: MessageThreadProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setBody("");
      await fetchMessages();
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const isMe = (msg: Msg) => msg.sender === viewerRole;

  return (
    <div className="flex flex-col h-full min-h-[360px] max-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <MessageCircle size={14} className="text-gold" /> Messages
        </h3>
        <button
          onClick={fetchMessages}
          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold/15 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={12} className="text-white/50" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-white/45 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe(msg) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe(msg)
                      ? "bg-gold text-void rounded-br-sm"
                      : "bg-white/[0.08] border border-white/15 text-white/90 rounded-bl-sm"
                  }`}
                >
                  {!isMe(msg) && (
                    <p className={`text-xs font-semibold mb-1 ${isMe(msg) ? "text-white/70" : "text-gold"}`}>
                      {msg.sender === "admin" ? "Abbassa Malik" : "Client"}
                    </p>
                  )}
                  <p>{msg.body}</p>
                  <p className={`text-xs mt-1 ${isMe(msg) ? "text-void/60 text-right" : "text-white/45"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {isMe(msg) && msg.readAt && " ✓✓"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white placeholder:text-white/35"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="w-10 h-10 rounded-full bg-gold text-void flex items-center justify-center hover:bg-gold-light transition-all disabled:opacity-50 flex-shrink-0"
        >
          {sending
            ? <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
            : <Send size={14} />
          }
        </button>
      </form>
    </div>
  );
}
// NEW FEATURE END (v4)
