import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model.js";


const searchTopicsPrompt = ChatPromptTemplate.fromTemplate(
  `Lista quais tópicos de uma lista de tópicos são relevantes para um texto.

  Liste apenas os tópicos relevantes para o texto.
  Não liste tópicos que não estão na lista.
  Caso o texto não tenha nenhum tópico que possa ser relevante na lista, não retorne nenhum tópico.

  Lista de tópicos:
  {topics}\n

  Texto:
  {query}\n
`
);

const dadosSchema = z.object({
  topicos: z.array(z.object({
    topico: z.string().describe('Um tópico presente na lista e relacionado ao texto'),
    explicacao: z.string().describe('Uma explicação sobre o porque o tópico é relevante para o texto')
  })).describe("Array com os tópicos relevantes ao texto, em conjunto com a explicação para escolha do tópico")
}).describe("Tópicos relevantes ao texto")

const modelWithStructuredOutput = model.withStructuredOutput(dadosSchema, {
  name: 'dados'
})

const taggingChain = searchTopicsPrompt.pipe(modelWithStructuredOutput);

export const searchTopics = async (query: string, topics: string[]): Promise<string[]> => {

  const {topicos} = await taggingChain.invoke({
    query,
    topics: topics.join(', ')
  })
  console.log(topicos)
  return topicos.map(t => t.topico)

}
