import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Check, Trash2, Settings, Home, Play, 
  Flame, Calendar, Star, Moon, Sun, Volume2, 
  VolumeX, Bell, BellOff, ArrowRight, X, 
  Clock, Coffee, Brain, Timer, ChevronRight,
  TrendingUp, Award, Heart, Sparkles, Smile,
  Wand2, Send, Droplets, Thermometer, Activity, 
  Info, ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  format, isToday, startOfToday, parseISO, subDays, 
  isSameDay, addDays, differenceInDays, startOfMonth, 
  endOfMonth, eachDayOfInterval, isSameMonth, addMonths, 
  subMonths, startOfWeek, endOfWeek
} from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Types & Constants ---
import { 
  Task, AnchorTaskTemplate, UserSettings, DailyReflection,
  CycleLog, CycleSettings, PeriodTrackerData, CyclePhase 
} from './types';
import { 
  MOTIVATIONAL_QUOTES, KEYWORD_EMOJI_MAP, CELEBRATION_MESSAGES, EMOJI_OPTIONS,
  CYCLE_PHASES, MOODS, SYMPTOMS, SELF_CARE, PARTNER_NOTES
} from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Utils ---
const playSound = (url: string, enabled: boolean) => {
  if (!enabled) return;
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  POP: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  CELEBRATE: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

const getEmojiFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  for (const [keyword, emoji] of Object.entries(KEYWORD_EMOJI_MAP)) {
    if (lowerName.includes(keyword)) return emoji;
  }
  return "✅";
};

// --- Components ---

