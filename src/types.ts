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
  periodTrackerRevealShown: boolean;
  periodTrackerTourShown: boolean;
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

export type HairCareLog = {
  id: string;
  type: 'shampoo' | 'oil';
  timestamp: string; // ISO string
};

export type HairCareSettings = {
  shampooTarget: number;
  oilTarget: number;
};

export type DateCategory = 'anniversary' | 'birthday' | 'appointment' | 'milestone' | 'other';

export type ImportantDate = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: DateCategory;
  notes: string;
  repeat: 'none' | 'yearly' | 'monthly' | 'weekly';
};

export type ShoppingCategory = 'groceries' | 'beauty' | 'clothing' | 'home' | 'health' | 'other';

export type ShoppingItem = {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity?: string;
  priority: 'normal' | 'urgent';
  bought: boolean;
};

export type SelfCareItem = {
  id: string;
  name: string;
  completed: boolean;
};

export type DailySelfCareLog = {
  date: string; // YYYY-MM-DD
  bathLogged: boolean;
  checklist: SelfCareItem[];
};
