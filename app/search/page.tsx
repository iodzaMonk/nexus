import SearchBar from "@/components/Search/SearchBar";
import { prisma } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostMinimal from "@/components/Post/PostMinimal"; // Imported here
import UserCard from "@/components/User/UserCard";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams; // Removed unused currentUser

  if (!q) {
    return (
      <div className="p-5">
        <SearchBar />
        <p className="text-gray-500 mt-4 text-center">Type to search</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: q,
        mode: "insensitive",
      },
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      caption: {
        contains: q,
        mode: "insensitive",
      },
    },
  });

  return (
    <div className="p-5 w-full md:w-2/3 lg:w-1/2">
      <SearchBar />

      <Tabs defaultValue="accounts" className="my-5">
        <TabsList className="bg-transparent">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Results for {q}</h2>

            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
        <TabsContent value="posts">
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Results for {q}</h2>

            {posts.length === 0 ? (
              <p className="text-gray-500">No posts found.</p>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <PostMinimal key={post.id} post={post} />
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
