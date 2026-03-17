import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, Tv, Image as ImageIcon, Star, Lock, Calendar, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WatchItem, GENRES, LANGUAGES, PLATFORMS } from './types';

interface AddWatchItemSheetProps {
  item: WatchItem | null;
  onClose: () => void;
  onSave: (item: WatchItem) => void;
}

export const AddWatchItemSheet: React.FC<AddWatchItemSheetProps> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<WatchItem>>({
    type: 'movie',
    status: 'want_to_watch',
    genres: [],
    language: 'English 🇬🇧',
    platform: 'Netflix',
    isFavorite: false,
    dateAdded: new Date().toISOString(),
    ...item
  });

  const [posterPreview, setPosterPreview] = useState<string | null>(item?.posterImage || null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
        setFormData({ ...formData, posterImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.title) return;
    
    const newItem: WatchItem = {
      id: item?.id || Date.now().toString(),
      type: formData.type as 'movie' | 'series',
      title: formData.title,
      posterImage: formData.posterImage || null,
      genres: formData.genres || [],
      language: formData.language || 'English 🇬🇧',
      platform: formData.platform || 'Netflix',
      status: formData.status as any,
      seasonsTotal: formData.seasonsTotal,
      episodesTotal: formData.episodesTotal,
      currentSeason: formData.currentSeason,
      currentEpisode: formData.currentEpisode,
      rating: formData.rating,
      review: formData.review,
      recommendedBy: formData.recommendedBy,
      dateStarted: formData.dateStarted,
      dateFinished: formData.dateFinished,
      personalNotes: formData.personalNotes,
      wouldRewatch: formData.wouldRewatch,
      isFavorite: formData.isFavorite || false,
      dateAdded: formData.dateAdded || new Date().toISOString(),
      isUrgent: formData.isUrgent
    };
    
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white dark:bg-deep-plum rounded-t-[32px] sm:rounded-[32px] h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-rose-gold/10 dark:border-white/5">
          <h2 className="text-2xl font-dancing text-accent dark:text-accent-light">
            {item ? 'Edit Entry 🎬' : 'Add to Watch World 💕'}
          </h2>
          <button onClick={onClose} className="p-2 bg-rose-card dark:bg-plum-card rounded-full text-text-secondary hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, type: 'movie' })}
              className={cn(
                "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                formData.type === 'movie' 
                  ? "border-accent bg-accent/5 text-accent" 
                  : "border-rose-gold/20 dark:border-white/10 text-text-secondary hover:border-accent/50"
              )}
            >
              <Film className="w-8 h-8" />
              <span className="font-bold text-lg">Movie 🎬</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'series' })}
              className={cn(
                "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                formData.type === 'series' 
                  ? "border-accent bg-accent/5 text-accent" 
                  : "border-rose-gold/20 dark:border-white/10 text-text-secondary hover:border-accent/50"
              )}
            >
              <Tv className="w-8 h-8" />
              <span className="font-bold text-lg">Series 📺</span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary dark:text-text-secondary">What's the title? 🎬</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title..."
              className="w-full p-4 bg-rose-card dark:bg-plum-card border border-rose-gold/20 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-lg font-medium"
            />
            {formData.title && !posterPreview && (
              <p className="text-xs text-accent font-medium animate-pulse">Tip: Add a poster image below 🖼️</p>
            )}
          </div>

          {/* Poster Image */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Poster Image 🖼️</label>
            <div className="flex gap-4 items-end">
              <div className="w-24 h-36 bg-rose-card dark:bg-plum-card rounded-xl overflow-hidden border border-rose-gold/20 dark:border-white/10 flex items-center justify-center relative group">
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-text-secondary" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-accent transition-colors">
                    <Plus className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-rose-card dark:bg-plum-card text-text-primary dark:text-text-secondary rounded-full text-sm font-bold hover:bg-rose-card/80 dark:hover:bg-white/10 transition-colors">
                  <ImageIcon className="w-4 h-4" />
                  Choose Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'want_to_watch', label: '🔖 Want to Watch' },
                { id: 'watching', label: '▶️ Currently Watching' },
                { id: 'finished', label: '✅ Finished' },
                { id: 'on_hold', label: '⏸️ On Hold' },
                { id: 'dropped', label: '❌ Dropped' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setFormData({ ...formData, status: s.id as any })}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all border",
                    formData.status === s.id
                      ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                      : "bg-white dark:bg-plum-card text-text-primary dark:text-text-secondary border-rose-gold/20 dark:border-white/10 hover:border-accent/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Series Specific Fields */}
          {formData.type === 'series' && (
            <div className="p-4 bg-rose-card dark:bg-plum-card rounded-2xl space-y-4 border border-rose-gold/10 dark:border-white/10">
              <h3 className="font-bold text-accent flex items-center gap-2">
                <Tv className="w-4 h-4" /> Episode Tracker
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Total Seasons</label>
                  <input type="number" value={formData.seasonsTotal || ''} onChange={e => setFormData({...formData, seasonsTotal: parseInt(e.target.value)})} className="w-full p-2 rounded-xl border border-rose-gold/20 dark:border-white/10 bg-white dark:bg-deep-plum" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Total Episodes</label>
                  <input type="number" value={formData.episodesTotal || ''} onChange={e => setFormData({...formData, episodesTotal: parseInt(e.target.value)})} className="w-full p-2 rounded-xl border border-rose-gold/20 dark:border-white/10 bg-white dark:bg-deep-plum" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Current Season</label>
                  <input type="number" value={formData.currentSeason || ''} onChange={e => setFormData({...formData, currentSeason: parseInt(e.target.value)})} className="w-full p-2 rounded-xl border border-rose-gold/20 dark:border-white/10 bg-white dark:bg-deep-plum" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Current Episode</label>
                  <input type="number" value={formData.currentEpisode || ''} onChange={e => setFormData({...formData, currentEpisode: parseInt(e.target.value)})} className="w-full p-2 rounded-xl border border-rose-gold/20 dark:border-white/10 bg-white dark:bg-deep-plum" />
                </div>
              </div>
            </div>
          )}

          {/* Genres */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Genres (Select multiple)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => {
                const isSelected = formData.genres?.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => {
                      const newGenres = isSelected 
                        ? formData.genres?.filter(x => x !== g)
                        : [...(formData.genres || []), g];
                      setFormData({ ...formData, genres: newGenres });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                      isSelected
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-white dark:bg-plum-card text-text-secondary border-rose-gold/20 dark:border-white/10 hover:bg-rose-card"
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Platform</label>
              <select 
                value={formData.platform}
                onChange={e => setFormData({ ...formData, platform: e.target.value })}
                className="w-full p-3 bg-rose-card dark:bg-plum-card border border-rose-gold/20 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-accent"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Language</label>
              <select 
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full p-3 bg-rose-card dark:bg-plum-card border border-rose-gold/20 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-accent"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Finished Specific Fields */}
          {formData.status === 'finished' && (
            <div className="p-6 bg-accent/5 dark:bg-accent/10 rounded-2xl space-y-6 border border-accent/20">
              <div className="space-y-2 text-center">
                <label className="text-sm font-bold text-accent">Your Rating ⭐</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={cn(
                        "w-8 h-8",
                        (formData.rating || 0) >= star 
                          ? "fill-accent text-accent" 
                          : "text-text-secondary dark:text-text-primary"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary dark:text-text-secondary">What did you think, Tanha? 💭</label>
                <textarea
                  value={formData.review || ''}
                  onChange={e => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Your honest thoughts... no spoilers (or all the spoilers) 🤭"
                  className="w-full p-4 bg-white dark:bg-deep-plum border border-rose-gold/20 dark:border-white/10 rounded-xl min-h-[100px] outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Would you rewatch it?</label>
                <div className="flex gap-2">
                  {[
                    { id: 'yes', label: 'Yes 🔁' },
                    { id: 'maybe', label: 'Maybe 🤔' },
                    { id: 'no', label: 'No ❌' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setFormData({ ...formData, wouldRewatch: r.id as any })}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-bold transition-all border",
                        formData.wouldRewatch === r.id
                          ? "bg-white dark:bg-plum-card border-accent text-accent shadow-sm"
                          : "bg-transparent border-transparent text-text-secondary hover:bg-white/50"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Optional Meta */}
          <div className="space-y-4 pt-4 border-t border-rose-gold/10 dark:border-white/5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-primary dark:text-text-secondary">Recommended by 💕</label>
              <input
                type="text"
                value={formData.recommendedBy || ''}
                onChange={e => setFormData({ ...formData, recommendedBy: e.target.value })}
                placeholder="e.g. My husband 💖, Best friend, TikTok 😂"
                className="w-full p-3 bg-rose-card dark:bg-plum-card border border-rose-gold/20 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-primary dark:text-text-secondary flex items-center gap-2">
                <Lock className="w-4 h-4" /> Private Notes 🔒
              </label>
              <textarea
                value={formData.personalNotes || ''}
                onChange={e => setFormData({ ...formData, personalNotes: e.target.value })}
                placeholder="Hidden from sharing..."
                className="w-full p-3 bg-rose-card dark:bg-plum-card border border-rose-gold/20 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-rose-gold/10 dark:border-white/5 bg-white dark:bg-deep-plum">
          <button
            onClick={handleSave}
            disabled={!formData.title}
            className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg shadow-lg shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            Add to Watch World 💕
          </button>
        </div>
      </motion.div>
    </div>
  );
};
