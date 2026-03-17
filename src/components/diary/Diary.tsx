import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Lock, Search, Plus, ChevronLeft, Settings, 
  Image as ImageIcon, Type, List, Quote, Heart, 
  Download, Trash2, Edit3, X, Check, Star, Calendar, Clock,
  Unlock, Fingerprint, Smile, MessageCircle
} from 'lucide-react';
import { 
  format, parseISO, subDays, isSameDay, startOfMonth, 
  endOfMonth, eachDayOfInterval, differenceInDays 
} from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { DiaryEntry, DiarySettings, DiaryType, WeatherType } from '../../types';
import { DIARY_PROMPTS, DIARY_MOODS, DIARY_WEATHER, DIARY_TYPES } from '../../constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DiaryProps {
  entries: DiaryEntry[];
  settings: DiarySettings;
  onUpdateEntries: (entries: DiaryEntry[] | ((prev: DiaryEntry[]) => DiaryEntry[])) => void;
  onUpdateSettings: (settings: DiarySettings | ((prev: DiarySettings) => DiarySettings)) => void;
  setSnackbar: (msg: string) => void;
  onOpenWishBox: () => void;
}

export const Diary: React.FC<DiaryProps> = ({
  entries,
  settings,
  onUpdateEntries,
  onUpdateSettings,
  setSnackbar,
  onOpenWishBox
}) => {
  const [view, setView] = useState<'lock' | 'home' | 'editor' | 'settings'>('lock');
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(!settings.pin);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Daily prompt
  const dailyPrompt = useMemo(() => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % DIARY_PROMPTS.length;
    return DIARY_PROMPTS[index];
  }, []);

  useEffect(() => {
    if (!settings.pin) {
      setIsUnlocked(true);
      setView('home');
    } else if (!isUnlocked) {
      setView('lock');
    } else {
      setView('home');
    }
  }, [settings.pin, isUnlocked]);

  const handleUnlock = (pin: string) => {
    if (pin === settings.pin) {
      setIsUnlocked(true);
      setView('home');
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1000);
      setPinInput('');
    }
  };

  const handleSaveEntry = (entry: DiaryEntry) => {
    onUpdateEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) {
        return prev.map(e => e.id === entry.id ? entry : e);
      }
      return [entry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    setSnackbar("Entry saved, Tanha 💕 Your thoughts are safe here 🌸");
    setView('home');
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry? 🥺")) {
      onUpdateEntries(prev => prev.filter(e => e.id !== id));
      setSnackbar("Entry deleted 🌸");
    }
  };

  if (view === 'lock') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="w-24 h-24 bg-rose-gold/20 dark:bg-white/10 rounded-full flex items-center justify-center text-accent shadow-xl shadow-accent/20">
          <Lock className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold serif italic text-text-primary dark:text-text-dark-primary">Tanha's Private Space 🔒🌸</h2>
          <p className="text-text-secondary">Enter your PIN to unlock your diary</p>
        </div>
        
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300",
                pinInput.length > i ? "bg-accent scale-110" : "bg-rose-gold/20 dark:bg-white/10",
                pinError && "bg-red-500 animate-bounce"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => {
                if (pinInput.length < 4) {
                  const newPin = pinInput + num;
                  setPinInput(newPin);
                  if (newPin.length === 4) handleUnlock(newPin);
                }
              }}
              className="h-16 rounded-2xl bg-white dark:bg-plum-card shadow-sm text-2xl font-bold text-text-primary dark:text-text-dark-primary hover:bg-rose-gold/10 dark:hover:bg-white/5 hover:text-accent transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => {
              if (pinInput.length < 4) {
                const newPin = pinInput + '0';
                setPinInput(newPin);
                if (newPin.length === 4) handleUnlock(newPin);
              }
            }}
            className="h-16 rounded-2xl bg-white dark:bg-plum-card shadow-sm text-2xl font-bold text-text-primary dark:text-text-dark-primary hover:bg-rose-gold/10 dark:hover:bg-white/5 hover:text-accent transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => setPinInput(prev => prev.slice(0, -1))}
            className="h-16 rounded-2xl bg-white dark:bg-plum-card shadow-sm text-xl font-bold text-text-secondary hover:bg-rose-gold/10 dark:hover:bg-white/5 hover:text-accent transition-all active:scale-95 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        {pinError && <p className="text-red-500 text-sm font-medium animate-pulse">Hmm, try again 🌸</p>}
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <DiaryEditor 
        entry={editingEntry}
        settings={settings}
        dailyPrompt={dailyPrompt}
        onSave={handleSaveEntry}
        onClose={() => {
          setView('home');
          setEditingEntry(null);
        }}
        onOpenWishBox={onOpenWishBox}
      />
    );
  }

  if (view === 'settings') {
    return (
      <DiarySettingsView
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onClose={() => setView('home')}
        onClearAll={() => {
          if (confirm("Are you sure, Tanha? This cannot be undone 🥺")) {
            if (confirm("Yes, delete everything")) {
              onUpdateEntries([]);
              setSnackbar("All diary entries cleared 🌸");
            }
          }
        }}
      />
    );
  }

  return (
    <DiaryHome 
      entries={entries}
      dailyPrompt={dailyPrompt}
      onNewEntry={() => {
        setEditingEntry(null);
        setView('editor');
      }}
      onEditEntry={(entry) => {
        setEditingEntry(entry);
        setView('editor');
      }}
      onDeleteEntry={handleDeleteEntry}
      onOpenSettings={() => setView('settings')}
      onLock={() => {
        if (settings.pin) {
          setIsUnlocked(false);
          setView('lock');
        } else {
          setSnackbar("Set a PIN in settings first! 🔒");
        }
      }}
    />
  );
};

