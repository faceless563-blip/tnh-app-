import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Check, Trash2, Settings, Home, Play, 
  Flame, Calendar, Star, Moon, Sun, Volume2, 
  VolumeX, Bell, BellOff, ArrowRight, X, 
  Clock, Coffee, Brain, Timer, ChevronRight,
  TrendingUp, Award, Heart, Sparkles, Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, isToday, startOfToday, parseISO, subDays, isSameDay } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Types & Constants ---
import { Task, AnchorTaskTemplate, UserSettings, DailyReflection } from './types';
import { MOTIVATIONAL_QUOTES, KEYWORD_EMOJI_MAP, CELEBRATION_MESSAGES, EMOJI_OPTIONS } from './constants';

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
      className={cn(
        "group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
        "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50",
        task.completed && "opacity-60 grayscale-[0.2]"
      )}
    >
      <div id={!task.completed ? "tour-checkbox" : undefined}>
        <AnimatedCheckbox checked={task.completed} onToggle={onToggle} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{task.emoji}</span>
          <h3 className={cn(
            "font-medium text-gray-900 dark:text-gray-100 truncate transition-all duration-500",
            task.completed && "line-through decoration-electric-indigo/50"
          )}>
            {task.name}
          </h3>
          {task.isAnchor && (
            <span className="px-1.5 py-0.5 rounded-md bg-electric-indigo/10 text-electric-indigo text-[10px] font-bold uppercase tracking-wider">
              Anchor
            </span>
          )}
        </div>
        {task.time && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{task.time}</span>
            {(() => {
              const [h, m] = task.time.split(':').map(Number);
              const now = new Date();
              const taskTime = new Date();
              taskTime.setHours(h, m, 0, 0);
              const diff = (taskTime.getTime() - now.getTime()) / (1000 * 60);
              if (diff > 0 && diff <= 15) {
                return <span className="ml-2 text-orange-500 font-bold animate-pulse">Starts soon!</span>;
              }
              return null;
            })()}
          </div>
        )}
      </div>

      {!task.isAnchor && onDelete && (
        <button 
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
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
        className="bg-white dark:bg-navy-800 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white">New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 dark:text-gray-400">What do you need to do today, Tanha? 🌸</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-navy-900 flex items-center justify-center text-3xl hover:scale-105 transition-all shrink-0"
              >
                {emoji}
              </button>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Drink water"
                className={cn(
                  "flex-1 p-4 rounded-2xl bg-gray-100 dark:bg-navy-900 outline-none border-2 transition-all font-medium dark:text-white",
                  error ? "border-red-400" : "border-transparent focus:border-electric-indigo"
                )}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm font-medium ml-1">{error}</p>}
          </div>

          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-6 gap-2 p-3 bg-gray-50 dark:bg-navy-900 rounded-2xl max-h-40 overflow-y-auto custom-scrollbar"
            >
              {EMOJI_OPTIONS.map(e => (
                <button 
                  key={e} 
                  onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  className="p-2 text-2xl hover:bg-white dark:hover:bg-navy-800 rounded-xl transition-all"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Set a reminder time (optional)</label>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-navy-900">
              <Clock className="w-5 h-5 text-gray-400" />
              <input 
                type="time" 
                className="bg-transparent outline-none flex-1 dark:text-white"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={handleConfirm}
            className="w-full p-5 bg-electric-indigo text-white rounded-2xl font-bold shadow-lg shadow-electric-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Add Task 💕
          </button>
          <button 
            onClick={onClose}
            className="w-full p-4 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-700 dark:hover:text-white transition-all"
          >
            Maybe later
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
        className="bg-white dark:bg-navy-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold dark:text-white">Daily Reflection</h2>
          <p className="text-gray-500 dark:text-gray-400">How was your day, {userName}?</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button 
              key={r}
              onClick={() => setRating(r)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all",
                rating >= r ? "bg-electric-indigo text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"
              )}
            >
              <Star className={cn("w-6 h-6", rating >= r && "fill-current")} />
            </button>
          ))}
        </div>

        <button 
          onClick={() => rating > 0 && onSave(rating)}
          className="w-full p-4 bg-electric-indigo text-white rounded-2xl font-bold shadow-lg shadow-electric-indigo/20"
        >
          Save Reflection
        </button>
      </motion.div>
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
      hasSeenTour: false
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('anchor_tasks');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [view, setView] = useState<'home' | 'focus' | 'settings'>('home');
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  
  const [celebration, setCelebration] = useState<{ message: string, isFinale: boolean } | null>(null);
  const lastMessageRef = useRef<string>('');

  // Snackbar auto-hide
  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => setSnackbar(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

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
        {view === 'focus' && focusTask && <FocusMode task={focusTask} onExit={() => setView('home')} />}
        {showReflection && <ReflectionModal userName={settings.name} onSave={handleReflectionSave} />}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3 p-6 rounded-3xl bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between min-h-[160px]">
            <p className="text-lg font-serif italic text-gray-700 dark:text-gray-200 leading-relaxed">
              "{quote}"
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-electric-indigo uppercase tracking-widest mt-4">
              <Award className="w-4 h-4" />
              Daily Wisdom
            </div>
          </div>
          
          <div id="tour-progress" className="md:col-span-2 p-6 rounded-3xl bg-electric-indigo text-white shadow-xl shadow-electric-indigo/20 flex flex-col items-center justify-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <motion.circle 
                  cx="40" cy="40" r="36" fill="none" stroke="white" strokeWidth="6" 
                  strokeDasharray="226"
                  animate={{ strokeDashoffset: 226 - (226 * (progress / 100)) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {progress}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-tighter">Today's Progress</div>
              <div className="text-[10px] opacity-70">{tasks.filter(t => t.completed).length}/{tasks.length} Tasks Done</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-6 pb-32 space-y-10">
        
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
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <div className="glass dark:glass-dark p-2 rounded-full shadow-2xl flex items-center gap-2">
          <button 
            onClick={() => setView('home')}
            className={cn("flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all", view === 'home' ? "bg-electric-indigo text-white" : "text-gray-500")}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-bold">Home</span>
          </button>
          
          <button 
            id="tour-add-task"
            onClick={() => setShowAddTask(true)}
            className="w-12 h-12 rounded-full bg-electric-indigo text-white flex items-center justify-center shadow-lg shadow-electric-indigo/30 hover:scale-110 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setView('settings')}
            className={cn("flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all", view === 'settings' ? "bg-electric-indigo text-white" : "text-gray-500")}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-bold">Settings</span>
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
