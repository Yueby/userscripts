export interface User {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  following: boolean;
  followed_by: boolean;
  followersCount: number;
  followingCount: number;
}

export interface DrawUser extends User {
  hasRetweet?: boolean;
  hasLike?: boolean;
  hasQuote?: boolean;
}

export interface Filters {
  followed_by: boolean;
  retweet: boolean;
  like: boolean;
  quote: boolean;
}

export type FilterKey = keyof Filters;

export interface DrawResult {
  success: boolean;
  winners?: DrawUser[];
  message?: string;
  count?: number;
}

export interface InteractionData {
  retweets: User[];
  likes: User[];
  quotes: User[];
}

export interface DrawHistoryEntry {
  id: string;
  tweetId: string;
  tweetUrl: string;
  winners: DrawUser[];
  filters: Filters;
  totalParticipants: number;
  timestamp: number;
  confirmed: boolean;
}

export type LangKey = 'en' | 'zh' | 'ja';

export type TranslationMap = Record<string, string>;
