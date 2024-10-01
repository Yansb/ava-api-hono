import { Hono } from "hono";
import { prisma } from "../db";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { modelTopics } from "../providers/AI/topicModeling";
import { getFullPdf } from "../providers/pdf/pdfjs";
import { extractMetadata } from "../providers/AI/extractMetadata";
import { confirmDocumentUploadRequest, documentUploadRequest } from "../schemas/documents";
import { uploadFile } from "../providers/bucket/s3";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

app.post('/', zValidator('form', documentUploadRequest),async (c) => {
  const {file, courseId} = c.req.valid('form')
  const pdfArrayBuffer = await file.arrayBuffer()
  const fileId = await uploadFile(Buffer.from(pdfArrayBuffer),file.name);

  const fullText = await getFullPdf(pdfArrayBuffer)

  const course = await prisma.course.findFirst({
    where: {
      id: courseId
    }
  })

  const metadata = await extractMetadata(fullText)
  const topicos = await modelTopics(metadata.resumo)


  if(!course){
    return c.json({
      error: 'Course not found'
    }, {
      status: 404
    })
  }

  return c.json({
    metadata,
    topics: topicos,
    fileId
  })

})

app.post("/confirm-upload", zValidator('json', confirmDocumentUploadRequest), async (c) => {
  const { cursoId, fileId, discente, ano, orientador, palavrasChave, resumo, titulo, topicos } = c.req.valid("json")


  const existingTopics = await prisma.topics.findMany({
    where: {
      nome: {
        in: topicos
      }
    }
  });

  const existingTopicNames = new Set(existingTopics.map(t => t.nome));
  const newTopics = topicos.filter(t => !existingTopicNames.has(t));

  const createdDocument = await prisma.documents.create({
    data: {
      cursoId,
      fileId,
      discente,
      data_defesa: ano,
      orientador,
      resumo,
      titulo,
      palavras_chave: palavrasChave,
      Topics: {
        connect: existingTopics.map(topic => ({ id: topic.id })),
        create: newTopics.map(nome => ({ nome }))
      }
    },
    include: {
      Topics: true
    }
  });

  return c.json({ success: true, document: createdDocument });
});

export default app
