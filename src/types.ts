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

export type DiaryType = 'normal' | 'gratitude' | 'dear_diary' | 'dream' | 'letter_to_him' | 'rant';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'night';

export type DiaryEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  mood: string;
  weather: WeatherType | '';
  type: DiaryType;
  tags: string[];
  photos: string[];
  isLocked: boolean;
  isFavorite: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DiarySettings = {
  pin: string | null;
  useBiometric: boolean;
  reminderTime: string | null;
  autoSave: boolean;
  defaultType: DiaryType;
  fontSize: 'small' | 'medium' | 'large';
};

export type Prescription = {
  id: string;
  doctorName: string;
  specialization: string;
  hospitalName: string;
  date: string; // ISO string
  diagnosis: string;
  imagePaths: string[];
  notes: string;
  addedAt: string; // ISO string
};

export type MedicalReport = {
  id: string;
  reportType: string;
  labName: string;
  date: string; // ISO string
  referringDoctor: string;
  imagePaths: string[];
  notes: string;
  analysisResult: string | null;
  analysisDate: string | null;
  status: 'not_analyzed' | 'normal' | 'abnormal';
  addedAt: string; // ISO string
};
