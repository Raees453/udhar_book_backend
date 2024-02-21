-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "childId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
