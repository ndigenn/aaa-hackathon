import ChatPageClient from "@/components/chat-page-client";
import { requireAuthenticatedUser } from "@/lib/server-auth";

export default async function ChatPage() {
  await requireAuthenticatedUser("/chat");
  return <ChatPageClient />;
}
