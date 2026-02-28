import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";
import HomeLoadoutClient from "@/components/home/home-loadout-client";
import { getTopNavProfile } from "@/lib/user-profile";
import cardsData from "@/app/cards.json";

type InventoryCard = {
  id: string;
  name: string;
  rarity: string;
  type: string;
  unlocked?: boolean;
  imagePath?: string;
};

const rarityOrder: Record<string, number> = {
  "Ultra Rare": 0,
  Rare: 1,
  Common: 2,
};

export default async function HomePage() {
  const { username, coins, ownedCardIds } = await getTopNavProfile("/home");
  const ownedCardIdSet = new Set(ownedCardIds);

  const inventoryCards = ((cardsData.cards ?? []) as InventoryCard[])
    .filter((card) => card.unlocked || ownedCardIdSet.has(card.id))
    .sort((a, b) => {
      const rarityDiff = (rarityOrder[a.rarity] ?? 99) - (rarityOrder[b.rarity] ?? 99);
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    })
    .map((card) => ({
      id: card.id,
      name: card.name,
      rarity: card.rarity,
      type: card.type,
      imageSrc: card.imagePath ?? "/card.png",
    }));

  return (
    <main className="relative min-h-screen overflow-hidden text-[#f8e9c6]">
      <audio src="/home.mp3" autoPlay loop preload="auto" className="hidden" />

      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/homepage.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,6,0.38)_0%,rgba(20,10,8,0.5)_45%,rgba(25,14,9,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(14,8,6,0.6)_0%,rgba(14,8,6,0)_100%)]" />

      <AppTopNav username={username} coins={coins} />
      <HomeLoadoutClient inventoryCards={inventoryCards} />

      <BottomNav activeHref="/home" />
    </main>
  );
}
