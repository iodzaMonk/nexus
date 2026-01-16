-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;
