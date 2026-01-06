import { Suspense } from "react";
import PostFeed from "@/components/Post/PostFeed";
import PostSkeleton from "@/components/Post/PostSkeleton";
import AuthTab from "@/components/Auth/AuthForm";
import { cookies } from "next/headers";

export default async function Home() {
  const session = (await cookies()).get("session");

  return (
    <main className="p-10 flex flex-col items-center">
      <h1 className=" text-2xl font-bold mb-4">Nexus</h1>

      {!session && <AuthTab />}
      <Suspense fallback={<PostSkeleton />}>
        <PostFeed />
      </Suspense>
    </main>
  );
}
