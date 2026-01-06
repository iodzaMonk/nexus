import { Prisma } from "@/app/generated/prisma/client";

export const postInclude = {
  include: {
    author: true,
    comments: {
      include: {
        authorOwner: true,
      },
    },
    likes: true,
  },
} satisfies Prisma.PostDefaultArgs;

export type PostWithComments = Prisma.PostGetPayload<typeof postInclude>;