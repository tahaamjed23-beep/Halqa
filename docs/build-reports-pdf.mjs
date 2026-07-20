// Combine docs/reports/*.md into one print-ready HTML file.
// Usage: node docs/build-reports-pdf.mjs  →  docs/HALQA-ALL-REPORTS-v3.html
// Then print to PDF with headless Chrome. Minimal renderer: covers exactly
// the markdown these reports use (headings, bold/italic, lists, tables, links).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sub = process.argv[2] || 'reports';
const outName = process.argv[3] || 'HALQA-ALL-REPORTS-v3';
const docTitle = process.argv[4] || 'The Nine Reports — v3, expanded';
const dir = join(here, sub);
const files = readdirSync(dir).filter(f => f.endsWith('.md')).sort();

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\*([^*]+)\*/g, '<i>$1</i>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1">$1</a>');

function render(md) {
  const out = [];
  let list = 0, table = false; // list = current <ul> nesting depth
  const closeList = () => { while (list > 0) { out.push('</ul>'); list--; } };
  const closeTable = () => { if (table) { out.push('</table>'); table = false; } };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, '  ');
    const h = line.match(/^(#{1,4}) (.*)$/);
    const li = line.match(/^(\s*)- (.*)$/);
    if (h) { closeList(); closeTable(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    if (li) {
      closeTable();
      const depth = Math.floor(li[1].length / 2) + 1;
      while (list < depth) { out.push('<ul>'); list++; }
      while (list > depth) { out.push('</ul>'); list--; }
      out.push(`<li>${inline(li[2])}</li>`); continue;
    }
    if (/^\|/.test(line)) {
      closeList();
      if (/^\|[\s\-|]+\|$/.test(line)) continue; // separator row
      if (!table) { out.push('<table>'); table = true; }
      const cells = line.split('|').slice(1, -1).map(c => inline(c.trim()));
      out.push('<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>');
      continue;
    }
    closeList(); closeTable();
    if (/^\*.*\*$/.test(line.trim())) { out.push(`<p class="note">${inline(line.trim().slice(1, -1))}</p>`); continue; }
    if (line.trim() === '') continue;
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList(); closeTable();
  return out.join('\n');
}

const body = files.map((f, i) => {
  const html = render(readFileSync(join(dir, f), 'utf8'));
  return `<section${i > 0 ? ' style="page-break-before:always"' : ''}>${html}</section>`;
}).join('\n');

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Halqa — ${docTitle}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1a2b23;max-width:820px;margin:40px auto;line-height:1.55;font-size:11.5pt}
  h1{font-size:20pt;color:#1c6349;border-bottom:3px solid #1c6349;padding-bottom:6px}
  h2{font-size:14pt;color:#1c6349;margin-top:1.4em}
  h3{font-size:11.5pt;color:#444;font-style:italic;font-weight:normal}
  h4{font-size:11pt;color:#1c6349}
  table{border-collapse:collapse;margin:10px 0;width:100%}
  td{border:1px solid #b9cfc5;padding:5px 8px;font-size:10pt;vertical-align:top}
  tr:first-child td{background:#eaf3ee;font-weight:bold}
  ul{margin:6px 0;padding-left:22px}
  li{margin:3px 0}
  code{background:#f0f4f2;padding:1px 4px;border-radius:3px;font-size:10pt}
  a{color:#1c6349;word-break:break-all}
  .note{color:#555;font-style:italic;font-size:10.5pt}
  section{margin-bottom:30px}
</style></head><body>
<div style="text-align:center;margin-bottom:50px"><h1 style="border:none">HALQA</h1>
<p class="note">${docTitle} · 2026-07-13 · prepared for the chairman</p></div>
${body}
</body></html>`;

writeFileSync(join(here, `${outName}.html`), page);
console.log(`Wrote ${outName}.html (${files.length} files, ${(page.length / 1024).toFixed(0)} KB)`);
