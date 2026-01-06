import { getPosts } from "@/app/fetchPosts";
import PostSection from "./PostSection";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export default async function PostFeed() {
  const posts = await getPosts();
  const session = (await cookies()).get("session");
  const payload = await decrypt(session?.value);
  const userId = payload?.userId as string | undefined;

  return <PostSection posts={posts} userId={userId} />;
}
