import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
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
