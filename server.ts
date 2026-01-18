import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });
import next from "next";
import express from "express";
import {createServer} from "node:http";
import {Server} from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    app.all('*', (req, res) => {
        return handle(req, res);
    });
});

// Initialize Prisma Client
import { PrismaClient } from './app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Track online users: userId -> Set of socket IDs (a user might have multiple tabs)
const onlineUsers = new Map<string, Set<string>>();

io.on('connection', (socket) => {
    const log = (_msg: string) => { void _msg }; // No-op logger for now
    
    log(`User connected: ${socket.id}`);

    // Send the current list of online users to the newly connected user
    socket.emit('onlineUsers', Array.from(onlineUsers.keys()));

    socket.on('join', async (roomOrUserId: string) => {
        socket.join(roomOrUserId);
        log(`User ${socket.id} joined room ${roomOrUserId}`);

    });
    
    // Explicit event to register user presence
    socket.on('register', async (userId: string) => {
        // Tag socket with userId
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socket as any).userId = userId;
        
        socket.join(userId);

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
            // Broadcast that this user is now online
            io.emit('userOnline', userId);
        } else {
             // User already online
        }
        onlineUsers.get(userId)?.add(socket.id);
        
    });

    socket.on('sendMessage', (data) => {
        io.to(data.conversationId).emit('newMessage', data);
        if (data.recipientId) {
            io.to(data.recipientId).emit('newMessage', data);
        }
    });

    socket.on('readMessage', async (message) => {
        const readMsg = await prisma.message.findUnique({where: {id: message.id}, include: {sender: true}});
        if (!readMsg) return;
        
        await prisma.message.updateMany({
            where: {
                conversationId: readMsg.conversationId,
                seen: null,
                userId: readMsg.userId,
                createdAt: {lte: readMsg.createdAt}
            },
            data: {
                seen: new Date()
            }
        })


        const seenAt = new Date();
        io.to(readMsg.conversationId).emit('messageRead', {
            conversationId: readMsg.conversationId, 
            messageId: readMsg.id, 
            seenAt: seenAt 
        })
    })


    socket.on('disconnect', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (socket as any).userId;
        if (userId) {
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    const lastSeen = new Date();
                    
                    // Emit immediately for UI responsiveness
                    io.emit('userOffline', { userId, lastSeen });

                    // Update DB asynchronously
                    try {
                         await prisma.user.update({
                            where: { id: userId },
                            data: { lastSeen }
                        });
                    } catch (e) {
                         // silently fail in production logs
                    }
                }
            }
        }
        log(`User disconnected: ${socket.id}`);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
})

