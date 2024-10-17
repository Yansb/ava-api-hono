import { PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { env } from "@/env.js"
import {  NodePgDatabase } from "drizzle-orm/node-postgres"
import * as schemas from "@/db/schema"

const s3Client = new S3Client({
region: "sa-east-1"
})

export async function uploadFile(file: Buffer,fileName:string, db: NodePgDatabase<typeof schemas>){
  const response = await s3Client.send(
    new PutObjectCommand({
      Bucket: "tcc-yan-uneb",
      Key: fileName,
      Body: file,
    })
  )

  const fileUrl = env.AWS_BUCKET_URI + encodeURIComponent(fileName)

  const [dbFile]= await db.insert(schemas.files).values({
    nome: fileName,
    url: fileUrl
  }).returning()

  return dbFile.id
}
