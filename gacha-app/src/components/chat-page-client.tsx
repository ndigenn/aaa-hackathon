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

type OwnedCardOption = {
  id: string;
  name: string;
};

type ChatPageClientProps = {
  username: string;
  coins: number;
  ownedCards: OwnedCardOption[];
};

function createStarterMessages(cardName: string): ChatMessage[] {
  return [
    { id: `${cardName}-1`, author: "other", text: `Howdy, partner. ${cardName} reporting in.` },
    { id: `${cardName}-2`, author: "other", text: "What are we ridin' into next?" },
  ];
}

export default function ChatPageClient({ username, coins, ownedCards }: ChatPageClientProps) {
  const [selectedCardId, setSelectedCardId] = useState(ownedCards[0]?.id ?? "");
  const selectedCard = useMemo(
    () => ownedCards.find((card) => card.id === selectedCardId) ?? null,
    [ownedCards, selectedCardId],
  );
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    ...createStarterMessages(ownedCards[0]?.name ?? "Your card"),
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedCardId((current) => {
      if (current && ownedCards.some((card) => card.id === current)) return current;
      return ownedCards[0]?.id ?? "";
    });
  }, [ownedCards]);

  useEffect(() => {
    if (!selectedCard) {
      setMessages([]);
      return;
    }

    setMessages(createStarterMessages(selectedCard.name));
  }, [selectedCard]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0 && Boolean(selectedCard), [input, selectedCard]);

  async function sendMessage() {
    if (!canSend || isSending || !selectedCard) return;
    const messageText = input.trim();
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      author: "me",
      text: messageText,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardName: selectedCard.name,
          channel: selectedCard.name,
          message: messageText,
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };
      const reply = payload.reply;

      if (!response.ok || !reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            author: "other",
            text: payload.error ?? "Could not get a response right now.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          author: "other",
          text: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          author: "other",
          text: "Network issue. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/1on1.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,6,0.38)_0%,rgba(20,10,8,0.5)_45%,rgba(25,14,9,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(14,8,6,0.6)_0%,rgba(14,8,6,0)_100%)]" />

      <div className="relative flex min-h-screen flex-col">
        <AppTopNav username={username} coins={coins} className="pt-2" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-32">
          <section className="mx-auto max-w-4xl rounded-[26px] border-2 border-[#f0c67a]/60 bg-[linear-gradient(165deg,rgba(52,29,18,0.86)_0%,rgba(42,24,15,0.9)_50%,rgba(33,20,12,0.94)_100%)] shadow-[0_22px_55px_rgba(18,8,5,0.6)] backdrop-blur-[2px]">
            <div className="flex items-center justify-between border-b border-[#f0c67a]/35 px-4 py-3">
              <div className="font-extrabold uppercase tracking-[0.12em] text-[#f9dfa8]">Saloon Chat</div>

              <label className="flex items-center gap-2 text-sm text-[#f4d4a0]">
                <span className="opacity-90">Card</span>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  disabled={ownedCards.length === 0}
                  className="rounded-lg border border-[#f0c67a]/65 bg-[#2f1a11]/90 px-3 py-2 text-[#ffe7b9] outline-none focus:ring-2 focus:ring-[#d7a744]"
                >
                  {ownedCards.length === 0 ? (
                    <option value="">No owned cards</option>
                  ) : (
                    ownedCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

            <div ref={listRef} className="h-[340px] overflow-y-auto bg-[linear-gradient(180deg,rgba(25,14,9,0.38)_0%,rgba(25,14,9,0.2)_100%)] px-4 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <MessageRow key={m.id} msg={m} />
                ))}
              </div>
            </div>

            <div className="border-t border-[#f0c67a]/35 px-4 py-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={selectedCard ? `Message ${selectedCard.name}...` : "Own a card to start chatting..."}
                  disabled={!selectedCard}
                  className="w-full rounded-lg border border-[#f0c67a]/60 bg-[#2f1a11]/90 px-3 py-3 text-[#f8e9c6] placeholder:text-[#d5b98a] outline-none focus:ring-2 focus:ring-[#d7a744]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!canSend || isSending}
                  className="rounded-lg border border-[#ffe2a0]/80 bg-[linear-gradient(180deg,#ffdc8f_0%,#d7a744_100%)] px-4 py-3 font-extrabold uppercase tracking-[0.05em] text-[#4a2a16] shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? "Sending..." : "Send"}
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
      {!isMe && <div className="h-8 w-8 shrink-0 rounded-full border border-[#f0c67a]/70 bg-[#a66b2e]" />}

      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm border",
          isMe
            ? "border-[#d7a744] bg-[linear-gradient(180deg,#6a3f20_0%,#512d17_100%)] text-[#ffeac2]"
            : "border-[#f0c67a]/60 bg-[linear-gradient(180deg,#f3d197_0%,#e6bb73_100%)] text-[#3d210f]",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
      </div>

      {isMe && <div className="h-8 w-8 shrink-0 rounded-full border border-[#d7a744] bg-[#4a2a16]" />}
    </div>
  );
}
