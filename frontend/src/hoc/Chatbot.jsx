import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const WEBHOOK_URL = "https://csoni0822.app.n8n.cloud/webhook-test/hostel-chatbot";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", from: "bot", text: "Hi! 👋 How can I help you today?" },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages, loading]);

  const rid = () =>
    (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

  const safeJSON = (val) => {
    if (typeof val !== "string") return null;
    const s = val.trim();
    if (!s.startsWith("{") && !s.startsWith("[")) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const extractN8nPayload = (raw) => {
    if (Array.isArray(raw) && raw.length) {
      const item = raw[0];
      if (item && typeof item === "object") {
        if (item.json) return item.json;
        if (item.data) return item.data;
        return item;
      }
      if (typeof item === "string") return item;
    }

    if (raw && typeof raw === "object") {
      if (raw.body) return raw.body;
      if (raw.data !== undefined) {
        const maybeParsed = typeof raw.data === "string" ? safeJSON(raw.data) : null;
        return maybeParsed ?? raw.data;
      }
      return raw;
    }

    if (typeof raw === "string") {
      const maybe = safeJSON(raw);
      return maybe ?? raw;
    }

    return raw;
  };

  const normalizeBotPayload = (raw) => {
    const payload = extractN8nPayload(raw);

    if (typeof payload === "string") {
      return { replies: [payload], suggestions: [] };
    }

    if (Array.isArray(payload) && payload.every((x) => typeof x === "string")) {
      return { replies: payload, suggestions: [] };
    }

    if (payload && typeof payload === "object") {
      if (payload.json && typeof payload.json === "object") {
        return normalizeBotPayload(payload.json);
      }

      const reply =
        payload.reply ??
        payload.output ??
        payload.message ??
        payload.text ??
        null;

      const replies =
        payload.replies && Array.isArray(payload.replies)
          ? payload.replies
          : reply
          ? [String(reply)]
          : [];

      const sugs =
        Array.isArray(payload.suggestions) ? payload.suggestions.filter(Boolean) : [];

      if (!replies.length && Array.isArray(payload.messages)) {
        return { replies: payload.messages.map(String), suggestions: sugs };
      }

      if (replies.length) return { replies: replies.map(String), suggestions: sugs };
    }

    return {
      replies: ["Hmm… I couldn't read the response. Please try again."],
      suggestions: [],
    };
  };

  const sendToWebhook = async (text) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const body = {
      query: text,
      history: messages
        .slice(-15)
        .map((m) => ({ id: m.id, from: m.from, text: m.text })),
      meta: { source: "hostelhub-widget", ts: Date.now() },
    };

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    clearTimeout(timeout);

    try {
      return await res.json();
    } catch {
      const txt = await res.text();
      return safeJSON(txt) ?? txt;
    }
  };

  const sendMessage = async (prefill) => {
    const text = (prefill ?? input).trim();
    if (!text || loading) return;

    const userMsg = { id: rid(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    if (!prefill) setInput("");
    setLoading(true);

    try {
      const raw = await sendToWebhook(text);
      const { replies, suggestions: sugs } = normalizeBotPayload(raw);

      for (const reply of replies) {
        await new Promise((res) => setTimeout(res, 300)); 
        setMessages((prev) => [...prev, { id: rid(), from: "bot", text: reply }]);
      }

      setSuggestions(sugs?.slice(0, 6) ?? []);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          from: "bot",
          text: "Network issue ya server busy hai. Thodi der baad try karein. ❗",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed bottom-24 z-50 left-6 w-80 h-96 bg-background border border-border/60 shadow-xl rounded-xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between bg-primary/10 p-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Chat with us</h2>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Window */}
            <div
              ref={ref}
              className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2 text-sm"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
              `}</style>

              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-3 py-2 rounded-2xl shadow-sm whitespace-pre-wrap",
                      m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60"
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="text-xs text-muted-foreground animate-pulse">
                  Bot is typing...
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="px-2 pb-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2 py-1 rounded-full border border-border/60 hover:bg-muted/60"
                    disabled={loading}
                    title="Tap to send"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-border/60 p-2 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 z-50 left-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </>
  );
};

export default Chatbot;
