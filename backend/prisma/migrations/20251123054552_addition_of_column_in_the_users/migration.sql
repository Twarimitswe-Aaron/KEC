-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "isVisibleOnTeam" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "isVisibleOnTeam" BOOLEAN NOT NULL DEFAULT false;
