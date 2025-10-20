/*
  Warnings:

  - You are about to drop the column `description` on the `Form` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Form` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `moduleId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Module" DROP CONSTRAINT "Module_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resource" DROP CONSTRAINT "Resource_moduleId_fkey";

-- AlterTable
ALTER TABLE "public"."Form" DROP COLUMN "description",
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."Resource" DROP COLUMN "moduleId";

-- DropTable
DROP TABLE "public"."Module";
