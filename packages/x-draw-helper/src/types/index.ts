export interface User {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  following: boolean;
  followed_by: boolean;
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

export type LangKey = 'en' | 'zh' | 'ja';

export type TranslationMap = Record<string, string>;
