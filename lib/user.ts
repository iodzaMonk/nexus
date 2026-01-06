import { cookies } from "next/headers";
import { prisma } from "./db";
import { decrypt } from "./session";

export async function getCurrentUser() {
    const session = (await cookies()).get("session");
    const payload = await decrypt(session?.value);
    const userId = payload?.userId as string | undefined;

    if (!userId) return null;

    const user = await prisma.user.findUnique({where: {id: userId}})
    return user;
}

export async function getUser(username: string, viewerId?: string) {
    const user = await prisma.user.findUnique({
        where: {
            username: username
        },
        include: {
            followers: viewerId ? {
                where: {followerId: viewerId}
            } : false
        }
    }) 
    return user;
}
