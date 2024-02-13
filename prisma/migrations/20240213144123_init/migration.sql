/*
  Warnings:

  - Added the required column `owner` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "owner" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
