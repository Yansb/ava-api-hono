import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { model } from "./model.js";


const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Extraia apenas as informações contidas no texto de monografias do ensino superior.

  Regras:
  - Extraia apenas as propriedades mencionadas na função 'Classification'.
  - Não invente metadados; extraia apenas os que estão presentes no texto.
  - Se palavras-chave não estiverem presentes no texto, deixe o campo "palavras-chave" em branco.

Texto:
{input}
`
);

const dadosSchema = z.object({
  titulo: z.string().describe("O título do trabalho"),
  discente: z.string().describe("Nome do aluno que foi o autor do trabalho"),
  orientador: z.string().describe("Nome do orientador responsável por orientar o aluno pelo trabalho"),
  resumo: z.string().describe("Resumo do trabalho escrito pelo autor"),
  palavrasChave: z.array(z.string()).describe("Array com as palavras-chave definidas pelo autor do texto. Se o texto não contiver palavras-chave, deixe o array vazio"),
  ano: z.number().describe("Ano em que foi publicada a monografia")
}).describe("Metadados extraídos de uma monografia");

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