const AnimatedCheckbox = ({ checked, onToggle }: { checked: boolean, onToggle: () => void }) => {
  return (
    <button 
      onClick={onToggle}
      className={cn(
        "relative w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center overflow-hidden",
        checked ? "bg-electric-indigo border-electric-indigo" : "border-gray-300 dark:border-gray-600 bg-transparent"
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete?: () => void;
}

const TaskCard = ({ task, onToggle, onDelete }: TaskCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "group flex items-center gap-4 p-5 rounded-[32px] transition-all duration-500",
        "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50",
        !task.completed && "girly-shadow border-soft-pink/10",
        task.completed && "opacity-60 grayscale-[0.2]"
      )}
    >
      <div id={!task.completed ? "tour-checkbox" : undefined}>
        <AnimatedCheckbox checked={task.completed} onToggle={onToggle} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl girly-glow">{task.emoji}</span>
          <h3 className={cn(
            "font-bold text-gray-900 dark:text-gray-100 truncate transition-all duration-500",
            task.completed && "line-through decoration-soft-pink/50 opacity-50"
          )}>
            {task.name}
          </h3>
          {task.isAnchor && (
            <span className="px-2 py-0.5 rounded-full bg-soft-pink/10 text-soft-pink text-[9px] font-black uppercase tracking-widest">
              Anchor
            </span>
          )}
        </div>
        {task.time && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{task.time}</span>
            {(() => {
              const [h, m] = task.time.split(':').map(Number);
              const now = new Date();
              const taskTime = new Date();
              taskTime.setHours(h, m, 0, 0);
              const diff = (taskTime.getTime() - now.getTime()) / (1000 * 60);
              if (diff > 0 && diff <= 15) {
                return <span className="ml-2 text-rose-500 font-bold animate-pulse">Starts soon! 🌸</span>;
              }
              return null;
            })()}
          </div>
        )}
      </div>

      {!task.isAnchor && onDelete && (
        <button 
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2.5 text-gray-300 hover:text-rose-500 transition-all bg-gray-50 dark:bg-navy-900 rounded-xl"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

// --- Sub-Components ---

const CelebrationPopup = ({ 
  message, 
  onDismiss, 
  isFinale = false 
}: { 
  message: string, 
  onDismiss: () => void, 
  isFinale?: boolean 
}) => {
  useEffect(() => {
    if (!isFinale) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFinale, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm p-8 rounded-[40px] shadow-2xl text-center celebration-gradient border-4 border-white/50",
        isFinale ? "top-1/2 -translate-y-1/2" : "bottom-24"
      )}
    >
      {/* Floating Hearts Animation */}
      <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0, x: Math.random() * 200 - 100 }}
            animate={{ 
              y: -200, 
              opacity: [0, 1, 0],
              x: (Math.random() * 200 - 100) + (i * 20)
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              repeat: Infinity,
              delay: i * 0.4
            }}
            className="absolute bottom-0 text-red-400/30"
          >
            <Heart className="w-8 h-8 fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 space-y-6">
        <motion.div
          animate={{ y: [-10, 0, -10] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          {isFinale ? "🌙💖✨" : "💖"}
        </motion.div>
        
        <h2 className={cn(
          "text-3xl font-bold text-gray-800 leading-tight handwriting",
          isFinale ? "text-4xl" : "text-3xl"
        )}>
          {message}
        </h2>

        <button
          onClick={onDismiss}
          className="px-8 py-3 bg-white/80 hover:bg-white text-pink-600 rounded-full font-bold shadow-sm transition-all flex items-center gap-2 mx-auto"
        >
          {isFinale ? "I love you too! 💖" : "💖 Yay!"}
        </button>
      </div>

      {isFinale && (
        <div className="absolute -inset-4 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full border-4 border-pink-300/30 rounded-[50px]"
          />
        </div>
      )}
    </motion.div>
  );
};

const Onboarding = ({ 
  onFinish,
  soundEnabled
}: { 
  onFinish: (anchors: AnchorTaskTemplate[]) => void,
  soundEnabled: boolean
}) => {
  const [step, setStep] = useState(1);
  const [anchors, setAnchors] = useState<AnchorTaskTemplate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', time: '', emoji: '✅' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleNextStep = () => {
    playSound(SOUNDS.CLICK, soundEnabled);
    setStep(2);
  };

  const handleFinish = () => {
    playSound(SOUNDS.CELEBRATE, soundEnabled);
    onFinish(anchors);
  };

  const handleNameChange = (val: string) => {
    setNewTask(prev => ({ ...prev, name: val, emoji: getEmojiFromName(val) }));
  };

  const saveNewAnchor = () => {
    if (!newTask.name.trim()) return;
    playSound(SOUNDS.POP, soundEnabled);
    setAnchors([...anchors, { id: Math.random().toString(36).substr(2, 9), ...newTask }]);
    setNewTask({ name: '', time: '', emoji: '✅' });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-warm-white dark:bg-navy-900 flex items-center justify-center p-6 overflow-y-auto text-gray-900 dark:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {step === 1 && (
          <div className="space-y-8 text-center">
            <div className="w-24 h-24 bg-electric-indigo rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-electric-indigo/30 rotate-12">
              <Flame className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Hey Tanha! 🌸</h1>
              <p className="text-gray-500 dark:text-gray-400">This app is made just for you, with love 💖</p>
            </div>
            <div className="pt-4">
              <button 
                onClick={handleNextStep}
                className="w-full p-4 bg-electric-indigo text-white rounded-2xl font-bold shadow-lg shadow-electric-indigo/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Tanha, what do you do every day? 🗓️</h2>
              <p className="text-gray-500 dark:text-gray-400">Add your daily habits and I'll remind you every day 💕</p>
            </div>
            
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {anchors.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{a.emoji}</span>
                      <div>
                        <div className="font-bold">{a.name}</div>
                        {a.time && <div className="text-xs text-gray-500">{a.time}</div>}
                      </div>
                    </div>
                    <button onClick={() => { playSound(SOUNDS.CLICK, soundEnabled); setAnchors(anchors.filter(x => x.id !== a.id)); }} className="text-red-400 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {anchors.length === 0 && !isAdding && (
                <div className="text-center py-8 text-gray-400 italic">
                  No habits added yet...
                </div>
              )}
            </div>

            {isAdding ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-navy-800 border-2 border-electric-indigo space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { playSound(SOUNDS.CLICK, soundEnabled); setShowEmojiPicker(!showEmojiPicker); }}
                    className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-navy-900 flex items-center justify-center text-3xl hover:bg-gray-200 transition-all"
                  >
                    {newTask.emoji}
                  </button>
                  <div className="flex-1 space-y-2">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Task name (e.g. Gym)"
                      className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none p-1 font-bold"
                      value={newTask.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                    <input 
                      type="time" 
                      className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none p-1 text-xs text-gray-500"
                      value={newTask.time}
                      onChange={(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                {showEmojiPicker && (
                  <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-navy-900 rounded-xl max-h-32 overflow-y-auto">
                    {EMOJI_OPTIONS.map(e => (
                      <button 
                        key={e} 
                        onClick={() => { playSound(SOUNDS.CLICK, soundEnabled); setNewTask(prev => ({ ...prev, emoji: e })); setShowEmojiPicker(false); }}
                        className="p-2 text-xl hover:bg-white dark:hover:bg-navy-800 rounded-lg transition-all"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => { playSound(SOUNDS.CLICK, soundEnabled); setIsAdding(false); }} className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-navy-900 font-bold">Cancel</button>
                  <button onClick={saveNewAnchor} className="flex-1 p-3 rounded-xl bg-electric-indigo text-white font-bold">Add</button>
                </div>
              </motion.div>
            ) : (
              <button 
                onClick={() => { playSound(SOUNDS.CLICK, soundEnabled); setIsAdding(true); }}
                className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-electric-indigo hover:text-electric-indigo transition-all"
              >
                <Plus className="w-5 h-5" /> Add Anchor Task
              </button>
            )}

            <button 
              onClick={handleFinish}
              className="w-full p-4 bg-electric-indigo text-white rounded-2xl font-bold shadow-lg shadow-electric-indigo/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Let's go, Tanha! 💖 <Check className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const WelcomePopup = ({ onDismiss, soundEnabled }: { onDismiss: () => void, soundEnabled: boolean }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-navy-800 rounded-[40px] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative overflow-hidden"
      >
        {/* Floating Hearts */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 200, opacity: 0, x: Math.random() * 300 - 150 }}
              animate={{ 
                y: -300, 
                opacity: [0, 1, 0],
                x: (Math.random() * 300 - 150)
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity,
                delay: i * 0.5
              }}
              className="absolute bottom-0 text-pink-400/40"
            >
              <Heart className="w-10 h-10 fill-current" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 space-y-6">
          <div className="text-6xl">🥺💌</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold dark:text-white leading-tight">
              Your app is ready, Tanha!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Someone who loves you very much made this just for you 🥺💌
              <br />
              <span className="font-bold text-pink-500">Now go be the amazing person you already are 💖</span>
            </p>
          </div>

          <button 
            onClick={() => { playSound(SOUNDS.CLICK, soundEnabled); onDismiss(); }}
            className="w-full p-5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-2xl font-bold shadow-xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Aww, thank you! 🥰
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AddTaskModal = ({ 
  onClose, 
  onAdd,
  existingTasks 
}: { 
  onClose: () => void, 
  onAdd: (name: string, emoji: string, time?: string) => void,
  existingTasks: Task[]
}) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    setEmoji(getEmojiFromName(val));
    setError('');
  };

  const handleConfirm = () => {
    if (!name.trim()) {
      setError("Give it a name first! 🌸");
      return;
    }
    if (existingTasks.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("You already have this one! 💕");
      return;
    }
    onAdd(name.trim(), emoji, time || undefined);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-6">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-navy-800 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl space-y-6 border-t-4 border-soft-pink/20"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white handwriting">New Task 🌸</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-soft-pink uppercase tracking-widest ml-1">What's the plan, Tanha? ✨</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 rounded-[24px] bg-gray-50 dark:bg-navy-900 flex items-center justify-center text-3xl hover:scale-105 transition-all shrink-0 shadow-sm border border-soft-pink/5"
              >
                {emoji}
              </button>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Drink water 💧"
                className={cn(
                  "flex-1 p-5 rounded-[24px] bg-gray-50 dark:bg-navy-900 outline-none border-2 transition-all font-bold dark:text-white text-lg",
                  error ? "border-red-400" : "border-transparent focus:border-soft-pink shadow-inner"
                )}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm font-medium ml-2">{error}</p>}
          </div>

          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-6 gap-2 p-4 bg-gray-50 dark:bg-navy-900 rounded-[32px] max-h-48 overflow-y-auto custom-scrollbar border border-soft-pink/5"
            >
              {EMOJI_OPTIONS.map(e => (
                <button 
                  key={e} 
                  onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  className="p-3 text-2xl hover:bg-white dark:hover:bg-navy-800 rounded-2xl transition-all hover:scale-110"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Reminder Time ⏰</label>
            <div className="flex items-center gap-3 p-5 rounded-[24px] bg-gray-50 dark:bg-navy-900 border border-transparent focus-within:border-soft-pink transition-all">
              <Clock className="w-5 h-5 text-soft-pink" />
              <input 
                type="time" 
                className="bg-transparent outline-none flex-1 dark:text-white font-bold"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={handleConfirm}
            className="w-full p-5 bg-gradient-to-r from-soft-pink to-rose-400 text-white rounded-[24px] font-black shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
          >
            Add Task 💖
          </button>
          <button 
            onClick={onClose}
            className="w-full p-4 text-gray-400 dark:text-gray-500 font-bold hover:text-soft-pink transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AppTour = ({ onComplete, soundEnabled }: { onComplete: () => void, soundEnabled: boolean }) => {
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const steps = [
    {
      id: 'tour-greeting',
      message: "This is your little corner of the world, Tanha 🌸 Every day starts here, just for you — made with all my love 💖"
    },
    {
      id: 'tour-progress',
      message: "This ring fills up as you finish your tasks! Watch it grow, lokki amar — every tick makes me prouder 🥰"
    },
    {
      id: 'tour-anchors',
      message: "These are your everyday habits, Tanha 🔒 They show up automatically every single morning so you never have to think about adding them 💕"
    },
    {
      id: 'tour-today',
      message: "And this is where YOUR day lives ✨ Anything extra you want to get done today goes right here, just for today 🌼"
    },
    {
      id: 'tour-add-task',
      message: "Tap this whenever something new pops into your head! 🌸 Your to-do, your rules, your day — I just wanted to make it easier for you, amar lokki 💖"
    },
    {
      id: 'tour-checkbox',
      message: "Tick this when you're done with something 💪 And brace yourself... something special happens when you do 😏🎉"
    },
    {
      id: 'tour-streak',
      message: "This is your streak, Tanha 🔥 Every day you complete all your anchor tasks, this number goes up! How high can you go? (I already know you'll go very very high 😍)"
    },
    {
      id: 'tour-settings',
      message: "And over here you can change anything you want 🛠️ Add new daily habits, update your tasks, make this app truly yours — because it IS yours, forever 💌 Okay Tanha, you're all set! Go be amazing 🌟"
    }
  ];

  useEffect(() => {
    const updateCoords = () => {
      const element = document.getElementById(steps[step].id);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [step]);

  const handleNext = () => {
    playSound(SOUNDS.CLICK, soundEnabled);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    playSound(SOUNDS.CLICK, soundEnabled);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Dim Overlay with Spotlight Cutout */}
      <div className="absolute inset-0 bg-black/70 transition-all duration-500" style={{
        clipPath: `polygon(
          0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
          ${coords.left - 8}px ${coords.top - 8}px,
          ${coords.left + coords.width + 8}px ${coords.top - 8}px,
          ${coords.left + coords.width + 8}px ${coords.top + coords.height + 8}px,
          ${coords.left - 8}px ${coords.top + coords.height + 8}px,
          ${coords.left - 8}px ${coords.top - 8}px
        )`
      }} />

      <button 
        onClick={handleSkip}
        className="absolute top-8 right-8 text-white/60 hover:text-white font-bold text-sm transition-all z-[210]"
      >
        Skip tour
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="absolute z-[210] w-[90%] max-w-xs"
          style={{
            top: coords.top + coords.height + 24 > window.innerHeight - 200 
              ? coords.top - 200 
              : coords.top + coords.height + 24,
            left: Math.max(20, Math.min(window.innerWidth - 340, coords.left - 40))
          }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4 relative">
            {/* Arrow pointing to element */}
            <div className={cn(
              "absolute w-4 h-4 bg-white rotate-45 left-1/2 -translate-x-1/2",
              coords.top + coords.height + 24 > window.innerHeight - 200 ? "-bottom-2" : "-top-2"
            )} />
            
            <p className="text-gray-800 text-lg leading-relaxed handwriting font-bold">
              {steps[step].message}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-gray-400">
                {step + 1} / {steps.length}
              </span>
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-electric-indigo text-white rounded-full font-bold text-sm shadow-lg shadow-electric-indigo/20 hover:scale-105 active:scale-95 transition-all"
              >
                {step === steps.length - 1 ? "Finish! 🌟" : "Next 💕"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PeriodTrackerReveal = ({ onShowMe, onSkip }: { onShowMe: () => void, onSkip: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#0a0502] flex items-center justify-center overflow-hidden"
    >
      {/* Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-soft-pink/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: Math.random() * 1000, 
              x: Math.random() * 1000, 
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -500],
              opacity: [0, 0.4, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute text-rose-200/20"
          >
            {i % 3 === 0 ? <Heart className="w-6 h-6 fill-current" /> : i % 3 === 1 ? "🌸" : "✨"}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="mb-12"
        >
          <span className="text-xs font-black tracking-[0.3em] text-rose-400 uppercase mb-4 block">A Special Addition</span>
          <h1 className="text-6xl md:text-8xl font-display text-white leading-none tracking-tighter uppercase italic">
            For My <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-soft-pink">Lokki Bou</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative"
        >
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg rotate-[-12deg]">
            <Heart className="w-6 h-6 fill-current" />
          </div>

          <p className="text-lg md:text-xl text-rose-100/80 font-serif italic leading-relaxed mb-8">
            "You asked me for a period tracker... so I built one. Inside your app. Just for you. Because you deserve everything, amar lokki 💖"
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={onShowMe}
              className="group relative px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Enter My Cycle 🌸</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-rose-200 to-soft-pink opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            
            <button 
              onClick={onSkip}
              className="text-white/40 hover:text-white/60 text-xs font-bold tracking-widest uppercase transition-all"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const PeriodTrackerTour = ({ onComplete, soundEnabled }: { onComplete: () => void, soundEnabled: boolean }) => {
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const steps = [
    {
      id: 'tour-cycle-wheel',
      message: "This is your Cycle Wheel 🌸 It shows exactly where you are in your month — Menstrual, Follicular, Ovulation, or Luteal. It's like a compass for your body ✨"
    },
    {
      id: 'tour-log-button',
      message: "Every day you can log how you're feeling here 🥺 Your flow, your mood, your symptoms — the more you log, the smarter your predictions become 💪"
    },
    {
      id: 'tour-calendar',
      message: "Your whole cycle history lives here 📅 Color coded, beautiful, and completely private — only you can see this 💌"
    },
    {
      id: 'tour-phase-guide',
      message: "I added a full guide to every phase ✨ What to eat, how to feel, what to expect — because you deserve to understand your own body completely 💕"
    },
    {
      id: 'tour-partner-notes',
      message: "And my favorite part 🥺 I wrote you a little note for every phase — because no matter where you are in your month, I want you to know exactly how I feel about you 💖"
    },
    {
      id: 'tour-final',
      message: "That's your Health Space, Tanha 🌸\n\nI built this because I want you to feel supported, understood, and cared for — even when I'm not right next to you.\n\nYou are so loved. 🥺💖"
    }
  ];

  useEffect(() => {
    const updateCoords = () => {
      if (step === steps.length - 1) {
        setCoords({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160, width: 320, height: 200 });
        return;
      }

      const element = document.getElementById(steps[step].id);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback or skip
        if (steps[step].id === 'tour-mood-chips') {
          const logBtn = document.getElementById('tour-log-button');
          if (logBtn) {
            const rect = logBtn.getBoundingClientRect();
            setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
          }
        }
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [step]);

  const handleNext = () => {
    playSound(SOUNDS.CLICK, soundEnabled);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    playSound(SOUNDS.CLICK, soundEnabled);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Dim Overlay with Spotlight Cutout */}
      <div className="absolute inset-0 bg-black/70 transition-all duration-500" style={{
        clipPath: step === steps.length - 1 ? 'none' : `polygon(
          0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
          ${coords.left - 8}px ${coords.top - 8}px,
          ${coords.left + coords.width + 8}px ${coords.top - 8}px,
          ${coords.left + coords.width + 8}px ${coords.top + coords.height + 8}px,
          ${coords.left - 8}px ${coords.top + coords.height + 8}px,
          ${coords.left - 8}px ${coords.top - 8}px
        )`
      }} />

      <button 
        onClick={handleSkip}
        className="absolute top-8 right-8 text-white/60 hover:text-white font-bold text-sm transition-all z-[210]"
      >
        Skip tour 🌸
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="absolute z-[210] w-[90%] max-w-xs"
          style={{
            top: step === steps.length - 1 
              ? window.innerHeight / 2 - 100 
              : (coords.top + coords.height + 24 > window.innerHeight - 200 
                ? coords.top - 200 
                : coords.top + coords.height + 24),
            left: step === steps.length - 1
              ? window.innerWidth / 2 - 160
              : Math.max(20, Math.min(window.innerWidth - 340, coords.left - 40))
          }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4 relative">
            {step !== steps.length - 1 && (
              <div className={cn(
                "absolute w-4 h-4 bg-white rotate-45 left-1/2 -translate-x-1/2",
                coords.top + coords.height + 24 > window.innerHeight - 200 ? "-bottom-2" : "-top-2"
              )} />
            )}
            
            <p className="text-gray-800 text-lg leading-relaxed handwriting font-bold whitespace-pre-line">
              {steps[step].message}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-gray-400">
                {step + 1} / {steps.length}
              </span>
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-soft-pink text-white rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                {step === steps.length - 1 ? "Thank you 🥺💖" : "Next 💕"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const FocusMode = ({ task, onExit }: { task: Task, onExit: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-navy-900 text-white flex flex-col items-center justify-center p-8"
    >
      <button onClick={onExit} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all">
        <X className="w-8 h-8" />
      </button>

      <div className="text-center space-y-12 max-w-md w-full">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium">
            {mode === 'work' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
            {mode === 'work' ? 'Focusing on' : 'Break Time'}
          </div>
          <h2 className="text-4xl font-bold serif italic">{task.name}</h2>
        </div>

        <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="144" cy="144" r="130" 
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" 
            />
            <motion.circle 
              cx="144" cy="144" r="130" 
              fill="none" stroke="#5C6BC0" strokeWidth="8" 
              strokeDasharray="816"
              animate={{ strokeDashoffset: 816 - (816 * (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60))) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="text-7xl font-light tracking-tighter font-mono">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-20 h-20 rounded-full bg-electric-indigo flex items-center justify-center shadow-2xl shadow-electric-indigo/40 hover:scale-105 active:scale-95 transition-all"
          >
            {isActive ? <X className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button 
            onClick={() => setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60)}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Timer className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ReflectionModal = ({ 
  userName, 
  onSave 
}: { 
  userName: string, 
  onSave: (rating: number) => void 
}) => {
  const [rating, setRating] = useState(0);
  
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-navy-800 rounded-[40px] p-8 max-w-sm w-full text-center space-y-8 shadow-2xl border-4 border-soft-pink/20"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold dark:text-white handwriting">Daily Reflection</h2>
          <p className="text-gray-500 dark:text-gray-400">How was your day, {userName}? 🌸</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button 
              key={r}
              onClick={() => setRating(r)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all",
                rating >= r ? "bg-soft-pink text-white scale-110 shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-400"
              )}
            >
              <Star className={cn("w-6 h-6", rating >= r && "fill-current")} />
            </button>
          ))}
        </div>

        <button 
          onClick={() => rating > 0 && onSave(rating)}
          className="w-full p-4 bg-gradient-to-r from-soft-pink to-rose-400 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20"
        >
          Save Reflection 💖
        </button>
      </motion.div>
    </div>
  );
};

const WishBoxModal = ({ 
  onClose, 
  soundEnabled 
}: { 
  onClose: () => void, 
  soundEnabled: boolean 
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Say something first, Tanha 🌸");
      return;
    }

    setIsSending(true);
    playSound(SOUNDS.POP, soundEnabled);

    // Silently construct the message
    const encodedMessage = encodeURIComponent(
      `💌 Tanha's Message:\n\n${message.trim()}\n\n— Sent from her app 🌸`
    );
    const whatsappUrl = `https://wa.me/8801306477559?text=${encodedMessage}`;

    // Show success screen immediately
    setIsSent(true);

    // Trigger redirection after 1.5s
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1500);

    // Auto close after 2.5s
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-6">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-navy-800 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl space-y-6 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold dark:text-white handwriting">What's on your mind, Tanha? 🌸</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">A problem? A wish? Anything at all — just say it 💕</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                <textarea 
                  autoFocus
                  placeholder="Type anything here... I'm listening 🥺"
                  className={cn(
                    "w-full h-40 p-6 rounded-[32px] bg-gray-50 dark:bg-navy-900 outline-none border-2 transition-all resize-none dark:text-white text-lg leading-relaxed",
                    error ? "border-red-400" : "border-transparent focus:border-soft-pink"
                  )}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setError(''); }}
                />
                {error && <p className="text-red-400 text-sm font-medium ml-2">{error}</p>}
              </div>

              <button 
                onClick={handleSend}
                disabled={isSending}
                className="w-full p-5 bg-gradient-to-r from-soft-pink to-rose-400 text-white rounded-2xl font-bold shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSending ? "Sending... 💌" : "Send 💌"}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              {/* Floating Hearts Animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 200, opacity: 0, x: Math.random() * 300 - 150 }}
                    animate={{ 
                      y: -400, 
                      opacity: [0, 1, 0],
                      x: (Math.random() * 300 - 150)
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute bottom-0 text-pink-400/40"
                  >
                    <Heart className="w-8 h-8 fill-current" />
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 space-y-4">
                <div className="text-6xl">💖🌸🥺</div>
                <h2 className="text-3xl font-bold dark:text-white handwriting">Sent! 💖</h2>
                <div className="space-y-2">
                  <p className="text-lg text-gray-600 dark:text-gray-300">Your message is on its way 🌸</p>
                  <p className="text-sm font-medium text-pink-500 italic">Someone who loves you is listening, always 🥺</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --- Period Tracker Components ---

const CycleWheel = ({ day, phase }: { day: number, phase: CyclePhase }) => {
  const currentPhase = CYCLE_PHASES[phase];
  
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Background Track */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="12" />
        
        {/* Phase Segments */}
        {/* Menstrual: 1-5 (5 days) */}
        <circle 
          cx="128" cy="128" r="110" fill="none" stroke={CYCLE_PHASES.menstrual.color} strokeWidth="12" 
          strokeDasharray="691" strokeDashoffset={691 - (691 * (5 / 28))} 
          className="opacity-20"
        />
        {/* Follicular: 6-13 (8 days) */}
        <circle 
          cx="128" cy="128" r="110" fill="none" stroke={CYCLE_PHASES.follicular.color} strokeWidth="12" 
          strokeDasharray="691" strokeDashoffset={691 - (691 * (8 / 28))} 
          transform="rotate(64.28 128 128)"
          className="opacity-20"
        />
        {/* Ovulation: 14-16 (3 days) */}
        <circle 
          cx="128" cy="128" r="110" fill="none" stroke={CYCLE_PHASES.ovulation.color} strokeWidth="12" 
          strokeDasharray="691" strokeDashoffset={691 - (691 * (3 / 28))} 
          transform="rotate(167.14 128 128)"
          className="opacity-20"
        />
        {/* Luteal: 17-28 (12 days) */}
        <circle 
          cx="128" cy="128" r="110" fill="none" stroke={CYCLE_PHASES.luteal.color} strokeWidth="12" 
          strokeDasharray="691" strokeDashoffset={691 - (691 * (12 / 28))} 
          transform="rotate(205.71 128 128)"
          className="opacity-20"
        />

        {/* Current Day Indicator */}
        <motion.circle 
          cx="128" cy="128" r="110" fill="none" stroke={currentPhase.color} strokeWidth="12" 
          strokeDasharray="691" strokeDashoffset={691 - (691 * (1 / 28))}
          animate={{ rotate: (day - 1) * (360 / 28) }}
          transition={{ type: "spring", damping: 20 }}
          className="drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]"
        />
      </svg>

      <div className="text-center space-y-1 relative z-10">
        <motion.div 
          key={phase}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl mb-2"
        >
          {currentPhase.emoji}
        </motion.div>
        <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Day {day}</div>
        <div className="text-xl font-bold text-gray-800" style={{ color: currentPhase.color }}>
          {currentPhase.name}
        </div>
      </div>
    </div>
  );
};

const LogSheet = ({ 
  onClose, 
  onSave,
  initialData,
  selectedDate = new Date()
}: { 
  onClose: () => void, 
  onSave: (log: CycleLog) => void,
  initialData?: CycleLog,
  selectedDate?: Date
}) => {
  const [flow, setFlow] = useState<CycleLog['flow']>(initialData?.flow || 'none');
  const [moods, setMoods] = useState<string[]>(initialData?.moods || []);
  const [symptoms, setSymptoms] = useState<string[]>(initialData?.symptoms || []);
  const [medication, setMedication] = useState(initialData?.medication || false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [water, setWater] = useState(initialData?.waterIntake || 1.5);
  const [selfCare, setSelfCare] = useState<string[]>(initialData?.selfCare || []);

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    onSave({
      date: format(selectedDate, 'yyyy-MM-dd'),
      flow,
      moods,
      symptoms,
      medication,
      notes,
      waterIntake: water,
      selfCare
    });
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/40 backdrop-blur-sm flex items-end justify-center p-0 sm:p-6">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-navy-800 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar relative"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold dark:text-white handwriting">Log for {format(selectedDate, 'MMM do')} 🌸</h2>
            <p className="text-xs text-gray-400 font-medium">How are you feeling, Tanha? 💕</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Flow */}
        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">🩸 Flow Intensity</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(['none', 'spotting', 'light', 'medium', 'heavy', 'very_heavy'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFlow(f)}
                className={cn(
                  "p-3 rounded-2xl text-[10px] font-bold transition-all border-2",
                  flow === f 
                    ? "bg-soft-pink border-soft-pink text-white shadow-lg" 
                    : "bg-gray-50 dark:bg-navy-900 border-transparent text-gray-400"
                )}
              >
                <Droplets className={cn("w-5 h-5 mx-auto mb-1", flow === f ? "text-white" : "text-gray-300")} />
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Moods */}
        <div className="space-y-4" id="tour-mood-chips">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">😊 Mood Tracker</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => (
              <button 
                key={m.label}
                onClick={() => toggleItem(moods, setMoods, m.label)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all border-2",
                  moods.includes(m.label)
                    ? "bg-soft-pink/10 border-soft-pink text-soft-pink"
                    : "bg-gray-50 dark:bg-navy-900 border-transparent text-gray-500"
                )}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">🌡️ Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map(s => (
              <button 
                key={s}
                onClick={() => toggleItem(symptoms, setSymptoms, s)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all border-2",
                  symptoms.includes(s)
                    ? "bg-soft-pink/10 border-soft-pink text-soft-pink"
                    : "bg-gray-50 dark:bg-navy-900 border-transparent text-gray-500"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Medication & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">💊 Medication</label>
            <button 
              onClick={() => setMedication(!medication)}
              className={cn(
                "w-full p-4 rounded-2xl font-bold flex items-center justify-between transition-all border-2",
                medication ? "bg-soft-pink border-soft-pink text-white" : "bg-gray-50 dark:bg-navy-900 border-transparent text-gray-400"
              )}
            >
              <span>Pain relief today?</span>
              {medication ? "Yes 💖" : "No"}
            </button>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">💧 Water Intake</label>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 space-y-2">
              <div className="flex justify-between text-xs font-bold text-soft-pink">
                <span>{water} Liters</span>
                <span>3L+</span>
              </div>
              <input 
                type="range" min="0" max="3" step="0.5"
                className="w-full accent-soft-pink"
                value={water}
                onChange={(e) => setWater(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">✨ Self Care</label>
          <div className="flex flex-wrap gap-2">
            {SELF_CARE.map(sc => (
              <button 
                key={sc.label}
                onClick={() => toggleItem(selfCare, setSelfCare, sc.label)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all border-2",
                  selfCare.includes(sc.label)
                    ? "bg-soft-pink/10 border-soft-pink text-soft-pink"
                    : "bg-gray-50 dark:bg-navy-900 border-transparent text-gray-500"
                )}
              >
                {sc.emoji} {sc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">🌸 Anything else, Tanha?</label>
          <textarea 
            placeholder="How are you feeling today? Tell me everything..."
            className="w-full h-32 p-6 rounded-[32px] bg-gray-50 dark:bg-navy-900 outline-none border-2 border-transparent focus:border-soft-pink transition-all resize-none dark:text-white"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full p-5 bg-gradient-to-r from-soft-pink to-rose-400 text-white rounded-2xl font-bold shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Logged 💕
        </button>
      </motion.div>
    </div>
  );
};

const CalendarView = ({ 
  logs, 
  settings, 
  onSelectDate 
}: { 
  logs: CycleLog[], 
  settings: CycleSettings,
  onSelectDate: (date: Date) => void
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayType = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    
    // Check if it's a logged period day
    if (log && log.flow && log.flow !== 'none') return 'period';
    
    // Predictions
    const lastStart = parseISO(settings.lastPeriodStart);
    const diff = differenceInDays(date, lastStart);
    const cycleDay = ((diff % settings.cycleLength) + settings.cycleLength) % settings.cycleLength + 1;
    
    if (cycleDay >= 1 && cycleDay <= settings.periodDuration) return 'predicted';
    if (cycleDay === 14) return 'ovulation';
    if (cycleDay >= 12 && cycleDay <= 16) return 'fertile';
    if (cycleDay >= 24 && cycleDay <= 28) return 'pms';
    
    return 'regular';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold handwriting">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-gray-400 py-2">{d}</div>
        ))}
        {days.map(day => {
          const type = getDayType(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          
          return (
            <button 
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                !isCurrentMonth && "opacity-20",
                isTodayDate && "ring-2 ring-soft-pink ring-offset-2 dark:ring-offset-navy-900"
              )}
            >
              <span className={cn("text-sm font-bold", isTodayDate ? "text-soft-pink" : "text-gray-600 dark:text-gray-300")}>
                {format(day, 'd')}
              </span>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-1",
                type === 'period' && "bg-rose-600",
                type === 'predicted' && "bg-rose-300",
                type === 'ovulation' && "bg-yellow-400",
                type === 'fertile' && "bg-green-400",
                type === 'pms' && "bg-purple-400",
                type === 'regular' && "bg-transparent"
              )} />
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest justify-center">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-600" /> Logged</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-300" /> Predicted</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Ovulation</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400" /> Fertile</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-400" /> PMS</div>
      </div>
    </div>
  );
};

const StartTrackingSheet = ({ 
  onClose, 
  onConfirm 
}: { 
  onClose: () => void, 
  onConfirm: (settings: CycleSettings) => void 
}) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);

  const handleConfirm = () => {
    if (!date) return;
    onConfirm({
      lastPeriodStart: date,
      cycleLength,
      periodDuration,
      remindersEnabled: {
        periodDue: true,
        dailyLog: true,
        fertileWindow: true
      }
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-navy-800 w-full max-w-md rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-navy-900">
          <motion.div 
            initial={{ width: "33.33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-rose-500"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">Step 01</span>
                  <h2 className="text-3xl font-bold dark:text-white handwriting">When did it start? 🌸</h2>
                  <p className="text-gray-500 text-sm">Tell me the first day of your last period 💕</p>
                </div>

                <div className="relative group">
                  <input 
                    type="date" 
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full p-6 rounded-[28px] bg-gray-50 dark:bg-navy-900 border-2 border-transparent focus:border-rose-400 outline-none font-bold dark:text-white text-xl transition-all text-center"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-rose-400 pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">Step 02</span>
                  <h2 className="text-3xl font-bold dark:text-white handwriting">Your Rhythm 🗓️</h2>
                  <p className="text-gray-500 text-sm">How many days are usually between your periods?</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <span className="text-6xl font-black text-rose-500">{cycleLength}</span>
                    <span className="text-xl font-bold text-gray-400 mt-auto mb-2 ml-2">days</span>
                  </div>
                  
                  <input 
                    type="range" min="21" max="35" 
                    className="w-full h-3 bg-gray-100 dark:bg-navy-900 rounded-full appearance-none cursor-pointer accent-rose-500"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">
                    <span>Short (21)</span>
                    <span>Average (28)</span>
                    <span>Long (35)</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">Step 03</span>
                  <h2 className="text-3xl font-bold dark:text-white handwriting">The Duration 🩸</h2>
                  <p className="text-gray-500 text-sm">How many days does your period typically last?</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[3, 4, 5, 6, 7, 8].map(d => (
                    <button
                      key={d}
                      onClick={() => setPeriodDuration(d)}
                      className={cn(
                        "h-16 rounded-2xl font-black text-xl transition-all border-2",
                        periodDuration === d 
                          ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20 scale-105" 
                          : "bg-gray-50 dark:bg-navy-900 border-transparent text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select number of days</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 pt-10">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="flex-1 p-5 bg-gray-100 dark:bg-navy-900 text-gray-500 rounded-[24px] font-bold transition-all hover:bg-gray-200"
            >
              Back
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="flex-1 p-5 text-gray-400 font-bold hover:text-rose-500 transition-all"
            >
              Cancel
            </button>
          )}

          <button 
            onClick={step === 3 ? handleConfirm : nextStep}
            className="flex-[2] p-5 bg-rose-500 text-white rounded-[24px] font-black shadow-xl shadow-rose-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {step === 3 ? "Complete 💕" : "Next Step"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PeriodTracker = ({ 
  data, 
  onUpdate,
  onInitialize,
  setSnackbar
}: { 
  data: PeriodTrackerData, 
  onUpdate: (data: PeriodTrackerData) => void,
  onInitialize?: () => void,
  setSnackbar: (msg: string | null) => void
}) => {
  const [showLog, setShowLog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showStartTracking, setShowStartTracking] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<CyclePhase | null>(null);

  const cycleDay = useMemo(() => {
    const lastStart = parseISO(data.settings.lastPeriodStart);
    const diff = differenceInDays(new Date(), lastStart);
    return ((diff % data.settings.cycleLength) + data.settings.cycleLength) % data.settings.cycleLength + 1;
  }, [data.settings]);

  const currentPhase: CyclePhase = useMemo(() => {
    if (cycleDay >= 1 && cycleDay <= 5) return 'menstrual';
    if (cycleDay >= 6 && cycleDay <= 13) return 'follicular';
    if (cycleDay >= 14 && cycleDay <= 16) return 'ovulation';
    return 'luteal';
  }, [cycleDay]);

  const statusInfo = useMemo(() => {
    if (currentPhase === 'menstrual') return { text: "Period is here 🩸", color: "text-rose-600" };
    if (currentPhase === 'ovulation') return { text: "You're likely ovulating today ✨", color: "text-yellow-500" };
    if (cycleDay >= 12 && cycleDay <= 16) return { text: `Fertile window: next ${16 - cycleDay + 1} days 🌱`, color: "text-green-500" };
    if (cycleDay >= 24) return { text: "PMS zone — be gentle with yourself 🌙", color: "text-purple-500" };
    
    const daysToPeriod = data.settings.cycleLength - cycleDay + 1;
    return { text: `Period expected in ${daysToPeriod} days 🔴`, color: "text-rose-400" };
  }, [currentPhase, cycleDay, data.settings.cycleLength]);

  const handleSaveLog = (log: CycleLog) => {
    const newLogs = [...data.logs.filter(l => l.date !== log.date), log];
    onUpdate({ ...data, logs: newLogs });
    setShowLog(false);
  };

  const handleStartTracking = (settings: CycleSettings) => {
    onUpdate({ ...data, settings });
    setShowStartTracking(false);
    if (onInitialize) onInitialize();
  };

  if (!data.settings.lastPeriodStart) {
    return (
      <div className="min-h-[80vh] flex flex-col">
        {/* Editorial Header */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden rounded-[40px] bg-[#FFF0F3] dark:bg-navy-900/50 mb-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-200/30 blur-[80px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-soft-pink/20 blur-[80px]" />
          </div>
          
          <div className="relative z-10 text-center space-y-4 px-6">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase block"
            >
              Welcome to your space
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-display text-gray-900 dark:text-white uppercase leading-none"
            >
              Tanha's <br />
              <span className="italic font-serif text-rose-500">Health Space</span>
            </motion.h1>
          </div>
        </section>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mb-12">
          {[
            { 
              title: "Smart Predictions", 
              desc: "Know exactly when your period is coming with AI-powered tracking.",
              icon: "🗓️",
              color: "bg-rose-50 dark:bg-rose-900/10"
            },
            { 
              title: "Mood & Symptoms", 
              desc: "Understand your body's patterns and how they affect your day.",
              icon: "✨",
              color: "bg-soft-pink/10 dark:bg-soft-pink/5"
            },
            { 
              title: "Partner Notes", 
              desc: "Special messages from your husband tailored to your cycle phase.",
              icon: "💌",
              color: "bg-purple-50 dark:bg-purple-900/10"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className={cn("p-8 rounded-[32px] space-y-4", feature.color)}
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="text-xl font-bold dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-8 max-w-md"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold dark:text-white handwriting">Ready to begin? 🌸</h2>
              <p className="text-gray-500">It only takes a minute to set up your personalized cycle tracker.</p>
            </div>
            
            <button 
              onClick={() => setShowStartTracking(true)}
              className="group relative w-full p-6 bg-rose-500 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-rose-500/30 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10">Start Tracking 🌸</span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-soft-pink opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showStartTracking && (
            <StartTrackingSheet 
              onClose={() => setShowStartTracking(false)}
              onConfirm={handleStartTracking}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-32" id="tour-final">
      {/* Hero Wheel */}
      <section className="pt-8" id="tour-cycle-wheel">
        <CycleWheel day={cycleDay} phase={currentPhase} />
      </section>

      {/* Status Card */}
      <section className="px-6" id="tour-status-card">
        <div className="p-6 rounded-[32px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center", statusInfo.color)}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</div>
              <div className={cn("text-lg font-bold", statusInfo.color)}>{statusInfo.text}</div>
            </div>
          </div>
          <button 
            id="tour-log-button"
            onClick={() => {
              setSelectedDate(new Date());
              setShowLog(true);
            }}
            className="p-4 bg-soft-pink text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Log Today 🌸
          </button>
        </div>
      </section>

      {/* Predictions */}
      <section className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4" id="tour-predictions">
        <div className="p-6 rounded-[32px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-2">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Next Period 🗓️</div>
          <div className="text-lg font-bold dark:text-white">
            {format(addDays(parseISO(data.settings.lastPeriodStart), data.settings.cycleLength), 'MMM do')}
          </div>
          <div className="text-sm text-soft-pink font-medium">
            {data.settings.cycleLength - cycleDay + 1} days away
          </div>
        </div>
        <div className="p-6 rounded-[32px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-2">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Fertile Window 🌱</div>
          <div className="text-lg font-bold dark:text-white">
            {format(addDays(parseISO(data.settings.lastPeriodStart), 11), 'MMM d')} - {format(addDays(parseISO(data.settings.lastPeriodStart), 15), 'MMM d')}
          </div>
          <div className="text-sm text-green-500 font-medium">Ovulation likely: {format(addDays(parseISO(data.settings.lastPeriodStart), 13), 'MMM do')} ✨</div>
        </div>
      </section>

      {/* Partner Notes */}
      <section className="px-6" id="tour-partner-notes">
        <div className="p-8 rounded-[40px] bg-gradient-to-br from-soft-pink/5 to-rose-400/5 border-2 border-soft-pink/10 space-y-4 relative overflow-hidden">
          <div className="absolute top-4 right-6 text-soft-pink/20">
            <Heart className="w-12 h-12 fill-current" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-soft-pink uppercase tracking-[0.2em]">
            <Heart className="w-3 h-3 fill-current" />
            From him 💌
          </div>
          <p className="text-xl font-serif italic text-gray-800 dark:text-gray-100 leading-relaxed handwriting">
            {PARTNER_NOTES[currentPhase]}
          </p>
        </div>
      </section>

      {/* Calendar */}
      <section className="px-6" id="tour-calendar">
        <div className="p-8 rounded-[40px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <CalendarView 
            logs={data.logs} 
            settings={data.settings} 
            onSelectDate={(d) => {
              setSelectedDate(d);
              setShowLog(true);
            }} 
          />
        </div>
      </section>

      {/* Phase Guide */}
      <section className="px-6 space-y-4" id="tour-phase-guide">
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          <Info className="w-5 h-5 text-soft-pink" />
          Know Your Cycle, Tanha 💕
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar snap-x">
          {(Object.entries(CYCLE_PHASES) as [CyclePhase, any][]).map(([key, phase]) => (
            <motion.div 
              key={key}
              layout
              onClick={() => setExpandedPhase(expandedPhase === key ? null : key)}
              className={cn(
                "min-w-[280px] p-6 rounded-[32px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4 snap-center cursor-pointer transition-all",
                expandedPhase === key && "ring-2 ring-soft-pink/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${phase.color}20`, color: phase.color }}>
                    {phase.emoji}
                  </div>
                  <div className="font-bold text-lg" style={{ color: phase.color }}>{phase.name}</div>
                </div>
                <motion.div
                  animate={{ rotate: expandedPhase === key ? 180 : 0 }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </motion.div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{phase.description}</p>
              
              <AnimatePresence>
                {expandedPhase === key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 pt-4 border-t border-gray-50 dark:border-navy-900"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Energy ⚡</div>
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{phase.energy}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mood 🎭</div>
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{phase.mood}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Eat 🥗</div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">{phase.foods}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Settings Trigger for Tour */}
      <section className="px-6 pb-10">
        <button 
          id="tour-cycle-settings"
          onClick={() => setShowSettings(true)}
          className="w-full p-6 rounded-[32px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center justify-between group hover:border-soft-pink/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center text-soft-pink group-hover:bg-soft-pink group-hover:text-white transition-all">
              <Settings className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Preferences</div>
              <div className="text-lg font-bold dark:text-white">Cycle Settings 🌸</div>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-soft-pink transition-all" />
        </button>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showLog && (
          <LogSheet 
            onClose={() => setShowLog(false)} 
            onSave={handleSaveLog}
            selectedDate={selectedDate}
            initialData={data.logs.find(l => l.date === format(selectedDate, 'yyyy-MM-dd'))}
          />
        )}
        {showSettings && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-navy-800 rounded-[40px] p-8 max-w-md w-full space-y-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold dark:text-white handwriting">Cycle Settings 🌸</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Period Start Date</label>
                  <input 
                    type="date" 
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border-2 border-transparent focus:border-soft-pink outline-none font-bold dark:text-white"
                    value={data.settings.lastPeriodStart}
                    onChange={(e) => onUpdate({ ...data, settings: { ...data.settings, lastPeriodStart: e.target.value } })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Cycle Length</label>
                    <input 
                      type="number" min="21" max="35"
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border-2 border-transparent focus:border-soft-pink outline-none font-bold dark:text-white"
                      value={data.settings.cycleLength}
                      onChange={(e) => onUpdate({ ...data, settings: { ...data.settings, cycleLength: parseInt(e.target.value) || 28 } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Period Duration</label>
                    <input 
                      type="number" min="2" max="10"
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border-2 border-transparent focus:border-soft-pink outline-none font-bold dark:text-white"
                      value={data.settings.periodDuration}
                      onChange={(e) => onUpdate({ ...data, settings: { ...data.settings, periodDuration: parseInt(e.target.value) || 5 } })}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowSettings(false);
                  setSnackbar("Settings saved, Tanha 💕");
                }}
                className="w-full p-5 bg-gradient-to-r from-soft-pink to-rose-400 text-white rounded-2xl font-bold shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save Settings 💕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  // State
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('anchor_settings');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Tanha',
      onboarded: false,
      darkMode: true,
      soundEnabled: true,
      notificationsEnabled: true,
      anchorTasks: [],
      streak: 0,
      reflections: [],
      hasSeenWelcomePopup: false,
      hasSeenTour: false,
      periodTrackerRevealShown: false,
      periodTrackerTourShown: false
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('anchor_tasks');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [cycleData, setCycleData] = useState<PeriodTrackerData>(() => {
    const saved = localStorage.getItem('anchor_cycle_data');
    if (saved) return JSON.parse(saved);
    return {
      logs: [],
      settings: {
        cycleLength: 28,
        periodDuration: 5,
        lastPeriodStart: '',
        remindersEnabled: {
          periodDue: true,
          dailyLog: true,
          fertileWindow: true
        }
      }
    };
  });

  const [view, setView] = useState<'home' | 'focus' | 'settings' | 'cycle'>('home');
  const [activeTab, setActiveTab] = useState<'day' | 'cycle'>('day');
  const [showCycleReveal, setShowCycleReveal] = useState(false);
  const [showCycleTour, setShowCycleTour] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showWishBox, setShowWishBox] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  
  const [celebration, setCelebration] = useState<{ message: string, isFinale: boolean } | null>(null);
  const lastMessageRef = useRef<string>('');

  // Snackbar auto-hide
  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => setSnackbar(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  useEffect(() => {
    if (settings.onboarded && !settings.periodTrackerRevealShown) {
      const timer = setTimeout(() => {
        setShowCycleReveal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [settings.onboarded, settings.periodTrackerRevealShown]);

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const reflection = settings.reflections.find(r => r.date === dateStr);
      return {
        name: format(date, 'EEE'),
        rate: reflection ? reflection.rating * 20 : Math.random() * 100,
        fullDate: dateStr
      };
    });
  }, [settings.reflections]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('anchor_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('anchor_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('anchor_cycle_data', JSON.stringify(cycleData));
  }, [cycleData]);

  // Midnight Reset Logic
  useEffect(() => {
    const checkReset = () => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const lastCheck = localStorage.getItem('last_reset_check');
      
      if (lastCheck !== todayStr) {
        // It's a new day!
        localStorage.setItem('last_reset_check', todayStr);
        
        // Reset tasks
        setTasks(prev => {
          // Keep only anchor tasks from settings, reset their completion
          const newDayTasks: Task[] = settings.anchorTasks.map(at => ({
            id: at.id,
            name: at.name,
            emoji: at.emoji,
            time: at.time,
            completed: false,
            isAnchor: true,
            date: todayStr
          }));
          return newDayTasks;
        });

        // Check streak
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const wasYesterdayCompleted = tasks.length > 0 && tasks.every(t => t.completed);
        
        if (!wasYesterdayCompleted && settings.streak > 0) {
           setSettings(s => ({ ...s, streak: 0 }));
        }
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [settings.anchorTasks, settings.streak, tasks]);

  // Reflection Trigger (After 8 PM)
  useEffect(() => {
    const hour = new Date().getHours();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const alreadyReflected = settings.reflections.some(r => r.date === todayStr);
    
    if (hour >= 20 && !alreadyReflected && settings.onboarded) {
      setShowReflection(true);
    }
  }, [settings.reflections, settings.onboarded]);

  // Handlers
  const handleTaskToggle = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);

    const isNowCompleted = newTasks.find(t => t.id === id)?.completed;
    
    if (isNowCompleted) {
      const allCompleted = newTasks.length > 0 && newTasks.every(t => t.completed);
      
      if (allCompleted) {
        playSound(SOUNDS.CELEBRATE, settings.soundEnabled);
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FFB6C1', '#5C6BC0', '#FAFAF8']
        });
        setCelebration({ 
          message: "ALLLL DONE!! Amar lokki completed everything today! I love you to the moon and back, forever and always 🌙💖✨", 
          isFinale: true 
        });
        
        // Update streak if not already updated today
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (settings.lastCompletedDate !== todayStr) {
          setSettings(s => ({
            ...s,
            streak: s.streak + 1,
            lastCompletedDate: todayStr
          }));
        }
      } else {
        playSound(SOUNDS.SUCCESS, settings.soundEnabled);
        // Individual task celebration
        let randomMessage;
        do {
          randomMessage = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
        } while (randomMessage === lastMessageRef.current);
        
        lastMessageRef.current = randomMessage;
        setCelebration({ message: randomMessage, isFinale: false });
      }
    } else {
      playSound(SOUNDS.CLICK, settings.soundEnabled);
    }
  };

  const addTask = (name: string, emoji: string, time?: string) => {
    playSound(SOUNDS.POP, settings.soundEnabled);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      emoji,
      time,
      completed: false,
      isAnchor: false,
      date: format(new Date(), 'yyyy-MM-dd')
    };
    setTasks([...tasks, newTask]);
    setShowAddTask(false);
    setSnackbar("Added! You got this, Tanha 💪");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleOnboardingFinish = (anchors: AnchorTaskTemplate[]) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const initialTasks: Task[] = anchors.map(a => ({
      ...a,
      completed: false,
      isAnchor: true,
      date: todayStr
    }));
    
    setSettings(s => ({
      ...s,
      name: 'Tanha',
      onboarded: true,
      anchorTasks: anchors
    }));
    setTasks(initialTasks);
  };

  const handleReflectionSave = (rating: number) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setSettings(s => ({
      ...s,
      reflections: [...s.reflections, { date: todayStr, rating }]
    }));
    setShowReflection(false);
  };

  // --- Main Render Logic ---

  if (!settings.onboarded) return <Onboarding onFinish={handleOnboardingFinish} soundEnabled={settings.soundEnabled} />;

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning, Tanha ☀️";
    if (hour >= 12 && hour < 17) return "Good Afternoon, Tanha 🌤️";
    if (hour >= 17 && hour < 20) return "Good Evening, Tanha 🌸";
    return "Good Night, Tanha 🌙";
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", settings.darkMode ? "bg-navy-900 text-white" : "bg-warm-white text-gray-900")}>
      <AnimatePresence>
        {showCycleReveal && (
          <PeriodTrackerReveal 
            onShowMe={() => {
              setSettings(prev => ({ ...prev, periodTrackerRevealShown: true }));
              setShowCycleReveal(false);
              setActiveTab('cycle');
              // Don't start tour yet - wait for them to initialize tracking
            }}
            onSkip={() => {
              setSettings(prev => ({ ...prev, periodTrackerRevealShown: true }));
              setShowCycleReveal(false);
            }}
          />
        )}

        {showCycleTour && (
          <PeriodTrackerTour 
            soundEnabled={settings.soundEnabled}
            onComplete={() => {
              setSettings(prev => ({ ...prev, periodTrackerTourShown: true }));
              setShowCycleTour(false);
              setSnackbar("Your cycle space is ready, Tanha 💕 You can retake this tour anytime in settings 🌸");
            }}
          />
        )}

        {view === 'focus' && focusTask && <FocusMode task={focusTask} onExit={() => setView('home')} />}
        {showReflection && <ReflectionModal userName={settings.name} onSave={handleReflectionSave} />}
        {showWishBox && <WishBoxModal onClose={() => setShowWishBox(false)} soundEnabled={settings.soundEnabled} />}
        {showAddTask && (
          <AddTaskModal 
            onClose={() => setShowAddTask(false)} 
            onAdd={addTask} 
            existingTasks={tasks}
          />
        )}
        {!settings.hasSeenWelcomePopup && settings.onboarded && (
          <WelcomePopup onDismiss={() => {
            setSettings(s => ({ ...s, hasSeenWelcomePopup: true }));
            if (!settings.hasSeenTour) setShowTour(true);
          }} soundEnabled={settings.soundEnabled} />
        )}
        {showTour && (
          <AppTour onComplete={() => {
            setShowTour(false);
            setSettings(s => ({ ...s, hasSeenTour: true }));
            setSnackbar("Tour complete! Now go show today who's boss, Tanha 💪💖");
          }} soundEnabled={settings.soundEnabled} />
        )}
        {celebration && (
          <CelebrationPopup 
            message={celebration.message} 
            isFinale={celebration.isFinale} 
            onDismiss={() => setCelebration(null)} 
          />
        )}
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 bg-navy-800 text-white rounded-full shadow-xl border border-white/10 font-medium flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {snackbar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="max-w-2xl mx-auto pt-12 px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 id="tour-greeting" className="text-3xl font-bold serif italic tracking-tight">
              {greeting()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div id="tour-streak" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 font-bold text-sm">
              <Flame className="w-4 h-4 fill-current" />
              {settings.streak}
            </div>
            <button 
              id="tour-settings"
              onClick={() => setView('settings')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quote & Progress */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 p-8 rounded-[40px] bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-soft-pink/5 rounded-full blur-2xl group-hover:bg-soft-pink/10 transition-all duration-700" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sakura/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-soft-pink uppercase tracking-[0.2em]">
                <Heart className="w-3 h-3 fill-current" />
                Daily Love Note
              </div>
              <p className="text-xl font-serif italic text-gray-800 dark:text-gray-100 leading-relaxed handwriting">
                "{quote}"
              </p>
            </div>
            
            <div className="relative z-10 flex items-center gap-2 mt-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-soft-pink to-rose-400 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Just for you, Tanha 🌸</span>
            </div>
          </div>
          
          <div id="tour-progress" className="md:col-span-2 p-8 rounded-[40px] bg-gradient-to-br from-soft-pink to-rose-400 text-white shadow-xl shadow-pink-500/20 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <motion.circle 
                  cx="48" cy="48" r="42" fill="none" stroke="white" strokeWidth="8" 
                  strokeDasharray="264"
                  animate={{ strokeDashoffset: 264 - (264 * (progress / 100)) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">
                {progress}%
              </div>
              {/* Sparkles on ring */}
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-200"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </div>
            <div className="text-center relative z-10">
              <div className="text-xs font-black uppercase tracking-[0.2em] opacity-90">Today's Progress</div>
              <div className="text-[11px] font-bold mt-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {tasks.filter(t => t.completed).length} / {tasks.length} Tasks Done ✨
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "max-w-2xl mx-auto py-8 px-6 pb-32 space-y-10",
        activeTab === 'cycle' && "bg-[#FFF0F3] dark:bg-navy-900 min-h-screen"
      )}>
        {activeTab === 'day' ? (
          <>
            {/* Weekly Summary Card (Swipeable feel) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-electric-indigo" />
                  Weekly Momentum
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: settings.darkMode ? '#8E9299' : '#6B7280', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-navy-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                              {payload[0].value}% Complete
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="rate" radius={[6, 6, 6, 6]} barSize={24}>
                      {weeklyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isSameDay(parseISO(entry.fullDate), new Date()) ? '#5C6BC0' : (settings.darkMode ? '#2C3E50' : '#E5E7EB')} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Anchor Tasks */}
            <section id="tour-anchors" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-electric-indigo" />
                  Anchor Tasks
                </h2>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.isAnchor).map(task => (
                  <motion.div key={task.id} className="relative">
                    <TaskCard 
                      task={task} 
                      onToggle={() => handleTaskToggle(task.id)} 
                    />
                    <button 
                      onClick={() => { setFocusTask(task); setView('focus'); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-electric-indigo hover:text-white transition-all"
                    >
                      <Timer className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Today's Tasks */}
            <section id="tour-today" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-electric-indigo" />
                  Today's Tasks
                </h2>
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {tasks.filter(t => !t.isAnchor).map(task => (
                    <motion.div key={task.id}>
                      <TaskCard 
                        task={task} 
                        onToggle={() => handleTaskToggle(task.id)} 
                        onDelete={() => deleteTask(task.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {tasks.filter(t => !t.isAnchor).length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                    <p className="text-gray-400 text-sm">No extra tasks for today. Add one below!</p>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <PeriodTracker 
            data={cycleData} 
            onUpdate={setCycleData} 
            setSnackbar={setSnackbar}
            onInitialize={() => {
              setSnackbar("Your cycle tracker is ready, Tanha! 💕🌸");
              setTimeout(() => setShowCycleTour(true), 1000);
            }}
          />
        )}
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <div className="glass dark:glass-dark p-2 rounded-full shadow-2xl flex items-center gap-2 relative">
          {/* Hidden Wish Box Trigger - Floating Heart */}
          <motion.button 
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { playSound(SOUNDS.CLICK, settings.soundEnabled); setShowWishBox(true); }}
            className="absolute -top-16 right-4 w-12 h-12 rounded-full bg-white dark:bg-navy-800 shadow-xl flex items-center justify-center text-soft-pink border-2 border-soft-pink/20 animate-float"
          >
            <Heart className="w-6 h-6 fill-current" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-soft-pink"
            />
          </motion.button>

          <button 
            onClick={() => setActiveTab('day')}
            className={cn(
              "flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all", 
              activeTab === 'day' ? "bg-gradient-to-r from-soft-pink to-rose-400 text-white shadow-lg" : "text-gray-500"
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-bold">My Day</span>
          </button>
          
          <button 
            id="tour-add-task"
            onClick={() => setShowAddTask(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-soft-pink to-rose-400 text-white flex items-center justify-center shadow-xl shadow-pink-500/40 hover:scale-110 transition-all border-4 border-white/20"
          >
            <Plus className="w-7 h-7" strokeWidth={3} />
          </button>

          <button 
            onClick={() => setActiveTab('cycle')}
            className={cn(
              "flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all", 
              activeTab === 'cycle' ? "bg-gradient-to-r from-soft-pink to-rose-400 text-white shadow-lg" : "text-gray-500"
            )}
          >
            <Smile className="w-5 h-5" />
            <span className="text-sm font-bold">My Cycle</span>
          </button>
        </div>
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {view === 'settings' && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-50 bg-warm-white dark:bg-navy-900 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto p-6 space-y-12 pb-32">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold serif italic">TANHA CHATTERJEE</h2>
                <button onClick={() => { playSound(SOUNDS.CLICK, settings.soundEnabled); setView('home'); }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Profile */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Profile</h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-gray-700/50 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Your Name</label>
                    <div className="w-full p-4 rounded-xl bg-gray-50 dark:bg-navy-900 font-bold text-lg dark:text-white flex items-center gap-2">
                      Tanha 🌸
                    </div>
                    <p className="text-[10px] text-gray-400 italic">This app is made just for you! 💕</p>
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Preferences</h3>
                <div className="p-2 rounded-3xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                        {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <span className="font-medium">Dark Mode</span>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                      className={cn("w-12 h-6 rounded-full transition-all relative", settings.darkMode ? "bg-electric-indigo" : "bg-gray-200")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", settings.darkMode ? "right-1" : "left-1")} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                        {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </div>
                      <span className="font-medium">Sound Effects</span>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                      className={cn("w-12 h-6 rounded-full transition-all relative", settings.soundEnabled ? "bg-electric-indigo" : "bg-gray-200")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", settings.soundEnabled ? "right-1" : "left-1")} />
                    </button>
                  </div>
                </div>
              </section>

              {/* Cycle Tracker Settings */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Cycle Tracker</h3>
                <div className="p-2 rounded-3xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Cycle Reminders</span>
                    </div>
                    <button 
                      onClick={() => setCycleData(d => ({ 
                        ...d, 
                        settings: { 
                          ...d.settings, 
                          remindersEnabled: { 
                            ...d.settings.remindersEnabled, 
                            periodDue: !d.settings.remindersEnabled.periodDue 
                          } 
                        } 
                      }))}
                      className={cn("w-12 h-6 rounded-full transition-all relative", cycleData.settings.remindersEnabled.periodDue ? "bg-soft-pink" : "bg-gray-200")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", cycleData.settings.remindersEnabled.periodDue ? "right-1" : "left-1")} />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <button 
                      onClick={() => {
                        setShowCycleTour(true);
                        setView('home');
                        setActiveTab('cycle');
                      }}
                      className="w-full p-4 rounded-2xl bg-soft-pink/10 text-soft-pink font-bold flex items-center justify-center gap-2 hover:bg-soft-pink/20 transition-all"
                    >
                      Take the tour again 🌸
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all your cycle data, Tanha? 🥺 This cannot be undone.")) {
                          setCycleData({
                            logs: [],
                            settings: {
                              cycleLength: 28,
                              periodDuration: 5,
                              lastPeriodStart: '',
                              remindersEnabled: {
                                periodDue: true,
                                dailyLog: true,
                                fertileWindow: true
                              }
                            }
                          });
                          setSnackbar("Cycle data cleared 🌸");
                        }
                      }}
                      className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-100 transition-all"
                    >
                      Clear Cycle Data 🗑️
                    </button>
                  </div>
                </div>
              </section>

              {/* Manage Anchors */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Anchor Tasks</h3>
                <div className="space-y-3">
                  {settings.anchorTasks.map(at => (
                    <div key={at.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{at.emoji}</span>
                        <span className="font-medium">{at.name}</span>
                      </div>
                      <button 
                        onClick={() => setSettings(s => ({ ...s, anchorTasks: s.anchorTasks.filter(x => x.id !== at.id) }))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const name = prompt("What's the new anchor task, Tanha? 🌸");
                      if (name) {
                        const emoji = getEmojiFromName(name);
                        setSettings(s => ({ 
                          ...s, 
                          anchorTasks: [...s.anchorTasks, { id: Math.random().toString(36).substr(2, 9), name, emoji }] 
                        }));
                      }
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-electric-indigo hover:text-electric-indigo transition-all"
                  >
                    <Plus className="w-5 h-5" /> Add New Anchor
                  </button>
                </div>
              </section>

              <button 
                onClick={() => {
                  if (confirm("Reset all data? This cannot be undone.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full p-4 text-red-500 font-bold border-2 border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
              >
                Reset Application
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
