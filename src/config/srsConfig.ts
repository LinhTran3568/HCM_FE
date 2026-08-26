export interface BoxConfig {
  box: number;
  correctStreakRequired: number;
  distance: number;
}

export const DEFAULT_BASE_DISTANCE = 3;
export const DEFAULT_STREAK_TO_LEARN = 5;
export const MAX_BOX = 5;
export const REVIEW_EVERY_N_LEARNED = 200;
export const REVIEW_COUNT = 5;

export const BOX_TABLE: BoxConfig[] = [
  { box: 0, correctStreakRequired: 0, distance: 3 },
  { box: 1, correctStreakRequired: 1, distance: 7 },
  { box: 2, correctStreakRequired: 2, distance: 15 },
  { box: 3, correctStreakRequired: 3, distance: 30 },
  { box: 4, correctStreakRequired: 4, distance: 60 },
  { box: 5, correctStreakRequired: 5, distance: Infinity },
];

export function buildBoxTable(baseDistance: number, streakToLearn: number): BoxConfig[] {
  const table: BoxConfig[] = [];
  let dist = baseDistance;
  for (let i = 0; i <= streakToLearn; i++) {
    table.push({
      box: i,
      correctStreakRequired: i,
      distance: i === streakToLearn ? Infinity : dist,
    });
    if (i < streakToLearn) {
      dist = Math.round(dist * 2.1);
    }
  }
  return table;
}

export function getDistanceForBox(box: number, table: BoxConfig[]): number {
  const entry = table.find((t) => t.box === box);
  return entry ? entry.distance : Infinity;
}
