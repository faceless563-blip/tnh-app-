import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, Trash2, Calendar as CalendarIcon, ShoppingBag, 
  Sparkles, Heart, Droplets, Clock, CheckCircle2, 
  ChevronLeft, ChevronRight, MoreHorizontal, 
  AlertCircle, Share2, Filter, Star, Bath, 
  CheckSquare, Square, Info, Settings as SettingsIcon,
  Flame, TrendingUp, Gift, PartyPopper, Bell, Book, Film, Pill
} from 'lucide-react';
import { 
  format, addDays, subDays, startOfWeek, endOfWeek, 
  isSameDay, parseISO, differenceInDays, startOfMonth, 
  endOfMonth, eachDayOfInterval, isSameMonth, addMonths, 
  subMonths, isToday, isPast, isFuture
} from 'date-fns';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, 
  Tooltip, Cell, PieChart, Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  HairCareLog, HairCareSettings, ImportantDate, 
  ShoppingItem, DailySelfCareLog, DateCategory,
  ShoppingCategory
} from '../types';
import { 
  SHOPPING_CATEGORIES, DATE_CATEGORIES, 
  DEFAULT_SELF_CARE_CHECKLIST, HAIR_CARE_MESSAGES,
  BATH_CELEBRATION, SELF_CARE_COMPLETE
} from '../constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Hair Care Tracker ---

interface HairCareTrackerProps {
  logs: HairCareLog[];
  settings: HairCareSettings;
  onLog: (type: 'shampoo' | 'oil') => void;
  onUpdateSettings: (settings: HairCareSettings) => void;
  onDeleteLog: (id: string) => void;
}

