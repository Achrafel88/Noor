import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Challenge {
  id: string;
  titleKey: string;
  type: 'quran' | 'tasbih' | 'morning_dua' | 'evening_dua';
  goal: number;
  current: number;
  completed: boolean;
}

interface ChallengeState {
  lastUpdated: string;
  dailyChallenges: Challenge[];
  completeChallenge: (id: string) => void;
  updateProgress: (type: Challenge['type'], amount: number) => void;
  resetDaily: () => void;
}

const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'c1', titleKey: 'challenge_quran', type: 'quran', goal: 5, current: 0, completed: false },
  { id: 'c2', titleKey: 'challenge_tasbih', type: 'tasbih', goal: 100, current: 0, completed: false },
  { id: 'c3', titleKey: 'challenge_dua', type: 'morning_dua', goal: 15, current: 0, completed: false },
  { id: 'c4', titleKey: 'challenge_evening_dua', type: 'evening_dua', goal: 15, current: 0, completed: false },
];

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      lastUpdated: new Date().toDateString(),
      dailyChallenges: DEFAULT_CHALLENGES,
      
      completeChallenge: (id) => set((state) => ({
        dailyChallenges: state.dailyChallenges.map(c => 
          c.id === id ? { ...c, completed: true, current: c.goal } : c
        )
      })),

      updateProgress: (type, amount) => set((state) => ({
        dailyChallenges: state.dailyChallenges.map(c => {
          if (c.type === type && !c.completed) {
            const nextVal = c.current + amount;
            return { 
              ...c, 
              current: Math.min(c.goal, nextVal),
              completed: nextVal >= c.goal 
            };
          }
          return c;
        })
      })),

      resetDaily: () => {
        const today = new Date().toDateString();
        if (get().lastUpdated !== today) {
          set({ 
            lastUpdated: today, 
            dailyChallenges: DEFAULT_CHALLENGES 
          });
        }
      }
    }),
    { name: 'ramadan-soul-challenges-v2' }
  )
);
