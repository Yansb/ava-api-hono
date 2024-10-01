import { PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import { prisma } from "../../db"

const s3Client = new S3Client({
region: "sa-east-1"
})

export async function uploadFile(file: Buffer,fileName:string){
  const response = await s3Client.send(
    new PutObjectCommand({
      Bucket: "tcc-yan-uneb",
      Key: fileName,
      Body: file,
    })
  )

  const fileUrl = process.env.AWS_BUCKET_URI + encodeURIComponent(fileName)

  const dbFile= await prisma.files.create({
    data: {
      nome: fileName,
      url: fileUrl,
    }
  })

  return dbFile.id
}
