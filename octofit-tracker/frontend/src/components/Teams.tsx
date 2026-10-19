import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: string[] };

export default function Teams() {
  return (
    <CapabilityCard<{ teams: Team[] }, Team>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      select={(response) => response.teams}
      emptyText="No teams created yet."
      errorLabel="teams"
      renderItem={(team) => `${team.name}${team.mascot ? ` (${team.mascot})` : ''}: ${team.members?.length ?? 0} members`}
    />
  );
}
