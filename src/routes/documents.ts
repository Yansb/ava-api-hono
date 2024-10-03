import { Hono } from "hono";
import { prisma } from "../db.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { confirmDocumentUploadRequest, documentUploadRequest, searchDocumentsRequest } from "../schemas/documents.js";
import { uploadFile } from "../providers/bucket/s3.js";
import { searchTopics } from "../providers/AI/searchTopics.js";
import { getFullPdf } from "../providers/pdf/pdfjs.js";
import { modelTopics } from "../providers/AI/topicModeling.js";
import { extractMetadata } from "../providers/AI/extractMetadata.js";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

app.post('/', zValidator('form', documentUploadRequest),async (c) => {
  const {file, courseId} = c.req.valid('form')
  const pdfArrayBuffer = await file.arrayBuffer()
  const existingFile = await prisma.files.findFirst({
    where: {
      nome: file.name
    }
  })
  let fileId: string | undefined = existingFile?.id

  if(!fileId){
    fileId = await uploadFile(Buffer.from(pdfArrayBuffer),file.name);
  }

  const fullText = await getFullPdf(pdfArrayBuffer)

  const course = await prisma.course.findFirst({
    where: {
      id: courseId
    }
  })

  const metadata = await extractMetadata(fullText)
  const {topicos} = await modelTopics(metadata.resumo)


  if(!course){
    return c.json({
      error: 'Course not found'
    }, {
      status: 404
    })
  }

  return c.json({
    metadata,
    topicos,
    fileId,
    cursoId: course.id
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

app.get("/search", zValidator('query', searchDocumentsRequest), async (c) => {
  const { search } = c.req.valid("query")
  const topics = await prisma.topics.findMany({
    select: {
      nome: true
    }
  })

  const textTopics = await searchTopics(search, topics.map(t => t.nome))
  const documentsWithTopics = await prisma.documents.findMany({
    where: {
      Topics: {
        some: {
          nome: {
            in: textTopics
          }
        }
      }
    },
    include: {
      Topics: true,
      arquivo: true
    }
  })

  return c.json({
    documents: documentsWithTopics
  })

})

export default app
