import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model";


const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Extrai a informação desejada de monografias do ensino superior.

Só extraia as propriedades mencionadas na função 'Classification'.
Não invente metadados apenas extraia os que estão contidos no texto.

Texto:
{input}
`
);

const dadosSchema = z.object({
  titulo: z.string().describe("O titulo do trabalho"),
  discente: z.string().describe("Nome do aluno que foi o autor do trabalho"),
  orientador: z.string().describe("Nome do orientador responsavel por orientar o aluno pelo trabalho"),
  resumo: z.string().describe("Resumo do trabalho escrito pelo autor"),
  palavrasChave: z.array(z.string()).describe("Array com as palavras-chave definidas pelo autor do texto"),
  ano: z.number().describe("Ano em que foi publicada a monografia")
}).describe("Metadados extraidos de uma monografia")

const modelWithStructuredOutput = model.withStructuredOutput(dadosSchema, {
  name: 'dados'
})

const taggingChain = taggingPrompt.pipe(modelWithStructuredOutput);

export const extractMetadata = async (text: string): Promise<z.infer<typeof dadosSchema>> => {
  const metadata = await taggingChain.invoke({
    input: text
  })

  return metadata

}
