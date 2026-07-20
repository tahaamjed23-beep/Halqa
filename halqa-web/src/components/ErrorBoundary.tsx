import { Component, type ReactNode } from 'react';

// Catches a rendering bug and degrades to a recoverable message instead of a
// blank page. Two modes:
//  - default (full): a whole-screen fallback with a reload button.
//  - scoped (compact): a small inline card, used to wrap a single panel (Rafa,
//    committee chat, an individual page) so one component failing never blanks
//    the rest of the app.
// `resetKey` lets a parent force recovery on navigation — when the key changes
// (e.g. the current page), the boundary clears its error and retries.
type Props = { children: ReactNode; scoped?: boolean; label?: string; resetKey?: string | number };
export default class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('Halqa UI caught:', this.props.label ?? 'app', error); }
  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.scoped) {
      return (
        <div className="scoped-error">
          <b>{this.props.label ?? 'This panel'} hit a display error</b>
          <p>Your data is safe. The rest of the app keeps working.</p>
          <button className="secondary" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      );
    }
    return (
      <div className="blocked-page">
        <h2>Something broke on this screen</h2>
        <p>Your data is safe — this is a display error, not a ledger one. Reload to continue.</p>
        <button className="primary" onClick={() => { this.setState({ error: null }); window.location.reload(); }}>Reload Halqa</button>
      </div>
    );
  }
}
