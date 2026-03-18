export interface UserProfile {
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
}

export interface BettingHouse {
  id: string;
  name: string;
  url: string;
  reminderTime?: string; // HH:mm
  createdAt: number;
  iconType?: 'lucide';
  iconValue?: string;
}

export interface ChecklistState {
  houses: BettingHouse[];
  completedToday: string[]; // Array of house IDs
  lastResetDate: string; // YYYY-MM-DD
  history: Record<string, string[]>; // houseId -> array of dates (YYYY-MM-DD)
  earnings: Record<string, Record<string, number>>; // date (YYYY-MM-DD) -> houseId -> amount
  spins: Record<string, Record<string, number>>; // date (YYYY-MM-DD) -> houseId -> amount
  globalReminderTime?: string; // HH:mm
  currentStreak: number;
  bestStreak: number;
  streakGoal?: number;
  userProfile?: UserProfile;
}
