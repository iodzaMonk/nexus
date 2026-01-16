"use server";

import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const supabaseKey = process.env.SUPABASE_STORAGE_KEY as string;
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadProfilePicture(formData: FormData) {
    const session = (await cookies()).get("session");
    const imageFile = formData.get("image") as File
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string;
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileExtension}`
    const {data, error} = await supabase.storage.from('profile').upload(fileName, imageFile);
    
    if (error || !data?.fullPath) {
        console.log(error);
        throw new Error("Error uploading image");
    }

    const imageURL = data.fullPath;

    await prisma.user.update({
        where: {id: userId}, data: {profileImage: imageURL}
    })

    revalidatePath("/profile");
}

export async function toggleFollow(targetUserId: string) {
    const session = (await cookies()).get("session");
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string;

    if (targetUserId === userId) throw Error("Can't follow yourself!");
    const followExists = await prisma.follows.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: targetUserId
            }
        }
    })

    if (followExists) {
        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId
                }
            }
        })
    } else {
        await prisma.follows.create({
            data: {
                followerId: userId,
                followingId: targetUserId
            }
        })
    }

    revalidatePath('/');
}


export async function updateUser(prevState: unknown, formData: FormData) {
    const session = (await cookies()).get("session");
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string;

    if (!userId) {
        return { message: "Not authenticated", errors: {} };
    }

    const username = formData.get("username") as string;
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;

    // specific validation could go here (e.g. zodd)

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (currentUser?.username !== username) {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return { errors: { username: ["Username is already taken"] }, message: "" };
        }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                username,
                name,
                bio
            }
        });
        
        revalidatePath("/profile");
        // revalidate both old and new username paths just in case
        if (currentUser?.username) revalidatePath(`/profile/${currentUser.username}`);
        revalidatePath(`/profile/${username}`);
        
        return { message: "Profile updated successfully!", errors: {} };
    } catch (e) {
        console.error(e);
        return { message: "Failed to update profile", errors: {} };
    }
}
