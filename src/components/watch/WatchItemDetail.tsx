import React from 'react';
import { motion } from 'motion/react';
import { X, Film, Tv, Star, Heart, Share2, Edit3, Calendar, MessageSquare, User, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WatchItem } from './types';

interface WatchItemDetailProps {
  item: WatchItem;
  onClose: () => void;
  onUpdate: (updates: Partial<WatchItem>) => void;
  onEdit: () => void;
}

export const WatchItemDetail: React.FC<WatchItemDetailProps> = ({ item, onClose, onUpdate, onEdit }) => {
  const isMovie = item.type === 'movie';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full h-[95vh] bg-white dark:bg-deep-plum rounded-t-[40px] flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* Header Actions */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button onClick={onEdit} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <Edit3 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Poster */}
        <div className="h-[40vh] relative flex-shrink-0 bg-deep-plum">
          {item.posterImage ? (
            <img src={item.posterImage} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-primary">
              {isMovie ? <Film className="w-24 h-24" /> : <Tv className="w-24 h-24" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-deep-plum via-black/40 to-black/20" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-accent/80 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider">
                {item.type}
              </span>
              <button
                onClick={() => onUpdate({ isFavorite: !item.isFavorite })}
                className="p-1.5 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-accent/80 transition-colors"
              >
                <Heart className={cn("w-5 h-5", item.isFavorite && "fill-accent text-accent")} />
              </button>
            </div>
            <h1 className="text-4xl font-dancing font-bold text-white drop-shadow-lg leading-tight">
              {item.title}
            </h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-deep-plum">
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-rose-card dark:bg-plum-card text-text-primary dark:text-text-secondary rounded-2xl text-sm font-bold">
              {item.platform}
            </span>
            <span className="px-4 py-2 bg-rose-card dark:bg-plum-card text-text-primary dark:text-text-secondary rounded-2xl text-sm font-bold">
              {item.language}
            </span>
            {item.genres?.map(g => (
              <span key={g} className="px-4 py-2 bg-accent/5 text-accent rounded-2xl text-sm font-bold border border-accent/10">
                {g}
              </span>
            ))}
          </div>

          {/* Status & Progress */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-card to-rose-card/80 dark:from-plum-card dark:to-deep-plum border border-rose-gold/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-secondary uppercase tracking-widest text-xs">Status</h3>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                item.status === 'finished' ? "bg-green-100 text-green-700" :
                item.status === 'watching' ? "bg-rose-gold/20 text-rose-700" :
                item.status === 'want_to_watch' ? "bg-purple-100 text-purple-700" :
                "bg-rose-gold/20 text-text-primary"
              )}>
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {!isMovie && item.status === 'watching' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-text-primary dark:text-text-secondary">
                  <span>Season {item.currentSeason || 1}</span>
                  <span>Episode {item.currentEpisode || 0} {item.episodesTotal ? `of ${item.episodesTotal}` : ''}</span>
                </div>
                <div className="h-3 w-full bg-rose-gold/20 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.episodesTotal ? Math.min(100, Math.max(0, ((item.currentEpisode || 0) / item.episodesTotal) * 100)) : 0}%` }}
                  />
                </div>
              </div>
            )}

            {item.status === 'finished' && item.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={cn(
                      "w-6 h-6",
                      item.rating! >= star ? "fill-accent text-accent" : "text-text-secondary dark:text-text-primary"
                    )} />
                  ))}
                </div>
                <span className="font-bold text-text-secondary">{item.rating}/5</span>
              </div>
            )}
          </div>

          {/* Review */}
          {item.review && (
            <div className="space-y-3">
              <h3 className="font-bold text-accent flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Tanha's Thoughts 💭
              </h3>
              <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10 relative">
                <span className="absolute top-4 left-4 text-4xl text-accent/20 font-serif leading-none">"</span>
                <p className="text-text-primary dark:text-text-secondary leading-relaxed relative z-10 pt-2 italic">
                  {item.review}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {item.recommendedBy && (
              <div className="p-4 rounded-2xl bg-rose-card dark:bg-plum-card border border-rose-gold/10 dark:border-white/10">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Recommended By</span>
                </div>
                <p className="font-medium text-text-primary dark:text-text-secondary">{item.recommendedBy}</p>
              </div>
            )}
            
            {item.wouldRewatch && (
              <div className="p-4 rounded-2xl bg-rose-card dark:bg-plum-card border border-rose-gold/10 dark:border-white/10">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <Film className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Would Rewatch?</span>
                </div>
                <p className="font-medium text-text-primary dark:text-text-secondary capitalize">
                  {item.wouldRewatch === 'yes' ? 'Yes 🔁' : item.wouldRewatch === 'maybe' ? 'Maybe 🤔' : 'No ❌'}
                </p>
              </div>
            )}

            {item.dateStarted && (
              <div className="p-4 rounded-2xl bg-rose-card dark:bg-plum-card border border-rose-gold/10 dark:border-white/10">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Started</span>
                </div>
                <p className="font-medium text-text-primary dark:text-text-secondary">
                  {new Date(item.dateStarted).toLocaleDateString()}
                </p>
              </div>
            )}

            {item.dateFinished && (
              <div className="p-4 rounded-2xl bg-rose-card dark:bg-plum-card border border-rose-gold/10 dark:border-white/10">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Finished</span>
                </div>
                <p className="font-medium text-text-primary dark:text-text-secondary">
                  {new Date(item.dateFinished).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Private Notes */}
          {item.personalNotes && (
            <div className="p-6 rounded-3xl bg-deep-plum text-text-secondary border border-white/5">
              <h3 className="font-bold text-text-secondary flex items-center gap-2 mb-3 text-sm">
                <Lock className="w-4 h-4" /> Private Notes
              </h3>
              <p className="text-sm leading-relaxed">{item.personalNotes}</p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
