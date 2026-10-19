import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  return (
    <CapabilityCard<{ activities: Activity[] }, Activity>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      select={(response) => response.activities}
      emptyText="No activities recorded yet."
      errorLabel="activities"
      renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
