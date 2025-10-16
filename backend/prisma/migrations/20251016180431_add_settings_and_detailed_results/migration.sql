-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "settings" TEXT;

-- AlterTable
ALTER TABLE "public"."QuizAttempt" ADD COLUMN     "detailedResults" TEXT;
