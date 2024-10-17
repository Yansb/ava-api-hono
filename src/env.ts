import { config } from 'dotenv'
import { z } from 'zod'


config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  UNEB_UUID: z.string().uuid(),
  SI_UUID: z.string().uuid(),
  OPENAI_API_KEY: z.string(),
  AWS_BUCKET_URI: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  DATABASE_URL: z.string().url(),
})

export const env = EnvSchema.parse(process.env)
