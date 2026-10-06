// Phone screenshots of the Halqa preview through the Chrome DevTools Protocol, with the sample user's name set to the
// presenter's (text replaced in the rendered page only; the application code is not touched).
// Usage: node shoot_named.mjs out_dir name=url [name=url ...]
// Env: REPLACE='[["Taha Amjed","Taha Kayani"]]'  WAIT=3500  SCHEME=light
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [, , outDir, ...jobs] = process.argv;
const REPL = JSON.parse(process.env.REPLACE || '[["Taha Amjed","Taha Kayani"]]');
mkdirSync(outDir, { recursive: true });
const port = 9334;
const prof = process.env.PROFILE || path.join(outDir, 'cdp-profile');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--force-color-profile=srgb', 'about:blank'],
  { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const pg = list.find(t => t.type === 'page');
      if (pg) return pg.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('no chrome target');
}

const ws = new WebSocket(await target());
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise(r => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

const swap = `(() => { const R = ${JSON.stringify(REPL)}; let n, c = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while ((n = w.nextNode())) { for (const [a, b] of R) { if (n.nodeValue.includes(a)) { n.nodeValue = n.nodeValue.split(a).join(b); c++; } } }
  return c; })()`;

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: process.env.SCHEME || 'light' }] });
for (const job of jobs) {
  const eq = job.indexOf('=');
  const name = job.slice(0, eq), url = job.slice(eq + 1);
  await send('Page.navigate', { url });
  await sleep(Number(process.env.WAIT || 3500));
  const r = await send('Runtime.evaluate', { expression: swap, returnByValue: true });
  await sleep(400);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(path.join(outDir, name + '.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('saved', name, 'replacements', r.result && r.result.result ? r.result.result.value : '?');
}
ws.close();
chrome.kill();
process.exit(0);
