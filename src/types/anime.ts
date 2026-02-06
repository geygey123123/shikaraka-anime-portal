// Anime-related types from Shikimori API

export interface AnimeImage {
  original: string;
  preview: string;
  x96: string;
  x48: string;
}

export interface AnimeGenre {
  id: number;
  name: string;
  russian: string;
  kind: string;
}

export interface AnimeStudio {
  id: number;
  name: string;
  filtered_name: string;
  real: boolean;
  image: string | null;
}

export interface Anime {
  id: number;
  name: string;
  russian: string;
  image: AnimeImage;
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string;
  released_on: string | null;
  rating: string;
  english: string[];
  japanese: string[];
  synonyms: string[];
  license_name_ru: string | null;
  duration: number;
  description: string;
  description_html: string;
  description_source: string | null;
  franchise: string | null;
  favoured: boolean;
  thread_id: number;
  topic_id: number;
  myanimelist_id: number;
  rates_scores_stats: Array<{ name: number; value: number }>;
  rates_statuses_stats: Array<{ name: string; value: number }>;
  updated_at: string;
  next_episode_at: string | null;
  genres: AnimeGenre[];
  studios: AnimeStudio[];
}

// User and authentication types

export interface User {
  id: string;
  email: string;
  user_metadata: {
    username?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  shikimori_id: number;
  anime_name: string;
  added_at: string;
}
