"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";

type ChatMessage = {
    id: string;
    author: "me" | "other";
    text: string;
    time?: string;
};

const CHANNELS = ["Global", "Guild", "Trade", "Support"];

export default function ChatPage() {
    // Replace these with your real user/game state later
    const username = "Username";
    const gold = 12345;

    const [channel, setChannel] = useState(CHANNELS[0]);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "1", author: "other", text: "Howdy, partner" },
        { id: "2", author: "me", text: "Yo! Anyone pulling on the new banner?" },
        { id: "3", author: "other", text: "Saving my gold for the next rotation." },
    ]);

    const listRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom on new message
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
            {/* Optional background image overlay */}
            <div className="absolute inset-0 bg-[url('/western-bg.jpg')] bg-cover bg-center opacity-15 pointer-events-none" />

            <div className="relative flex min-h-screen flex-col">
                {/* TOP BAR */}
                <header className="w-full border-b border-amber-900/30 bg-white/70 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                        <div className="font-semibold text-amber-900">{username}</div>

                        <div className="flex items-center gap-2">
                            {/* swap to your logo if you want */}
                            <img
                                src="/araara-logo.png"
                                alt="AraAra Alliance"
                                className="h-10 w-auto"
                            />
                        </div>

                        <div className="font-semibold text-amber-900">
                            Gold: <span className="tabular-nums">{gold.toLocaleString()}</span>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24">
                    {/* Chat panel container */}
                    <section className="mx-auto max-w-3xl rounded-2xl border-4 border-amber-700 bg-white/90 shadow-2xl backdrop-blur-sm">
                        {/* Channel dropdown header */}
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

                        {/* Messages area */}
                        <div
                            ref={listRef}
                            className="h-[420px] overflow-y-auto px-4 py-4"
                        >
                            <div className="flex flex-col gap-3">
                                {messages.map((m) => (
                                    <MessageRow key={m.id} msg={m} />
                                ))}
                            </div>
                        </div>

                        {/* Input box area */}
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

                <nav className="fixed inset-x-0 bottom-0 px-4 pb-6">
                    <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-2 rounded-2xl border border-[#f0c779]/25 bg-[linear-gradient(180deg,rgba(90,53,30,0.95)_0%,rgba(65,35,20,0.95)_100%)] p-3 shadow-[0_10px_35px_rgba(20,8,4,0.55)] backdrop-blur">
                        <Link
                            href="/home"
                            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
                        >
                            Home
                        </Link>
                        <Link
                            href="/cards"
                            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
                        >
                            Card
                        </Link>
                        <Link
                            href="/summon"
                            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
                        >
                            Summon
                        </Link>
                        <Link
                            href="/chat"
                            className="rounded-xl border border-[#ffe3a8] bg-[linear-gradient(180deg,#f8d787_0%,#d9aa49_100%)] px-2 py-3 text-center text-sm font-extrabold text-[#4f3018] shadow-[0_0_18px_rgba(237,185,84,0.35)] hover:brightness-105"
                        >
                            Chat
                        </Link>
                        <Link
                            href="/shop"
                            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
                        >
                            Shop
                        </Link>
                    </div>
                </nav>
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
                    isMe
                        ? "bg-amber-700 text-white border-amber-800"
                        : "bg-white text-amber-950 border-amber-300",
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
