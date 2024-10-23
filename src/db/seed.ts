import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js"
import { eq } from "drizzle-orm";
import { env } from "../env.js";
export async function seed(db: NodePgDatabase<typeof schema>){
  let uneb = await db.query.universities.findFirst({
    where: eq(schema.universities.id, env.UNEB_UUID)
  });

  if(!uneb){
    [uneb] = await db.insert(schema.universities).values({
      nome: 'UNEB - Universidade do Estado Da Bahia',
      id: env.UNEB_UUID,
    }).returning()
  }

  const course = await db.query.courses.findFirst({
    where: eq(schema.courses.id, env.SI_UUID)
  })

  if(!course){
    await db.insert(schema.courses).values({
      nome: 'Sistemas de Informação',
      universidadeId: uneb.id,
      id: env.SI_UUID
    })
  }

}
