-- CreateTable
CREATE TABLE "universidades" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "universidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "universidadeId" UUID NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "discente" TEXT NOT NULL,
    "orientador" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "palavras_chave" JSONB[],
    "data_defesa" TIMESTAMP(3) NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "cursoId" UUID NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topics" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentsToTopics" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentsToTopics_AB_unique" ON "_DocumentsToTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentsToTopics_B_index" ON "_DocumentsToTopics"("B");

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_universidadeId_fkey" FOREIGN KEY ("universidadeId") REFERENCES "universidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentsToTopics" ADD CONSTRAINT "_DocumentsToTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentsToTopics" ADD CONSTRAINT "_DocumentsToTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
