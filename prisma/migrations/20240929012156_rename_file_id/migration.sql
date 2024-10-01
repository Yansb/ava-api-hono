/*
  Warnings:

  - You are about to drop the column `filesId` on the `documentos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `documentos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `documentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_filesId_fkey";

-- DropIndex
DROP INDEX "documentos_filesId_key";

-- AlterTable
ALTER TABLE "documentos" DROP COLUMN "filesId",
ADD COLUMN     "fileId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "documentos_fileId_key" ON "documentos"("fileId");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
