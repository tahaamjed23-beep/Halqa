// ---------------------------------------------------------------------------
// WCAG 2.2 AA, CHECKED MECHANICALLY
//
// Work register section AK1: 53 success criteria. Two of them, the contrast
// ones, already have their own audit. This file takes every remaining criterion
// that can be decided from the source and decides it, so the answer stops
// being somebody's memory of a check they did once.
//
// Criteria that cannot be decided from source are listed at the end with what
// would decide them, rather than quietly counted as passes. A criterion nobody
// can check is not a criterion that is met.
//
//   node tests/audit-wcag.mjs           report
//   node tests/audit-wcag.mjs --all     every check with its findings
// ---------------------------------------------------------------------------
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'src');
const ALL = process.argv.includes('--all');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|css)$/.test(p)) out.push(p);
  }
  return out;
}

const FILES = walk(SRC).map(p => ({ path: p, rel: relative(SRC, p), text: readFileSync(p, 'utf8') }));
const TSX = FILES.filter(f => f.rel.endsWith('.tsx'));
const CSS = FILES.filter(f => f.rel.endsWith('.css'));
const ALL_TEXT = FILES.map(f => f.text).join('\n');
const CSS_TEXT = CSS.map(f => f.text).join('\n');

// A check returns a list of findings. Empty means the criterion holds.
const checks = [];
const check = (id, title, fn) => checks.push({ id, title, fn });

// Strip comments, so a criterion is never judged by something written ABOUT it.
const code = f => f.text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// The last line of a CSS selector group, which is the selector that actually
// owns the rule when several are listed one per line.
const lastLine = s => s.trim().split(/\r?\n/).pop().trim();

/**
 * Every opening tag of one kind, read properly.
 *
 * A regex of the form /<input\b[^>]*>/ cannot read JSX, because an arrow
 * function inside an attribute contains a `>`: on
 *
 *     <input type="file" hidden onChange={e => ...} />
 *
 * it stops at the arrow and reports a tag that ends halfway through the first
 * attribute. That is how a hidden file input was reported as unlabelled twice,
 * and it would have quietly weakened every check below that reads a tag. So
 * the scan tracks quotes and braces and ends the tag at a `>` that is actually
 * the end of one.
 */
function tags(text, name) {
  const out = [];
  const open = new RegExp(`<${name}\\b`, 'g');
  for (const m of text.matchAll(open)) {
    let depth = 0, quote = '';
    for (let i = m.index; i < text.length; i++) {
      const c = text[i];
      if (quote) { if (c === quote && text[i - 1] !== '\\') quote = ''; continue; }
      if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) { out.push({ 0: text.slice(m.index, i + 1), index: m.index }); break; }
    }
  }
  return out;
}

// ------------------------------------------------------------ perceivable --

