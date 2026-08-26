export interface Option {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  correctKey: string | null;
  correctText: string;
  needsReview?: boolean;
}

export interface CardProgress {
  id: number;
  box: number;
  correctStreak: number;
  totalSeen: number;
  totalCorrect: number;
  totalWrong: number;
  learned: boolean;
  lastSeenAt: number;
}

export interface TestResult {
  date: string;
  total: number;
  correct: number;
  answers: { questionId: number; selected: string; correct: boolean }[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  baseDistance: number;
  streakToLearn: number;
  dailyHistory: { date: string; studied: number; learned: number }[];
  testHistory: TestResult[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  fontSize: 'medium',
  baseDistance: 3,
  streakToLearn: 5,
  dailyHistory: [],
  testHistory: [],
};

export const STORAGE_KEYS = {
  PROGRESS: 'hcm202_progress_v1',
  SETTINGS: 'hcm202_settings_v1',
  THEME: 'hcm202_theme',
} as const;

export type TabId = 'hoc' | 'kiemtra' | 'toanbo' | 'caidat';

export function createDefaultProgress(id: number): CardProgress {
  return {
    id,
    box: 0,
    correctStreak: 0,
    totalSeen: 0,
    totalCorrect: 0,
    totalWrong: 0,
    learned: false,
    lastSeenAt: 0,
  };
}
