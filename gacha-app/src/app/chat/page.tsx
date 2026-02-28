import ChatPageClient from "@/components/chat-page-client";
import { getTopNavProfile } from "@/lib/user-profile";

export default async function ChatPage() {
  const { username, coins } = await getTopNavProfile("/chat");
  return <ChatPageClient username={username} coins={coins} />;
}
