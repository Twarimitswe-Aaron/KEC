/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId]` on the table `Certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Certificates" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Certificates_studentId_courseId_key" ON "Certificates"("studentId", "courseId");
