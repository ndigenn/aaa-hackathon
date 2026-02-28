"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";

type ChatMessage = {
  id: string;
  author: "me" | "other";
  text: string;
  time?: string;
};

const CHANNELS = ["Global", "Guild", "Trade", "Support"];

type ChatPageClientProps = {
  username: string;
  coins: number;
};

export default function ChatPageClient({ username, coins }: ChatPageClientProps) {

  const [channel, setChannel] = useState(CHANNELS[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", author: "other", text: "Howdy, partner" },
    { id: "2", author: "me", text: "Yo! Anyone pulling on the new banner?" },
    { id: "3", author: "other", text: "Saving my gold for the next rotation." },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  function sendMessage() {
    if (!canSend) return;
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      author: "me",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-amber-400 to-yellow-600">
      <div className="absolute inset-0 bg-[url('/western-bg.jpg')] bg-cover bg-center opacity-15 pointer-events-none" />

      <div className="relative flex min-h-screen flex-col">
        <AppTopNav username={username} coins={coins} />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-28">
          <section className="mx-auto max-w-3xl rounded-2xl border-4 border-amber-700 bg-white/90 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-amber-700/30 px-4 py-3">
              <div className="font-semibold text-amber-900">Chat</div>

              <label className="flex items-center gap-2 text-sm text-amber-900">
                <span className="opacity-80">Channel</span>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="rounded-lg border border-amber-500 bg-white px-3 py-2 text-amber-900 outline-none focus:ring-2 focus:ring-amber-600"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div ref={listRef} className="h-[420px] overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <MessageRow key={m.id} msg={m} />
                ))}
              </div>
            </div>

            <div className="border-t border-amber-700/30 px-4 py-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={`Message ${channel}...`}
                  className="w-full rounded-lg border border-amber-500 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-amber-600"
                />
                <button
                  onClick={sendMessage}
                  disabled={!canSend}
                  className="rounded-lg bg-amber-700 px-4 py-3 font-bold text-white shadow-md transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </main>

        <BottomNav activeHref="/chat" />
      </div>
    </div>
  );
}

function MessageRow({ msg }: { msg: ChatMessage }) {
  const isMe = msg.author === "me";

  return (
    <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-amber-300 border border-amber-600" />
      )}

      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm border",
          isMe ? "bg-amber-700 text-white border-amber-800" : "bg-white text-amber-950 border-amber-300",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
      </div>

      {isMe && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-amber-900 border border-amber-950" />
      )}
    </div>
  );
}
