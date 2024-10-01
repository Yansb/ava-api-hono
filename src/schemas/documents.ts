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
