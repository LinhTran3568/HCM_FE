import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings } from '../config/types';
import { STORAGE_KEYS } from '../config/types';
import { loadSettings, saveSettings } from '../storage/settingsStorage';

interface ThemeContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  settings: { theme: 'system', fontSize: 'medium', baseDistance: 3, streakToLearn: 5, dailyHistory: [], testHistory: [] },
  updateSettings: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const FONT_SCALES: Record<string, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xlarge: 1.25,
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(FONT_SCALES[settings.fontSize] ?? 1));
  }, [settings.fontSize]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: 'light' | 'dark' | 'system') {
  let effective: 'light' | 'dark';
  if (theme === 'system') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    effective = theme;
  }
  document.documentElement.setAttribute('data-theme', effective);
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // ignore
  }
}
