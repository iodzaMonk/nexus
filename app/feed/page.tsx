import { Suspense } from "react";
import VideoFeed from "@/components/Post/VideoFeed";
import PostSkeleton from "@/components/Post/PostSkeleton";
import { getVideos } from "@/app/fetchPosts";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export default async function FeedPage() {
  const posts = await getVideos();
  const session = (await cookies()).get("session");
  const payload = await decrypt(session?.value);
  const userId = payload?.userId as string | undefined;

  return (
    <div className="flex w-full justify-center">
      <main className="flex flex-col items-center w-full max-w-xl">
        <Suspense fallback={<PostSkeleton />}>
          <VideoFeed posts={posts} userId={userId} />
        </Suspense>
      </main>
    </div>
  );
}
