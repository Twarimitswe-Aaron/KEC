/*
  Warnings:

  - You are about to drop the column `Contacts` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "Contacts",
ADD COLUMN     "phone" TEXT;
