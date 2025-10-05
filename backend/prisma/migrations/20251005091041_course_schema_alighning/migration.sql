/*
  Warnings:

  - You are about to drop the column `adminId` on the `Course` table. All the data in the column will be lost.
  - Added the required column `image_url` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_adminId_fkey";

-- DropIndex
DROP INDEX "public"."Feedback_studentId_key";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "adminId",
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "maximum" INTEGER,
ADD COLUMN     "open" BOOLEAN,
ADD COLUMN     "totalPaid" TEXT;

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
