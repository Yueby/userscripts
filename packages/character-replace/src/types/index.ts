export interface CharacterMap {
  [key: string]: string;
}

export interface ReplacerConfig {
  targetTags?: string[];
  excludeTags?: string[];
}

export type ReplaceFunction = () => void;

