import { useEffect, useState } from 'react';
import { getJson, type ApiState } from '../api/client.js';

type Suggestion = { title: string; reason?: string };

// No auth in this exercise, so suggestions are requested for the seeded demo user.
const DEMO_USER_EMAIL = 'mona@example.com';

export default function Workouts() {
  const [state, setState] = useState<ApiState<Suggestion[]>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`).then(
      (response) => { if (active) setState({ status: 'success', data: response.suggestions ?? [] }); },
      (error: unknown) => { if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }); },
    );
    return () => { active = false; };
  }, []);

  let body;
  if (state.status === 'loading') {
    body = <p role="status">Loading workout suggestions...</p>;
  } else if (state.status === 'error') {
    body = <p role="alert" className="text-danger">Unable to load workout suggestions: {state.message}</p>;
  } else if (state.data.length === 0) {
    body = <p>No workout suggestions yet.</p>;
  } else {
    body = (
      <ul className="list-group list-group-flush">
        {state.data.map((suggestion, index) => (
          <li key={index} className="list-group-item">{`${suggestion.title}${suggestion.reason ? `: ${suggestion.reason}` : ''}`}</li>
        ))}
      </ul>
    );
  }
  return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p>{body}</div></section>;
}
