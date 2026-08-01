export type Macro = {
  protein: number;
  carbs: number;
  fat: number;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealSource = 'camera' | 'demo' | 'seed' | 'health';

export type Meal = {
  id: string;
  name: string;
  /** Short human description, e.g. "1 bowl · 220 g" */
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  /** ISO timestamp the meal was eaten/logged */
  loggedAt: string;
  /** Local uri of the photo, if any */
  photoUri?: string | null;
  source: MealSource;
  notes?: string;
};

export type Goals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Profile = {
  age: number;
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  activity: 'sedentary' | 'light' | 'moderate' | 'active';
};

/** What Gemini returns for one food item */
export type FoodEstimate = {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** 0..1 how confident the model is */
  confidence: number;
  /** 'ai' | 'demo' */
  source: 'ai' | 'demo';
};

export type AnalysisResult = {
  items: FoodEstimate[];
  /** e.g. the model used */
  model?: string;
};

/** Helper to key calendar days */
export const dayKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const todayKey = () => dayKey(new Date());

export const sumMacros = (meals: Meal[]): Macro =>
  meals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

export const sumCalories = (meals: Meal[]) =>
  meals.reduce((acc, m) => acc + m.calories, 0);
