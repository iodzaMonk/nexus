"use server"
import {prisma} from "@/lib/db"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import * as bcrypt from 'bcrypt';
import { encrypt, decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const supabaseKey = process.env.SUPABASE_STORAGE_KEY as string;
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadPost(formData: FormData) {
    const session = (await cookies()).get("session");
    const caption = formData.get("caption") as string
    const imageFile = formData.get("image") as File
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string;
    
    if (!userId) {
        throw new Error("User not authenticated");
    }
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

export async function createAccount(prevState: any, formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const rePassword = formData.get("rePassword") as string
    const email = formData.get("email") as string

    if (password != rePassword) {
        return {message: "Password do not match"};
    }
  
    try {
        const hash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hash 
            }
        })

        return {message: "Account created successfully!!"};
    } catch(e) {
        console.error(e);
        return {message: "An error occurred while creating account"}; 
    }

}

export async function login(prevState: any, formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
  
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) {
            return {message: "No user found!"};
        }

        const pass = await bcrypt.compare(password, user?.password);

        if (!pass) {
            return {message: "Incorrect password!"};
        }

        const session = await encrypt({ userId: user.id });
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        (await cookies()).set("session", session, {httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: expires, path: "/"});
        revalidatePath("/");

        
        return {message: "Loged in successfully!!"};
    } catch(e) {
        console.error(e);
        return {message: "An error occurred while logging in"}; 
    }

}

export async function logout() {
    (await cookies()).delete("session");
    redirect("/");
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