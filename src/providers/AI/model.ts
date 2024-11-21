import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  model: 'gpt-4o-mini'
})
