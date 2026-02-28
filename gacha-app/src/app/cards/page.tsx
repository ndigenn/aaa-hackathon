import CardsPageClient from "@/components/cards-page-client";
import { requireAuthenticatedUser } from "@/lib/server-auth";

export default async function CardsPage() {
  await requireAuthenticatedUser("/cards");
  return <CardsPageClient />;
}
