import AppCard from './AppCard';
import UpdateComponent from './UpdateComponent';
import OpenAIComponent from './OpenAIComponent';
import DebugCard from './DebugCard';

export default function HomePage() {
  return (
    <div>
      <AppCard>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          Keep this app running while you are playing Sentient Sims!
        </div>
      </AppCard>
      <UpdateComponent />
      <OpenAIComponent />
      <DebugCard />
    </div>
  );
}
