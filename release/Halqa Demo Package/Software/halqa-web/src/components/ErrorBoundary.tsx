import { Component, type ReactNode } from 'react';

// Last-resort catch so a rendering bug degrades to a recoverable screen
// instead of a blank page. State-level errors still surface through each
// page's own error boxes; this only catches what they miss.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('Halqa UI crashed:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="blocked-page">
        <h2>Something broke on this screen</h2>
        <p>Your data is safe — this is a display error, not a ledger one. Reload to continue.</p>
        <button className="primary" onClick={() => { this.setState({ error: null }); window.location.reload(); }}>Reload Halqa</button>
      </div>
    );
  }
}
