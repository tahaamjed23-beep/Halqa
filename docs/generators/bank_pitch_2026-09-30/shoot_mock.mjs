// Captures screens the application does not have yet: each one is written in the app's own wallet kit
// (mocks_<bank>.json from mock_screens.py) and injected into a running preview page, so the live stylesheet,
// fonts and tab bar render it. The application code is not changed.
// Usage: node shoot_mock.mjs out_dir mocks.json [base_url]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [, , outDir, mockFile, baseArg] = process.argv;
const BASE = baseArg || 'http://localhost:4100/?preview=1&screen=verify';
const MOCKS = JSON.parse(readFileSync(mockFile, 'utf8'));
mkdirSync(outDir, { recursive: true });
const port = 9335;
const prof = process.env.PROFILE || path.join(outDir, 'cdp-profile-mock');
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

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
for (const [name, html] of Object.entries(MOCKS)) {
  await send('Page.navigate', { url: BASE });
  await sleep(Number(process.env.WAIT || 3500));
  const js = `(() => { const el = document.querySelector('.w-screen'); if (!el) return 'no w-screen';
    el.outerHTML = ${JSON.stringify(html)}; window.scrollTo(0, 0);
    const R = [["Taha Amjed","Taha Kayani"]]; let n, c = 0;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while ((n = w.nextNode())) { for (const [a, b] of R) { if (n.nodeValue.includes(a)) { n.nodeValue = n.nodeValue.split(a).join(b); c++; } } }
    return 'ok ' + c; })()`;
  const r = await send('Runtime.evaluate', { expression: js, returnByValue: true });
  await sleep(700);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(path.join(outDir, name + '.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('saved', name, r.result && r.result.result ? r.result.result.value : '?');
}
ws.close();
chrome.kill();
process.exit(0);
