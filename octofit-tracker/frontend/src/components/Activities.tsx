import { useEffect, useState } from 'react';
import { getJson, type ApiState } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [state, setState] = useState<ApiState<Activity[]>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities').then(
      (response) => { if (active) setState({ status: 'success', data: response.activities ?? [] }); },
      (error: unknown) => { if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }); },
    );
    return () => { active = false; };
  }, []);

  let body;
  if (state.status === 'loading') {
    body = <p role="status">Loading activities...</p>;
  } else if (state.status === 'error') {
    body = <p role="alert" className="text-danger">Unable to load activities: {state.message}</p>;
  } else if (state.data.length === 0) {
    body = <p>No activities recorded yet.</p>;
  } else {
    body = (
      <ul className="list-group list-group-flush">
        {state.data.map((activity, index) => (
          <li key={index} className="list-group-item">{`${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}</li>
        ))}
      </ul>
    );
  }
  return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p>{body}</div></section>;
}