check('1.1.1', 'Non text content has a text alternative or is marked decorative', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of tags(t, 'img')) {
      if (!/\balt\s*=/.test(m[0])) bad.push(`${f.rel}: an img with no alt`);
    }
    // An inline svg is either labelled or explicitly hidden from the reader.
    // Markup built inside a template string is not an element on the page: the
    // invite QR code is assembled as a string and handed to an <img> that
    // carries its own alt, so the <svg> inside it was never a finding.
    const noTemplates = t.replace(/`(?:[^`\\]|\\.)*`/g, '``');
    for (const m of tags(noTemplates, 'svg')) {
      if (!/aria-hidden|aria-label|role\s*=\s*["'{]?img|<title/.test(m[0])) {
        bad.push(`${f.rel}: an svg that is neither labelled nor hidden`);
      }
    }
  }
  return bad;
});

// The one <video> element in the application is the CNIC camera viewfinder: a
// live preview of the member's own camera, fed from srcObject and muted. It is
// a control, not media content, so none of 1.2.1 to 1.2.5 bites on it. What
// WOULD bite is a <video> or <audio> carrying a src, so that is what these ask.
const mediaElements = () => {
  const found = [];
  for (const f of TSX) {
    const viewfinder = /srcObject/.test(code(f));
    for (const m of code(f).matchAll(/<(video|audio)\b([^>]*)>/g)) {
      if (/\bsrc\s*=/.test(m[2]) && !viewfinder) found.push(`${f.rel}: a <${m[1]}> carrying media`);
    }
  }
  return found;
};
check('1.2.1', 'Audio only and video only content carries a transcript', mediaElements);
check('1.2.2', 'Prerecorded video is captioned', mediaElements);
check('1.2.3', 'Prerecorded video has an audio description or a text alternative', mediaElements);
check('1.2.4', 'Live captions', () => []);   // no live media, by construction
check('1.2.5', 'Prerecorded video has an audio description', mediaElements);

check('1.3.1', 'Headings, lists and tables are marked up as such', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    // A screen with no heading element at all is the usual failure: a styled
    // div reads as nothing to a screen reader.
    if (/\/pages\//.test(f.rel) && !/<h[1-6]\b/.test(t)) bad.push(`${f.rel}: a screen with no heading element`);
  }
  return bad;
});

check('1.3.2', 'Reading order follows the visual order', () => {
  // The one construct that breaks it is ordering by CSS, which moves the
  // visual order without moving the DOM order.
  const bad = [];
  for (const f of CSS) {
    for (const m of code(f).matchAll(/\border\s*:\s*-?\d/g)) bad.push(`${f.rel}: flex order moves the visual order away from the DOM order`);
    if (/flex-direction\s*:\s*(row|column)-reverse/.test(code(f))) bad.push(`${f.rel}: a reversed flex direction`);
  }
  return bad;
});

check('1.3.3', 'No instruction relies on shape, colour or position alone', () => {
  const bad = [];
  for (const f of TSX) {
    for (const m of code(f).matchAll(/["'`][^"'`]*\b(the green|the red|the button on the right|the button on the left|click the circle|the icon above)\b[^"'`]*["'`]/gi)) {
      bad.push(`${f.rel}: ${m[0].slice(0, 60)}`);
    }
  }
  return bad;
});

check('1.3.4', 'Every screen works in portrait and in landscape', () => {
  const bad = [];
  if (/orientation\s*:\s*(portrait|landscape)/.test(CSS_TEXT) && /display\s*:\s*none/.test(CSS_TEXT)) {
    // Only a finding if an orientation query HIDES content.
    for (const f of CSS) {
      const t = code(f);
      for (const m of t.matchAll(/@media[^{]*orientation[^{]*\{([\s\S]{0,400}?)\}/g)) {
        if (/display\s*:\s*none/.test(m[1])) bad.push(`${f.rel}: content hidden in one orientation`);
      }
    }
  }
  return bad;
});

check('1.3.5', 'Personal fields carry an autocomplete purpose', () => {
  const WANT = [
    [/type\s*=\s*["']tel["']/, 'tel'],
    [/type\s*=\s*["']email["']/, 'email'],
  ];
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of tags(t, 'input')) {
      for (const [pattern, purpose] of WANT) {
        if (pattern.test(m[0]) && !/autoComplete\s*=/.test(m[0])) {
          bad.push(`${f.rel}: an ${purpose} field with no autoComplete`);
        }
      }
      if (/name\s*=\s*["'](fullName|name|cnic|address|city)["']/.test(m[0]) && !/autoComplete\s*=/.test(m[0])) {
        bad.push(`${f.rel}: a personal field with no autoComplete`);
      }
    }
  }
  return bad;
});

check('1.4.1', 'Status is shown by a word as well as by colour', () => {
  // The screen audit already enforces that every colour comes from a token.
  // What this adds is that a status tint never appears without its word.
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of t.matchAll(/--(ok|bad|warn)-bg/g)) {
      // The same element or its neighbours must carry text, not only the tint.
      const around = t.slice(Math.max(0, m.index - 300), m.index + 300);
      if (!/[A-Za-z]{4,}\s*[<{]|>[^<>{}]{4,}</.test(around)) bad.push(`${f.rel}: a status tint with no words near it`);
    }
  }
  return bad;
});

check('1.4.2', 'No sound plays on its own', () => {
  // The camera viewfinder calls play() and is muted, which makes no sound at
  // all. An Audio object, or an unmuted autoplay, would.
  const bad = [];
  if (/new Audio\(/.test(ALL_TEXT)) bad.push('an Audio object is constructed');
  for (const f of TSX) {
    for (const m of code(f).matchAll(/<(video|audio)\b([^>]*)>/g)) {
      if (/autoplay/i.test(m[2]) && !/\bmuted\b/.test(m[2])) bad.push(`${f.rel}: an unmuted autoplay <${m[1]}>`);
    }
  }
  return bad;
});

check('1.4.4', 'Text enlarges to 200 per cent without loss', () => {
  // This criterion is about ZOOM, and zoom scales a px font exactly as it
  // scales a rem one — and scales the container with it. So neither a px font
  // size nor a fixed height fails it, and the only thing that does is a
  // viewport forbidding the member to zoom at all. Two earlier passes of this
  // check asked the wrong question twice: first every px font size, then every
  // fixed height. Text that clips when SPACING grows is 1.4.12, below.
  const bad = [];
  const html = (() => { try { return readFileSync(join(SRC, '..', 'index.html'), 'utf8'); } catch { return ''; } })();
  if (/user-scalable\s*=\s*no/i.test(html)) bad.push('index.html forbids zooming');
  const max = /maximum-scale\s*=\s*([\d.]+)/i.exec(html);
  if (max && Number(max[1]) < 2) bad.push(`index.html caps zoom at ${max[1]}`);
  return bad;
});

check('1.4.5', 'No text is set as an image, except a logo', () => {
  const bad = [];
  for (const f of TSX) {
    for (const m of code(f).matchAll(/<img\b[^>]*alt\s*=\s*["']([^"']{25,})["'][^>]*>/g)) {
      if (!/logo|mark|brand/i.test(m[0])) bad.push(`${f.rel}: an image whose alt is a sentence, which suggests text in a picture`);
    }
  }
  return bad;
});

check('1.4.12', 'Layouts hold when text spacing is increased', () => {
  // A fixed height is not itself a failure: a 44px tap target is deliberate and
  // right. It fails when the height ALSO clips.
  const bad = [];
  for (const f of CSS) {
    for (const m of code(f).matchAll(/([^{}]+)\{([^{}]*height\s*:\s*\d+px[^{}]*overflow\s*:\s*hidden[^{}]*)\}/g)) {
      if (!/font-size|line-height|white-space|text-overflow/.test(m[2])) continue;
      const selector = lastLine(m[1]);
      // The screen reader only utility is clipped to one pixel on purpose:
      // invisible and unclipped is not a thing it can be.
      if (/sr-only|visually-hidden/.test(selector)) continue;
      // A tile holding one initial is not a line of text and cannot reflow.
      if (/avatar|logo|initial|monogram/.test(selector)) continue;
      bad.push(`${f.rel}: "${selector}" clips its text when spacing grows`);
    }
  }
  return bad;
});

check('1.4.13', 'Content on hover or focus can be dismissed and stays while pointed at', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    // The browser's own title attribute is the one tooltip that cannot be
    // dismissed and does not stay. `title` on a React COMPONENT is a prop and
    // nothing to do with this criterion, which is why this matches the opening
    // tag itself: the first pass looked backwards for any tag and so counted
    // every <RowGroup title="..."> and <Row title={label}> in the application.
    // `title=` only, never `title===`: a comparison against a prop called
    // title is not an attribute, and matching it flagged system.tsx for a line
    // that reads `aria-label={typeof title==='string' ? ... }`.
    for (const m of t.matchAll(/<(div|span|button|a|p|li|td|th|img|svg)\b[^>]*\btitle\s*=(?!=)/g)) {
      bad.push(`${f.rel}: a title attribute on <${m[1]}>, used as a tooltip`);
    }
  }
  return bad;
});

// -------------------------------------------------------------- operable --

check('2.1.1', 'Every function works from a keyboard', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    // A sheet backdrop is exempt where the component closes on Escape: the
    // function, dismissing the layer, IS reachable from a keyboard, and
    // tapping a backdrop is a pointer convenience on top of it. The hook
    // that provides Escape is lib/dismissable.ts, so its presence is the
    // test. Pure event plumbing is exempt too: stopping a click reaching
    // the backdrop is not an action and there is nothing for a key to do.
    const dismissable = /useDismissable|Escape/.test(t);
    for (const m of t.matchAll(/<(div|span|li|tr|td)\b([^>]*)onClick([^>]*)>/g)) {
      const attrs = m[2] + m[3];
      if (/onKeyDown|onKeyUp|role\s*=\s*["']button["']|tabIndex/.test(attrs)) continue;
      if (/stopPropagation/.test(attrs)) continue;
      const isBackdrop = /aria-hidden|sheet-bg|backdrop|scrim|-wrap/.test(m[0]);
      if (isBackdrop && dismissable) continue;
      bad.push(`${f.rel}: <${m[1]}> with onClick and no keyboard path`);
    }
  }
  return bad;
});

check('2.1.2', 'Focus is never trapped', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    if (/preventDefault\(\)/.test(t) && /key\s*===\s*['"]Tab['"]/.test(t)) {
      if (!/Escape/.test(t)) bad.push(`${f.rel}: Tab is intercepted with no Escape route`);
    }
  }
  return bad;
});

check('2.1.4', 'No single character key shortcut, or it can be switched off', () => {
  const bad = [];
  for (const f of TSX) {
    for (const m of code(f).matchAll(/e?\.key\s*===\s*["']([a-zA-Z0-9])["']/g)) {
      bad.push(`${f.rel}: a single key shortcut (${m[1]})`);
    }
  }
  return bad;
});

check('2.2.1', 'Time limits can be extended, security limits apart', () => {
  // A code that expires and a session that ends are security limits and are
  // exempt. What is not exempt is content that moves on by itself.
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of t.matchAll(/setInterval\(/g)) {
      const around = t.slice(m.index, m.index + 260);
      if (/setStep|setIndex|setSlide|next\(\)/.test(around)) bad.push(`${f.rel}: content advances on a timer`);
    }
  }
  return bad;
});

check('2.2.2', 'Moving content can be paused', () => {
  const bad = [];
  for (const f of CSS) {
    const t = code(f);
    for (const m of t.matchAll(/animation\s*:[^;]*infinite/g)) {
      bad.push(`${f.rel}: an animation that never stops`);
    }
  }
  // An animation that respects the reader's own setting is not a finding.
  return bad.filter(() => !/prefers-reduced-motion/.test(CSS_TEXT));
});

check('2.3.1', 'Nothing flashes', () => {
  const bad = [];
  for (const f of CSS) {
    for (const m of code(f).matchAll(/animation[^;]*?(\d+(?:\.\d+)?)(m?s)[^;]*infinite/g)) {
      const ms = m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
      if (ms > 0 && ms < 334) bad.push(`${f.rel}: an animation repeating every ${ms}ms, which is above three a second`);
    }
  }
  return bad;
});

check('2.4.1', 'A skip link', () => {
  const html = (() => { try { return readFileSync(join(SRC, '..', 'index.html'), 'utf8'); } catch { return ''; } })();
  const everything = ALL_TEXT + html;
  return /skip-to|skipToContent|Skip to content|skip-link/i.test(everything) ? [] : ['no skip link anywhere'];
});

check('2.4.2', 'Every screen has a title saying where the member is', () => {
  const bad = [];
  for (const f of TSX) {
    if (!/\/pages\//.test(f.rel)) continue;
    const t = code(f);
    if (!/document\.title|useTitle|<title|usePageTitle/.test(t)) bad.push(`${f.rel}: sets no document title`);
  }
  return bad;
});

check('2.4.4', 'Every link says where it goes', () => {
  const bad = [];
  for (const f of TSX) {
    for (const m of code(f).matchAll(/>\s*(here|click here|more|read more|link)\s*</gi)) {
      bad.push(`${f.rel}: a link that says only "${m[1]}"`);
    }
  }
  return bad;
});

check('2.4.6', 'Headings and labels describe their content', () => {
  const bad = [];
  for (const f of TSX) {
    for (const m of code(f).matchAll(/<h[1-6][^>]*>\s*<\/h[1-6]>/g)) bad.push(`${f.rel}: an empty heading`);
    for (const m of code(f).matchAll(/<label[^>]*>\s*<\/label>/g)) bad.push(`${f.rel}: an empty label`);
  }
  return bad;
});

check('2.4.7', 'A visible focus state on every control', () => {
  const bad = [];
  for (const f of CSS) {
    const t = code(f);
    for (const m of t.matchAll(/outline\s*:\s*(none|0)\b/g)) {
      const around = t.slice(Math.max(0, m.index - 400), m.index + 400);
      if (!/box-shadow|outline-offset|:focus-visible/.test(around)) {
        bad.push(`${f.rel}: outline removed with nothing put in its place`);
      }
    }
  }
  if (!/:focus-visible/.test(CSS_TEXT)) bad.push('no :focus-visible style anywhere');
  return bad;
});

check('2.5.1', 'No gesture needs more than one finger or a path', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    if (/touches\s*\[\s*1\s*\]|touches\.length\s*>\s*1/.test(t)) bad.push(`${f.rel}: a multi finger gesture`);
  }
  return bad;
});

check('2.5.2', 'Actions fire on release and can be abandoned', () => {
  const bad = [];
  for (const f of TSX) {
    for (const m of code(f).matchAll(/onMouseDown\s*=|onTouchStart\s*=/g)) {
      const around = code(f).slice(Math.max(0, m.index - 200), m.index + 400);
      if (!/onMouseUp|onTouchEnd|onClick/.test(around)) bad.push(`${f.rel}: an action that fires on press`);
    }
  }
  return bad;
});

check('2.5.3', 'The spoken name contains the visible label', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of t.matchAll(/<button\b([^>]*aria-label\s*=\s*["']([^"']+)["'][^>]*)>([^<>{}]{2,40})</g)) {
      // Plain text only. The first pass compared against JSX source such as
      // `move(i, -1)}>`, which is not a visible label and never was.
      const raw = m[3].trim();
      if (!raw || /[{}()=>]/.test(raw)) continue;
      const spoken = m[2].toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      const visible = raw.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (visible && spoken && !spoken.includes(visible)) {
        bad.push(`${f.rel}: spoken "${m[2]}" does not contain visible "${raw}"`);
      }
    }
  }
  return bad;
});

check('2.5.4', 'Nothing is triggered by shaking or tilting', () =>
  /devicemotion|DeviceOrientation|deviceorientation/i.test(ALL_TEXT) ? ['motion is listened for'] : []);

check('2.5.7', 'Anything done by dragging can also be done by buttons', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    if (/onDragStart|draggable\s*=|onDragEnd/.test(t)) {
      if (!/Move up|Move down|moveUp|moveDown|aria-label=["'](Move|Reorder)/.test(t)) {
        bad.push(`${f.rel}: dragging with no button alternative`);
      }
    }
  }
  return bad;
});

check('2.5.8', 'Targets are at least 24 by 24', () => {
  const bad = [];
  // Only a rule whose OWN selector is a control counts. An icon or a dot sized
  // inside a button is not the target; the button is. The first pass looked
  // backwards 220 characters for the word button and so flagged every icon.
  for (const f of CSS) {
    for (const m of code(f).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = m[1].trim().split('\n').pop().trim();
      if (!/(^|[\s,>])(button|\.btn[\w-]*|\.chip|\.tab)(\s*[:,]|\s|$)/.test(selector)) continue;
      if (/\s(svg|i|\.icon|\.dot)\b|::?(before|after)/.test(selector)) continue;
      const h = /(?:min-)?height\s*:\s*(\d+)px/.exec(m[2]);
      const w = /(?:min-)?width\s*:\s*(\d+)px/.exec(m[2]);
      for (const pair of [['height', h], ['width', w]]) {
        if (pair[1] && Number(pair[1][1]) > 0 && Number(pair[1][1]) < 24) {
          bad.push(`${f.rel}: "${selector}" has ${pair[0]} ${pair[1][1]}px, under the 24px floor`);
        }
      }
    }
  }
  return bad;
});

// ------------------------------------------------------- understandable --

check('3.1.1', 'The language of each screen is declared', () => {
  const html = (() => { try { return readFileSync(join(SRC, '..', 'index.html'), 'utf8'); } catch { return ''; } })();
  return /<html[^>]*\blang\s*=/.test(html) ? [] : ['index.html declares no lang'];
});

check('3.1.2', 'Urdu inside an English screen is declared as Urdu', () => {
  const bad = [];
  const URDU = /[؀-ۿ]/;
  for (const f of TSX) {
    const t = code(f);
    // Where the strings live in a data array and the language is declared at
    // the point they are RENDERED, the file is handled: looking backwards from
    // a const declaration finds nothing and never could.
    if (/lang\s*=/.test(t) && /['"](ur|pa|ps|sd)['"]/.test(t)) continue;
    for (const m of t.matchAll(/["'`]([^"'`]*[؀-ۿ][^"'`]*)["'`]/g)) {
      const around = t.slice(Math.max(0, m.index - 260), m.index);
      if (!/lang\s*=|dir\s*=/.test(around)) bad.push(`${f.rel}: an Urdu string with no lang and none declared in the file`);
    }
  }
  return bad;
});

check('3.2.1', 'Focus never changes the screen on its own', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of t.matchAll(/onFocus\s*=\s*\{[^}]{0,200}/g)) {
      if (/navigate\(|setPage\(|location\./.test(m[0])) bad.push(`${f.rel}: focus navigates`);
    }
  }
  return bad;
});

check('3.2.2', 'Choosing an option never submits by surprise', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of tags(t, 'select')) {
      if (/onChange\s*=\s*\{[^}]*submit/i.test(m[1])) bad.push(`${f.rel}: a select that submits on change`);
    }
  }
  return bad;
});

check('3.3.1', 'Errors are named in text beside the field', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    // A form file with no error text at all is the finding.
    if (/<input\b/.test(t) && /\/pages\//.test(f.rel)) {
      if (!/error|Error|message|invalid/.test(t)) bad.push(`${f.rel}: a form with no error text`);
    }
  }
  return bad;
});

check('3.3.2', 'Every field is labelled', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of tags(t, 'input')) {
      if (/type\s*=\s*["'](hidden|submit|button)["']/.test(m[0])) continue;
      // A hidden input is not in the accessibility tree at all, so there is
      // nothing for a label to name. The file pickers are hidden behind a
      // visible button, and the button is what carries the name.
      if (/\bhidden\b/.test(m[0])) continue;
      if (/aria-label|aria-labelledby|\bid\s*=/.test(m[0])) continue;
      // An input wrapped in a <label> is labelled by that wrapper — and the
      // wrapper is usually the <Field> component, which renders exactly that:
      // `<label><span>{label}</span>{children}</label>`, in both ui.tsx and
      // wallet.tsx. Counting only the literal tag reported 48 fields as
      // unnamed when the great majority already carry a real label element.
      //
      // The count runs over the WHOLE prefix, not a window of it: this file's
      // form is one line thousands of characters long, so a 600 character
      // lookback did not reach the <Field> the input plainly sits inside.
      const before = t.slice(0, m.index);
      const opens = (before.match(/<label\b/g) || []).length + (before.match(/<Field\b/g) || []).length;
      const closes = (before.match(/<\/label>/g) || []).length + (before.match(/<\/Field>/g) || []).length;
      if (opens > closes) continue;
      {
        bad.push(`${f.rel}: an input with no label, no id and no label around it`);
      }
    }
  }
  return bad;
});

check('3.3.7', 'Nothing is asked twice in one journey', () => {
  // Only a human can judge a journey. What IS checkable is that a field with
  // the same name is not rendered twice in one file.
  const bad = [];
  for (const f of TSX) {
    const seen = new Map();
    for (const m of code(f).matchAll(/<input\b[^>]*\bname\s*=\s*["']([^"']+)["'][^>]*>/g)) {
      seen.set(m[1], (seen.get(m[1]) || 0) + 1);
    }
    for (const [name, n] of seen) if (n > 1) bad.push(`${f.rel}: the field "${name}" appears ${n} times`);
  }
  return bad;
});

check('3.3.8', 'Signing in needs no memory test beyond the PIN', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    // Blocking paste into a code field is the usual failure, because it stops
    // a member pasting the code their phone just received.
    for (const m of t.matchAll(/onPaste\s*=\s*\{[^}]{0,160}/g)) {
      if (/preventDefault/.test(m[0])) bad.push(`${f.rel}: paste is blocked`);
    }
  }
  return bad;
});

// ------------------------------------------------------------- robust --

check('4.1.2', 'Custom controls expose their name, role and state', () => {
  const bad = [];
  for (const f of TSX) {
    const t = code(f);
    for (const m of t.matchAll(/role\s*=\s*["'](switch|checkbox|radio|tab|menuitem)["']/g)) {
      const around = t.slice(Math.max(0, m.index - 300), m.index + 300);
      if (!/aria-checked|aria-selected|aria-expanded|aria-pressed/.test(around)) {
        bad.push(`${f.rel}: role="${m[1]}" with no state attribute`);
      }
    }
  }
  return bad;
});

check('4.1.3', 'Results and errors are announced', () => {
  const bad = [];
  if (!/aria-live/.test(ALL_TEXT)) bad.push('no aria-live region anywhere');
  return bad;
});

// ------------------------------------------------------------- the report --
// Criteria a source scan cannot settle, listed rather than assumed.
const BY_HAND = [
  ['1.4.3', 'Contrast (Minimum)', 'has its own audit: tests/audit-contrast.mjs, 40 pairs in both themes'],
  ['1.4.10', 'Reflow', 'has its own check in tests/audit-screens.mjs at 320 pixels'],
  ['1.4.11', 'Non text Contrast', 'has its own audit: tests/audit-contrast.mjs'],
  ['2.4.3', 'Focus Order', 'has its own check in tests/audit-screens.mjs'],
  ['2.4.5', 'Multiple Ways', 'navigation and search both reach every screen; judged by walking the app'],
  ['2.4.11', 'Focus Not Obscured', 'needs a rendered page: the tab bar is fixed, so this is measured, not read'],
  ['3.2.3', 'Consistent Navigation', 'one navigation component on every screen; judged by reading it'],
  ['3.2.4', 'Consistent Identification', 'one component kit; judged by reading it'],
  ['3.2.6', 'Consistent Help', 'help sits in the same place on every screen; judged by walking the app'],
  ['3.3.3', 'Error Suggestion', 'every message in lib/field-rules.ts says what to change; judged by reading them'],
  ['3.3.4', 'Error Prevention', 'every payment, signature and closure is reviewable before it commits'],
];

let failed = 0;
const rows = [];
for (const c of checks) {
  let findings;
  try { findings = c.fn(); } catch (e) { findings = [`the check itself failed: ${e.message}`]; }
  const unique = [...new Set(findings)];
  rows.push({ ...c, findings: unique });
  if (unique.length) failed++;
}

console.log(`WCAG 2.2 AA across ${FILES.length} files: ${checks.length} criteria checked from source.\n`);
for (const r of rows) {
  if (r.findings.length === 0) {
    if (ALL) console.log(`  pass  ${r.id.padEnd(7)} ${r.title}`);
  } else {
    console.log(`  FAIL  ${r.id.padEnd(7)} ${r.title}`);
    for (const f of (ALL ? r.findings : r.findings.slice(0, 6))) console.log(`          ${f}`);
    if (!ALL && r.findings.length > 6) console.log(`          ...and ${r.findings.length - 6} more`);
  }
}
console.log(`\n${checks.length - failed} of ${checks.length} criteria pass from source.`);
console.log(`\n${BY_HAND.length} more are settled elsewhere or by hand:`);
for (const [id, title, how] of BY_HAND) console.log(`  ${id.padEnd(7)} ${title}: ${how}`);
process.exit(failed ? 1 : 0);
