import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  model: 'gpt-3.5-turbo-0125'
})
