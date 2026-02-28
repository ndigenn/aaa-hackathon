"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type InventoryCard = {
  id: string;
  name: string;
  rarity: string;
  type: string;
  imageSrc: string;
};

type HomeLoadoutClientProps = {
  inventoryCards: InventoryCard[];
};

export default function HomeLoadoutClient({
  inventoryCards,
}: HomeLoadoutClientProps) {
  const router = useRouter();
  const [loadout, setLoadout] = useState<Array<InventoryCard | null>>([
    null,
    null,
    null,
  ]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [battleMessage, setBattleMessage] = useState<string | null>(null);

  const assignedCardIds = useMemo(
    () => new Set(loadout.filter(Boolean).map((card) => card!.id)),
    [loadout],
  );

  function selectCardForSlot(card: InventoryCard) {
    if (activeSlot === null) return;
    setLoadout((current) => {
      const next = [...current];
      next[activeSlot] = card;
      return next;
    });
    setActiveSlot(null);
  }

  function clearSlot(slotIndex: number) {
    setLoadout((current) => {
      const next = [...current];
      next[slotIndex] = null;
      return next;
    });
  }

  function startBattle() {
    const selectedIds = loadout
      .filter((card): card is InventoryCard => Boolean(card))
      .map((card) => card.id);

    if (selectedIds.length < 3) {
      setBattleMessage("Select 3 cards in your loadout to start battle.");
      return;
    }

    setBattleMessage(null);
    router.push(`/battle?loadout=${selectedIds.join(",")}`);
  }

  return (
    <>
      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-start gap-6 px-4 pb-32 pt-28 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[#f1cf8e]/40 bg-[#22160f]/55 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-[1px]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f2cb84]">
            Team Loadout
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#ffe8b8] sm:text-3xl">
            Select 3 Cowgirls
          </h1>
          <p className="mt-2 text-sm text-[#efd8b0]">
            Click a slot to pick a card from your inventory.
          </p>

          <div className="mt-5 grid gap-3">
            {loadout.map((card, index) => (
              <div
                key={`loadout-slot-${index + 1}`}
                role="button"
                tabIndex={0}
                onClick={() => setActiveSlot(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveSlot(index);
                  }
                }}
                className="group relative flex h-[122px] cursor-pointer items-center gap-4 rounded-xl border border-[#f0c67a]/40 bg-[#3a281b]/35 px-4 py-3 text-left transition hover:border-[#f6d491]/80 hover:bg-[#493022]/45"
              >
                {card ? (
                  <>
                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md border border-[#f3cd86]/60 bg-[#2a1b12]">
                      <Image
                        src={card.imageSrc}
                        alt={card.name}
                        width={56}
                        height={80}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-[#ffe8b8]">{card.name}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#f4cd84]">
                        {card.rarity} • {card.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearSlot(index);
                      }}
                      className="ml-auto shrink-0 rounded-md border border-[#f0c67a]/45 px-2 py-1 text-xs font-semibold text-[#f3d3a1] transition hover:bg-[#57372a]/70"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-center gap-2 text-[#f6ddb0]">
                    <span className="text-3xl leading-none">+</span>
                    <span className="text-sm font-semibold uppercase tracking-[0.1em]">
                      Select Card
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#f1cf8e]/40 bg-[#22160f]/55 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-[1px]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f2cb84]">
            Battle Mode
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#ffe8b8] sm:text-3xl">
            Ready To Fight
          </h2>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#f0c67a]/45 bg-[#2f1d12]/50">
            <Image
              src="/battle.png"
              alt="Battle preview"
              width={640}
              height={420}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          <button
            type="button"
            onClick={startBattle}
            className="mt-5 w-full rounded-xl border border-[#ffe3a6]/80 bg-[linear-gradient(180deg,#ffdf95_0%,#d6a43d_100%)] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#4a2b16] transition hover:brightness-105"
          >
            Battle
          </button>

          {battleMessage ? (
            <p className="mt-3 rounded-lg border border-[#f2cd86]/30 bg-[#3a2348]/60 px-3 py-2 text-sm text-[#f8ddb0]">
              {battleMessage}
            </p>
          ) : null}
        </div>
      </section>

      {activeSlot !== null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[82vh] w-full max-w-2xl overflow-auto rounded-2xl border border-[#f0c67a]/55 bg-[linear-gradient(165deg,#2f1e27_0%,#3b2549_55%,#4a2a1d_100%)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.58)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-extrabold text-[#ffe8b8]">
                Select Card For Slot {activeSlot + 1}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                className="rounded-md border border-[#f2cd86]/40 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#ffe8b8]"
              >
                Close
              </button>
            </div>

            {inventoryCards.length === 0 ? (
              <p className="mt-6 text-sm text-[#efd8b0]">
                No cards in inventory yet. Pull cards from Summon to build your team.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {inventoryCards.map((card) => {
                  const alreadyAssigned = assignedCardIds.has(card.id);
                  const currentSlotCard = loadout[activeSlot];
                  const isCurrentCard = currentSlotCard?.id === card.id;
                  const isDisabled = alreadyAssigned && !isCurrentCard;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => selectCardForSlot(card)}
                      className="flex items-center gap-3 rounded-xl border border-[#f0c67a]/40 bg-[#2a1a35]/75 p-3 text-left transition hover:border-[#ffdba1]/85 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <div className="h-20 w-14 overflow-hidden rounded-md border border-[#f3cd86]/60 bg-[#2a1b12]">
                        <Image
                          src={card.imageSrc}
                          alt={card.name}
                          width={56}
                          height={80}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#ffe8b8]">{card.name}</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-[#f4cd84]">
                          {card.rarity} • {card.type}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
