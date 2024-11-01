import { zValidator } from "@hono/zod-validator";
import { confirmDocumentUploadRequest, documentUploadRequest, searchDocumentsRequest, SearchDocumentsResponseTopics } from "../schemas/documents.js";
import { uploadFile } from "../providers/bucket/s3.js";
import { searchTopics } from "../providers/AI/searchTopics.js";
import { getFullPdf } from "../providers/pdf/pdfjs.js";
import { modelTopics } from "../providers/AI/topicModeling.js";
import { extractMetadata } from "../providers/AI/extractMetadata.js";
import { desc, eq, inArray, sql } from "drizzle-orm";
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
  const { db } = c.var;
  let { search, topicsIds } = c.req.valid("query");
  let topicsObject: SearchDocumentsResponseTopics = []
  if(topicsIds){
    topicsObject = await db.query.topics.findMany({
      columns: {
        id: true,
        nome: true
      },
      where: inArray(topics.id, topicsIds)
    })
  }else if(search){
    const registeredTopics = await db.query.topics.findMany();

    const selectedTopics = await searchTopics(search, registeredTopics.map(t => t.nome));

    topicsObject = registeredTopics.filter(t => selectedTopics.includes(t.nome));
    topicsIds = topicsObject.map(t => t.id);
  }else{
    return c.json({
      error: 'Expected at least one of search or topicsIds'
    }, {
      status: 400
    })
  }

  const documentsWithTopics = await db
  .selectDistinct({documentoId: documentsTopics.documentoId})
  .from(documentsTopics)
  .where(inArray(documentsTopics.topicoId, topicsIds))
  .execute()

  const distinctDocuments = await db.query.documents.findMany({
    where: inArray(documents.id, documentsWithTopics.map(d => d.documentoId)),
    orderBy: desc(documents.createdAt),
    with: {
      arquivos: {
        columns: {
          id: true,
          nome: true,
          url: true
        },
      },
      documentsToTopics: {
        columns: {},
        with: {
          topic: true
        }
      }
    }
  });

  return c.json({
    topics: topicsObject,
    documents: distinctDocuments,
  });
});

export default app
