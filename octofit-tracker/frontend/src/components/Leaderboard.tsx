import { useEffect, useState } from 'react';
import { getJson, type ApiState } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [state, setState] = useState<ApiState<Entry[]>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: Entry[] }>('/api/leaderboard').then(
      (response) => { if (active) setState({ status: 'success', data: response.leaderboard ?? [] }); },
      (error: unknown) => { if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }); },
    );
    return () => { active = false; };
  }, []);

  let body;
  if (state.status === 'loading') {
    body = <p role="status">Loading the leaderboard...</p>;
  } else if (state.status === 'error') {
    body = <p role="alert" className="text-danger">Unable to load the leaderboard: {state.message}</p>;
  } else if (state.data.length === 0) {
    body = <p>No leaderboard scores yet.</p>;
  } else {
    body = (
      <ul className="list-group list-group-flush">
        {state.data.map((entry, index) => (
          <li key={index} className="list-group-item">{`#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}</li>
        ))}
      </ul>
    );
  }
  return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p>{body}</div></section>;
}
