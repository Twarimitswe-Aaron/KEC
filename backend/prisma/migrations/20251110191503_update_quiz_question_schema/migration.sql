/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `QuizQuestion` table. All the data in the column will be lost.
  - The `options` column on the `QuizQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `correctAnswers` column on the `QuizQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Option" DROP CONSTRAINT "Option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Response" DROP CONSTRAINT "Response_questionId_fkey";

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "correctAnswer" TEXT[],
ADD COLUMN     "options" TEXT[],
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."QuizQuestion" DROP COLUMN "correctAnswer",
DROP COLUMN "order",
DROP COLUMN "orderIndex",
ADD COLUMN     "imageUrl" TEXT,
DROP COLUMN "options",
ADD COLUMN     "options" JSONB,
DROP COLUMN "correctAnswers",
ADD COLUMN     "correctAnswers" JSONB;

-- DropTable
DROP TABLE "public"."Option";
