import { relations, sql } from "drizzle-orm";
import { integer, jsonb, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z} from 'zod'

export const universities = pgTable('universidades', {
  id: uuid().primaryKey().defaultRandom(),
  nome: varchar().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`now()`),
})

export const courses = pgTable('cursos', {
  id: uuid().primaryKey().defaultRandom(),
  nome: varchar().notNull(),
  universidadeId: uuid().notNull().references(() => universities.id),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`now()`),
})

const palavrasChave = z.array(z.string())
type PalavrasChave = z.infer<typeof palavrasChave>

export const files = pgTable('arquivos', {
  id: uuid().primaryKey().defaultRandom(),
  url: varchar().notNull(),
  nome: varchar().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`now()`),
})

export const documents = pgTable('documentos', {
  id: uuid().primaryKey().defaultRandom(),
  titulo: varchar().notNull(),
  discente: varchar().notNull(),
  orientador:  varchar().notNull(),
  resumo: varchar().notNull(),
  palavrasChave: jsonb('palavrasChave').$type<PalavrasChave>().notNull(),
  ano_defesa: integer().notNull(),
  cursoId: uuid().notNull().references(() => courses.id),
  arquivoId: uuid().notNull().references(() => files.id),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`now()`),
})

export const topics = pgTable('topicos', {
  id: uuid().primaryKey().defaultRandom(),
  nome: varchar().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`now()`),
})

export const documentsTopics = pgTable('documentos_topics', {
  documentoId: uuid().notNull().references(() => documents.id),
  topicoId: uuid().notNull().references(() => topics.id),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`now()`),
},(table) => ({
  pk: primaryKey({columns: [table.documentoId, table.topicoId]})
}))

export const documentsRelations = relations(documents, ({ many, one }) => ({
  documentsToTopics: many(documentsTopics),
  arquivos: one(files, {
    fields: [documents.arquivoId],
    references: [files.id]
  }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  documentsToTopics: many(documentsTopics)
}));

export const documentsTopicsRelations = relations(documentsTopics, ({ one }) => ({
  document: one(documents, {
    fields: [documentsTopics.documentoId],
    references: [documents.id]
  }),
  topic: one(topics, {
    fields: [documentsTopics.topicoId],
    references: [topics.id]
  })
}));
