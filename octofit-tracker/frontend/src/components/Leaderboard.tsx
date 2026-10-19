import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<{ leaderboard: Entry[] }, Entry>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      select={(response) => response.leaderboard}
      emptyText="No leaderboard scores yet."
      errorLabel="the leaderboard"
      renderItem={(entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
    />
  );
}
