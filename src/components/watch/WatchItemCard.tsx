import React from 'react';
import { motion } from 'motion/react';
import { Film, Tv, Star, Flame, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WatchItem } from './types';

interface WatchItemCardProps {
  item: WatchItem;
  onUpdate: (updates: Partial<WatchItem>) => void;
  onDelete: () => void;
  onEdit: () => void;
  onClick: () => void;
}

export const WatchItemCard: React.FC<WatchItemCardProps> = ({ item, onUpdate, onDelete, onEdit, onClick }) => {
  const isMovie = item.type === 'movie';
  const addedDate = new Date(item.dateAdded);
  const daysAgo = Math.floor((Date.now() - addedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white dark:bg-plum-card rounded-2xl overflow-hidden shadow-md border border-rose-gold/10 dark:border-white/5 cursor-pointer group relative flex flex-col h-full"
    >
      {/* Poster Area */}
      <div className="aspect-[2/3] w-full bg-rose-card dark:bg-deep-plum relative">
        {item.posterImage ? (
          <img src={item.posterImage} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary dark:text-text-primary">
            {isMovie ? <Film className="w-12 h-12" /> : <Tv className="w-12 h-12" />}
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
              {isMovie ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
              {item.type}
            </span>
            {item.isUrgent && (
              <span className="px-2 py-1 bg-red-500/80 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                <Flame className="w-3 h-3" /> Urgent
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ isFavorite: !item.isFavorite }); }}
            className="p-1.5 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-accent/80 transition-colors"
          >
            <Heart className={cn("w-4 h-4", item.isFavorite && "fill-accent text-accent")} />
          </button>
        </div>

        {/* Bottom Info (over poster) */}
        <div className="absolute bottom-2 left-2 right-2">
          {item.status === 'finished' && item.rating && (
            <div className="flex items-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={cn(
                  "w-3 h-3",
                  item.rating! >= star ? "fill-accent text-accent" : "text-white/30"
                )} />
              ))}
            </div>
          )}
          <h3 className="text-white font-dancing text-xl leading-tight line-clamp-2 drop-shadow-md">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {item.genres?.[0] && (
            <span className="px-2 py-0.5 bg-rose-card dark:bg-deep-plum text-text-primary dark:text-text-secondary rounded-full text-[10px] font-bold">
              {item.genres[0]}
            </span>
          )}
          <span className="px-2 py-0.5 bg-rose-card dark:bg-deep-plum text-text-primary dark:text-text-secondary rounded-full text-[10px] font-bold">
            {item.language.split(' ')[0]}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-[10px] text-text-secondary font-medium">
          <span>{item.platform}</span>
          {item.status === 'want_to_watch' && (
            <span>Added {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}</span>
          )}
          {item.status === 'finished' && item.wouldRewatch === 'yes' && (
            <span className="text-accent font-bold">🔁 Rewatch</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
