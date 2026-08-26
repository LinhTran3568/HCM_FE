import type { CardProgress } from '../config/types';
import { STORAGE_KEYS, createDefaultProgress } from '../config/types';

let inMemoryFallback: CardProgress[] | null = null;

export function loadProgress(): CardProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw) as CardProgress[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return inMemoryFallback ?? [];
}

export function saveProgress(data: CardProgress[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
    inMemoryFallback = null;
  } catch {
    inMemoryFallback = data;
    console.warn('localStorage full or blocked, using in-memory fallback');
  }
}

export function getProgressForId(progress: CardProgress[], id: number): CardProgress | undefined {
  return progress.find((p) => p.id === id);
}

export function ensureAllQuestionsHaveProgress(
  progress: CardProgress[],
  questionIds: number[]
): CardProgress[] {
  const map = new Map(progress.map((p) => [p.id, p]));
  let changed = false;
  for (const id of questionIds) {
    if (!map.has(id)) {
      map.set(id, createDefaultProgress(id));
      changed = true;
    }
  }
  if (changed) {
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }
  return progress;
}
