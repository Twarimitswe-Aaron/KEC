-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "district" TEXT,
ADD COLUMN     "sector" TEXT;

-- AlterTable
ALTER TABLE "Workshop" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
