-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'ENDED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "templateType" TEXT DEFAULT 'HTML',
ADD COLUMN     "templateUrl" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "sessionId" TEXT;
