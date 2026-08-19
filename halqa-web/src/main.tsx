import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Rules for screens that were shipped with class names but no stylesheet.
// Loaded after index.css so it can complete, never override, the base system.
import './styles-completion.css'
// Corrections keyed on the real markup (rows are <article>, status modifiers are
// status-open/-closed). Must load after the completion pass to win on order.
import './styles-structure.css'
// Sections 1-5 plus the cash-app continuity rules.
import './styles-sections.css'
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
