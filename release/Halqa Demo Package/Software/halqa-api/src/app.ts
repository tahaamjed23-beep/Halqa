import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import authRoutes from './routes/auth';
import committeeRoutes from './routes/committees';
import schemeRoutes from './routes/schemes';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import profileRoutes from './routes/profile';
import exchangeRoutes from './routes/exchange';
import riskRoutes from './routes/risk';
import protectionRoutes from './routes/protection';
import partnerRoutes from './routes/partner';
import vaultRoutes from './routes/vault';
import { prisma } from './db';
import { jsonSafe } from './lib/money';
import { verifyPassport } from './lib/passport';

export const app = express();
const webOrigins = Array.from(new Set([
  'http://localhost:4100',
  'http://127.0.0.1:4100',
  ...(process.env.WEB_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean),
]));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: webOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60_000, limit: 1500, standardHeaders: 'draft-7' })); // sized for three consecutive integration runs (~250 requests each) with headroom
app.use((_req, res, next) => {
  const original = res.json.bind(res);
  res.json = (body: unknown) => original(jsonSafe(body));
  next();
});
// Structured request log: one JSON line per request (health excluded), so
// latency and error spikes are greppable instead of invisible.
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    if (req.path === '/api/health') return;
    const line = JSON.stringify({ t: new Date().toISOString(), method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - started });
    if (res.statusCode >= 500) console.error(line); else console.log(line);
  });
  next();
});
const bootedAt = Date.now();
app.get('/api/health', async (_req, res) => {
  const db = await prisma.$queryRaw`SELECT 1`.then(() => 'ok').catch(() => 'down');
  res.status(db === 'ok' ? 200 : 503).json({ status: db === 'ok' ? 'ok' : 'degraded', db, stage: 'record-only-prototype', uptimeSec: Math.round((Date.now() - bootedAt) / 1000), at: new Date().toISOString() });
});
// Public Credit Passport verification: a lender/landlord/employer holding a
// member's passport token confirms it here without any Halqa account.
app.get('/api/verify/:token', rateLimit({ windowMs: 15 * 60_000, limit: 60 }), (req, res) => {
  const result = verifyPassport(req.params.token);
  res.status(result.valid ? 200 : 422).json(result);
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 30 }), authRoutes);
app.use('/api/committees', committeeRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/protection', protectionRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/vault', vaultRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
  const e = error as { message?: string; status?: number; code?: string };
  if (e.code === 'P2002') return res.status(409).json({ error: 'A unique value already exists' });
  console.error(error);
  return res.status(e.status || 500).json({ error: e.status ? e.message : 'Internal server error' });
});
