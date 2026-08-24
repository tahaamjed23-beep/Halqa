import { AppearancePanel } from '../components/Appearance';
import { FlowHeader } from '../components/wallet';

// Look and feel, on its own screen. It used to sit three taps down inside
// Settings, under Your details, which is not where anybody looks for a theme.
export default function AppearancePage({ back }: { back?: () => void }) {
  return (
    <div className="w-screen">
      <FlowHeader title="Look and feel" onBack={back} />
      <div className="w-screen-body">
        <AppearancePanel />
      </div>
    </div>
  );
}
