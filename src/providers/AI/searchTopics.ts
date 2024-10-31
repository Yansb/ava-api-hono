import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model.js";


const searchTopicsPrompt = ChatPromptTemplate.fromTemplate(
  `Liste quais tópicos da lista a seguir são relevantes para o texto fornecido.

  **Instruções rigorosas**:
  - Retorne somente os tópicos da "Lista de Tópicos" que estejam claramente relacionados ao conteúdo do "Texto".
  - Não crie nem adicione tópicos novos. Só retorne os que estão na "Lista de Tópicos".
  - Se nenhum tópico da lista for relevante, devolva uma lista vazia sem inventar ou sugerir qualquer tópico.

  Lista de Tópicos:
  {topics}\n

  Texto:
  {query}\n
`
);

const dadosSchema = z.object({
  topicos: z.array(z.object({
    topico: z.string().describe('Um tópico presente na lista e relacionado ao texto'),
  })).describe("Array com os tópicos relevantes ao texto")
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
