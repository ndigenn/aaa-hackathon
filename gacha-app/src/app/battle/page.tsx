import AppTopNav from "@/components/app-top-nav";
import BottomNav from "@/components/bottom-nav";
import BattlePageClient from "@/components/battle/battle-page-client";
import { getTopNavProfile } from "@/lib/user-profile";
import cardsData from "@/app/cards.json";

type CardDefinition = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  unlocked?: boolean;
  stats?: {
    attack?: number;
    hp?: number;
  };
  abilities?: Array<{
    name: string;
    description: string;
  }>;
};

type BattleCard = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  imageSrc: string;
  attack: number;
  hp: number;
  abilities: Array<{
    name: string;
    description: string;
  }>;
};

const CARD_IMAGE_BY_NAME: Record<string, string> = {
  "billy the kid": "/billie.png",
  "wyatt earp": "/wynne.png",
  "butch cassidy": "/sunny.png",
  "calamity jane": "/jane.png",
  "wild bill hickok": "/beth.png",
  "doc holiday": "/doc.png",
  "bass reaves": "/bass.png",
  "belle starr": "/belle.png",
  "black bart": "/card.png",
  "charles goodnight": "/goodnight.png",
};

export default async function BattlePage() {
  const { username, coins, ownedCardIds } = await getTopNavProfile("/battle");
  const ownedCardIdSet = new Set(ownedCardIds);
  const cardDefinitions = (cardsData.cards ?? []) as CardDefinition[];

  const availableCards: BattleCard[] = cardDefinitions
    .filter((card) => card.unlocked || ownedCardIdSet.has(card.id))
    .map((card) => ({
      id: card.id,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      description: card.description,
      imageSrc: CARD_IMAGE_BY_NAME[card.name.toLowerCase()] ?? "/card.png",
      attack: Math.max(20, Number(card.stats?.attack ?? 60)),
      hp: Math.max(120, Number(card.stats?.hp ?? 360)),
      abilities: (card.abilities ?? []).slice(0, 2).map((ability) => ({
        name: ability.name,
        description: ability.description,
      })),
    }));

  return (
    <main className="relative min-h-screen overflow-hidden text-[#f8e9c6]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cardsbackground.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,6,0.52)_0%,rgba(20,10,8,0.64)_45%,rgba(25,14,9,0.84)_100%)]" />

      <AppTopNav username={username} coins={coins} />
      <BattlePageClient availableCards={availableCards} />
      <BottomNav activeHref="/home" />
    </main>
  );
}
