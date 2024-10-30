import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model.js";
import { DBType } from "../../db/types.js";

const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Relacione o texto a tópicos cadastrados no sistema ou crie novos tópicos se nenhum dos cadastrados for altamente relevante.

  Regras:
  - Utilize apenas tópicos cadastrados que sejam altamente específicos e pertinentes ao conteúdo técnico do texto, cobrindo diretamente as áreas de estudo ou tecnologia mencionadas.
  - Se os tópicos cadastrados são apenas vagamente relacionados, gere novos tópicos que representem com precisão o conteúdo técnico do texto.
  - Novos tópicos devem ser focados, de forma a capturar as principais áreas de conhecimento e metodologias do texto.

  Tópicos cadastrados disponíveis:
  {topicos}\n

  Texto:
  {input}
  `
);

const topicsSchema = z.object({
  topicos: z.array(z.object({
    topico: z.string().describe('Um tópico conciso e diretamente ligado ao conteúdo técnico do texto, como "Cristais Fotônicos", "Algoritmos Genéticos", ou "Método dos Elementos Finitos".'),
    importancia: z.number().min(0).max(100).describe('A relevância do tópico para o texto, em uma escala de 0 a 100')
  })).min(1).describe('O texto deve conter pelo menos um tópico')
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
