
import { prisma } from '../lib/db';

async function force() {
    const iodza = await prisma.user.findUnique({ where: { username: 'iodza' } });
    if (!iodza) throw new Error("iodza not found");

    // Ensure TestBot exists
    let bot = await prisma.user.findUnique({ where: { username: 'TestBot' } });
    if (!bot) {
        bot = await prisma.user.create({
            data: {
                username: 'TestBot',
                email: 'bot@nexus.com',
                password: 'bot',
                name: 'System Bot'
            }
        });
    }

    // Find/Create conversation
    let convo = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { id: iodza.id } } },
                { participants: { some: { id: bot.id } } }
            ]
        }
    });

    if (!convo) {
        convo = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: iodza.id }, { id: bot.id }]
                }
            }
        });
    }

    // Send 3 unread messages
    for (let i = 1; i <= 3; i++) {
        await prisma.message.create({
            data: {
                content: `Unread Check #${i} 🔴`,
                userId: bot.id,
                conversationId: convo.id,
                seen: null
            }
        });
    }

    console.log("Sent 3 unread messages from TestBot to iodza.");
}

force().catch(console.error).finally(() => prisma.$disconnect());
