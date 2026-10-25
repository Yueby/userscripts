export interface ReplyComment {
  id: string;
  text: string;
  createdAt: string;
  url: string;
}

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
  profileLoaded?: boolean;
  replyComments?: ReplyComment[];
}

export interface DrawUser extends User {
  hasRetweet?: boolean;
  hasLike?: boolean;
  hasQuote?: boolean;
  hasReply?: boolean;
}

export interface Filters {
  followed_by: boolean;
  retweet: boolean;
  like: boolean;
  quote: boolean;
  reply: boolean;
}

export type FilterKey = keyof Filters;

export interface DrawResult {
  success: boolean;
  winners?: DrawUser[];
  message?: string;
  count?: number;
}

export type InteractionSource = 'retweets' | 'likes' | 'quotes' | 'replies';

export interface InteractionData {
  retweets: User[];
  likes: User[];
  quotes: User[];
  replies: User[];
  failedSources: InteractionSource[];
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
