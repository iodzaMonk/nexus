import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import ConversationList from "@/components/Messages/ConversationList";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <div>Not authenticated</div>;
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          id: currentUser.id,
        },
      },
    },
    include: {
      participants: true,
      messages: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

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
