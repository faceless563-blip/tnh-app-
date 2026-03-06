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