export const HairCareTracker: React.FC<HairCareTrackerProps> = ({ 
  logs, settings, onLog, onUpdateSettings, onDeleteLog 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const weekLogs = logs.filter(log => {
    const date = parseISO(log.timestamp);
    return date >= weekStart && date <= weekEnd;
  });
  
  const shampooCount = weekLogs.filter(l => l.type === 'shampoo').length;
  const oilCount = weekLogs.filter(l => l.type === 'oil').length;
  
  const lastShampoo = logs.filter(l => l.type === 'shampoo').sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  const lastOil = logs.filter(l => l.type === 'oil').sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  
  const getDaysAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const days = differenceInDays(new Date(), parseISO(dateStr));
    if (days === 0) return 'Today 🌸';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const shampooProgress = Math.min(100, (shampooCount / settings.shampooTarget) * 100);
  const oilProgress = Math.min(100, (oilCount / settings.oilTarget) * 100);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif italic">Tanha's Hair Care 🌸</h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-rose-card dark:hover:bg-white/10 transition-all"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 space-y-4"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Weekly Targets</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Shampoo Target</label>
              <input 
                type="number" 
                value={settings.shampooTarget}
                onChange={(e) => onUpdateSettings({ ...settings, shampooTarget: parseInt(e.target.value) || 1 })}
                className="w-full p-3 rounded-xl bg-rose-card dark:bg-deep-plum border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Oil Target</label>
              <input 
                type="number" 
                value={settings.oilTarget}
                onChange={(e) => onUpdateSettings({ ...settings, oilTarget: parseInt(e.target.value) || 1 })}
                className="w-full p-3 rounded-xl bg-rose-card dark:bg-deep-plum border-none font-bold"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Shampoo Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 rounded-[32px] bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-white/50 dark:border-white/5 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Droplets className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-accent/60">Shampoo</span>
              <button 
                onClick={() => onLog('shampoo')}
                className="w-10 h-10 rounded-full bg-white dark:bg-plum-card shadow-md flex items-center justify-center text-accent hover:scale-110 active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-accent">{shampooCount}</span>
              <span className="text-sm font-bold text-accent">/ {settings.shampooTarget}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-accent uppercase">
                <span>Last: {getDaysAgo(lastShampoo?.timestamp)}</span>
                <span>{Math.round(shampooProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-rose-gold/30/30 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${shampooProgress}%` }}
                  className="h-full bg-accent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Oil Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 rounded-[32px] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-white/50 dark:border-white/5 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Sparkles className="w-12 h-12 text-amber-500" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-amber-600/60">Hair Oil</span>
              <button 
                onClick={() => onLog('oil')}
                className="w-10 h-10 rounded-full bg-white dark:bg-plum-card shadow-md flex items-center justify-center text-amber-600 hover:scale-110 active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-amber-600">{oilCount}</span>
              <span className="text-sm font-bold text-amber-400">/ {settings.oilTarget}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-amber-400 uppercase">
                <span>Last: {getDaysAgo(lastOil?.timestamp)}</span>
                <span>{Math.round(oilProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-amber-200/30 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${oilProgress}%` }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* History */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Recent Logs</h3>
        <div className="space-y-3">
          {logs.slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  log.type === 'shampoo' ? "bg-accent/10 text-accent" : "bg-amber-500/10 text-amber-500"
                )}>
                  {log.type === 'shampoo' ? <Droplets className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-sm capitalize">{log.type} Applied</p>
                  <p className="text-[10px] text-text-secondary">{format(parseISO(log.timestamp), 'MMM do, h:mm a')}</p>
                </div>
              </div>
              <button 
                onClick={() => onDeleteLog(log.id)}
                className="p-2 text-text-secondary hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-rose-gold/10 dark:border-white/5 rounded-3xl">
              <p className="text-text-secondary text-sm italic">No hair care logs yet. Start your journey to healthy hair, Tanha! 🌸✨</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// --- Important Dates Calendar ---

interface ImportantDatesProps {
  dates: ImportantDate[];
  onAdd: (date: Omit<ImportantDate, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const ImportantDatesCalendar: React.FC<ImportantDatesProps> = ({ dates, onAdd, onDelete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState<Omit<ImportantDate, 'id'>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'other',
    notes: '',
    repeat: 'none'
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const datesInMonth = useMemo(() => {
    return dates.filter(d => isSameMonth(parseISO(d.date), currentMonth));
  }, [dates, currentMonth]);

  const upcomingDates = useMemo(() => {
    return dates
      .filter(d => !isPast(parseISO(d.date)) || isToday(parseISO(d.date)))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [dates]);

  const handleAdd = () => {
    if (!newDate.title) return;
    onAdd(newDate);
    setShowAddModal(false);
    setNewDate({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'other',
      notes: '',
      repeat: 'none'
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif italic">Important Dates 📅</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-full bg-accent-light text-white shadow-lg hover:scale-110 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Upcoming Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {upcomingDates.map(d => {
          const daysLeft = differenceInDays(parseISO(d.date), new Date());
          return (
            <motion.div 
              key={d.id}
              whileHover={{ y: -5 }}
              className="min-w-[200px] p-5 rounded-3xl bg-white dark:bg-plum-card shadow-sm border border-rose-gold/10 dark:border-white/10/50 space-y-3"
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center",
                DATE_CATEGORIES.find(c => c.id === d.category)?.color.replace('text-', 'bg-').replace('600', '100')
              )}>
                <span className="text-xl">{DATE_CATEGORIES.find(c => c.id === d.category)?.emoji}</span>
              </div>
              <div>
                <p className="font-bold text-sm truncate">{d.title}</p>
                <p className="text-[10px] text-text-secondary">{format(parseISO(d.date), 'MMMM do')}</p>
              </div>
              <div className="pt-2 border-t border-rose-gold/5 dark:border-white/10/50">
                <span className="text-xs font-black text-accent-light">
                  {daysLeft === 0 ? "Today! 🌸" : `${daysLeft} days left`}
                </span>
              </div>
            </motion.div>
          );
        })}
        {upcomingDates.length === 0 && (
          <div className="w-full p-8 text-center bg-rose-card dark:bg-plum-card/50 rounded-3xl border-2 border-dashed border-rose-gold/10 dark:border-white/5">
            <p className="text-xs text-text-secondary italic">No upcoming dates soon. Add one to start the countdown! ✨</p>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="p-6 rounded-[40px] bg-white dark:bg-plum-card shadow-sm border border-rose-gold/10 dark:border-white/10/50 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold font-serif italic text-xl">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-rose-card dark:hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-rose-card dark:hover:bg-white/10"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-black text-text-secondary uppercase">{d}</div>
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayDates = dates.filter(d => d.date === dateStr);
            const isTodayDate = isToday(day);
            
            return (
              <div 
                key={dateStr}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all",
                  isTodayDate ? "bg-accent-light text-white shadow-lg shadow-accent/20" : "hover:bg-rose-card dark:hover:bg-white/5"
                )}
              >
                <span className={cn("text-xs font-bold", !isTodayDate && "text-text-primary dark:text-text-secondary")}>
                  {format(day, 'd')}
                </span>
                <div className="flex gap-0.5 mt-1">
                  {dayDates.slice(0, 3).map(d => (
                    <div 
                      key={d.id} 
                      className={cn(
                        "w-1 h-1 rounded-full",
                        isTodayDate ? "bg-white" : (DATE_CATEGORIES.find(c => c.id === d.category)?.color.replace('text-', 'bg-') || 'bg-rose-gold/40')
                      )} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* List View */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">All Dates</h3>
        <div className="space-y-3">
          {dates.slice().sort((a, b) => a.date.localeCompare(b.date)).map(d => (
            <div key={d.id} className="p-4 rounded-2xl bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  DATE_CATEGORIES.find(c => c.id === d.category)?.color.replace('text-', 'bg-').replace('600', '100')
                )}>
                  <span className="text-lg">{DATE_CATEGORIES.find(c => c.id === d.category)?.emoji}</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{d.title}</p>
                  <p className="text-[10px] text-text-secondary">{format(parseISO(d.date), 'MMMM do, yyyy')}</p>
                </div>
              </div>
              <button onClick={() => onDelete(d.id)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-deep-plum/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-plum-card rounded-[40px] p-8 shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-bold font-serif italic">Add Important Date 🌸</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Event Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Anniversary 💑"
                    value={newDate.title}
                    onChange={e => setNewDate({ ...newDate, title: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-rose-card dark:bg-deep-plum border-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Date</label>
                  <input 
                    type="date" 
                    value={newDate.date}
                    onChange={e => setNewDate({ ...newDate, date: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-rose-card dark:bg-deep-plum border-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DATE_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setNewDate({ ...newDate, category: cat.id as DateCategory })}
                        className={cn(
                          "p-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2",
                          newDate.category === cat.id 
                            ? "bg-accent-light/10 border-accent-light text-accent-light" 
                            : "bg-rose-card dark:bg-deep-plum border-transparent text-text-secondary"
                        )}
                      >
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="text-[8px] font-bold uppercase">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full py-4 rounded-2xl bg-rose-gold text-white font-bold shadow-lg shadow-accent/20"
              >
                Save Date 💖
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Shopping List ---

interface ShoppingListProps {
  items: ShoppingItem[];
  onAdd: (item: Omit<ShoppingItem, 'id'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearBought: () => void;
  setSnackbar: (msg: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, onAdd, onToggle, onDelete, onClearBought, setSnackbar }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<ShoppingItem, 'id'>>({
    name: '',
    category: 'groceries',
    bought: false,
    priority: 'normal',
    quantity: '1'
  });

  const handleAdd = () => {
    if (!newItem.name.trim()) {
      setSnackbar("Give it a name first, Tanha! 🌸");
      return;
    }
    onAdd(newItem);
    setShowAdd(false);
    setNewItem({ name: '', category: 'groceries', bought: false, priority: 'normal', quantity: '1' });
  };

  const handleUpdateQuantity = (val: number) => {
    const current = parseInt(newItem.quantity || '1');
    const next = Math.max(1, current + val);
    setNewItem({ ...newItem, quantity: next.toString() });
  };

  const categories = SHOPPING_CATEGORIES;
  const sortedItems = [...items].sort((a, b) => {
    if (a.bought !== b.bought) return a.bought ? 1 : -1;
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    return 0;
  });

  const groupedItems = categories.map(cat => ({
    ...cat,
    items: sortedItems.filter(i => i.category === cat.id)
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold font-serif italic">Shopping List 🛍️</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowConfirmClear(true)}
            className="p-2 rounded-xl bg-rose-card dark:bg-white/5 text-text-secondary hover:text-red-500 transition-all"
            title="Clear bought items"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="p-2 rounded-xl bg-accent-light text-white shadow-lg hover:scale-110 transition-all"
          >
            <Plus className={cn("w-5 h-5 transition-transform", showAdd && "rotate-45")} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-[32px] bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 space-y-6 shadow-xl shadow-accent/5 mx-2">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="What do we need, Tanha? 🌸"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="flex-1 p-4 rounded-2xl bg-warm-white dark:bg-deep-plum text-text-primary dark:text-text-dark-primary border-none font-bold text-sm focus:ring-2 focus:ring-[#B76E79]/20 transition-all"
                  />
                  <div className="flex items-center bg-warm-white dark:bg-deep-plum rounded-2xl px-2 gap-2 text-text-primary dark:text-text-dark-primary">
                    <button 
                      onClick={() => handleUpdateQuantity(-1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-rose-card/80 dark:hover:bg-white/10 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-black text-sm">{newItem.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-rose-card/80 dark:hover:bg-white/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-6">
                    <div className="flex gap-2 min-w-max px-6">
                      {categories.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setNewItem({ ...newItem, category: cat.id as ShoppingCategory })}
                          className={cn(
                            "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2",
                            newItem.category === cat.id 
                              ? "bg-accent-light text-white border-accent-light shadow-md shadow-accent/20" 
                              : "bg-rose-card dark:bg-deep-plum text-text-secondary border-transparent hover:border-rose-gold/20 dark:hover:border-white/10"
                          )}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2 p-1 bg-rose-card dark:bg-deep-plum rounded-xl">
                    <button 
                      onClick={() => setNewItem({ ...newItem, priority: 'normal' })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all", 
                        newItem.priority === 'normal' 
                          ? "bg-accent-light text-white shadow-sm" 
                          : "text-text-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
                      )}
                    >
                      Normal
                    </button>
                    <button 
                      onClick={() => setNewItem({ ...newItem, priority: 'urgent' })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all", 
                        newItem.priority === 'urgent' 
                          ? "bg-accent text-white shadow-sm" 
                          : "text-text-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
                      )}
                    >
                      Urgent 🔥
                    </button>
                  </div>
                  <button 
                    onClick={handleAdd}
                    className="px-8 py-3 rounded-2xl bg-rose-gold text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {groupedItems.map(cat => (
          <div key={cat.id} className="space-y-4">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
              <span>{cat.emoji}</span>
              {cat.label}
            </h3>
            <div className="space-y-3 px-2">
              {cat.items.map(item => (
                <motion.div 
                  key={item.id}
                  layout
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setEditingItem(item);
                  }}
                  className={cn(
                    "p-5 rounded-[28px] bg-white dark:bg-plum-card border transition-all flex items-center justify-between group relative overflow-hidden",
                    item.bought 
                      ? "opacity-50 border-transparent bg-rose-card/50 dark:bg-deep-plum/50" 
                      : "border-rose-gold/10 dark:border-white/10/50 shadow-sm hover:shadow-md hover:border-accent-light/20"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <button 
                      onClick={() => onToggle(item.id)}
                      className={cn(
                        "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all",
                        item.bought 
                          ? "bg-accent-light border-accent-light text-white" 
                          : "border-rose-gold/20 dark:border-white/10 hover:border-accent-light"
                      )}
                    >
                      {item.bought && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className={cn(
                        "font-black text-sm tracking-tight transition-all", 
                        item.bought ? "line-through text-text-secondary" : "text-text-primary dark:text-text-dark-primary"
                      )}>
                        {item.name}
                        {item.priority === 'urgent' && (
                          <span className="ml-2 text-[8px] bg-accent text-white px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">Urgent</span>
                        )}
                      </p>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all relative z-10">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Long press / Edit overlay */}
                  <AnimatePresence>
                    {editingItem?.id === item.id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/90 dark:bg-plum-card/90 backdrop-blur-sm z-20 flex items-center justify-center gap-4"
                      >
                        <button 
                          onClick={() => {
                            onDelete(item.id);
                            setEditingItem(null);
                          }}
                          className="flex flex-col items-center gap-1 text-red-500"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black uppercase">Delete</span>
                        </button>
                        <button 
                          onClick={() => setEditingItem(null)}
                          className="flex flex-col items-center gap-1 text-text-secondary"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-rose-card/10 flex items-center justify-center">
                            <Plus className="w-6 h-6 rotate-45" />
                          </div>
                          <span className="text-[10px] font-black uppercase">Cancel</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-rose-gold/10 dark:border-white/5 rounded-[48px] space-y-6 mx-2">
            <div className="w-20 h-20 bg-accent-light/10 rounded-full flex items-center justify-center mx-auto text-accent-light">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-text-primary dark:text-text-dark-primary font-bold">The list is empty!</p>
              <p className="text-text-secondary text-xs italic">What should we get today, Tanha? 🌸🛍️</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Clear Dialog */}
      <AnimatePresence>
        {showConfirmClear && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-plum-card rounded-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-accent-light/10 rounded-full flex items-center justify-center mx-auto text-accent-light mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif italic">Clear bought items, Tanha? 🛒</h3>
                <p className="text-text-secondary text-sm">This will remove all items you've already picked up.</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    onClearBought();
                    setShowConfirmClear(false);
                  }}
                  className="w-full py-4 rounded-2xl bg-accent-light text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/20"
                >
                  Yes, clear
                </button>
                <button 
                  onClick={() => setShowConfirmClear(false)}
                  className="w-full py-4 rounded-2xl bg-rose-card dark:bg-white/5 text-text-secondary font-black text-sm uppercase tracking-widest"
                >
                  Keep them
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Self Care Tracker ---

interface SelfCareProps {
  logs: DailySelfCareLog[];
  onLog: (checklist: string[], notes: string) => void;
  onLogBath: () => void;
  bathLogs: string[];
}

export const SelfCareTracker: React.FC<SelfCareProps> = ({ logs, onLog, onLogBath, bathLogs }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(l => l.date === todayStr);
  const hasBathedToday = bathLogs.includes(todayStr);

  const [checklist, setChecklist] = useState<string[]>(todayLog?.checklist || []);
  const [notes, setNotes] = useState(todayLog?.notes || '');

  const handleToggle = (item: string) => {
    const newChecklist = checklist.includes(item) 
      ? checklist.filter(i => i !== item)
      : [...checklist, item];
    setChecklist(newChecklist);
    onLog(newChecklist, notes);
  };

  const streak = useMemo(() => {
    let count = 0;
    let current = new Date();
    while (bathLogs.includes(format(current, 'yyyy-MM-dd'))) {
      count++;
      current = subDays(current, 1);
    }
    return count;
  }, [bathLogs]);

  const weeklyScore = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekLogs = logs.filter(l => {
      const d = parseISO(l.date);
      return d >= start && d <= end;
    });
    if (weekLogs.length === 0) return 0;
    const totalItems = weekLogs.reduce((acc, l) => acc + l.checklist.length, 0);
    const maxPossible = weekLogs.length * DEFAULT_SELF_CARE_CHECKLIST.length;
    return Math.round((totalItems / maxPossible) * 100);
  }, [logs]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif italic">Self Care Space ✨</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 font-bold text-xs">
          <Flame className="w-4 h-4 fill-current" />
          {streak} Day Streak
        </div>
      </div>

      {/* Bath Tracker Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={cn(
          "p-8 rounded-[40px] relative overflow-hidden transition-all duration-500",
          hasBathedToday 
            ? "bg-gradient-to-br from-rose-gold to-fuchsia-500 text-white shadow-xl shadow-accent/20" 
            : "bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 shadow-sm"
        )}
      >
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Bath className="w-20 h-20" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif italic">Daily Bath Log 🛁</h3>
            <p className={cn("text-sm", hasBathedToday ? "text-rose-50" : "text-text-secondary")}>
              {hasBathedToday 
                ? "You're all fresh and clean, Tanha! 🌸✨" 
                : "Have you had your bath today, lokki? 🚿"}
            </p>
          </div>
          
          {!hasBathedToday ? (
            <button 
              onClick={onLogBath}
              className="w-full py-4 rounded-2xl bg-accent text-white font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 hover:bg-accent transition-all"
            >
              <Droplets className="w-5 h-5" />
              I've had my bath! 🚿
            </button>
          ) : (
            <div className="flex items-center gap-3 py-4 px-6 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold">Logged for today! ✨</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Weekly Score */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Weekly Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-accent-light">{weeklyScore}%</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="h-1.5 w-full bg-rose-card dark:bg-deep-plum rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${weeklyScore}%` }}
              className="h-full bg-accent-light"
            />
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Completed Today</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-fuchsia-500">{checklist.length}</span>
            <span className="text-xs font-bold text-text-secondary">/ {DEFAULT_SELF_CARE_CHECKLIST.length}</span>
          </div>
          <p className="text-[10px] text-text-secondary italic">Keep it up, lokki! 💕</p>
        </div>
      </div>

      {/* Checklist */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Self Care Checklist</h3>
        <div className="grid grid-cols-1 gap-3">
          {DEFAULT_SELF_CARE_CHECKLIST.map(item => (
            <button 
              key={item}
              onClick={() => handleToggle(item)}
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                checklist.includes(item)
                  ? "bg-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-600"
                  : "bg-white dark:bg-plum-card border-rose-gold/10 dark:border-white/10/50 text-text-primary dark:text-text-secondary"
              )}
            >
              <span className="font-bold text-sm">{item}</span>
              {checklist.includes(item) ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5 text-text-dark-primary dark:text-text-primary" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Self Care Notes</h3>
        <textarea 
          placeholder="How are you feeling today, Tanha? 🌸"
          value={notes}
          onChange={e => {
            setNotes(e.target.value);
            onLog(checklist, e.target.value);
          }}
          className="w-full p-6 rounded-3xl bg-white dark:bg-plum-card border border-rose-gold/10 dark:border-white/10/50 font-medium text-sm min-h-[120px] focus:ring-2 focus:ring-accent-light/20 transition-all"
        />
      </section>
    </div>
  );
};

// --- More Menu (Grid) ---

interface MoreMenuProps {
  onNavigate: (view: 'hair' | 'dates' | 'shopping' | 'selfcare' | 'cycle' | 'wishbox' | 'diary' | 'watchworld' | 'medicines') => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({ onNavigate }) => {
  const menuItems = [
    { id: 'cycle', name: 'My Cycle', icon: Heart, color: 'bg-[#B76E79]', emoji: '🌸' },
    { id: 'hair', name: 'Hair Care', icon: Droplets, color: 'bg-accent', emoji: '💆' },
    { id: 'wishbox', name: 'Wish Box', icon: Sparkles, color: 'bg-[#E8C4CC]', emoji: '🪄' },
    { id: 'dates', name: 'Important Dates', icon: CalendarIcon, color: 'bg-[#8B6F6F]', emoji: '📅' },
    { id: 'shopping', name: 'Shopping List', icon: ShoppingBag, color: 'bg-[#F48FB1]', emoji: '🛒' },
    { id: 'selfcare', name: 'Self Care', icon: Bath, color: 'bg-[#CE93D8]', emoji: '🛁' },
    { id: 'diary', name: 'My Diary', icon: Book, color: 'bg-[#8B3A52]', emoji: '📖' },
    { id: 'watchworld', name: 'Watch World', icon: Film, color: 'bg-accent', emoji: '🎬' },
    { id: 'medicines', name: 'Medicines 💊', icon: Pill, color: 'bg-[#F8BBD9]', emoji: '💊' },
  ];

  return (
    <div className="space-y-8 pb-[100px] min-h-screen -mx-6 -mt-6 px-6 pt-12 bg-gradient-to-br from-[#FFE4EC] via-[#FCE4EC] to-[#FDFAF7] dark:from-[#2C1810] dark:via-[#3D2C2C] dark:to-[#1A1114]">
      <h2 className="text-[32px] font-serif text-[#B76E79] pt-5">Explore More 🌸</h2>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.id as any)}
            className="p-6 rounded-[20px] bg-white/90 dark:bg-plum-card/90 border border-white/50 shadow-sm flex flex-col items-center gap-4 group"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12",
              item.color
            )}>
              <item.icon className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="font-bold text-[13px] text-[#2C1810] dark:text-text-dark-primary font-sans">{item.emoji} {item.name}</p>
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="p-8 rounded-[40px] bg-white dark:bg-plum-card border border-rose-gold/20 text-center space-y-2">
        <p className="text-sm font-serif italic text-text-primary dark:text-text-dark-primary">"You deserve all the love in the world, Tanha."</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Always remember that 💖</p>
      </div>
    </div>
  );
};
