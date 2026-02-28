"use client";

import { useState } from "react";
import Link from "next/link";
import cardsData from "../cards.json";

type Card = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  unlocked: boolean;
  history?: string;
};

export default function CardsPage() {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const cards = cardsData.cards as Card[];

  const rarityOrder: Record<string, number> = {
    "Ultra Rare": 0,
    Rare: 1,
    Common: 2,
  };

  const sortedCards = [...cards].sort((a, b) => {
    const rarityDiff = (rarityOrder[a.rarity] ?? 99) - (rarityOrder[b.rarity] ?? 99);
    if (rarityDiff !== 0) return rarityDiff;
    return a.name.localeCompare(b.name);
  });
  const visibleCards = sortedCards.filter((card) => card.unlocked);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#5a2d72_0%,#3b1f4f_45%,#2a1733_70%,#22180f_100%)] px-4 pb-28 pt-8 text-[#f8e9c6]">
      <section className="mx-auto w-full max-w-xl">
        <h1 className="text-center text-3xl font-extrabold text-[#ffe8b8]">
          My Cowgirls
        </h1>
        <p className="mt-2 text-center text-sm text-[#efd8b0]">
          Click on each of your cowgirls to view their history and unlock more details about their legendary exploits across the Wild West!
        </p>

        {visibleCards.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[#efd8b0]">
            No unlocked cards yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() =>
                setFlippedCardId((current) =>
                  current === card.id ? null : card.id,
                )
              }
              className="w-full text-left"
              style={{ perspective: "1200px" }}
            >
              <div
                className="relative min-h-[250px] transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform:
                    flippedCardId === card.id ? "rotateY(180deg)" : "none",
                }}
              >
                <article
                  className={`absolute inset-0 rounded-xl border p-4 shadow-[0_12px_30px_rgba(20,8,4,0.45)] transition ${
                    card.unlocked
                      ? "border-[#f0c67a]/40 bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)]"
                      : "border-white/15 bg-[linear-gradient(165deg,rgba(90,90,90,0.8)_0%,rgba(70,70,70,0.88)_45%,rgba(45,45,45,0.92)_100%)] grayscale"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold">{card.name}</h2>
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs font-semibold">
                      {card.unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#f4cd84]">
                    {card.rarity} • {card.type}
                  </p>
                  <p className="mt-3 text-sm text-[#efd8b0]">
                    {card.description}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4cd84]">
                    Click to view history
                  </p>
                </article>

                <article
                  className={`absolute inset-0 rounded-xl border p-4 shadow-[0_12px_30px_rgba(20,8,4,0.45)] transition ${
                    card.unlocked
                      ? "border-[#f0c67a]/40 bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)]"
                      : "border-white/15 bg-[linear-gradient(165deg,rgba(90,90,90,0.8)_0%,rgba(70,70,70,0.88)_45%,rgba(45,45,45,0.92)_100%)] grayscale"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <h3 className="text-lg font-bold text-[#ffe8b8]">
                    {card.name} History
                  </h3>
                  <p className="mt-3 text-sm text-[#efd8b0]">
                    {card.history ??
                      "This outlaw's legend spread across saloons and frontier towns, earning a feared reputation that still echoes through the West."}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4cd84]">
                    Click to flip back
                  </p>
                </article>
              </div>
            </button>
            ))}
          </div>
        )}
      </section>

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
            className="rounded-xl border border-[#ffe3a8] bg-[linear-gradient(180deg,#f8d787_0%,#d9aa49_100%)] px-2 py-3 text-center text-sm font-extrabold text-[#4f3018] shadow-[0_0_18px_rgba(237,185,84,0.35)] hover:brightness-105"
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
            className="rounded-xl border border-[#c49558]/25 bg-[#5d3824] px-2 py-2 text-center text-sm font-medium text-[#f7dfb3] hover:bg-[#6d4430]"
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
    </main>
  );
}
