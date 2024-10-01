/*
  Warnings:

  - You are about to drop the column `nome_arquivo` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the `Topics` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[filesId]` on the table `documentos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `cursos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filesId` to the `documentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `documentos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `data_defesa` on the `documentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `universidades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_DocumentsToTopics" DROP CONSTRAINT "_DocumentsToTopics_B_fkey";

-- AlterTable
ALTER TABLE "cursos" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "documentos" DROP COLUMN "nome_arquivo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filesId" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "data_defesa",
ADD COLUMN     "data_defesa" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "universidades" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Topics";

-- CreateTable
CREATE TABLE "topicos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentos_filesId_key" ON "documentos"("filesId");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_filesId_fkey" FOREIGN KEY ("filesId") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentsToTopics" ADD CONSTRAINT "_DocumentsToTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "topicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
