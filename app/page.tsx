import { Suspense } from "react";
import PostFeed from "@/components/Post/PostFeed";
import PostSkeleton from "@/components/Post/PostSkeleton";
import AuthTab from "@/components/Auth/AuthForm";
import { getCurrentUser, getRecommendedUsers } from "@/lib/user";

import RecommendedUsers from "@/components/RecommendedUsers";

export default async function Home() {
  const user = await getCurrentUser();
  const recommendedUsers = await getRecommendedUsers(user?.id);

  return (
    <div className="flex w-full justify-center">
      <main className="p-4 md:p-10 flex flex-col items-center w-full max-w-xl">
        <h1 className=" text-2xl font-bold mb-4">Nexus</h1>

        {!user && <AuthTab />}

        {/* Mobile Recommended Users */}
        <div className="w-full xl:hidden mb-6">
          <RecommendedUsers users={recommendedUsers} />
        </div>

        <Suspense fallback={<PostSkeleton />}>
          <PostFeed />
        </Suspense>
      </main>

      {/* Right Sidebar for Recommended Users - only on Home */}
      <div className="hidden xl:flex flex-col w-80 p-6 border-l border-white/10 h-screen sticky top-0">
        <RecommendedUsers users={recommendedUsers} />
      </div>
    </div>
  );
}
