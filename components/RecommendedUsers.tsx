import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import UserCard from "./User/UserCard";

interface RecommendedUsersProps {
  className?: string;
}

export default async function RecommendedUsers({
  className = "",
}: RecommendedUsersProps) {
  const currentUser = await getCurrentUser();

  // Fetch 5 random users (excluding the current user if logged in)
  const users = await prisma.user.findMany({
    where: {
      AND: [{ id: { not: currentUser?.id } }],
    },
    take: 5,
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h3 className="text-lg font-semibold px-2">Recommended</h3>
      <div className="flex flex-row overflow-x-auto pb-4 xl:pb-0 gap-4 xl:flex-col xl:overflow-visible no-scrollbar">
        {users.map((user) => (
          <div key={user.id} className="w-64 shrink-0 xl:w-auto">
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}
