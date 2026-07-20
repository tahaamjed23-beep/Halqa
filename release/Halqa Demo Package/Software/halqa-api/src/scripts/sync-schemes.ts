import 'dotenv/config';
import { prisma } from '../db';
import { syncSchemeCatalog } from '../lib/scheme-catalog';

async function main() {
  await syncSchemeCatalog(prisma);
  console.log('scheme catalog synced');
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
