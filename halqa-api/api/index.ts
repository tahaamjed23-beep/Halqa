// Vercel serverless entry for the Halqa API.
// The Express app lives in ../src/app.ts (routes only, no listen). Socket.io
// chat and the cron delinquency sweep run only under the long-lived server.ts
// process; on serverless they are absent by design — the web app already
// degrades committee chat gracefully, and delinquency runs via Vercel Cron.
// The scheme/partner catalogs are seeded in the database, so no boot sync is
// needed here.
import { app } from '../src/app';
export default app;
