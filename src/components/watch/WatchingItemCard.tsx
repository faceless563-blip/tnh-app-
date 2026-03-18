import React from 'react';
import { motion } from 'motion/react';
import { Film, Tv, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WatchItem } from './types';

interface WatchingItemCardProps {
  item: WatchItem;
  onUpdate: (updates: Partial<WatchItem>) => void;
  onClick: () => void;
}

export const WatchingItemCard: React.FC<WatchingItemCardProps> = ({ item, onUpdate, onClick }) => {
  const isSeries = item.type === 'series';
  const progress = isSeries && item.episodesTotal 
    ? Math.min(100, Math.max(0, ((item.currentEpisode || 0) / item.episodesTotal) * 100))
    : 0;

  const handleIncrementEpisode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSeries) return;
    
    const nextEp = (item.currentEpisode || 0) + 1;
    const updates: Partial<WatchItem> = { currentEpisode: nextEp };
    
    if (item.episodesTotal && nextEp >= item.episodesTotal) {
      if (item.seasonsTotal && (item.currentSeason || 1) < item.seasonsTotal) {
        // Season complete
        updates.currentSeason = (item.currentSeason || 1) + 1;
        updates.currentEpisode = 1;
      } else {
        // Series complete
        updates.status = 'finished';
        updates.dateFinished = new Date().toISOString();
      }
    }
    onUpdate(updates);
  };

  const handleFinishMovie = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ status: 'finished', dateFinished: new Date().toISOString() });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className="bg-white dark:bg-plum-card rounded-3xl p-4 shadow-md border border-rose-gold/10 dark:border-white/5 flex gap-4 cursor-pointer group"
    >
      {/* Poster */}
      <div className="w-24 h-36 rounded-2xl overflow-hidden bg-rose-card dark:bg-deep-plum flex-shrink-0 relative shadow-inner">
        {item.posterImage ? (
          <img src={item.posterImage} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary dark:text-text-primary">
            {isSeries ? <Tv className="w-8 h-8" /> : <Film className="w-8 h-8" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif text-2xl font-bold text-text-primary dark:text-text-dark-primary leading-tight line-clamp-2">
              {item.title}
            </h3>
            <span className="px-2 py-1 bg-rose-card dark:bg-deep-plum rounded-md text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              {isSeries ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
              {item.type}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
              {item.platform}
            </span>
            {item.genres?.[0] && (
              <span className="px-2 py-0.5 bg-rose-card dark:bg-deep-plum text-text-secondary rounded-full text-[10px] font-bold">
                {item.genres[0]}
              </span>
            )}
          </div>
        </div>

        {/* Progress / Actions */}
        {isSeries ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-text-primary dark:text-text-secondary">
              <span>S{item.currentSeason || 1} • Ep {item.currentEpisode || 0}</span>
              {item.episodesTotal && <span>of {item.episodesTotal}</span>}
            </div>
            
            <div className="h-2 w-full bg-rose-card dark:bg-deep-plum rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <div className="flex justify-end pt-1">
              <button
                onClick={handleIncrementEpisode}
                className="px-4 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Ep 📺
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between mt-auto">
            <span className="text-xs font-medium text-text-secondary">
              Started: {new Date(item.dateStarted || item.dateAdded).toLocaleDateString()}
            </span>
            <button
              onClick={handleFinishMovie}
              className="px-4 py-2 bg-accent text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md shadow-accent/20 hover:scale-105 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" /> Finished!
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
