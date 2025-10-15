/*
  Warnings:

  - You are about to drop the column `status` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Lesson" DROP COLUMN "status",
ADD COLUMN     "isUnlocked" BOOLEAN NOT NULL DEFAULT false;
