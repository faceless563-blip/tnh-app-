export type Task = {
  id: string;
  name: string;
  emoji: string;
  time?: string;
  completed: boolean;
  isAnchor: boolean;
  date: string; // YYYY-MM-DD
};

export type AnchorTaskTemplate = {
  id: string;
  name: string;
  emoji: string;
  time?: string;
};

export type DailyReflection = {
  date: string;
  rating: number; // 1-5
};

export type UserSettings = {
  name: string;
  onboarded: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  anchorTasks: AnchorTaskTemplate[];
  streak: number;
  lastCompletedDate?: string;
  reflections: DailyReflection[];
  hasSeenWelcomePopup: boolean;
  hasSeenTour: boolean;
};

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type CycleLog = {
  date: string; // YYYY-MM-DD
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy' | 'very_heavy';
  moods: string[];
  symptoms: string[];
  medication: boolean;
  notes: string;
  waterIntake: number; // 0-3+
  selfCare: string[];
};

export type CycleSettings = {
  cycleLength: number; // default 28
  periodDuration: number; // default 5
  lastPeriodStart: string; // YYYY-MM-DD
  remindersEnabled: {
    periodDue: boolean;
    dailyLog: boolean;
    fertileWindow: boolean;
  };
};

export type PeriodTrackerData = {
  logs: CycleLog[];
  settings: CycleSettings;
};
