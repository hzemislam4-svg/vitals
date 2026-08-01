import { Platform } from 'react-native';

import type { Profile } from './types';

const ACTIVITY_MULTIPLIER: Record<Profile['activity'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

/** Mifflin-St Jeor BMR */
export function bmr(profile: Profile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}

export function tdee(profile: Profile): number {
  return bmr(profile) * ACTIVITY_MULTIPLIER[profile.activity];
}

export function macroTargetsFromProfile(profile: Profile) {
  const calories = Math.round(tdee(profile));
  const protein = Math.round(profile.weightKg * (profile.activity === 'sedentary' ? 1.6 : 1.8));
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.round(Math.max(50, (calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

export const SEX_LABELS: Record<Profile['sex'], string> = { male: 'Male', female: 'Female' };

export const ACTIVITY_LABELS: Record<Profile['activity'], string> = {
  sedentary: 'Sedentary',
  light: 'Lightly active',
  moderate: 'Moderately active',
  active: 'Very active',
};

export const ACTIVITY_DESCRIPTIONS: Record<Profile['activity'], string> = {
  sedentary: 'Desk job, little exercise',
  light: 'Exercise 1–3 days a week',
  moderate: 'Exercise 3–5 days a week',
  active: 'Intense exercise 6–7 days a week',
};

export const isIOS = Platform.OS === 'ios';
