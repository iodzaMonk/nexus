import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/user";
import ConversationList from "@/components/Messages/ConversationList";
import { getConversations } from "@/app/actions/chat";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <div>Not authenticated</div>;
  }

  const conversations = await getConversations();

  return (
    <>
      {/* Mobile: Show conversation list here because layout hides it */}
      <div className="lg:hidden h-full w-full">
        <ConversationList
          initialConversations={conversations}
          currentUser={currentUser}
        />
      </div>

      {/* Desktop: Show placeholder */}
      <div className="hidden lg:flex h-full flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <MessageCircle className="h-12 w-12 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Your Inbox
        </h3>
        <p className="max-w-xs">
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
    </>
  );
}
