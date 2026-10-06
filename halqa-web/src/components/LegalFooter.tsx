import { useState } from 'react';
import { useDismissable } from '../lib/dismissable';
import { useBackToClose } from '../lib/back';
import { LEGAL_DOCS, type DocId } from '../legal/content';

// The corporate footer (LinkedIn-style) + the modal document reader. Rendered
// on the auth screen and at the bottom of Settings. Self-contained: clicking a
// link opens the full policy in a scrollable modal.

export function LegalDocModal({ doc, onClose }: { doc: DocId; onClose: () => void }) {
  const d = LEGAL_DOCS[doc];
  useBackToClose(true, onClose);
  const layer = useDismissable(true, onClose);
  return <div className="modal-backdrop" aria-hidden="true" onClick={onClose}>
    {/* The dialog is the section, not the backdrop: a reader should be told it
        is in a document, and the backdrop is only somewhere to tap. Escape
        closes it, and so does Close. */}
    <section className="modal legal-modal" role="dialog" aria-modal="true" aria-label={d.title}
             ref={layer} tabIndex={-1} onClick={e => e.stopPropagation()}>
      <div className="modal-head"><h2>{d.title}</h2><button className="text-action" onClick={onClose}>Close</button></div>
      <div className="legal-body">
        <p className="legal-updated">{d.updated}</p>
        <p className="legal-intro">{d.intro}</p>
        {d.sections.map(s => <section key={s.h}><h3>{s.h}</h3>{s.p.map(par => <p key={par.slice(0, 40)}>{par}</p>)}</section>)}
      </div>
    </section>
  </div>;
}

const LINKS: [string, DocId | null][] = [
  ['About', null], ['Accessibility', null], ['Help Center', null],
  ['User Agreement', 'agreement'], ['Privacy Policy', 'privacy'], ['Cookie Policy', 'cookies'],
  ['Ad Choices', 'ads'], ['Advertising', 'ads'], ['Community Policies', 'community'],
  ['Fees & Payments', 'fees'],
];

export default function LegalFooter() {
  const [open, setOpen] = useState<DocId | null>(null);
  const [info, setInfo] = useState('');
  const plain: Record<string, string> = {
    About: 'Halqa is Pakistan\'s digital committee network, create, join, pay and collect kametis with full records and portable trust.',
    // The one Urdu word in an English sentence. It is written out in English
    // here rather than wrapped in a lang attribute, because this value is a
    // plain string passed to a text node and cannot carry markup.
    Accessibility: 'Halqa supports system font scaling, screen-reader labels on core flows, and Urdu across the app. Report accessibility issues from Help Center.',
    'Help Center': 'Questions or complaints: email support@halqa.pk, we answer within 2 working days. Security reports: security@halqa.pk.',
  };
  return <footer className="legal-footer">
    <nav>{LINKS.map(([label, doc]) => <button key={label} className="footer-link" onClick={() => doc ? setOpen(doc) : setInfo(info === label ? '' : label)}>{label}</button>)}</nav>
    {info && <p className="footer-info">{plain[info]}</p>}
    <span className="footer-brand">Halqa © 2026</span>
    {open && <LegalDocModal doc={open} onClose={() => setOpen(null)} />}
  </footer>;
}
