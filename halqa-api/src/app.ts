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
import agreementRoutes from './routes/agreements';
import { prisma } from './db';
import { jsonSafe } from './lib/money';
import { verifyPassport } from './lib/passport';
import { assertSecretsStrong } from './lib/security';

assertSecretsStrong(); // refuse to boot in production with weak/default JWT secrets

export const app = express();
app.disable('x-powered-by'); // don't advertise the framework/version to attackers
app.set('trust proxy', 1);   // so rate-limit keys and audit logs see the real client IP behind one proxy
const webOrigins = Array.from(new Set([
  'http://localhost:4100',
  'http://127.0.0.1:4100',
  ...(process.env.WEB_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean),
]));
// Defense-in-depth response headers. The API returns only JSON, so a strict
// CSP that forbids scripts/objects/frames costs nothing and neutralises a whole
// class of content-injection attacks; HSTS forces HTTPS once deployed behind TLS.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } },
  hsts: { maxAge: 15552000, includeSubDomains: true },
  referrerPolicy: { policy: 'no-referrer' },
}));
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
// Vercel Cron entry for the delinquency sweep (reminders, penalties,
// escalation). On serverless there is no long-lived scheduler, so the platform
// cron calls this instead, authenticated with the CRON_SECRET env var that
// Vercel sends as a bearer token. 404s when no secret is configured (e.g. the
// long-lived server, where node-cron owns the sweep).
app.get('/api/cron/delinquency', async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(404).json({ error: 'Route not found' });
    if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });
    const { evaluateDelinquencies } = await import('./services/delinquency');
    res.json(await evaluateDelinquencies());
  } catch (error) { next(error); }
});
// Public Credit Passport verification: a lender/landlord/employer holding a
// member's passport token confirms it here without any Halqa account.
app.get('/api/verify/:token', rateLimit({ windowMs: 15 * 60_000, limit: 60 }), (req, res) => {
  const result = verifyPassport(req.params.token);
  // A landlord/employer opens this link in a browser — render a readable
  // document there; JSON stays for programmatic verification.
  if (req.accepts(['json', 'html']) === 'html') {
    const esc = (v: unknown) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
    const rupees = (paisa: string) => `Rs ${(Number(BigInt(paisa) / 100n)).toLocaleString('en-PK')}`;
    const body = result.valid
      ? `<div class="badge ok">✔ VERIFIED — issued and signed by Halqa</div>
         <h1>${esc(result.passport.fullName)}</h1><p class="sub">@${esc(result.passport.username)} · member since ${new Date(result.passport.memberSince).toLocaleDateString('en-PK')}</p>
         <div class="grid">
           <div><span>Reliability score</span><b>${esc(result.passport.creditScore)}</b></div>
           <div><span>Clean circles completed</span><b>${esc(result.passport.cleanCompletions)}</b></div>
           <div><span>Installments resolved</span><b>${esc(result.passport.paymentsResolved)}</b></div>
           <div><span>On-time rate</span><b>${result.passport.onTimePct === null ? 'No history yet' : esc(result.passport.onTimePct) + '%'}</b></div>
           <div><span>Missed payments</span><b>${esc(result.passport.missedPayments)}</b></div>
           <div><span>Total recorded</span><b>${rupees(result.passport.totalRecordedPaisa)}</b></div>
           <div><span>Default flag</span><b>${result.passport.defaultFlag ? 'YES — active default' : 'None'}</b></div>
           <div><span>Valid until</span><b>${new Date(result.passport.expiresAt).toLocaleDateString('en-PK')}</b></div>
         </div>
         <p class="note">This Credit Passport was generated by the member and cryptographically signed by Halqa. If this page shows VERIFIED, the figures are authentic and unaltered. Generated ${new Date(result.passport.generatedAt).toLocaleString('en-PK')}.</p>`
      : `<div class="badge bad">✖ NOT VERIFIED</div><h1>This document could not be verified</h1><p class="sub">${esc(result.reason)}</p><p class="note">Ask the member to generate a fresh Credit Passport link from their Halqa profile.</p>`;
    return res.status(result.valid ? 200 : 422).type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Halqa Credit Passport</title>
<style>body{margin:0;font-family:Georgia,'Times New Roman',serif;background:#faf7f0;color:#232014;display:flex;justify-content:center;padding:32px 16px}main{max-width:640px;width:100%;background:#fff;border:1px solid #e5dcc3;border-radius:14px;padding:36px;box-shadow:0 8px 30px rgba(80,60,10,.08)}
.badge{display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;letter-spacing:.4px}.badge.ok{background:#f4ecd4;color:#7a5d00;border:1px solid #d9c26a}.badge.bad{background:#fbeaea;color:#8f1d1d;border:1px solid #e3b3b3}
h1{margin:14px 0 2px;font-size:26px}.sub{margin:0 0 20px;color:#8a815f}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.grid div{border:1px solid #efe8d2;border-radius:10px;padding:10px 14px}.grid span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a815f}.grid b{font-size:17px}
.note{margin-top:22px;font-size:12.5px;color:#6d6547;line-height:1.6;border-top:1px solid #efe8d2;padding-top:14px}footer{margin-top:10px;font-size:11px;color:#a79e79}</style></head>
<body><main>${body}<footer>Halqa — Pakistan's digital committee network · halqa-seven.vercel.app</footer></main></body></html>`);
  }
  res.status(result.valid ? 200 : 422).json(result);
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: process.env.NODE_ENV === 'production' ? 30 : process.env.SECURITY_RELAXED === 'true' ? 10_000 : 200 }), authRoutes); // strict in production; dev headroom for suites; effectively off in relaxed demo mode
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
app.use('/api/agreements', agreementRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
  const e = error as { message?: string; status?: number; code?: string };
  if (e.code === 'P2002') return res.status(409).json({ error: 'A unique value already exists' });
  console.error(error);
  return res.status(e.status || 500).json({ error: e.status ? e.message : 'Internal server error' });
});
