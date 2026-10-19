# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: The UI uses the shared API client and handles null or missing data. A shared `CapabilityCard` and a `useApi` hook cover loading (`role="status"`), empty, data, and error (`role="alert"`) states. Activities, Teams, Leaderboard, and Workouts are thin wrappers that supply an endpoint, labels, and an item renderer. Workouts requests suggestions for the seeded `mona@example.com` user because auth is out of scope.
- Logic tier decision: Validation and business rules live in `octofitService.ts`. Errors carry an HTTP status and the existing error middleware in `app.ts` returns them. Malformed input returns 400 and unknown users, teams, or emails return 404, so cast errors never reach a 500.
- Data tier decision: Add the missing required fields and validators to every model first (`Team`, `Activity`, `Workout`, `User`). `points` and `occurredAt` have no schema defaults, so the service must set them.
- Activity tracking approach: POST validates `userId` and `teamId` as ObjectIds and checks that both documents exist. It then stores `points` (1 per minute) and `occurredAt` (now).
- Team management approach: POST requires a non-empty `name` and `mascot` and an optional array of valid member IDs, and rejects anything else with 400.
- Leaderboard approach: Sum `points` per team with an aggregation, include teams with zero activity, sort by points descending (ties by name), and assign a 1-based `rank`.
- Workout suggestions approach: Map the user's last 10 activity types to a focus (for example `run` to `endurance`). Rank workouts matching the dominant recent focus first, then the user's goal, then the rest. Each suggestion carries a `reason`.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` - passed, 5 tests. A failure indicates a Mongoose model is missing a required field, validator, schema default, or seed-data behavior.
- API command: `npm run test:api --prefix octofit-tracker/backend` - passed, 4 tests. A failure indicates the Express route or service does not meet the API contract for validation, persistence, aggregation, or workout suggestions.
- Frontend command: `npm test --prefix octofit-tracker/frontend` - passed, 15 tests. A failure indicates a capability view does not request the expected API endpoint or does not render its loading, empty, data, or accessible error state.
- Backend build command: `npm run build --prefix octofit-tracker/backend` - passed. A failure indicates a TypeScript type or module-resolution error in the backend.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` - passed. A failure indicates a TypeScript, bundling, or frontend module-resolution error.