// --- Diary Home ---

const DiaryHome: React.FC<{
  entries: DiaryEntry[];
  dailyPrompt: string;
  onNewEntry: () => void;
  onEditEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenSettings: () => void;
  onLock: () => void;
}> = ({ entries, dailyPrompt, onNewEntry, onEditEntry, onDeleteEntry, onOpenSettings, onLock }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'favorites' | 'locked'>('all');

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)));
    }
    const now = new Date();
    if (filter === 'week') {
      const start = subDays(now, 7);
      result = result.filter(e => new Date(e.date) >= start);
    } else if (filter === 'month') {
      const start = startOfMonth(now);
      result = result.filter(e => new Date(e.date) >= start);
    } else if (filter === 'favorites') {
      result = result.filter(e => e.isFavorite);
    } else if (filter === 'locked') {
      result = result.filter(e => e.isLocked);
    }
    return result;
  }, [entries, search, filter]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const entry = entries.find(e => isSameDay(new Date(e.date), d));
      return { date: d, entry };
    });
  }, [entries]);

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-bold serif italic text-accent">Tanha's Diary 📖</h2>
          <p className="text-sm text-text-secondary font-medium">Your thoughts, your feelings, your world 🌸</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onLock} className="p-2 rounded-xl bg-rose-card dark:bg-plum-card text-text-secondary hover:text-accent transition-all">
            <Lock className="w-5 h-5" />
          </button>
          <button onClick={onOpenSettings} className="p-2 rounded-xl bg-rose-card dark:bg-plum-card text-text-secondary hover:text-accent transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Prompt */}
      <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#F0F8FF] to-[#E4F0FF] dark:from-[#0F172A] dark:to-[#020617] shadow-lg shadow-accent/10 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Book className="w-24 h-24" />
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-lg font-bold text-text-primary dark:text-text-dark-primary serif italic leading-relaxed">
            "{dailyPrompt}"
          </p>
          <button 
            onClick={onNewEntry}
            className="px-8 py-4 rounded-full bg-accent text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
          >
            <Edit3 className="w-4 h-4" /> Write Today's Entry ✍️
          </button>
        </div>
      </div>

      {/* Mood Strip */}
      <div className="space-y-3">
        <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Last 7 Days</h3>
        <div className="flex justify-between px-2">
          {last7Days.map((day, i) => (
            <button 
              key={i}
              onClick={() => day.entry && onEditEntry(day.entry)}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-xs font-bold text-text-secondary">{format(day.date, 'EEEE').charAt(0)}</div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all",
                day.entry ? "bg-white dark:bg-plum-card shadow-sm border border-rose-gold/20 dark:border-rose-900/30" : "bg-rose-card dark:bg-deep-plum opacity-50"
              )}>
                {day.entry ? day.entry.mood || '📝' : ''}
              </div>
              {day.entry && <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 px-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input 
            type="text"
            placeholder="Search your thoughts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-plum-card border-none font-medium text-sm focus:ring-2 focus:ring-rose-gold/40 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['all', 'week', 'month', 'favorites', 'locked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all",
                filter === f ? "bg-accent text-white shadow-md shadow-accent/20" : "bg-white dark:bg-plum-card text-text-secondary hover:bg-rose-gold/10 dark:hover:bg-white/5"
              )}
            >
              {f === 'favorites' ? 'Favorites ⭐' : f === 'locked' ? 'Locked 🔒' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4 px-2">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-rose-gold/20 dark:border-rose-900/30 rounded-[32px] space-y-4">
            <div className="w-16 h-16 bg-rose-gold/10 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-accent">
              <Book className="w-8 h-8" />
            </div>
            <p className="text-text-secondary font-medium">No entries found 🌸</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <motion.div
              key={entry.id}
              layout
              onClick={() => onEditEntry(entry)}
              className="p-5 rounded-[24px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/5 dark:border-white/5 flex gap-4 cursor-pointer hover:shadow-md hover:border-rose-gold/20 transition-all relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-light" />
              <div className="text-3xl">{entry.mood || '📝'}</div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-text-primary dark:text-text-dark-primary truncate pr-2">
                    {entry.title || format(new Date(entry.date), 'EEEE, MMMM d 🌸')}
                  </h4>
                  {entry.isLocked && <Lock className="w-3 h-3 text-text-secondary flex-shrink-0" />}
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                  {entry.isLocked ? "This entry is locked 🔒" : entry.body || "Empty entry..."}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{entry.wordCount} words 📝</span>
                  {entry.type !== 'normal' && (
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-rose-gold/10 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      {DIARY_TYPES.find(t => t.id === entry.type)?.label.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Insights & Stats */}
      {entries.length > 0 && (
        <div className="px-2 pt-8 space-y-4">
          <h3 className="text-xl font-bold serif italic text-text-primary dark:text-text-dark-primary">Diary Insights ✨</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[24px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/20 dark:border-rose-900/30 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-gold/10 dark:bg-white/5 flex items-center justify-center text-accent">
                <Book className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-text-primary dark:text-text-dark-primary">{entries.length}</p>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Entries</p>
              </div>
            </div>
            <div className="p-4 rounded-[24px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/20 dark:border-rose-900/30 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-gold/10 dark:bg-white/5 flex items-center justify-center text-accent">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-text-primary dark:text-text-dark-primary">
                  {entries.reduce((acc, e) => acc + (e.wordCount || 0), 0)}
                </p>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Words Written</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Diary Editor ---

const DiaryEditor: React.FC<{
  entry: DiaryEntry | null;
  settings: DiarySettings;
  dailyPrompt: string;
  onSave: (entry: DiaryEntry) => void;
  onClose: () => void;
  onOpenWishBox: () => void;
}> = ({ entry, settings, dailyPrompt, onSave, onClose, onOpenWishBox }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [body, setBody] = useState(entry?.body || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [weather, setWeather] = useState<WeatherType | ''>(entry?.weather || '');
  const [type, setType] = useState<DiaryType>(entry?.type || settings.defaultType);
  const [isLocked, setIsLocked] = useState(entry?.isLocked || false);
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite || false);
  
  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(w => w.length > 0).length, [body]);

  const handleSave = () => {
    const newEntry: DiaryEntry = {
      id: entry?.id || Math.random().toString(36).substr(2, 9),
      date: entry?.date || new Date().toISOString(),
      title,
      body,
      mood,
      weather,
      type,
      tags: entry?.tags || [],
      photos: entry?.photos || [],
      isLocked,
      isFavorite,
      wordCount,
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(newEntry);
  };

  // Auto-save
  useEffect(() => {
    if (settings.autoSave && body.trim().length > 0) {
      const timer = setTimeout(() => {
        // In a real app, we'd silently save here without closing
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [body, settings.autoSave]);

  const getBgColor = () => {
    if (type === 'letter_to_him') return 'bg-[#F0F8FF] dark:bg-[#0F172A]';
    if (type === 'dream') return 'bg-[#F5F3FF] dark:bg-[#1E1B4B]';
    if (type === 'rant') return 'bg-[#F8FAFC] dark:bg-[#1E293B]';
    return 'bg-[#FFFEF7] dark:bg-[#020617]'; // Default warm cream
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn("fixed inset-0 z-50 flex flex-col", getBgColor())}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-rose-gold/20/50 dark:border-white/5/50">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-all">
          <ChevronLeft className="w-6 h-6 text-text-primary dark:text-text-secondary" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 rounded-full hover:bg-black/5 transition-all">
            <Star className={cn("w-5 h-5", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-text-secondary")} />
          </button>
          <button onClick={() => setIsLocked(!isLocked)} className="p-2 rounded-full hover:bg-black/5 transition-all">
            {isLocked ? <Lock className="w-5 h-5 text-accent" /> : <Unlock className="w-5 h-5 text-text-secondary" />}
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 rounded-full bg-accent text-white font-bold text-sm shadow-md shadow-accent/20">
            Save 💕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Meta Info */}
        <div className="space-y-1">
          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
            {format(entry ? new Date(entry.date) : new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-xs text-text-secondary">Written at {format(entry ? new Date(entry.createdAt) : new Date(), 'h:mm a')}</p>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Give this entry a title... (optional) 🌸"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-transparent border-none text-2xl font-bold serif italic text-text-primary dark:text-text-dark-primary placeholder:text-text-secondary focus:ring-0 p-0"
        />

        {/* Mood & Weather Selectors */}
        <div className="flex flex-col gap-4 py-4 border-y border-rose-gold/20/50 dark:border-white/5/50">
          <div className="space-y-2">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">How are you feeling? 🌸</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {DIARY_MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "text-2xl p-2 rounded-full transition-all flex-shrink-0",
                    mood === m ? "bg-white dark:bg-plum-card shadow-md scale-110" : "opacity-50 hover:opacity-100 hover:scale-110"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Weather 🌤️</p>
            <div className="flex gap-2">
              {DIARY_WEATHER.map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id as WeatherType)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1",
                    weather === w.id ? "bg-white dark:bg-plum-card shadow-sm text-text-primary dark:text-text-dark-primary" : "text-text-secondary hover:bg-black/5"
                  )}
                >
                  {w.emoji} {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {DIARY_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setType(t.id as DiaryType);
                if (t.id === 'gratitude' && !body) setBody("1. \n2. \n3. ");
                if (t.id === 'dear_diary' && !body) setBody("Dear Diary,\n\n");
                if (t.id === 'letter_to_him' && !body) setBody("Hey baby, 💌\n\n");
              }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                type === t.id ? "bg-accent text-white border-accent shadow-md shadow-accent/20" : "bg-transparent border-rose-gold/20 dark:border-white/10 text-text-secondary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Writing Area */}
        <div className="relative flex-1 min-h-[300px]">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={`Start writing, Tanha... this is your safe space 🌸\nNo judgment. No rules. Just you. 💕\n\nPrompt: ${dailyPrompt}`}
            className={cn(
              "w-full h-full min-h-[300px] bg-transparent border-none resize-none focus:ring-0 p-0 text-[#1E293B] dark:text-[#E2E8F0] serif leading-[1.8]",
              settings.fontSize === 'small' ? 'text-sm' : settings.fontSize === 'large' ? 'text-xl' : 'text-base'
            )}
          />
        </div>
      </div>

      {/* Footer / Toolbar */}
      <div className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-md border-t border-rose-gold/20/50 dark:border-white/5/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-text-secondary">
          <button className="hover:text-accent transition-colors"><ImageIcon className="w-5 h-5" /></button>
          <button className="hover:text-accent transition-colors"><Type className="w-5 h-5" /></button>
          <button className="hover:text-accent transition-colors"><List className="w-5 h-5" /></button>
          <button className="hover:text-accent transition-colors"><Quote className="w-5 h-5" /></button>
        </div>
        <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">
          {wordCount} words
        </div>
      </div>

      {/* Special Letter to Him Action */}
      {type === 'letter_to_him' && body.length > 10 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
          <button 
            onClick={() => {
              handleSave();
              onOpenWishBox();
            }}
            className="w-full py-3 rounded-2xl bg-rose-gold text-white font-bold shadow-lg shadow-accent/30 flex items-center justify-center gap-2 animate-bounce"
          >
            <MessageCircle className="w-5 h-5" /> Send this to him? 💌
          </button>
        </div>
      )}
    </motion.div>
  );
};

// --- Diary Settings ---

const DiarySettingsView: React.FC<{
  settings: DiarySettings;
  onUpdateSettings: (settings: DiarySettings | ((prev: DiarySettings) => DiarySettings)) => void;
  onClose: () => void;
  onClearAll: () => void;
}> = ({ settings, onUpdateSettings, onClose, onClearAll }) => {
  const [newPin, setNewPin] = useState('');

  return (
    <div className="space-y-8 pb-32 px-4">
      <div className="flex items-center gap-4">
        <button onClick={onClose} className="p-2 rounded-full bg-rose-card dark:bg-plum-card text-text-secondary hover:text-accent transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold serif italic">Diary Settings ⚙️</h2>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-[24px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/10 dark:border-white/10/50 space-y-4">
          <h3 className="font-bold text-text-primary dark:text-text-dark-primary flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" /> Security
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Set Diary PIN (4 digits)</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder={settings.pin ? "****" : "Enter new PIN"}
                className="flex-1 p-3 rounded-xl bg-rose-card dark:bg-deep-plum border-none focus:ring-2 focus:ring-rose-gold/40"
              />
              <button 
                onClick={() => {
                  if (newPin.length === 4) {
                    onUpdateSettings(s => ({ ...s, pin: newPin }));
                    setNewPin('');
                    alert("PIN updated successfully! 🔒");
                  } else {
                    alert("PIN must be 4 digits 🌸");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-sm"
              >
                Save
              </button>
            </div>
            {settings.pin && (
              <button 
                onClick={() => {
                  if (confirm("Remove PIN lock?")) onUpdateSettings(s => ({ ...s, pin: null }));
                }}
                className="text-xs text-red-500 font-bold mt-2"
              >
                Remove PIN
              </button>
            )}
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/10 dark:border-white/10/50 space-y-4">
          <h3 className="font-bold text-text-primary dark:text-text-dark-primary flex items-center gap-2">
            <Type className="w-5 h-5 text-accent" /> Preferences
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Font Size</span>
            <select 
              value={settings.fontSize}
              onChange={e => onUpdateSettings(s => ({ ...s, fontSize: e.target.value as any }))}
              className="p-2 rounded-lg bg-rose-card dark:bg-deep-plum border-none text-sm font-bold"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Auto-save Drafts</span>
            <button 
              onClick={() => onUpdateSettings(s => ({ ...s, autoSave: !s.autoSave }))}
              className={cn("w-12 h-6 rounded-full transition-colors relative", settings.autoSave ? "bg-accent" : "bg-rose-gold/20 dark:bg-white/10")}
            >
              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", settings.autoSave ? "right-1" : "left-1")} />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/10 dark:border-white/10/50 space-y-4">
          <h3 className="font-bold text-text-primary dark:text-text-dark-primary flex items-center gap-2">
            <Download className="w-5 h-5 text-accent" /> Data
          </h3>
          <button className="w-full p-3 rounded-xl bg-rose-card dark:bg-deep-plum text-text-primary dark:text-text-dark-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-card transition-all">
            <Download className="w-4 h-4" /> Export My Diary 📖
          </button>
          <button 
            onClick={onClearAll}
            className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete All Entries
          </button>
        </div>
      </div>
    </div>
  );
};
