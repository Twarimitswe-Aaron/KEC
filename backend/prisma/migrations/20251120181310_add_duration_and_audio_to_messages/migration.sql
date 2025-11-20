-- AlterEnum
ALTER TYPE "public"."MessageType" ADD VALUE 'AUDIO';

-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "duration" INTEGER;
