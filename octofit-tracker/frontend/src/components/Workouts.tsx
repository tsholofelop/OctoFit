import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason?: string };

// No auth in this exercise, so suggestions are requested for the seeded demo user.
const DEMO_USER_EMAIL = 'mona@example.com';

export default function Workouts() {
  return (
    <CapabilityCard<{ suggestions: Suggestion[] }, Suggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`}
      select={(response) => response.suggestions}
      emptyText="No workout suggestions yet."
      errorLabel="workout suggestions"
      renderItem={(suggestion) => `${suggestion.title}${suggestion.reason ? `: ${suggestion.reason}` : ''}`}
    />
  );
}
