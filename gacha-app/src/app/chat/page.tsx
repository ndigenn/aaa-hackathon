import ChatPageClient from "@/components/chat-page-client";
import { getTopNavProfile } from "@/lib/user-profile";
import cardsData from "@/app/cards.json";

type CardDefinition = {
  id: string;
  name: string;
  unlocked?: boolean;
};

export default async function ChatPage() {
  const { username, coins, ownedCardIds } = await getTopNavProfile("/chat");
  const ownedCardIdSet = new Set(ownedCardIds);

  const ownedCards = ((cardsData.cards ?? []) as CardDefinition[])
    .filter((card) => card.unlocked || ownedCardIdSet.has(card.id))
    .map((card) => ({ id: card.id, name: card.name }));

  return <ChatPageClient username={username} coins={coins} ownedCards={ownedCards} />;
}
