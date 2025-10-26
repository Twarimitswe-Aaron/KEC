/*
  Warnings:

  - The `settings` column on the `Quiz` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Made the column `lessonId` on table `Resource` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "settings",
ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "public"."Resource" ALTER COLUMN "lessonId" SET NOT NULL;
