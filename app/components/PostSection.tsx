import Image from "next/image";
import CommentSection from "./CommentSection";
import CommentForm from "./CommentForm";
import { PostWithComments } from "@/lib/PostWithComments";
interface PostSectionProps {
    posts: PostWithComments[];
}
export default function PostSection({posts}: PostSectionProps) {
    return (
      <div className="gap-8 mt-10 flex flex-col items-center">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-xl overflow-hidden bg-brand-mid shadow-sm w-1/3 ">
            <div className="relative aspect-square">
              <Image width="1200" height="1200" src={`https://pyoghzghwkpgiqbpbphp.supabase.co/storage/v1/object/public/${post.imageUrl}`} alt={post.caption || "Post"} className="object-cover w-full h-full"/> 
            </div>

            <div className="p-4">
              <p className="font-bold">{post.author.name}</p>
              <p className="">{post.caption}</p>
              <span className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <CommentSection post={post}/>
            <CommentForm postId={post.id}/>
          </div>
        ))}
      </div>
    );
}