import { uploadPost } from "./actions";
import { getPosts } from '@/app/fetchPosts';
import PostSection from "./components/PostSection";


export default async function Home() {

  const posts = await getPosts();

  return (
    <main className="p-10 flex flex-col items-center">
      <h1 className=" text-2xl font-bold mb-4">Nexus</h1>

      <form action={uploadPost} className="flex flex-col gap-4 max-w-sm">
        <input type="file" name="image" accept="image/*" required />

        <input type="text" name="caption" placeholder="Write a caption..." className="border p-2 border-white" />

        <button type="submit" className="bg-brand-hlg p-2 rounded">Upload Post</button>
      </form>

     <PostSection posts={posts}/> 

    </main>
  );
}
