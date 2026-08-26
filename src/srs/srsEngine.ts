import type { CardProgress, Question } from '../config/types';
import type { BoxConfig } from '../config/srsConfig';
import { getDistanceForBox } from '../config/srsConfig';

export function processAnswer(
  progress: CardProgress,
  isCorrect: boolean,
  boxTable: BoxConfig[],
  streakToLearn: number
): CardProgress {
  const updated = { ...progress, lastSeenAt: Date.now(), totalSeen: progress.totalSeen + 1 };

  if (isCorrect) {
    updated.correctStreak = progress.correctStreak + 1;
    updated.totalCorrect = progress.totalCorrect + 1;
    updated.box = Math.min(progress.box + 1, streakToLearn);
    updated.learned = updated.box >= streakToLearn;
  } else {
    updated.correctStreak = 0;
    updated.box = 0;
    updated.totalWrong = progress.totalWrong + 1;
    updated.learned = false;
  }

  return updated;
}

export function buildQueue(
  allProgress: CardProgress[],
  questions: Question[],
  streakToLearn: number
): number[] {
  const unlearned = allProgress
    .filter((p) => !p.learned)
    .sort((a, b) => {
      if (a.box !== b.box) return a.box - b.box;
      return a.lastSeenAt - b.lastSeenAt;
    });

  const queue: number[] = [];
  for (const p of unlearned) {
    const q = questions.find((q) => q.id === p.id);
    if (q && q.correctKey) {
      queue.push(p.id);
    }
  }
  return queue;
}

export function insertBackIntoQueue(
  queue: number[],
  currentIndex: number,
  questionId: number,
  newBox: number,
  boxTable: BoxConfig[],
  allProgress: CardProgress[]
): number[] {
  const distance = getDistanceForBox(newBox, boxTable);
  if (distance === Infinity) {
    const newQueue = [...queue];
    newQueue.splice(currentIndex, 1);
    return newQueue;
  }

  const newQueue = [...queue];
  newQueue.splice(currentIndex, 1);

  const insertPos = Math.min(currentIndex + distance, newQueue.length);
  newQueue.splice(insertPos, 0, questionId);

  return newQueue;
}

export function shouldInsertReview(
  questionsAnswered: number,
  learnedCount: number
): boolean {
  return questionsAnswered > 0 && questionsAnswered % 200 === 0 && learnedCount > 0;
}

export function pickReviewQuestions(
  allProgress: CardProgress[],
  count: number
): number[] {
  const learned = allProgress.filter((p) => p.learned);
  if (learned.length === 0) return [];
  const shuffled = [...learned].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((p) => p.id);
}
