export interface WatchItem {
  id: string;
  type: 'movie' | 'series';
  title: string;
  posterImage: string | null;
  genres: string[];
  language: string;
  platform: string;
  status: 'want_to_watch' | 'watching' | 'finished' | 'on_hold' | 'dropped';
  seasonsTotal?: number;
  episodesTotal?: number;
  currentSeason?: number;
  currentEpisode?: number;
  rating?: number; // 0.5 to 5.0
  review?: string;
  recommendedBy?: string;
  dateStarted?: string;
  dateFinished?: string;
  personalNotes?: string;
  wouldRewatch?: 'yes' | 'maybe' | 'no';
  isFavorite: boolean;
  dateAdded: string;
  isUrgent?: boolean;
}

export const GENRES = [
  'Romance 💕', 'Thriller 😱', 'Comedy 😂', 'Drama 🎭', 
  'Horror 👻', 'Action 💥', 'Sci-Fi 🚀', 'Fantasy 🧙', 
  'Animation 🎨', 'Documentary 🎙️', 'Mystery 🔍', 'Crime 🕵️', 
  'Historical 📜', 'K-Drama 🇰🇷', 'Bollywood 🎵', 'Hollywood 🌟', 
  'Turkish 🌙', 'Bengali 🌿'
];

export const LANGUAGES = [
  'Bangla 🇧🇩', 'English 🇬🇧', 'Hindi 🇮🇳', 'Korean 🇰🇷', 'Turkish 🇹🇷', 'Other 🌍'
];

export const PLATFORMS = [
  'Netflix', 'YouTube', 'Disney+', 'Hoichoi', 'Chorki', 
  'Amazon Prime', 'Downloaded', 'Cinema 🎭', 'Other'
];
