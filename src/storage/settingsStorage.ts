import type { AppSettings, TestResult } from '../config/types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../config/types';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    console.warn('Could not save settings');
  }
}

export function addTestResult(result: TestResult): void {
  const settings = loadSettings();
  settings.testHistory = [...settings.testHistory.slice(-30), result];
  saveSettings(settings);
}

export function updateDailyHistory(studied: number, learned: number): void {
  const settings = loadSettings();
  const today = new Date().toISOString().split('T')[0];
  const existing = settings.dailyHistory.find((d) => d.date === today);
  if (existing) {
    existing.studied += studied;
    existing.learned += learned;
  } else {
    settings.dailyHistory.push({ date: today, studied, learned });
  }
  settings.dailyHistory = settings.dailyHistory.slice(-7);
  saveSettings(settings);
}

export function exportData(): string {
  const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS) ?? '[]';
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? '{}';
  return JSON.stringify({ progress: JSON.parse(progress), settings: JSON.parse(settings) }, null, 2);
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.progress) localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.THEME);
}
