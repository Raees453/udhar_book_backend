/*
  Warnings:

  - You are about to drop the column `detetedAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "detetedAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "deleted",
DROP COLUMN "deletedAt";
