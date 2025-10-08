-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "uploaderId" DROP NOT NULL;
