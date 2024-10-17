import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model.js";
import { prisma } from "../../db.js";

const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Relaciona o texto a tópicos cadastrados no sistema e gera novos tópicos caso nenhum se encaixe.

Estes são os tópicos já cadastrados no sistema, só utilize os topicos que forem relevantes:
{topicos}\n


Texto:
{input}
`
);

const topicsSchema = z.object({
  topicos: z.array(z.object({
    topico: z.string().describe('Um tópico do texto. Um tópico deve ser composto por poucas palavras, como "Inteligência Artificial", "Machine Learning" ou "Jogos".'),
    importancia: z.number().min(0).max(100).describe('A importância do tópico entre 0 e 100')
  })).min(2).describe('Um texto deve ter no minimo dois tópicos'),
})

const modelWithStructuredOutput = model.withStructuredOutput(topicsSchema, {
  name: 'topics'
})

const taggingChain = taggingPrompt.pipe(modelWithStructuredOutput);

export const modelTopics = async (abstract: string): Promise<z.infer<typeof topicsSchema>> => {
  const topics = await prisma.topics.findMany()
  const topicos = topics.map(t => t.nome).join(', ')
  const result = await taggingChain.invoke({
    input: abstract,
    topicos
  })

  return result
}
