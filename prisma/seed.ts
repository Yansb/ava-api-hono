import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const uneb = await prisma.university.upsert({
    where: { id: process.env.UNEB_UUID },
    update: {},
    create: {
      id: process.env.UNEB_UUID,
      nome: 'UNEB - Universidade do Estado Da Bahia',
    },
  });

  const course = await prisma.course.upsert({
    where: { id: process.env.SI_UUID },
    update: {},
    create: {
      id: process.env.SI_UUID,
      nome: 'Sistemas de Informação',
      universidadeId: uneb.id,
    },
  });

  console.log({ uneb, course });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
