import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw httpError(400, 'Request body must be an object');
  return input as Record<string, unknown>;
}

export async function listActivities() {
  return Activity.find().lean();
}

const POINTS_PER_MINUTE = 1;

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = asRecord(input);
  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) throw httpError(400, 'userId must be a valid ID');
  if (typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) throw httpError(400, 'teamId must be a valid ID');
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) throw httpError(400, 'minutes must be a number of at least 1');
  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: Math.round(minutes * POINTS_PER_MINUTE),
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = asRecord(input);
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'mascot is required');
  if (!Array.isArray(members) || !members.every((id) => typeof id === 'string' && mongoose.isValidObjectId(id))) {
    throw httpError(400, 'members must be an array of valid user IDs');
  }
  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((entry) => [entry._id.toString(), entry.totalPoints]));
  return teams
    .map((team) => ({ teamId: team._id, teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || String(a.teamName).localeCompare(String(b.teamName)))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

const FOCUS_BY_ACTIVITY: Record<string, string> = {
  run: 'endurance',
  cycle: 'endurance',
  swim: 'endurance',
  walk: 'endurance',
  strength: 'strength',
  lift: 'strength',
  yoga: 'mobility',
  stretch: 'mobility',
};
const RECENT_ACTIVITY_LIMIT = 10;

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recent = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(RECENT_ACTIVITY_LIMIT).lean();
  const minutesByFocus = new Map<string, number>();
  const typeByFocus = new Map<string, string>();
  for (const activity of recent) {
    const type = String(activity.type).toLowerCase();
    const focus = FOCUS_BY_ACTIVITY[type] ?? type;
    minutesByFocus.set(focus, (minutesByFocus.get(focus) ?? 0) + (activity.minutes ?? 0));
    if (!typeByFocus.has(focus)) typeByFocus.set(focus, type);
  }
  const recentFocus = [...minutesByFocus.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const goalFocus = user.fitnessGoal.toLowerCase();

  const reasonFor = (focus: string) => {
    if (focus === recentFocus) return `Based on your recent ${typeByFocus.get(focus)} activity, which builds ${focus}.`;
    if (focus === goalFocus) return `Matches your ${focus} fitness goal.`;
    return 'A balanced option to round out your recent activity.';
  };
  const rank = (focus: string) => (focus === recentFocus ? 0 : focus === goalFocus ? 1 : 2);

  const workouts = await Workout.find().lean();
  return workouts
    .map((workout) => ({ ...workout, reason: reasonFor(workout.focus.toLowerCase()) }))
    .sort((a, b) => rank(a.focus.toLowerCase()) - rank(b.focus.toLowerCase()));
}

export { User };
