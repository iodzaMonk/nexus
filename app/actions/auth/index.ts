"use server";

import { prisma } from "@/lib/db";
import * as bcrypt from 'bcrypt';
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createAccount(prevState: unknown, formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const rePassword = formData.get("rePassword") as string
    const email = formData.get("email") as string

    if (password != rePassword) {
        return {message: "Password do not match", success: false};
    }
  
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hash 
            }
        })

        const session = await encrypt({ userId: user.id });
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        (await cookies()).set("session", session, {httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: expires, path: "/"});
        revalidatePath("/");

        return {message: "Account created successfully!!", success: true};
    } catch(e) {
        console.error(e);
        return {message: "An error occurred while creating account", success: false}; 
    }

}

export async function login(prevState: unknown, formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
  
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) {
            return {message: "No user found!", success: false};
        }

        const pass = await bcrypt.compare(password, user?.password);

        if (!pass) {
            return {message: "Incorrect password!", success: false};
        }

        const session = await encrypt({ userId: user.id });
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        (await cookies()).set("session", session, {httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: expires, path: "/"});
        revalidatePath("/");

        
        return {message: "Loged in successfully!!", success: true};
    } catch(e) {
        console.error(e);
        return {message: "An error occurred while logging in", success: false}; 
    }

}

export async function logout() {
    (await cookies()).delete("session");
    redirect("/");
}
