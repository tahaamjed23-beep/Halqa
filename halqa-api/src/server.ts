import 'dotenv/config';
import http from 'node:http';
import { Server } from 'socket.io';
import { app } from './app';
import { prisma } from './db';
import { registerSocket } from './socket';
import cron from 'node-cron';
import { evaluateDelinquencies } from './services/delinquency';
import { syncSchemeCatalog } from './lib/scheme-catalog';
import { syncPartnerCatalog } from './lib/partner-catalog';

for (const key of ['DATABASE_URL','JWT_SECRET','JWT_REFRESH_SECRET']) if (!process.env[key]) throw new Error(`Missing ${key}`);
const server = http.createServer(app);
const webOrigins = Array.from(new Set([
  'http://localhost:4100',
  'http://127.0.0.1:4100',
  ...(process.env.WEB_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean),
]));
const io = new Server(server, { cors: { origin: webOrigins } });
registerSocket(io);
const port = Number(process.env.PORT || 4101);
const start = async () => {
  await syncSchemeCatalog(prisma);
  await syncPartnerCatalog(prisma);
  server.listen(port, () => console.log(`Halqa API listening on http://localhost:${port}`));
  cron.schedule('7 * * * *',()=>{void evaluateDelinquencies().catch(error=>console.error('Delinquency scheduler failed',error))});
  setTimeout(()=>{void evaluateDelinquencies().catch(error=>console.error('Initial delinquency check failed',error))},5_000);
};
void start().catch(error => {
  console.error('Failed to boot Halqa API', error);
  process.exit(1);
});
const shutdown = async () => { await prisma.$disconnect(); server.close(() => process.exit(0)); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
