import {z} from "zod"

export const documentUploadRequest = z.object({
  file: z.any().refine((file) => file instanceof File, {
    message: 'Expected a File instance'
  }),
  courseId: z.string().uuid(),
})

export const confirmDocumentUploadRequest = z.object({
  fileId: z.string().uuid(),
  titulo: z.string(),
  discente: z.string(),
  orientador: z.string(),
  resumo: z.string(),
  palavrasChave: z.array(z.string()),
  ano: z.number(),
  topicos: z.array(z.string()),
  cursoId: z.string().uuid()
})

export const searchDocumentsRequest = z.object({
  search: z.string().min(1, 'A busca não pode ser vazia'),
  topicsIds: z.array(z.string().uuid()).optional(),
})
export const searchDocumentsResponseTopics = z.array(z.object({
  id: z.string().uuid(),
  nome: z.string()
}))
export const searchDocumentsResponse = z.object({
  topics: searchDocumentsResponseTopics,
  documents: z.array(z.object({
    id: z.string().uuid(),
    titulo: z.string(),
    discente: z.string(),
    orientador: z.string(),
    resumo: z.string(),
    palavrasChave: z.array(z.string()),
    ano: z.number(),
    topicos: z.array(z.object({
      id: z.string().uuid(),
      nome: z.string()
    })),
    curso: z.object({
      id: z.string().uuid(),
      nome: z.string()
    })
  }))
})

export type SearchDocumentsResponseTopics = z.infer<typeof searchDocumentsResponseTopics>
