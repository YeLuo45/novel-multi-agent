export type NovelStage = 'intake' | 'bible' | 'outline' | 'draft' | 'critique' | 'revision' | 'memory' | 'completed';

export type SourceMode = 'theme' | 'continuation';

export interface NovelInput {
  mode: SourceMode;
  theme?: string;
  existingText?: string;
  targetChapters: number;
  targetWords: number;
  language: 'zh-CN' | 'en';
}

export interface StoryBible {
  premise: string;
  genre: string;
  tone: string;
  worldRules: string[];
  characters: string[];
  promises: string[];
}

export interface ChapterCard {
  number: number;
  title: string;
  purpose: string;
  conflict: string;
  foreshadowing: string[];
}

export interface DraftCard {
  chapterNumber: number;
  title: string;
  body: string;
  targetWords: number;
}

export interface CritiqueCard {
  continuity: string[];
  style: string[];
  revisionPlan: string[];
  accepted: boolean;
}

export interface NovelMemory {
  characters: Record<string, string>;
  foreshadowing: string[];
  chapterSummaries: string[];
  styleFingerprint: string[];
}

export interface AuditEntry {
  stage: NovelStage;
  agent: string;
  inputSummary: string;
  outputSummary: string;
  createdAt: string;
}

export interface NovelProject {
  id: string;
  title: string;
  stage: NovelStage;
  input: NovelInput;
  bible?: StoryBible;
  outline: ChapterCard[];
  draft?: DraftCard;
  critique?: CritiqueCard;
  revision?: DraftCard;
  memory: NovelMemory;
  auditLog: AuditEntry[];
}
