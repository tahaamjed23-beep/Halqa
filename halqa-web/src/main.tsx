import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The token set is the single source of truth for colour, spacing, type,
// radius, elevation and motion. It loads first so everything after it consumes
// the same names instead of inventing its own values.
import './tokens.css'
import './index.css'
// Rules for screens that were shipped with class names but no stylesheet.
// Loaded after index.css so it can complete, never override, the base system.
import './styles-completion.css'
// Corrections keyed on the real markup (rows are <article>, status modifiers are
// status-open/-closed). Must load after the completion pass to win on order.
import './styles-structure.css'
// Sections 1-5 plus the cash-app continuity rules.
import './styles-sections.css'
// Engine surfaces and the rebuilt HYPER product.
import './styles-engines.css'
// The wallet layout set: JazzCash structure, Halqa palette.
import './styles-wallet.css'
// The design system components. Loaded last so a primitive always wins over
// the correction sheets that were written before it existed.
import './system.css'
// the page kit that destination screens are built from, drawn to match Home
import './page.css'
import App from './App.tsx'
import { bootAppearance } from './components/Appearance'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Apply the member's saved accent, theme, text size and language before the
// first paint, so the app never flashes the default palette at somebody who
// chose another one.
bootAppearance()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
