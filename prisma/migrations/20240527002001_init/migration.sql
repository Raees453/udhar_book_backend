/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phone_key" ON "Contact"("phone");
