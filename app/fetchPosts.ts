import {prisma} from "@/lib/db";

export async function getPosts() {
  return await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
      comments: {
        include: {
          authorOwner: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })
}