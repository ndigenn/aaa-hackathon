import CardsPageClient from "@/components/cards-page-client";
import { getTopNavProfile } from "@/lib/user-profile";

export default async function CardsPage() {
  const { username, coins } = await getTopNavProfile("/cards");
  return <CardsPageClient username={username} coins={coins} />;
}
