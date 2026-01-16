"use server";

import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const supabaseKey = process.env.SUPABASE_STORAGE_KEY as string;
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadPost(formData: FormData) {
    const session = (await cookies()).get("session");
    const caption = formData.get("caption") as string
    const file = (formData.get("file") || formData.get("image")) as File
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string;
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!file || file.size === 0) {
        throw new Error("No file uploaded");
    }

    const fileExtension = file.name.split(".").pop();
    const isVideo = file.type.startsWith("video/");
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileExtension}`
    
    const {data, error} = await supabase.storage.from('posts').upload(fileName, file);
    
    if (error || !data?.fullPath) {
        console.error("Supabase Upload Error:", error);
        throw new Error(`Error uploading file: ${error?.message || "Unknown error"}`);
    }

    const fileUrl = data.fullPath;

    await prisma.post.create({
        data: {
            imageUrl: isVideo ? null : fileUrl,
            videoUrl: isVideo ? fileUrl : null,
            authorId: userId,
            caption: caption
        }
    })

    revalidatePath("/");
}

export async function createComment(postId: string, formData: FormData) {
    const session = (await cookies()).get("session");
    const payload = await decrypt(session?.value);
    const authorId = payload?.userId as string;

    if (!authorId) {
        throw new Error("User not authenticated");
    }

    const content = formData.get("comment") as string

    await prisma.comment.create({
        data: {
            authorId: authorId,
            comment: content,
            postId: postId
        }
    })

    revalidatePath("/");
}

export async function toggleLike(postId: string) {
    const session = (await cookies()).get("session");
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string;

    if (!userId) {
        throw Error("No user exists");
    }

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId: userId,
                postId: postId
            }
        }
    })

    if (existingLike) {
        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId
                }
            }
        })
    } else {
        await prisma.like.create({
            data: {
                userId: userId,
                postId: postId
            }
        })
    }

    revalidatePath("/");
}
