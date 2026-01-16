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
      },
      likes: true
    }
  })
}

export async function getVideos() {
  return await prisma.post.findMany({
    where: {
      videoUrl: {
        not: null
      }
    },
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
      },
      likes: true
    }
  })
}