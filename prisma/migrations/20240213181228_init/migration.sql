/*
  Warnings:

  - Made the column `owner` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "owner" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_owner_fkey" FOREIGN KEY ("owner") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
