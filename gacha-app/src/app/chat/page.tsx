import ChatPageClient from "@/components/chat-page-client";
import { getTopNavProfile } from "@/lib/user-profile";
import cardsData from "@/app/cards.json";

type CardDefinition = {
  id: string;
  name: string;
  unlocked?: boolean;
};

const CARD_IMAGE_BY_NAME: Record<string, string> = {
  "billy the kid": "/billie.png",
  "wyatt earp": "/wynne.png",
  "butch cassidy": "/sunny.png",
  "calamity jane": "/jane.png",
  "doc holiday": "/doc.png",
  "bass reaves": "/bass.png",
  "belle starr": "/belle.png",
  "charles goodnight": "/goodnight.png",
};

export default async function ChatPage() {
  const { username, coins, ownedCardIds } = await getTopNavProfile("/chat");
  const ownedCardIdSet = new Set(ownedCardIds);

  const ownedCards = ((cardsData.cards ?? []) as CardDefinition[])
    .filter((card) => card.unlocked || ownedCardIdSet.has(card.id))
    .map((card) => ({
      id: card.id,
      name: card.name,
      imageSrc: CARD_IMAGE_BY_NAME[card.name.toLowerCase()] ?? "/card.png",
    }));

  return <ChatPageClient username={username} coins={coins} ownedCards={ownedCards} />;
}
