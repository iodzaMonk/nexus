import { getMessages } from "@/app/actions/chat";
import { getCurrentUser } from "@/lib/user";
import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/Messages/ChatWindow";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const conversation = await getMessages(conversationId);
  const currentUser = await getCurrentUser();

  if (!conversation || !currentUser) {
    return notFound();
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );

  return (
    <div className="flex flex-col h-full w-full">
      <ChatWindow
        initialMessages={conversation.messages}
        conversationId={conversationId}
        currentUser={currentUser}
        otherParticipant={otherParticipant}
      />
    </div>
  );
}
