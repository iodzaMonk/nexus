"use server";

import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/user";

const supabaseKey = process.env.SUPABASE_STORAGE_KEY as string;
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getOrCreateConversation(otherUserId: string) {
   const currentUser = await getCurrentUser(); 
   if (!currentUser) throw new Error("User not authenticated");

   const convo = await prisma.conversation.findFirst({
        where: {
            AND: [
                {participants: { some: { id: otherUserId}}},
                {participants: { some: { id: currentUser?.id}}}
            ]
        }, include: {
            participants: true,
        }
   });

   if (convo) return convo.id;

   const newConvo = await prisma.conversation.create({
    data: {
        participants: {
            connect: [
                { id: currentUser.id },
                { id: otherUserId }
            ]
        }
    }
   })

   return newConvo.id;
    
}

export async function sendMessage(conversationId: string, formData: FormData) {
   const currentUser = await getCurrentUser(); 
   if (!currentUser) throw new Error("User not authenticated");

   const content = formData.get("content") as string;
   const replyId = formData.get("replyId") as string | null;
   const imageFile = formData.get("image") as File | null;
   const videoFile = formData.get("video") as File | null;
   
   // Sanitize replyId
   const validReplyId = replyId && !replyId.startsWith('temp-') ? replyId : null;

   let imageUrl = null;
   let videoUrl = null;

   if (imageFile && imageFile.size > 0) {
        const fileExtension = imageFile.name.split(".").pop();
        const fileName = `messages/images/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExtension}`;
        const { data, error } = await supabase.storage.from('posts').upload(fileName, imageFile);
        
        if (error) {
            console.error("Error uploading message image:", error);
            throw new Error("Failed to upload image");
        }
        if (data?.fullPath) {
             imageUrl = data.fullPath;
        }
   }

   if (videoFile && videoFile.size > 0) {
        const fileExtension = videoFile.name.split(".").pop();
        const fileName = `messages/videos/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExtension}`;
        const { data, error } = await supabase.storage.from('posts').upload(fileName, videoFile);
        
        if (error) {
            console.error("Error uploading message video:", error);
            throw new Error("Failed to upload video");
        }
        if (data?.fullPath) {
             videoUrl = data.fullPath;
        }
   }

   const newMessage = await prisma.message.create({
    data: {
        conversationId: conversationId,
        userId: currentUser.id,
        content: content || "",
        replyToId: validReplyId,
        imageUrl: imageUrl,
        videoUrl: videoUrl
    },
    include: {
        replyTo: true
    }
   });

   return newMessage;
}

export async function getMessages(conversationId: string) {
    const messages = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        },
        include: {
            messages: {
                include: {replyTo: true},
                orderBy: {createdAt: "asc"}
            },
            participants: true,
        }
    })
    return messages;
}
