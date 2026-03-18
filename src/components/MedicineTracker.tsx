import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, Pill, Clock, Calendar, CheckCircle2, 
  AlertCircle, Trash2, Edit2, ChevronLeft, 
  ChevronRight, Settings as SettingsIcon, Bell,
  Info, Check, X, MoreVertical, History, Heart, PartyPopper,
  Calendar as CalendarIcon, PieChart as ChartIcon,
  Timer, Coffee, Utensils, Moon, Sun, Sunrise,
  FileText, Clipboard, Microscope, Camera, Image as ImageIcon,
  Share2, Save, Brain, Sparkles, ShieldCheck, Lock, Unlock,
  Search, Filter, ArrowRight, ExternalLink, Download,
  AlertTriangle, CheckCircle, Info as InfoIcon
} from 'lucide-react';
import { 
  format, addDays, subDays, startOfWeek, endOfWeek, 
  isSameDay, parseISO, differenceInDays, startOfMonth, 
  endOfMonth, eachDayOfInterval, isSameMonth, addMonths, 
  subMonths, isToday, isPast, isFuture, addHours,
  setHours, setMinutes, startOfDay
} from 'date-fns';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, 
  Tooltip, Cell, PieChart, Pie, LineChart, Line, YAxis
} from 'recharts';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  DOCTOR_SPECIALIZATIONS, REPORT_TYPES
} from '../constants';
import { Prescription, MedicalReport } from '../types';

// --- Types ---

export type MedicineType = 'tablet' | 'syrup' | 'injection' | 'supplement' | 'vitamin' | 'other';

export type Frequency = 'once' | 'twice' | 'three' | 'hours' | 'weekly' | 'monthly' | 'as_needed';

export type FoodPreference = 'with_food' | 'empty_stomach' | 'any';

export interface Medicine {
  id: string;
  name: string;
  type: MedicineType;
  dosage: string;
  frequency: Frequency;
  frequencyValue?: number; // for "Every X hours"
  times: string[]; // ISO time strings (only time part matters usually, but stored as full for convenience or just "HH:mm")
  withFood: FoodPreference;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  isActive: boolean;
  color: string;
  notes: string;
  takenLog: Record<string, string[]>; // date string -> array of time strings taken
}

export interface MedicineSettings {
  snoozeDuration: number;
  reminderSound: string;
  showCompletedCourses: boolean;
}

const MEDICINE_COLORS = [
  { name: 'rose', value: '#F8BBD9' },
  { name: 'peach', value: '#FFCCBC' },
  { name: 'lavender', value: '#E1BEE7' },
  { name: 'mint', value: '#C8E6C9' },
  { name: 'golden', value: '#FFF9C4' },
  { name: 'blush', value: '#FCE4EC' },
];

const MEDICINE_TYPES = [
  { id: 'tablet', label: 'Tablet', emoji: '💊' },
  { id: 'syrup', label: 'Syrup', emoji: '🧴' },
  { id: 'injection', label: 'Injection', emoji: '💉' },
  { id: 'supplement', label: 'Supplement', emoji: '🌿' },
  { id: 'vitamin', label: 'Vitamin', emoji: '🍊' },
  { id: 'other', label: 'Other', emoji: '💆' },
];

// --- Components ---

