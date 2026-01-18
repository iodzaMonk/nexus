
import { prisma } from '../lib/db';

async function debug() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        const count = await prisma.message.count({
            where: {
                seen: null,
                userId: { not: user.id }, // Sender is NOT me
                conversation: {
                    participants: {
                        some: { id: user.id } // I am in the conversation
                    }
                }
            }
        });
        console.log(`User: ${user.username} (${user.id}) - Unread: ${count}`);
    }
}

debug().catch(console.error).finally(() => prisma.$disconnect());
