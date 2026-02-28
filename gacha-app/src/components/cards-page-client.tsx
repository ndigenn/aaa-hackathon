"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import cardsData from "../../src/app/cards.json";
import BottomNav from "@/components/bottom-nav";
import AppTopNav from "@/components/app-top-nav";

type Card = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  unlocked: boolean;
  imagePath?: string;
  voiceLinePath?: string;
  history?: string;
  abilities: {
    name: string;
    type: string;
    cooldown: number | null;
    description: string;
  }[];
};

type CardsPageProps = {
  username: string;
  coins: number;
  ownedCardIds: string[];
};

export default function CardsPage({ username, coins, ownedCardIds }: CardsPageProps) {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const cards = cardsData.cards as Card[];
  const ownedCardIdSet = new Set(ownedCardIds);

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
  const visibleCards = sortedCards.filter(
    (card) => card.unlocked || ownedCardIdSet.has(card.id),
  );

  function playVoiceLine(voiceLinePath?: string) {
    if (!voiceLinePath) return;

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(voiceLinePath);
    audio.volume = 1;
    activeAudioRef.current = audio;
    void audio.play().catch(() => {});
  }

  function handleCardFlip(card: Card) {
    const isFlippingToHistory = flippedCardId !== card.id;
    if (isFlippingToHistory) {
      playVoiceLine(card.voiceLinePath);
    }
    setFlippedCardId((current) => (current === card.id ? null : card.id));
  }

  useEffect(() => {
    return () => {
      if (!activeAudioRef.current) return;
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[url('/card_b.png')] bg-cover bg-center bg-no-repeat px-4 pb-28 text-[#f8e9c6]">
      <AppTopNav username={username} coins={coins} />

      <section className="relative mx-auto w-full max-w-[58rem] pt-32">
        <div className="mx-auto rounded-3xl border border-[#f2cb74]/60 bg-[#4d3018]/90 px-4 py-4 shadow-[0_0_18px_rgba(255,210,120,0.2)]">
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
            <div className="mt-5 rounded-2xl border border-[#f2cb74]/45 bg-[#2f1b10]/55 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <div className="relative max-h-[62vh] min-h-[360px] overflow-y-auto rounded-xl border border-[#f2cb74]/35 bg-[linear-gradient(180deg,rgba(36,20,12,0.55)_0%,rgba(28,16,10,0.45)_100%)] p-2 pr-2 [scrollbar-color:#d7a744_#3b2417] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#3b2417]/90 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#3b2417] [&::-webkit-scrollbar-thumb]:bg-[linear-gradient(180deg,#f3d197_0%,#c4883d_100%)] [&::-webkit-scrollbar-thumb:hover]:bg-[linear-gradient(180deg,#f8deaa_0%,#d29748_100%)] sm:max-h-[58vh]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleCards.map((card) => {
                  const isCardUnlocked = card.unlocked || ownedCardIdSet.has(card.id);
                  return (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCardFlip(card)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleCardFlip(card);
                        }
                      }}
                      className="w-full cursor-pointer text-left"
                      style={{ perspective: "1200px" }}
                    >
                      <div
                        className="relative min-h-[340px] transition-transform duration-500"
                        style={{
                          transformStyle: "preserve-3d",
                          transform:
                            flippedCardId === card.id ? "rotateY(180deg)" : "none",
                        }}
                      >
                        <article
                          className={`absolute inset-0 flex flex-col rounded-xl border p-3 shadow-[0_12px_30px_rgba(20,8,4,0.45)] transition ${
                            isCardUnlocked
                              ? "border-[#f0c67a]/40 bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)]"
                              : "border-white/15 bg-[linear-gradient(165deg,rgba(90,90,90,0.8)_0%,rgba(70,70,70,0.88)_45%,rgba(45,45,45,0.92)_100%)] grayscale"
                          }`}
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-base font-bold">{card.name}</h2>
                            <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs font-semibold">
                              {isCardUnlocked ? "Unlocked" : "Locked"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#f4cd84]">
                            {card.rarity} - {card.type}
                          </p>
                          <div className="mt-3 flex flex-1 items-center justify-center">
                            <div className="rounded-lg border-l border-r border-[#f2cd86]/45 px-3">
                              <Image
                                src={card.imagePath ?? "/card.png"}
                                alt={`${card.name} portrait`}
                                width={280}
                                height={280}
                                className="h-56 w-56 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.38)]"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4cd84]">
                              Click card to flip
                            </span>
                            <div
                              className="group relative"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="rounded-md border border-[#f2cd86]/50 bg-[#3a2348]/80 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#ffe8b8] hover:bg-[#4a2b5f]"
                              >
                                Abilities
                              </button>
                              <div className="pointer-events-none invisible absolute bottom-full right-0 z-50 mb-2 w-64 rounded-lg border border-[#f2cd86]/35 bg-[#2b1a35]/95 p-3 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition group-hover:visible group-hover:opacity-100">
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#f4cd84]">
                                  Ability Details
                                </p>
                                <div className="space-y-2 text-xs text-[#efd8b0]">
                                  {card.abilities.map((ability) => (
                                    <div
                                      key={`${card.id}-${ability.name}`}
                                      className="rounded-md border border-white/10 bg-black/20 p-2"
                                    >
                                      <p>
                                        <span className="font-semibold">Name:</span>{" "}
                                        {ability.name}
                                      </p>
                                      <p>
                                        <span className="font-semibold">Type:</span>{" "}
                                        {ability.type}
                                      </p>
                                      <p>
                                        <span className="font-semibold">Cooldown:</span>{" "}
                                        {ability.cooldown === null
                                          ? "None"
                                          : ability.cooldown}
                                      </p>
                                      <p>
                                        <span className="font-semibold">Description:</span>{" "}
                                        {ability.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>

                        <article
                          className={`absolute inset-0 flex flex-col rounded-xl border p-3 shadow-[0_12px_30px_rgba(20,8,4,0.45)] transition ${
                            isCardUnlocked
                              ? "border-[#f0c67a]/40 bg-[linear-gradient(165deg,rgba(107,57,137,0.88)_0%,rgba(85,45,110,0.9)_35%,rgba(72,41,30,0.92)_100%)]"
                              : "border-white/15 bg-[linear-gradient(165deg,rgba(90,90,90,0.8)_0%,rgba(70,70,70,0.88)_45%,rgba(45,45,45,0.92)_100%)] grayscale"
                          }`}
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                        >
                          <h3 className="text-base font-bold text-[#ffe8b8]">
                            {card.name} History
                          </h3>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4cd84]">
                            Description
                          </p>
                          <p className="mt-1 text-sm text-[#efd8b0]">{card.description}</p>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4cd84]">
                            History
                          </p>
                          <p className="mt-3 text-sm text-[#efd8b0]">
                            {card.history ??
                              "This outlaw's legend spread across saloons and frontier towns, earning a feared reputation that still echoes through the West."}
                          </p>
                          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4cd84]">
                            Click to flip back
                          </p>
                        </article>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}
        </div>
      </section>

      <BottomNav activeHref="/cards" />
    </main>
  );
}

