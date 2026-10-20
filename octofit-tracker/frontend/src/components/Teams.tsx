import { useEffect, useState } from 'react';
import { getJson, type ApiState } from '../api/client.js';

type Team = { name: string; mascot?: string; members?: string[] };

export default function Teams() {
  const [state, setState] = useState<ApiState<Team[]>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams').then(
      (response) => { if (active) setState({ status: 'success', data: response.teams ?? [] }); },
      (error: unknown) => { if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }); },
    );
    return () => { active = false; };
  }, []);

  let body;
  if (state.status === 'loading') {
    body = <p role="status">Loading teams...</p>;
  } else if (state.status === 'error') {
    body = <p role="alert" className="text-danger">Unable to load teams: {state.message}</p>;
  } else if (state.data.length === 0) {
    body = <p>No teams created yet.</p>;
  } else {
    body = (
      <ul className="list-group list-group-flush">
        {state.data.map((team, index) => (
          <li key={index} className="list-group-item">{`${team.name}${team.mascot ? ` (${team.mascot})` : ''}: ${team.members?.length ?? 0} members`}</li>
        ))}
      </ul>
    );
  }
  return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p>{body}</div></section>;
}
