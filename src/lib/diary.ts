import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildSeedDiary } from './seed';
import { dayKey, todayKey } from './types';
import type { Goals, Meal, Profile } from './types';

type DayMap = Record<string, Meal[]>;

type Flags = {
  notificationsEnabled: boolean;
  healthEnabled: boolean;
  liveActivityEnabled: boolean;
};

type DiaryState = {
  onboarded: boolean;
  goals: Goals;
  profile: Profile | null;
  days: DayMap;
  /** Camera/estimate logs consumed by a non-pro user */
  freeLogsUsed: number;
  /** Dev-only override that simulates an active Pro entitlement */
  proOverride: boolean;
  flags: Flags;

  addMeal: (meal: Meal, date?: string) => void;
  updateMeal: (date: string, mealId: string, patch: Partial<Meal>) => void;
  removeMeal: (date: string, mealId: string) => void;
  setGoals: (goals: Goals) => void;
  setProfile: (profile: Profile) => void;
  completeOnboarding: () => void;
  setProOverride: (v: boolean) => void;
  setFlag: <K extends keyof Flags>(key: K, value: Flags[K]) => void;
  bumpFreeLog: () => void;
  seed: () => void;
  resetAll: () => void;
};

const DEFAULT_GOALS: Goals = { calories: 2200, protein: 150, carbs: 250, fat: 70 };

const initialDays = () => buildSeedDiary(DEFAULT_GOALS.calories);

export const useDiary = create<DiaryState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      goals: DEFAULT_GOALS,
      profile: null,
      days: initialDays(),
      freeLogsUsed: 0,
      proOverride: false,
      flags: {
        notificationsEnabled: true,
        healthEnabled: true,
        liveActivityEnabled: true,
      },

      addMeal: (meal, date) => {
        const key = date ?? dayKey(new Date(meal.loggedAt));
        const days = { ...get().days };
        const list = [...(days[key] ?? []), meal].sort((a, b) =>
          a.loggedAt.localeCompare(b.loggedAt)
        );
        days[key] = list;
        set({ days });
      },

      updateMeal: (date, mealId, patch) => {
        const days = { ...get().days };
        days[date] = (days[date] ?? []).map((m) => (m.id === mealId ? { ...m, ...patch } : m));
        set({ days });
      },

      removeMeal: (date, mealId) => {
        const days = { ...get().days };
        days[date] = (days[date] ?? []).filter((m) => m.id !== mealId);
        set({ days });
      },

      setGoals: (goals) => set({ goals }),
      setProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ onboarded: true }),
      setProOverride: (v) => set({ proOverride: v }),
      setFlag: (key, value) => set({ flags: { ...get().flags, [key]: value } }),
      bumpFreeLog: () => set({ freeLogsUsed: get().freeLogsUsed + 1 }),

      seed: () => set({ days: buildSeedDiary(get().goals.calories) }),

      resetAll: () =>
        set({
          onboarded: false,
          goals: DEFAULT_GOALS,
          profile: null,
          days: initialDays(),
          freeLogsUsed: 0,
          proOverride: false,
          flags: { notificationsEnabled: true, healthEnabled: true, liveActivityEnabled: true },
        }),
    }),
    {
      name: 'vitals-diary-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Selectors */
export const mealsForDay = (state: DiaryState, date?: string): Meal[] => {
  const key = date ?? todayKey();
  return state.days[key] ?? [];
};

/** Non-persisted store for the photo → analysis draft flow */
type DraftState = {
  photoUri: string | null;
  items: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }[];
  source: 'ai' | 'demo';
  analyzing: boolean;
  setDraft: (d: Partial<Pick<DraftState, 'photoUri' | 'items' | 'source'>>) => void;
  setAnalyzing: (v: boolean) => void;
  clear: () => void;
};

export const useDraft = create<DraftState>()((set) => ({
  photoUri: null,
  items: [],
  source: 'demo',
  analyzing: false,
  setDraft: (d) => set(d),
  setAnalyzing: (analyzing) => set({ analyzing }),
  clear: () => set({ photoUri: null, items: [], source: 'demo', analyzing: false }),
}));
