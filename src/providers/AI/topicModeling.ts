import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model.js";
import { DBType } from "@/db/types.js";

const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Relaciona o texto a tópicos cadastrados no sistema, gerando novos tópicos caso nenhum dos já cadastrados seja relevante.
  Utilize apenas tópicos cadastrados se eles forem altamente relevantes e adequados ao contexto do texto.
  Se o tópico for apenas semelhante, mas não for claramente relevante, gere um novo.

Estes são os tópicos já cadastrados no sistema, só utilize tópicos que forem claramente relevantes:
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

export const modelTopics = async (abstract: string, db: DBType): Promise<z.infer<typeof topicsSchema>> => {
  const topics = await db.query.topics.findMany()

  const topicos = topics.map(t => t.nome).join(', ')

  const result = await taggingChain.invoke({
    input: abstract,
    topicos
  })

  return result
}
