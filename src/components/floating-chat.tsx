"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  text: "Hi! Have a question about finding training or listing your business? Send a message and we'll get back to you.",
};

/** No real model behind this — a lightweight keyword match so the reply at
 * least points somewhere useful, then a generic hand-off line either way. */
function getAutoReply(message: string): string {
  const m = message.toLowerCase();
  if (/price|pricing|cost|fee|subscription/.test(m)) {
    return "Our Standard and Premium tiers start from £24/month, and vetting is included either way — see the full breakdown on the Pricing page. A member of the team will follow up here with any specifics.";
  }
  if (/list|apply|sign up|become a trainer/.test(m)) {
    return "Listing your training is free until you're approved — head to “List your training” to get started. We'll check your insurance and qualifications and follow up here.";
  }
  if (/find|search|trainer|course|near me|location/.test(m)) {
    return "You can browse every vetted trainer on the Find training page — filter by specialism, location and rating. Let us know what you're after and we'll point you in the right direction.";
  }
  return "Thanks for reaching out — this is a demo assistant, so a real member of the team will get back to you here within one working day.";
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    const delay = 700 + Math.random() * 600;
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: getAutoReply(text) }]);
      setTyping(false);
    }, delay);
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(520px,calc(100dvh-7.5rem))] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-card border border-linen bg-paper shadow-e2 animate-[chatPanelIn_220ms_cubic-bezier(0.22,1,0.36,1)]">
          {/* Header */}
          <div className="border-b border-linen bg-ink px-5 py-4 text-ivory">
            <p className="font-display text-title">Chat with us</p>
            <p className="mt-0.5 text-micro text-ivory/70">
              Usually replies within a day
            </p>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-small leading-relaxed",
                  msg.role === "user"
                    ? "self-end bg-ink text-ivory"
                    : "self-start bg-linen text-ink-soft",
                )}
              >
                {msg.text}
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-1 self-start rounded-2xl bg-linen px-4 py-3">
                <span className="h-1.5 w-1.5 animate-[chatDot_1.2s_ease-in-out_infinite] rounded-full bg-stone" />
                <span className="h-1.5 w-1.5 animate-[chatDot_1.2s_ease-in-out_infinite] rounded-full bg-stone [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-[chatDot_1.2s_ease-in-out_infinite] rounded-full bg-stone [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-linen p-3">
            <label htmlFor="floating-chat-input" className="sr-only">
              Message
            </label>
            <input
              id="floating-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type a message…"
              className="h-11 flex-1 rounded-full border border-linen bg-ivory px-4 text-small text-ink placeholder:text-stone transition-colors focus:outline-none focus-visible:border-stone"
            />
            <button
              onClick={send}
              aria-label="Send message"
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-[#35342c] disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory shadow-e2 transition-colors hover:bg-[#35342c]"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
