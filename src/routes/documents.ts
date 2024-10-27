import { zValidator } from "@hono/zod-validator";
import { confirmDocumentUploadRequest, documentUploadRequest, searchDocumentsRequest } from "../schemas/documents.js";
import { uploadFile } from "../providers/bucket/s3.js";
import { searchTopics } from "../providers/AI/searchTopics.js";
import { getFullPdf } from "../providers/pdf/pdfjs.js";
import { modelTopics } from "../providers/AI/topicModeling.js";
import { extractMetadata } from "../providers/AI/extractMetadata.js";
import { eq, inArray } from "drizzle-orm";
import { createRouter } from "../providers/hono/createApp.js";
import { courses, documents, documentsTopics, files, topics } from "../db/schema.js";

const app = createRouter()

app.post('/documents', zValidator('form', documentUploadRequest),async (c) => {
  const {db} = c.var
  const {file, courseId} = c.req.valid('form')
  const pdfArrayBuffer = await file.arrayBuffer()
  const existingFile = await db.query.files.findFirst({
    where: eq(files.nome, file.name)
  })

  if(existingFile){
    return c.json({
      error: 'File already exists'
    }, {
      status: 409
    })
  }


  const fileId = await uploadFile(Buffer.from(pdfArrayBuffer),file.name, db);

  const fullText = await getFullPdf(pdfArrayBuffer)

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId )
  })

  const metadata = await extractMetadata(fullText)
  const {topicos} = await modelTopics(metadata.resumo, db)


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

app.post("/documents/confirm-upload", zValidator('json', confirmDocumentUploadRequest), async (c) => {
  const {db} = c.var
  const { cursoId, fileId, discente, ano, orientador, palavrasChave, resumo, titulo, topicos } = c.req.valid("json")

  const document = await db.transaction(async tx => {
    const existingTopics = await db.query.topics.findMany({
      where: inArray(topics.nome, topicos)
    });
    const existingTopicNames = new Set(existingTopics.map(t => t.nome));
    const newTopics = topicos.filter(t => !existingTopicNames.has(t));

    const [createdDocument] = await tx.insert(documents).values({
      cursoId,
      discente,
      ano_defesa: ano,
      orientador,
      resumo,
      titulo,
      palavrasChave: palavrasChave,
      arquivoId: fileId,
    }).returning()
    let insertedTopics: typeof existingTopics = []

    if(newTopics.length > 0){
      insertedTopics = await tx.insert(topics).values(newTopics.map(t => ({ nome: t }))).returning()
    }

    const topicsIds = [...existingTopics, ...insertedTopics]

    await tx.insert(documentsTopics).values(topicsIds.map(topic => ({
      documentoId: createdDocument.id,
      topicoId: topic.id
    })))
    return createdDocument;
  })


  return c.json({ success: true, document });
});

app.get("/documents/search", zValidator('query', searchDocumentsRequest), async (c) => {
  const {db} = c.var
  const { search } = c.req.valid("query")
  const topics = await db.query.topics.findMany()

  const topicsIds = await searchTopics(search, topics.map(t => t.id))
  const documentsWithTopics = await db.query.documentsTopics.findMany({
    where: inArray(documentsTopics.topicoId, topicsIds),
    with: {
      documents: {
        documents: {
          with: {
            arquivo: true,
          }
        },
        topics: true,
      }
    }
  })

  return c.json({
    documents: documentsWithTopics
  })

})

export default app