export const MedicineTracker: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('medicine_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<MedicineSettings>(() => {
    const saved = localStorage.getItem('medicine_settings');
    return saved ? JSON.parse(saved) : {
      snoozeDuration: 10,
      reminderSound: 'default',
      showCompletedCourses: true
    };
  });

  const [activeTab, setActiveTab] = useState<'today' | 'list' | 'history'>('today');
  const [mainTab, setMainTab] = useState<'medicines' | 'prescriptions' | 'reports'>('medicines');
  const [showSettings, setShowSettings] = useState(false);
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('tanha_prescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<MedicalReport[]>(() => {
    const saved = localStorage.getItem('tanha_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem('medicine_records_locked');
    return saved === 'true';
  });

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCourseComplete, setShowCourseComplete] = useState<Medicine | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [analyzingReport, setAnalyzingReport] = useState<MedicalReport | Prescription | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    localStorage.setItem('tanha_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('tanha_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('medicine_records_locked', isLocked.toString());
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem('medicine_list', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('medicine_settings', JSON.stringify(settings));
  }, [settings]);

  // Check for course completion
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedMed = medicines.find(m => 
      !m.isOngoing && 
      m.endDate && 
      m.endDate < today && 
      m.isActive
    );

    if (completedMed) {
      setShowCourseComplete(completedMed);
      // Deactivate it so it doesn't show up again
      setMedicines(prev => prev.map(m => m.id === completedMed.id ? { ...m, isActive: false } : m));
    }
  }, [medicines]);

  const handleAddMedicine = (med: Omit<Medicine, 'id' | 'takenLog'>) => {
    const newMed: Medicine = {
      ...med,
      id: Math.random().toString(36).substr(2, 9),
      takenLog: {}
    };
    setMedicines([...medicines, newMed]);
    setShowAddSheet(false);
  };

  const handleUpdateMedicine = (updatedMed: Medicine) => {
    setMedicines(medicines.map(m => m.id === updatedMed.id ? updatedMed : m));
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const toggleMedicineStatus = (id: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  const markAsTaken = (medicineId: string, time: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setMedicines(prev => {
      let isNowTaken = false;
      const newMeds = prev.map(m => {
        if (m.id === medicineId) {
          const todayLog = m.takenLog[today] || [];
          const isAlreadyTaken = todayLog.includes(time);
          isNowTaken = !isAlreadyTaken;
          const newLog = isAlreadyTaken 
            ? todayLog.filter(t => t !== time)
            : [...todayLog, time];
          
          return {
            ...m,
            takenLog: {
              ...m.takenLog,
              [today]: newLog
            }
          };
        }
        return m;
      });

      // Check for celebration
      const activeToday = newMeds.filter(m => m.isActive && isMedDueOnDate(m, new Date()));
      const totalDoses = activeToday.reduce((acc, m) => acc + m.times.length, 0);
      const takenDoses = activeToday.reduce((acc, m) => acc + (m.takenLog[today]?.length || 0), 0);

      if (totalDoses > 0 && takenDoses === totalDoses && isNowTaken) {
        setShowCelebration(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F8BBD9', '#B76E79', '#FFD700']
        });
      }

      return newMeds;
    });
  };

  const isMedDueOnDate = (med: Medicine, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (isPast(parseISO(med.startDate)) || isToday(parseISO(med.startDate))) {
      if (med.isOngoing) return true;
      if (med.endDate && (isPast(parseISO(med.endDate)) || isToday(parseISO(med.endDate)))) {
        return dateStr <= med.endDate;
      }
    }
    return false;
  };

  const todayMeds = useMemo(() => {
    return medicines.filter(m => m.isActive && isMedDueOnDate(m, new Date()));
  }, [medicines]);

  const totalDosesToday = todayMeds.reduce((acc, m) => acc + m.times.length, 0);
  const takenDosesToday = todayMeds.reduce((acc, m) => acc + (m.takenLog[format(new Date(), 'yyyy-MM-dd')]?.length || 0), 0);
  const progress = totalDosesToday > 0 ? (takenDosesToday / totalDosesToday) * 100 : 0;

  const lastDoctorVisit = useMemo(() => {
    if (prescriptions.length === 0) return null;
    const sorted = [...prescriptions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].date;
  }, [prescriptions]);

  const analyzedReportsCount = useMemo(() => {
    return reports.filter(r => r.status !== 'not_analyzed').length;
  }, [reports]);

  const HealthOverviewCard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[32px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Health Overview 🏥</h3>
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-2xl bg-rose-card/30 dark:bg-white/5 border border-rose-gold/5">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Prescriptions</p>
          <p className="text-xl font-serif text-[#B76E79]">{prescriptions.length} 📋</p>
        </div>
        <div className="p-3 rounded-2xl bg-rose-card/30 dark:bg-white/5 border border-rose-gold/5">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Reports</p>
          <p className="text-xl font-serif text-[#B76E79]">{reports.length} 🔬</p>
        </div>
        <div className="p-3 rounded-2xl bg-rose-card/30 dark:bg-white/5 border border-rose-gold/5">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Analyzed</p>
          <p className="text-xl font-serif text-[#B76E79]">{analyzedReportsCount} 🤖</p>
        </div>
        <div className="p-3 rounded-2xl bg-rose-card/30 dark:bg-white/5 border border-rose-gold/5">
          <p className="text-[10px] font-bold text-text-secondary uppercase">Last Visit</p>
          <p className="text-sm font-bold text-[#B76E79]">{lastDoctorVisit ? format(parseISO(lastDoctorVisit), 'MMM d, yyyy') : 'No data'}</p>
        </div>
      </div>
    </motion.div>
  );

  const handleAddReport = (report: Omit<MedicalReport, 'id' | 'addedAt' | 'analysisResult' | 'analysisDate' | 'status'>) => {
    const newReport: MedicalReport = {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString(),
      analysisResult: null,
      analysisDate: null,
      status: 'not_analyzed'
    };
    setReports([...reports, newReport]);
    setShowAddReport(false);
  };

  const handleAddPrescription = (prescription: Omit<Prescription, 'id' | 'addedAt'>) => {
    const newPrescription: Prescription = {
      ...prescription,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString()
    };
    setPrescriptions([...prescriptions, newPrescription]);
    setShowAddPrescription(false);
  };

  const analyzeReport = async (record: MedicalReport | Prescription) => {
    setAnalyzingReport(record);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setShowAnalysis(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAnalysisResult("Tanha's AI needs to be set up first 🤖\nPlease contact support 💕");
      setIsAnalyzing(false);
      return;
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      // For demo purposes, we'll use the first image if available
      const imagePath = record.imagePaths[0];
      if (!imagePath) throw new Error("No image found");
      
      const base64ImageData = imagePath.includes('base64,') 
        ? imagePath.split('base64,')[1] 
        : imagePath;

      const prompt = `You are a compassionate and careful 
              medical report assistant helping a young 
              woman named Tanha understand her medical 
              reports and prescriptions in simple terms.
              
              YOUR RULES — FOLLOW STRICTLY:
              - NEVER diagnose any medical condition
              - NEVER recommend specific medicines or doses
              - NEVER say something is definitely wrong
              - NEVER say something is definitely fine
              - Use warm caring simple language always
              - No medical jargon whatsoever
              - If values look concerning say only:
                "this may be worth discussing with 
                your doctor" — nothing stronger
              - Be like a warm knowledgeable friend
                not a clinical robot
              - ALWAYS include the full disclaimer
              
              FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
              
              📋 WHAT THIS REPORT SHOWS
              [Simple explanation of what this report 
              is and what it was measuring]
              
              📊 YOUR VALUES AT A GLANCE
              [List each value with its result and 
              whether it appears within normal range.
              Use simple symbols: ✅ Normal ⚠️ Check]
              
              🌸 WHAT THIS GENERALLY MEANS
              [Warm plain explanation. Use phrases like
              'this generally suggests' or 
              'this may indicate' never 'you have']
              
              💡 GENERAL WELLNESS TIPS
              [Simple lifestyle suggestions relevant 
              to what the report shows]
              
              ⚕️ IMPORTANT DISCLAIMER
              This analysis is for general understanding 
              only. It is NOT a medical diagnosis. No AI 
              system can replace a qualified certified 
              doctor who knows your full medical history. 
              Please share this report with your doctor 
              at your next visit. Your doctor's opinion 
              is final — always. Your health is precious, 
              Tanha. Always trust your doctor first. 💕`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64ImageData
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          temperature: 0.3,
          maxOutputTokens: 1200,
        }
      });

      const result = response.text;
      if (!result) throw new Error("No response from AI");
      
      setAnalysisResult(result);
      
      // Update report status if it's a report
      if ('reportType' in record) {
        setReports(prev => prev.map(r => r.id === record.id ? { 
          ...r, 
          analysisResult: result, 
          analysisDate: new Date().toISOString(),
          status: result.includes('⚠️') || result.includes('Check') ? 'abnormal' : 'normal'
        } : r));
      }
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof Error && error.message === "No image found") {
        setAnalysisResult("The image is a little unclear, Tanha 🌸\nTry taking the photo in better lighting ☀️\nand make sure all text is fully visible 📋");
      } else {
        setAnalysisResult("Something went wrong, Tanha 🌸\nPlease try again in a moment 💕");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FDF8F5] dark:from-[#1A1114] dark:via-[#2C1810] dark:to-[#1A1114] pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif text-[#B76E79] dark:text-[#E8C4CC]">Tanha's Medicines 💊</h1>
          <p className="text-sm text-text-secondary mt-1 italic">Because taking care of yourself matters 🌸</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 rounded-2xl bg-white dark:bg-plum-card border border-rose-gold/10 text-text-secondary hover:text-[#B76E79] transition-all"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex px-6 gap-2 mb-6 bg-rose-gold/5 p-1 rounded-2xl mx-6">
        {[
          { id: 'medicines', label: 'Medicines 💊' },
          { id: 'prescriptions', label: 'Prescriptions 📋' },
          { id: 'reports', label: 'Reports 🔬' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id as any)}
            className={cn(
              "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              mainTab === tab.id 
                ? "bg-[#B76E79] text-white shadow-md" 
                : "text-[#8B6F6F] hover:bg-rose-gold/10"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-8">
        {mainTab === 'medicines' && (
          <>
            <HealthOverviewCard />
            
            {/* Sub Tabs for Medicines */}
            <div className="flex gap-4">
              {[
                { id: 'today', label: 'Today', icon: Clock },
                { id: 'list', label: 'All Meds', icon: Pill },
                { id: 'history', label: 'History', icon: History }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all",
                    activeTab === tab.id 
                      ? "bg-[#B76E79] text-white shadow-lg shadow-rose-gold/20" 
                      : "bg-white dark:bg-plum-card text-text-secondary border border-rose-gold/10"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'today' && (
              <>
                {/* Hero Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[40px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-xl shadow-rose-gold/5 space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Pill className="w-24 h-24 rotate-12" />
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-bold font-serif italic">Today's Schedule 📅</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-secondary">
                        {takenDosesToday} of {totalDosesToday} doses taken today 💊
                      </span>
                      <span className="text-xs font-black text-[#B76E79]">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-rose-gold/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-[#B76E79] to-[#F8BBD9]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {todayMeds.length > 0 ? (
                      todayMeds.flatMap(med => med.times.map(time => ({ med, time })))
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(({ med, time }) => {
                          const isTaken = med.takenLog[format(new Date(), 'yyyy-MM-dd')]?.includes(time);
                          return (
                            <div key={`${med.id}-${time}`} className="flex items-center justify-between p-4 rounded-2xl bg-rose-card/30 dark:bg-white/5 border border-rose-gold/5">
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => markAsTaken(med.id, time)}
                                  className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                    isTaken 
                                      ? "bg-[#B76E79] border-[#B76E79] text-white" 
                                      : "border-rose-gold/20 hover:border-[#B76E79]"
                                  )}
                                >
                                  {isTaken && <Check className="w-4 h-4" />}
                                </button>
                                <div>
                                  <p className={cn("font-bold text-sm", isTaken && "line-through text-text-secondary")}>{med.name}</p>
                                  <p className="text-[10px] text-text-secondary font-medium">{time} • {med.dosage}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {time.includes('AM') || parseInt(time) < 12 ? <Sunrise className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <p className="text-sm text-text-secondary italic">No medicines due today, Tanha! 🌸</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#B76E79]">Enjoy your healthy day 💖</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Timeline View */}
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-2">Timeline</h3>
                  <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-gold/10">
                    {todayMeds.flatMap(med => med.times.map(time => ({ med, time })))
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(({ med, time }) => {
                        const isTaken = med.takenLog[format(new Date(), 'yyyy-MM-dd')]?.includes(time);
                        return (
                          <div key={`timeline-${med.id}-${time}`} className="relative">
                            <div className={cn(
                              "absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-[#1A1114] z-10",
                              isTaken ? "border-[#B76E79] bg-[#B76E79]" : "border-rose-gold/20"
                            )} />
                            <div className="p-4 rounded-3xl bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm flex items-center justify-between">
                              <div>
                                <p className="text-[10px] font-black text-[#B76E79] uppercase tracking-tighter">{time}</p>
                                <p className="font-bold text-sm">{med.name}</p>
                                <p className="text-[10px] text-text-secondary">{med.dosage} • {med.withFood === 'with_food' ? 'With Food' : med.withFood === 'empty_stomach' ? 'Empty Stomach' : 'Anytime'}</p>
                              </div>
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center",
                                isTaken ? "bg-[#B76E79]/10 text-[#B76E79]" : "bg-rose-card dark:bg-white/5 text-text-secondary"
                              )}>
                                {isTaken ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'list' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Your Medicines</h3>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, showCompletedCourses: !s.showCompletedCourses }))}
                    className="text-[10px] font-bold text-[#B76E79] uppercase tracking-widest"
                  >
                    {settings.showCompletedCourses ? 'Hide Completed' : 'Show Completed'}
                  </button>
                </div>

                <div className="grid gap-4">
                  {medicines.length > 0 ? (
                    medicines
                      .filter(m => settings.showCompletedCourses || m.isActive)
                      .map(med => {
                        const daysRemaining = med.isOngoing ? null : (med.endDate ? differenceInDays(parseISO(med.endDate), new Date()) : 0);
                        return (
                          <motion.div 
                            key={med.id}
                            layout
                            className={cn(
                              "p-6 rounded-[32px] border transition-all relative overflow-hidden group",
                              med.isActive ? "bg-white dark:bg-plum-card border-rose-gold/10 shadow-sm" : "bg-rose-card/30 dark:bg-white/5 border-transparent opacity-60"
                            )}
                            style={{ borderLeftColor: med.color, borderLeftWidth: '6px' }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-lg">{med.name}</h4>
                                  <span className="px-2 py-0.5 rounded-full bg-rose-gold/10 text-[#B76E79] text-[8px] font-black uppercase tracking-widest">
                                    {MEDICINE_TYPES.find(t => t.id === med.type)?.label}
                                  </span>
                                </div>
                                <p className="text-xs text-text-secondary font-medium">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                              </div>
                              <button 
                                onClick={() => toggleMedicineStatus(med.id)}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all",
                                  med.isActive ? "bg-[#B76E79]" : "bg-rose-gold/20"
                                )}
                              >
                                <motion.div 
                                  animate={{ x: med.isActive ? 24 : 4 }}
                                  className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm"
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Next: {med.times[0]} 🌙</span>
                              </div>
                              {!med.isOngoing && daysRemaining !== null && (
                                <div className="flex items-center gap-1 text-accent">
                                  <Timer className="w-3 h-3" />
                                  <span>{daysRemaining > 0 ? `${daysRemaining} days remaining ⏳` : 'Course Completed! 🎉'}</span>
                                </div>
                              )}
                            </div>

                            <div className="absolute top-2 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => setEditingMedicine(med)}
                                className="p-2 rounded-xl bg-rose-card dark:bg-white/10 text-text-secondary hover:text-[#B76E79]"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMedicine(med.id)}
                                className="p-2 rounded-xl bg-rose-card dark:bg-white/10 text-text-secondary hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                  ) : (
                    <div className="p-20 text-center border-2 border-dashed border-rose-gold/10 dark:border-white/5 rounded-[48px] space-y-6">
                      <div className="w-20 h-20 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto text-[#B76E79]">
                        <Pill className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-text-primary dark:text-text-dark-primary font-bold">No medicines added yet, Tanha 🌸</p>
                        <p className="text-text-secondary text-xs italic">Add your medicines and vitamins here and never miss a dose again 💊💕</p>
                        <button 
                          onClick={() => setShowAddSheet(true)}
                          className="mt-4 px-6 py-3 rounded-2xl bg-[#B76E79] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-gold/20"
                        >
                          Add First Medicine 💊
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-8">
                {/* Compliance Stats */}
                <div className="p-8 rounded-[40px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold font-serif italic text-xl">Monthly Compliance</h3>
                    <ChartIcon className="w-5 h-5 text-[#B76E79]" />
                  </div>
                  
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', value: 80 },
                        { name: 'Tue', value: 100 },
                        { name: 'Wed', value: 60 },
                        { name: 'Thu', value: 90 },
                        { name: 'Fri', value: 100 },
                        { name: 'Sat', value: 70 },
                        { name: 'Sun', value: 85 },
                      ]}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                          {(entry: any) => (
                            <Cell fill={entry.value === 100 ? '#B76E79' : entry.value > 70 ? '#F8BBD9' : '#FFCCBC'} />
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-card/30 dark:bg-white/5 border border-rose-gold/5 text-center">
                    <p className="text-xs text-text-primary dark:text-text-dark-primary font-medium italic">
                      "You took your medicines 87% of the time this month, Tanha 💊 Keep going! 💪"
                    </p>
                  </div>
                </div>

                {/* Calendar History */}
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary px-2">Compliance Calendar</h3>
                  <div className="p-6 rounded-[40px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm">
                    <div className="grid grid-cols-7 gap-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-text-secondary uppercase">{d}</div>
                      ))}
                      {Array.from({ length: 31 }).map((_, i) => {
                        const compliance = Math.random();
                        return (
                          <div 
                            key={i}
                            className={cn(
                              "aspect-square rounded-xl flex items-center justify-center relative",
                              compliance > 0.8 ? "bg-green-100 text-green-600" : compliance > 0.4 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                            )}
                          >
                            <span className="text-[10px] font-bold">{i + 1}</span>
                            <div className={cn(
                              "absolute bottom-1 w-1 h-1 rounded-full",
                              compliance > 0.8 ? "bg-green-600" : compliance > 0.4 ? "bg-amber-600" : "bg-red-600"
                            )} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex justify-center gap-4 text-[8px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> All Taken</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Partial</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Missed</div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )}

        {mainTab === 'prescriptions' && (
          <PrescriptionTab 
            prescriptions={prescriptions}
            onAdd={() => setShowAddPrescription(true)}
            onSelect={setSelectedPrescription}
            isLocked={isLocked}
          />
        )}

        {mainTab === 'reports' && (
          <ReportTab 
            reports={reports}
            onAdd={() => setShowAddReport(true)}
            onSelect={setSelectedReport}
            isLocked={isLocked}
          />
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => {
          if (mainTab === 'medicines') setShowAddSheet(true);
          else if (mainTab === 'prescriptions') setShowAddPrescription(true);
          else if (mainTab === 'reports') setShowAddReport(true);
        }}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-[#B76E79] text-white shadow-2xl shadow-rose-gold/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add/Edit Sheet */}
      <AnimatePresence>
        {(showAddSheet || editingMedicine) && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddSheet(false); setEditingMedicine(null); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white dark:bg-plum-card rounded-t-[48px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-rose-gold/20 rounded-full mx-auto mb-8" />
              
              <h3 className="text-2xl font-bold font-serif italic mb-8">
                {editingMedicine ? 'Edit Medicine 💊' : 'Add Medicine / Vitamin 💊'}
              </h3>

              <MedicineForm 
                initialData={editingMedicine || undefined}
                onSubmit={(data) => {
                  if (editingMedicine) {
                    handleUpdateMedicine({ ...editingMedicine, ...data });
                  } else {
                    handleAddMedicine(data as any);
                  }
                }}
                onCancel={() => { setShowAddSheet(false); setEditingMedicine(null); }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-plum-card rounded-[40px] p-8 space-y-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold font-serif italic">Medicine Settings ⚙️</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Snooze Duration (mins)</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSettings(s => ({ ...s, snoozeDuration: Math.max(5, s.snoozeDuration - 5) }))} className="p-2 rounded-xl bg-rose-card dark:bg-white/5"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold">{settings.snoozeDuration}</span>
                    <button onClick={() => setSettings(s => ({ ...s, snoozeDuration: s.snoozeDuration + 5 }))} className="p-2 rounded-xl bg-rose-card dark:bg-white/5"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Lock Health Records 🔒</p>
                    <p className="text-[10px] text-text-secondary italic">Keep your prescriptions and reports private 💕</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newValue = !isLocked;
                      setIsLocked(newValue);
                      localStorage.setItem('medicine_records_locked', String(newValue));
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      isLocked ? "bg-[#B76E79]" : "bg-rose-gold/20"
                    )}
                  >
                    <motion.div 
                      animate={{ x: isLocked ? 24 : 4 }}
                      className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Reminder Sound</label>
                  <select 
                    value={settings.reminderSound}
                    onChange={e => setSettings(s => ({ ...s, reminderSound: e.target.value }))}
                    className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold text-sm"
                  >
                    <option value="default">Soft Chime 🔔</option>
                    <option value="gentle">Gentle Harp 🎵</option>
                    <option value="cheerful">Cheerful Pop ✨</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Clear Completed Courses</span>
                  <button 
                    onClick={() => {
                      setMedicines(prev => prev.filter(m => m.isActive || m.isOngoing));
                      setShowSettings(false);
                    }}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-4 rounded-2xl bg-[#B76E79] text-white font-black text-sm uppercase tracking-widest shadow-lg"
              >
                Done 🌸
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Prescription Sheet */}
      <AnimatePresence>
        {showAddPrescription && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPrescription(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white dark:bg-plum-card rounded-t-[48px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-rose-gold/20 rounded-full mx-auto mb-8" />
              <h3 className="text-2xl font-bold font-serif italic mb-8">Add Prescription 📋💕</h3>
              <PrescriptionForm 
                onSubmit={handleAddPrescription}
                onCancel={() => setShowAddPrescription(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Report Sheet */}
      <AnimatePresence>
        {showAddReport && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddReport(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white dark:bg-plum-card rounded-t-[48px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-rose-gold/20 rounded-full mx-auto mb-8" />
              <h3 className="text-2xl font-bold font-serif italic mb-8">Add Medical Report 🔬💕</h3>
              <ReportForm 
                onSubmit={handleAddReport}
                onCancel={() => setShowAddReport(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription Detail View */}
      <AnimatePresence>
        {selectedPrescription && (
          <RecordDetailView 
            record={selectedPrescription}
            type="prescription"
            onClose={() => setSelectedPrescription(null)}
            onAnalyze={() => analyzeReport(selectedPrescription)}
            onDelete={() => {
              setPrescriptions(prev => prev.filter(p => p.id !== selectedPrescription.id));
              setSelectedPrescription(null);
            }}
            onAddToMedicineList={() => {
              setMainTab('medicines');
              setShowAddSheet(true);
              setSelectedPrescription(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Report Detail View */}
      <AnimatePresence>
        {selectedReport && (
          <RecordDetailView 
            record={selectedReport}
            type="report"
            onClose={() => setSelectedReport(null)}
            onAnalyze={() => analyzeReport(selectedReport)}
            onDelete={() => {
              setReports(prev => prev.filter(r => r.id !== selectedReport.id));
              setSelectedReport(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* AI Analysis View */}
      <AnimatePresence>
        {showAnalysis && (
          <AIAnalysisView 
            isAnalyzing={isAnalyzing}
            result={analysisResult}
            onClose={() => setShowAnalysis(false)}
            hasAcceptedDisclaimer={hasAcceptedDisclaimer}
            onAcceptDisclaimer={() => setHasAcceptedDisclaimer(true)}
            recordName={analyzingReport ? ('doctorName' in analyzingReport ? analyzingReport.doctorName : analyzingReport.reportType) : ''}
            recordDate={analyzingReport ? format(parseISO(analyzingReport.date), 'MMM d, yyyy') : ''}
          />
        )}
      </AnimatePresence>

      {/* Celebration Popup */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCelebration(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative w-full max-w-xs bg-white dark:bg-plum-card rounded-[48px] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto text-[#B76E79]">
                <Heart className="w-10 h-10 fill-current" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#B76E79]">All medicines taken today, lokki amar! 🥺💊💕</h3>
                <p className="text-sm text-text-secondary italic">I am so proud of you for taking care of yourself 🌸</p>
              </div>
              <button 
                onClick={() => setShowCelebration(false)}
                className="w-full py-4 rounded-2xl bg-[#B76E79] text-white font-black text-sm uppercase tracking-widest shadow-lg"
              >
                Love you! 💖
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Completion Popup */}
      <AnimatePresence>
        {showCourseComplete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCourseComplete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative w-full max-w-xs bg-white dark:bg-plum-card rounded-[48px] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto text-[#B76E79]">
                <PartyPopper className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#B76E79]">Course Completed! 🎉</h3>
                <p className="text-sm text-text-secondary italic">
                  You completed your full course of {showCourseComplete.name}! So proud of you for being consistent with your health, lokki amar 💊💕
                </p>
              </div>
              <button 
                onClick={() => setShowCourseComplete(null)}
                className="w-full py-4 rounded-2xl bg-[#B76E79] text-white font-black text-sm uppercase tracking-widest shadow-lg"
              >
                Yay! 🌸
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-components for Prescriptions and Reports ---

const PrescriptionTab: React.FC<{
  prescriptions: Prescription[];
  onAdd: () => void;
  onSelect: (p: Prescription) => void;
  isLocked: boolean;
}> = ({ prescriptions, onAdd, onSelect, isLocked }) => {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Lock className="w-12 h-12 text-rose-gold/40" />
        <p className="text-sm text-text-secondary italic">Health records are locked 🔒</p>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-rose-gold/10 dark:border-white/5 rounded-[48px] space-y-6">
        <div className="w-20 h-20 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto text-[#B76E79]">
          <Clipboard className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-text-primary dark:text-text-dark-primary font-bold">No prescriptions saved yet, Tanha 🌸</p>
          <p className="text-text-secondary text-xs italic">Store your prescriptions here safely — always with you, always private 💕</p>
          <button 
            onClick={onAdd}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#B76E79] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-gold/20"
          >
            Add First Prescription 📋
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {prescriptions.map(p => (
        <motion.div
          key={p.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(p)}
          className="p-4 rounded-[32px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm flex gap-4 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl bg-rose-card dark:bg-white/5 flex items-center justify-center overflow-hidden border border-rose-gold/5">
            {p.imagePaths.length > 0 ? (
              <img src={p.imagePaths[0]} alt="Prescription" className="w-full h-full object-cover" />
            ) : (
              <FileText className="w-8 h-8 text-rose-gold/40" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-sm line-clamp-1">{p.doctorName}</h4>
            <p className="text-[10px] text-text-secondary font-medium">{p.hospitalName}</p>
            <p className="text-[10px] text-[#B76E79] font-bold">{p.diagnosis}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-text-secondary">{format(parseISO(p.date), 'MMM d, yyyy')}</span>
              <button className="text-[8px] font-black uppercase tracking-widest bg-[#B76E79] text-white px-3 py-1 rounded-full shadow-sm">
                View & Analyze 🤖
              </button>
            </div>
          </div>
          <div className="self-center">
            <ChevronRight className="w-5 h-5 text-rose-gold/40" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ReportTab: React.FC<{
  reports: MedicalReport[];
  onAdd: () => void;
  onSelect: (r: MedicalReport) => void;
  isLocked: boolean;
}> = ({ reports, onAdd, onSelect, isLocked }) => {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Lock className="w-12 h-12 text-rose-gold/40" />
        <p className="text-sm text-text-secondary italic">Health records are locked 🔒</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-rose-gold/10 dark:border-white/5 rounded-[48px] space-y-6">
        <div className="w-20 h-20 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto text-[#B76E79]">
          <Microscope className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-text-primary dark:text-text-dark-primary font-bold">No reports saved yet 🔬</p>
          <p className="text-text-secondary text-xs italic">Upload your medical reports and let AI help you understand them 💕 Remember — always consult your doctor! 🏥</p>
          <button 
            onClick={onAdd}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#B76E79] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-gold/20"
          >
            Add First Report 🔬
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reports.map(r => (
        <motion.div
          key={r.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(r)}
          className="p-4 rounded-[32px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm flex gap-4 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-2xl bg-rose-card dark:bg-white/5 flex items-center justify-center overflow-hidden border border-rose-gold/5">
            {r.imagePaths.length > 0 ? (
              <img src={r.imagePaths[0]} alt="Report" className="w-full h-full object-cover" />
            ) : (
              <Microscope className="w-8 h-8 text-rose-gold/40" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm line-clamp-1">{r.reportType}</h4>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-[10px] text-text-secondary font-medium">{r.labName}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-text-secondary">{format(parseISO(r.date), 'MMM d, yyyy')}</span>
              <button className="text-[8px] font-black uppercase tracking-widest bg-[#B76E79] text-white px-3 py-1 rounded-full shadow-sm">
                View & Analyze 🤖
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const StatusBadge: React.FC<{ status: MedicalReport['status'] }> = ({ status }) => {
  const config = {
    normal: { label: 'Normal ✅', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
    abnormal: { label: 'Check Results ⚠️', color: 'bg-red-100 text-red-600', icon: AlertTriangle },
    not_analyzed: { label: 'Not Analyzed 🔍', color: 'bg-rose-gold/10 text-[#B76E79]', icon: Search }
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <div className={cn("px-2 py-0.5 rounded-full flex items-center gap-1 text-[8px] font-black uppercase tracking-widest", color)}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </div>
  );
};

// --- Prescription Form ---

const PrescriptionForm: React.FC<{
  onSubmit: (data: Omit<Prescription, 'id' | 'addedAt'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('General');
  const [hospitalName, setHospitalName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [diagnosis, setDiagnosis] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePaths(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Doctor's name 👨‍⚕️</label>
          <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" placeholder="Enter doctor's name..." />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Specialization</label>
          <div className="flex flex-wrap gap-2">
            {DOCTOR_SPECIALIZATIONS.map(s => (
              <button key={s} onClick={() => setSpecialization(s)} className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all border", specialization === s ? "bg-[#B76E79] text-white border-[#B76E79]" : "bg-white dark:bg-white/5 text-text-secondary border-rose-gold/10")}>{s}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Hospital or clinic name</label>
          <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" placeholder="Where was this prescribed?" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Date of prescription</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">What was it prescribed for? 🌸</label>
          <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" placeholder="e.g. Fever, Routine checkup..." />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Upload prescription photo 📸</label>
          <div className="flex flex-wrap gap-4">
            {imagePaths.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-rose-gold/10">
                <img src={img} alt="Prescription" className="w-full h-full object-cover" />
                <button onClick={() => setImagePaths(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-rose-gold/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-rose-gold/5 transition-all">
              <Camera className="w-6 h-6 text-rose-gold/40" />
              <span className="text-[8px] font-black uppercase tracking-widest text-rose-gold/40">Add Photo</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Any additional notes? 💊</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold min-h-[100px]" placeholder="Add any extra details here..." />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-rose-card dark:bg-white/5 text-text-secondary font-black text-sm uppercase tracking-widest">Cancel</button>
        <button onClick={() => onSubmit({ doctorName, specialization, hospitalName, date, diagnosis, imagePaths, notes })} className="flex-2 py-4 rounded-2xl bg-[#B76E79] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-gold/20">Save Prescription 📋💕</button>
      </div>
    </div>
  );
};

// --- Report Form ---

const ReportForm: React.FC<{
  onSubmit: (data: Omit<MedicalReport, 'id' | 'addedAt' | 'analysisResult' | 'analysisDate' | 'status'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [reportType, setReportType] = useState('Blood Test');
  const [labName, setLabName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [referringDoctor, setReferringDoctor] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePaths(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Report Type</label>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map(r => (
              <button key={r} onClick={() => setReportType(r)} className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all border", reportType === r ? "bg-[#B76E79] text-white border-[#B76E79]" : "bg-white dark:bg-white/5 text-text-secondary border-rose-gold/10")}>{r}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Lab or hospital name</label>
          <input type="text" value={labName} onChange={e => setLabName(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" placeholder="Where was this test done?" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Referring doctor (optional)</label>
          <input type="text" value={referringDoctor} onChange={e => setReferringDoctor(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold" placeholder="Dr. Name" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Upload report photo 📸</label>
          <div className="flex flex-wrap gap-4">
            {imagePaths.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-rose-gold/10">
                <img src={img} alt="Report" className="w-full h-full object-cover" />
                <button onClick={() => setImagePaths(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-rose-gold/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-rose-gold/5 transition-all">
              <Camera className="w-6 h-6 text-rose-gold/40" />
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <span className="text-[8px] font-black uppercase tracking-widest text-rose-gold/40">Add Photo</span>
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold min-h-[100px]" placeholder="Additional notes..." />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-rose-card dark:bg-white/5 text-text-secondary font-black text-sm uppercase tracking-widest">Cancel</button>
        <button onClick={() => onSubmit({ reportType, labName, date, referringDoctor, imagePaths, notes })} className="flex-2 py-4 rounded-2xl bg-[#B76E79] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-gold/20">Save Report 🔬💕</button>
      </div>
    </div>
  );
};

// --- Record Detail View ---

const RecordDetailView: React.FC<{
  record: Prescription | MedicalReport;
  type: 'prescription' | 'report';
  onClose: () => void;
  onAnalyze: () => void;
  onDelete: () => void;
  onAddToMedicineList?: () => void;
}> = ({ record, type, onClose, onAnalyze, onDelete, onAddToMedicineList }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="fixed inset-0 z-[150] bg-white dark:bg-[#1A1114] flex flex-col">
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2 rounded-full bg-rose-card dark:bg-white/5 text-text-secondary"><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-rose-card dark:bg-white/5 text-text-secondary"><Share2 className="w-5 h-5" /></button>
          <button onClick={onDelete} className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Image Viewer */}
        <div className="relative aspect-[3/4] bg-black group overflow-hidden">
          {record.imagePaths.length > 0 ? (
            <motion.img 
              src={record.imagePaths[currentImageIndex]} 
              alt="Record" 
              className={cn(
                "w-full h-full transition-all cursor-zoom-in",
                isZoomed ? "object-cover scale-150 cursor-zoom-out" : "object-contain"
              )}
              onClick={() => setIsZoomed(!isZoomed)}
              animate={{ scale: isZoomed ? 1.5 : 1 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <ImageIcon className="w-20 h-20" />
            </div>
          )}
          {record.imagePaths.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {record.imagePaths.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === currentImageIndex ? "bg-white w-4" : "bg-white/30")} />
              ))}
            </div>
          )}
          {record.imagePaths.length > 1 && (
            <>
              <button onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : record.imagePaths.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={() => setCurrentImageIndex(prev => (prev < record.imagePaths.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-all"><ChevronRight className="w-6 h-6" /></button>
            </>
          )}
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-[#B76E79]">
              {'doctorName' in record ? record.doctorName : record.reportType}
            </h2>
            <p className="text-sm text-text-secondary font-medium">
              {'specialization' in record ? `${record.specialization} • ${record.hospitalName}` : record.labName}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Calendar className="w-4 h-4 text-rose-gold/40" />
              <span className="text-xs font-bold text-text-secondary">{format(parseISO(record.date), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onAnalyze} className="col-span-2 py-4 rounded-2xl bg-gradient-to-r from-[#B76E79] to-[#F8BBD9] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-gold/20 flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              Analyze with Tanha's AI 🤖💕
            </button>
            {type === 'prescription' && (
              <button 
                onClick={onAddToMedicineList}
                className="col-span-2 py-4 rounded-2xl bg-rose-gold/10 text-[#B76E79] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-rose-gold/20"
              >
                <Plus className="w-5 h-5" />
                Add to Medicine List
              </button>
            )}
          </div>

          <div className="space-y-6">
            {'diagnosis' in record && record.diagnosis && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Diagnosis</h4>
                <p className="text-sm font-medium leading-relaxed">{record.diagnosis}</p>
              </div>
            )}
            {record.notes && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Notes</h4>
                <p className="text-sm font-medium leading-relaxed italic">"{record.notes}"</p>
              </div>
            )}
            {type === 'report' && (
              <div className="p-4 rounded-2xl bg-rose-gold/5 border border-rose-gold/10 flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-[#B76E79] shrink-0" />
                <p className="text-[10px] font-medium text-text-secondary leading-relaxed">
                  Always share this report with your doctor for professional interpretation 💕
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AI Analysis View ---

const AIAnalysisView: React.FC<{
  isAnalyzing: boolean;
  result: string | null;
  onClose: () => void;
  hasAcceptedDisclaimer: boolean;
  onAcceptDisclaimer: () => void;
  recordName: string;
  recordDate: string;
}> = ({ isAnalyzing, result, onClose, hasAcceptedDisclaimer, onAcceptDisclaimer, recordName, recordDate }) => {
  const loadingMessages = [
    "Reading your report carefully... 🔬",
    "Analyzing the values... 📊",
    "Preparing your summary... 🌸",
    "Almost ready, Tanha... 💕"
  ];
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-[#1A1114] flex flex-col">
      <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-rose-gold/10">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[#B76E79]" />
          <div>
            <h2 className="text-lg font-bold font-serif">Tanha's AI Analysis 🤖💕</h2>
            <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Your Personal Health Assistant 🌸</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-rose-card dark:bg-white/5 text-text-secondary"><X className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isAnalyzing ? (
          <div className="h-full flex flex-col items-center justify-center p-12 space-y-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-rose-gold/10 rounded-full flex items-center justify-center text-[#B76E79]"
            >
              <Brain className="w-12 h-12" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-[#B76E79]">{loadingMessages[loadingIndex]}</h3>
              <p className="text-xs text-text-secondary italic">This will only take a moment, lokki amar 🌸</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-8 pb-32">
            {!hasAcceptedDisclaimer && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-[32px] bg-rose-50 dark:bg-red-900/10 border border-rose-200 dark:border-red-900/20 space-y-4"
              >
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h4 className="font-black text-xs uppercase tracking-widest">Important Notice</h4>
                </div>
                <p className="text-xs font-medium leading-relaxed text-text-primary dark:text-text-dark-primary">
                  This analysis is for general understanding only. It is NOT a medical diagnosis. No AI knows your health better than your doctor. Please always consult a certified medical professional for any health decisions. Your doctor's opinion is final — always. 💕
                </p>
                <button 
                  onClick={onAcceptDisclaimer}
                  className="w-full py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20"
                >
                  I understand 💕
                </button>
              </motion.div>
            )}

            {hasAcceptedDisclaimer && result && (
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-2xl font-serif text-[#B76E79]">{recordName}</h3>
                  <p className="text-xs font-bold text-text-secondary">{recordDate}</p>
                </div>

                <div className="space-y-4">
                  {result.split('\n\n').map((section, i) => {
                    const title = section.split('\n')[0];
                    const content = section.split('\n').slice(1).join('\n');
                    if (!title || !content) return null;
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-[32px] bg-white dark:bg-plum-card border border-rose-gold/10 shadow-sm space-y-3"
                      >
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#B76E79]">{title}</h4>
                        <div className="text-sm font-medium leading-relaxed text-text-secondary whitespace-pre-wrap">
                          {content}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 py-4 rounded-2xl bg-rose-gold/10 text-[#B76E79] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Analysis 💾
                  </button>
                  <button 
                    onClick={() => {
                      // Logic to open important dates or set reminder
                      onClose();
                    }}
                    className="flex-1 py-4 rounded-2xl bg-[#B76E79] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Calendar className="w-4 h-4" />
                    Set Doctor Reminder 📅
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface MedicineFormProps {
  initialData?: Medicine;
  onSubmit: (data: Omit<Medicine, 'id' | 'addedAt'>) => void;
  onCancel: () => void;
}

const MedicineForm: React.FC<MedicineFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<MedicineType>(initialData?.type || 'tablet');
  const [dosage, setDosage] = useState(initialData?.dosage || '');
  const [frequency, setFrequency] = useState<Frequency>(initialData?.frequency || 'once');
  const [times, setTimes] = useState<string[]>(initialData?.times || ['08:00 AM']);
  const [withFood, setWithFood] = useState<FoodPreference>(initialData?.withFood || 'any');
  const [startDate, setStartDate] = useState(initialData?.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [isOngoing, setIsOngoing] = useState(initialData?.isOngoing ?? true);
  const [color, setColor] = useState(initialData?.color || MEDICINE_COLORS[0].value);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleFrequencyChange = (freq: Frequency) => {
    setFrequency(freq);
    if (freq === 'once') setTimes(['08:00 AM']);
    else if (freq === 'twice') setTimes(['08:00 AM', '08:00 PM']);
    else if (freq === 'three') setTimes(['08:00 AM', '02:00 PM', '08:00 PM']);
  };

  const updateTime = (index: number, val: string) => {
    const newTimes = [...times];
    newTimes[index] = val;
    setTimes(newTimes);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">What is it called? 💊</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Paracetamol"
            className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold focus:ring-2 focus:ring-[#B76E79]/20 transition-all"
          />
        </div>

        {/* Type Chips */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Type</label>
          <div className="flex flex-wrap gap-2">
            {MEDICINE_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setType(t.id as MedicineType)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                  type === t.id 
                    ? "bg-[#B76E79] text-white border-[#B76E79] shadow-md" 
                    : "bg-white dark:bg-white/5 text-text-secondary border-rose-gold/10"
                )}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">How much per dose? 🌸</label>
          <input 
            type="text" 
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="e.g. 1 tablet"
            className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold focus:ring-2 focus:ring-[#B76E79]/20 transition-all"
          />
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Frequency</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'once', label: 'Once daily' },
              { id: 'twice', label: 'Twice daily' },
              { id: 'three', label: 'Three times' },
              { id: 'as_needed', label: 'As needed' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => handleFrequencyChange(f.id as Frequency)}
                className={cn(
                  "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  frequency === f.id 
                    ? "bg-[#B76E79] text-white border-[#B76E79]" 
                    : "bg-white dark:bg-white/5 text-text-secondary border-rose-gold/10"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Times */}
        {frequency !== 'as_needed' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Time Slots</label>
            <div className="grid grid-cols-2 gap-3">
              {times.map((time, idx) => (
                <div key={idx} className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input 
                    type="time" 
                    value={time.includes(' ') ? format(parseISO(`2000-01-01T${time.replace(' AM', ':00').replace(' PM', ':00')}`), 'HH:mm') : time}
                    onChange={e => updateTime(idx, e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Food Preference */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Food Preference</label>
          <div className="flex gap-2">
            {[
              { id: 'with_food', label: 'With Food', icon: Utensils },
              { id: 'empty_stomach', label: 'Empty Stomach', icon: Coffee },
              { id: 'any', label: 'Anytime', icon: Sunrise }
            ].map(pref => (
              <button
                key={pref.id}
                onClick={() => setWithFood(pref.id as FoodPreference)}
                className={cn(
                  "flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all border",
                  withFood === pref.id 
                    ? "bg-[#B76E79] text-white border-[#B76E79]" 
                    : "bg-white dark:bg-white/5 text-text-secondary border-rose-gold/10"
                )}
              >
                <pref.icon className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase">{pref.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Course Type</label>
            <button 
              onClick={() => setIsOngoing(!isOngoing)}
              className={cn(
                "w-full p-4 rounded-2xl font-bold text-sm border transition-all",
                isOngoing ? "bg-rose-card/50 dark:bg-deep-plum text-text-primary border-transparent" : "bg-[#B76E79] text-white border-[#B76E79]"
              )}
            >
              {isOngoing ? 'Ongoing ♾️' : 'Fixed Course ⏳'}
            </button>
          </div>
        </div>

        {!isOngoing && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold text-sm"
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Any special instructions? 🌸</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Take with warm water"
            className="w-full p-4 rounded-2xl bg-rose-card/50 dark:bg-deep-plum border-none font-bold text-sm min-h-[100px] resize-none"
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">Card Color</label>
          <div className="flex justify-between px-2">
            {MEDICINE_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setColor(c.value)}
                className={cn(
                  "w-10 h-10 rounded-full transition-all border-4",
                  color === c.value ? "border-[#B76E79] scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl bg-rose-card dark:bg-white/5 text-text-secondary font-black text-xs uppercase tracking-widest"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSubmit({ name, type, dosage, frequency, times, withFood, startDate, endDate, isOngoing, color, notes, isActive: true })}
          className="flex-[2] py-4 rounded-2xl bg-[#B76E79] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-gold/20"
        >
          {initialData ? 'Update Medicine 💕' : 'Add Medicine 💕'}
        </button>
      </div>
    </div>
  );
};
