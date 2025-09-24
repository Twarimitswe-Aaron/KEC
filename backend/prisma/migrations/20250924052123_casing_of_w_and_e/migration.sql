/*
  Warnings:

  - You are about to drop the column `Education` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `Work` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "Education",
DROP COLUMN "Work",
ADD COLUMN     "education" TEXT,
ADD COLUMN     "work" TEXT;
