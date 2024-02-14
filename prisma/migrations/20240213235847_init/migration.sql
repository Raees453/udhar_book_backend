/*
  Warnings:

  - You are about to drop the column `owner` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `tenant` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_owner_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "owner",
DROP COLUMN "tenant",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
