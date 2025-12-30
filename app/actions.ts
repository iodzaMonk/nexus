"use server"
import {prisma} from "@/lib/db"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export async function uploadPost(formData: FormData) {
    const caption = formData.get("caption") as string
    const imageFile = formData.get("image") as File
    const userId = "2344b5cb-3a1b-4288-b160-6cfe1e47ca6c"
    const supabase = createClient('https://pyoghzghwkpgiqbpbphp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b2doemdod2twZ2lxYnBicGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzYxODUsImV4cCI6MjA4MjYxMjE4NX0.cYKGY3_fOvB2uQNRorf8ed980UEGCjb1bel3R2ABIFA');

    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileExtension}`
    const {data, error} = await supabase.storage.from('posts').upload(fileName, imageFile);
    
    if (error || !data?.fullPath) {
        console.log(error);
        throw new Error("Error uploading image");
    }

    const imageURL = data.fullPath;

    await prisma.post.create({
        data: {
            imageUrl: imageURL,
            authorId: userId,
            caption: caption
        }
    })

    revalidatePath("/");
}

export async function createComment(postId: string, formData: FormData) {
    const content = formData.get("comment") as string
    const authorId = "2344b5cb-3a1b-4288-b160-6cfe1e47ca6c"

    await prisma.comment.create({
        data: {
            authorId: authorId,
            comment: content,
            postId: postId
        }
    })

    revalidatePath("/");
}