import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Tv, Heart, Bookmark, PlayCircle, CheckCircle2, Plus, Star, Search, X, Image as ImageIcon, Calendar, Trash2, Edit3, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WatchItem, GENRES, LANGUAGES, PLATFORMS } from './types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Components
import { AddWatchItemSheet } from './AddWatchItemSheet';
import { WatchItemCard } from './WatchItemCard';
import { WatchingItemCard } from './WatchingItemCard';
import { WatchItemDetail } from './WatchItemDetail';

export const WatchWorld: React.FC = () => {
  const [items, setItems] = useLocalStorage<WatchItem[]>('tanha_watch_world', []);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'watching' | 'watched' | 'favorites'>('watchlist');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<WatchItem | null>(null);

  const stats = useMemo(() => {
    const movies = items.filter(i => i.type === 'movie' && i.status === 'finished').length;
    const series = items.filter(i => i.type === 'series' && i.status === 'finished').length;
    const watchlist = items.filter(i => i.status === 'want_to_watch').length;
    const ratedItems = items.filter(i => i.rating !== undefined);
    const avgRating = ratedItems.length > 0 
      ? (ratedItems.reduce((acc, i) => acc + (i.rating || 0), 0) / ratedItems.length).toFixed(1)
      : '0.0';
    
    // Rough estimate: 2h per movie, 10h per series
    const hours = (movies * 2) + (series * 10);

    return { movies, series, hours, avgRating, watchlist };
  }, [items]);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'watchlist': return items.filter(i => i.status === 'want_to_watch' || i.status === 'not_released');
      case 'watching': return items.filter(i => i.status === 'watching');
      case 'watched': return items.filter(i => i.status === 'finished');
      case 'favorites': return items.filter(i => i.isFavorite);
      default: return items;
    }
  }, [items, activeTab]);

  const handleSave = (item: WatchItem) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i));
    } else {
      setItems([item, ...items]);
    }
    setIsAdding(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleUpdate = (id: string, updates: Partial<WatchItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'watching', label: 'Watching', icon: PlayCircle },
    { id: 'watched', label: 'Watched', icon: CheckCircle2 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FDF8FA] dark:bg-[#1A1114] pb-24 -mx-6 -mt-8 pt-8">
      {/* Hero Header */}
      <div className="pt-12 px-6 pb-6 bg-gradient-to-b from-accent/10 to-transparent">
        <h1 className="text-4xl font-dancing text-accent dark:text-accent-light text-center mb-2">
          Tanha's Watch World 🎬
        </h1>
        <p className="text-center text-[#880E4F] dark:text-[#F48FB1] text-sm font-medium opacity-80">
          Every story you've lived through 🍿
        </p>
      </div>

      {/* Stats Bar */}
      <div className="px-6 mb-8 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 min-w-max pb-2">
          <StatChip icon="🎬" value={stats.movies} label="Movies Watched" />
          <StatChip icon="📺" value={stats.series} label="Series Watched" />
          <StatChip icon="⏱️" value={stats.hours} label="Hours (est.)" />
          <StatChip icon="⭐" value={stats.avgRating} label="Avg Rating" />
          <StatChip icon="🔖" value={stats.watchlist} label="In Watchlist" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 p-1 bg-white/50 dark:bg-black/20 rounded-2xl backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-accent text-white shadow-lg shadow-accent/30" 
                  : "text-text-secondary hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-text-secondary">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nothing here yet, lokki amar 💕</p>
              </div>
            ) : (
              <>
                {activeTab === 'watchlist' && filteredItems.some(i => i.status === 'not_released') && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#FFB74D] flex items-center gap-2 px-1">
                      <Calendar className="w-5 h-5" /> Coming Soon 🗓️
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {filteredItems.filter(i => i.status === 'not_released').map(item => (
                        <WatchItemCard 
                          key={item.id} 
                          item={item} 
                          onUpdate={(updates) => handleUpdate(item.id, updates)}
                          onDelete={() => handleDelete(item.id)}
                          onEdit={() => { setEditingItem(item); setIsAdding(true); }}
                          onClick={() => setSelectedItem(item)}
                        />
                      ))}
                    </div>
                    {filteredItems.some(i => i.status === 'want_to_watch') && (
                      <h3 className="text-lg font-bold text-accent flex items-center gap-2 px-1 pt-4">
                        <Bookmark className="w-5 h-5" /> Ready to Watch
                      </h3>
                    )}
                  </div>
                )}
                
                <div className={cn(
                  "grid gap-4",
                  (activeTab === 'watchlist' || activeTab === 'watched' || activeTab === 'favorites') 
                    ? "grid-cols-2" 
                    : "grid-cols-1"
                )}>
                  {filteredItems
                    .filter(item => activeTab === 'watchlist' ? item.status === 'want_to_watch' : true)
                    .map(item => (
                      activeTab === 'watching' ? (
                        <WatchingItemCard 
                          key={item.id} 
                          item={item} 
                          onUpdate={(updates) => handleUpdate(item.id, updates)}
                          onClick={() => setSelectedItem(item)}
                        />
                      ) : (
                        <WatchItemCard 
                          key={item.id} 
                          item={item} 
                          onUpdate={(updates) => handleUpdate(item.id, updates)}
                          onDelete={() => handleDelete(item.id)}
                          onEdit={() => { setEditingItem(item); setIsAdding(true); }}
                          onClick={() => setSelectedItem(item)}
                        />
                      )
                    ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingItem(null); setIsAdding(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-xl shadow-accent/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AnimatePresence>
        {isAdding && (
          <AddWatchItemSheet 
            item={editingItem}
            onClose={() => { setIsAdding(false); setEditingItem(null); }}
            onSave={handleSave}
          />
        )}
        {selectedItem && (
          <WatchItemDetail
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={(updates) => handleUpdate(selectedItem.id, updates)}
            onEdit={() => { setEditingItem(selectedItem); setIsAdding(true); setSelectedItem(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatChip = ({ icon, value, label }: { icon: string, value: string | number, label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-plum-card rounded-full shadow-sm border border-accent/10 whitespace-nowrap">
    <span className="text-lg">{icon}</span>
    <div className="flex flex-col">
      <span className="text-sm font-black text-accent dark:text-accent-light leading-none">{value}</span>
      <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">{label}</span>
    </div>
  </div>
);
