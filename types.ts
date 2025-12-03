export const PetStage = {
  EGG: 1,
  CRACKED_EGG: 2,
  BABY: 3,
  YOUNG: 4,
  ADULT: 5,
} as const;

export type PetStage = typeof PetStage[keyof typeof PetStage];

export interface Pet {
  id: string;
  name: string;
  stage: PetStage;
  currentXP: number; // XP specific to this pet (0-500)
  type: string; // e.g., 'Owl', 'Cat', 'Dragon' - assigned at birth
  birthDate: string;
  completedDate?: string;
}

export interface User {
  totalXP: number; // Cumulative XP forever
  level: number; // Player level
  name: string;
}

export interface ActivityRecord {
  id: string;
  type: 'STUDY' | 'ACTIVITY';
  label: string; // Task name or Activity name
  duration?: number; // Minutes (for study)
  xpEarned: number;
  timestamp: string;
  isPublic: boolean; // For the classroom feed
}

export interface DailyTracking {
  date: string; // YYYY-MM-DD
  activityCount: number; // Max 5 per day
}

export const XP_PER_LEVEL = 100;
export const MAX_PET_LEVEL = 5;
export const DAILY_ACTIVITY_LIMIT = 5;
export const ACTIVITY_XP_REWARD = 5;
export const STUDY_XP_REWARD_CHUNK = 10; // Per 30 mins