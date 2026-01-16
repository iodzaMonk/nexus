import ConversationList from "@/components/Messages/ConversationList";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  // Handled in component if no user, or return empty
  if (!currentUser) return <>{children}</>;

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
    <div className="flex w-full h-[calc(100vh-4rem)] md:h-screen bg-background">
      <div className="hidden lg:block h-full">
        <ConversationList
          initialConversations={conversations}
          currentUser={currentUser}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-card/30">{children}</div>
    </div>
  );
}
