import { dayKey } from './types';
import type { Meal, MealType } from './types';

type Template = {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const BREAKFAST: Template[] = [
  { name: 'Oatmeal with banana', quantity: '1 bowl · 260 g', calories: 352, protein: 12, carbs: 62, fat: 7 },
  { name: 'Greek yogurt & berries', quantity: '1 cup · 220 g', calories: 210, protein: 19, carbs: 28, fat: 4 },
  { name: 'Scrambled eggs & toast', quantity: '2 eggs + 1 slice', calories: 388, protein: 22, carbs: 27, fat: 22 },
  { name: 'Avocado toast', quantity: '1 slice · 140 g', calories: 422, protein: 11, carbs: 36, fat: 26 },
  { name: 'Berry smoothie', quantity: '1 glass · 350 ml', calories: 298, protein: 14, carbs: 48, fat: 6 },
  { name: 'Protein pancakes', quantity: '3 small · 190 g', calories: 430, protein: 28, carbs: 44, fat: 15 },
];

const LUNCH: Template[] = [
  { name: 'Grilled chicken salad', quantity: '1 plate · 420 g', calories: 485, protein: 43, carbs: 18, fat: 27 },
  { name: 'Turkey & avocado wrap', quantity: '1 wrap · 300 g', calories: 524, protein: 34, carbs: 52, fat: 19 },
  { name: 'Quinoa & roasted veg bowl', quantity: '1 bowl · 380 g', calories: 542, protein: 22, carbs: 72, fat: 16 },
  { name: 'Salmon & jasmine rice', quantity: '1 plate · 360 g', calories: 588, protein: 38, carbs: 55, fat: 21 },
  { name: 'Lentil & sweet potato soup', quantity: '1 bowl · 450 ml', calories: 376, protein: 18, carbs: 60, fat: 7 },
  { name: 'Chicken burrito bowl', quantity: '1 bowl · 460 g', calories: 610, protein: 40, carbs: 64, fat: 20 },
];

const DINNER: Template[] = [
  { name: 'Spaghetti bolognese', quantity: '1 plate · 480 g', calories: 724, protein: 34, carbs: 88, fat: 24 },
  { name: 'Steak & sweet potato', quantity: '1 plate · 380 g', calories: 612, protein: 46, carbs: 46, fat: 25 },
  { name: 'Chicken curry & basmati', quantity: '1 plate · 420 g', calories: 664, protein: 38, carbs: 74, fat: 23 },
  { name: 'Veggie stir-fry & noodles', quantity: '1 bowl · 400 g', calories: 452, protein: 16, carbs: 62, fat: 16 },
  { name: 'Margherita pizza', quantity: '2 slices · 220 g', calories: 534, protein: 22, carbs: 68, fat: 18 },
  { name: 'Beef tacos', quantity: '3 tacos · 330 g', calories: 690, protein: 38, carbs: 58, fat: 33 },
];

const SNACK: Template[] = [
  { name: 'Apple & peanut butter', quantity: '1 apple + 1 tbsp', calories: 190, protein: 6, carbs: 22, fat: 10 },
  { name: 'Protein shake', quantity: '1 shake · 300 ml', calories: 180, protein: 30, carbs: 6, fat: 3 },
  { name: 'Almonds', quantity: 'Handful · 28 g', calories: 170, protein: 6, carbs: 6, fat: 15 },
  { name: 'Cottage cheese & crackers', quantity: '1/2 cup + 4', calories: 150, protein: 16, carbs: 14, fat: 4 },
  { name: 'Dark chocolate', quantity: '2 squares · 20 g', calories: 120, protein: 2, carbs: 8, fat: 9 },
];

const POOLS: Record<MealType, Template[]> = {
  breakfast: BREAKFAST,
  lunch: LUNCH,
  dinner: DINNER,
  snack: SNACK,
};

/** Deterministic PRNG so seeded history is stable across launches */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MEAL_HOURS: Record<MealType, number[]> = {
  breakfast: [7, 8, 9],
  lunch: [12, 13],
  dinner: [19, 20],
  snack: [15, 16, 17],
};

const pick = <T,>(rand: () => number, arr: T[]): T => arr[Math.floor(rand() * arr.length)];

function buildMeal(template: Template, mealType: MealType, date: Date, source: 'seed' | 'demo', rand: () => number, idx: number): Meal {
  const hours = MEAL_HOURS[mealType];
  const h = hours[idx % hours.length];
  const when = new Date(date);
  when.setHours(h, Math.floor(rand() * 60), 0, 0);
  return {
    id: `meal-${source}-${dayKey(date)}-${mealType}-${idx}-${Math.floor(rand() * 1e6)}`,
    name: template.name,
    quantity: template.quantity,
    calories: template.calories,
    protein: template.protein,
    carbs: template.carbs,
    fat: template.fat,
    mealType,
    loggedAt: when.toISOString(),
    source,
  };
}

/** Number of days of history to seed (including today) */
const HISTORY_DAYS = 14;

/**
 * Builds a full diary for the previous `HISTORY_DAYS - 1` days plus today.
 * Today only gets breakfast + lunch so the user has room to keep logging.
 */
export function buildSeedDiary(goalCalories = 2200): Record<string, Meal[]> {
  const diary: Record<string, Meal[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = HISTORY_DAYS - 1; i >= 1; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const rand = mulberry32(dayKey(day).length * 7919 + day.getDate() * 31 + (day.getMonth() + 1) * 13);
    const target = Math.round(goalCalories * (0.86 + rand() * 0.28));
    const overDay = rand() > 0.82;

    const meals: Meal[] = [];
    let cal = 0;
    const order: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
    let idx = 0;
    for (const mealType of order) {
      if (meals.length >= 3 && rand() > 0.55) break;
      if (mealType === 'dinner' && !overDay && cal > target * 0.82) break;
      const t = pick(rand, POOLS[mealType]);
      if (cal + t.calories > target * 1.25) continue;
      meals.push(buildMeal(t, mealType, day, 'seed', rand, idx));
      idx += 1;
      cal += t.calories;
    }
    if (meals.length === 0) {
      meals.push(buildMeal(pick(rand, LUNCH), 'lunch', day, 'seed', rand, 0));
    }
    diary[dayKey(day)] = meals.sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
  }

  // Today — breakfast + lunch, eaten already.
  const rToday = mulberry32(Date.now() % 86400000 + 7);
  diary[dayKey(today)] = [
    buildMeal(pick(rToday, BREAKFAST), 'breakfast', today, 'seed', rToday, 0),
    buildMeal(pick(rToday, LUNCH), 'lunch', today, 'seed', rToday, 1),
  ].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));

  return diary;
}

/** A plausible sample analysis, used to demo the photo → estimate flow. */
export const DEMO_MEAL: Template = {
  name: 'Grilled chicken, rice & vegetables',
  quantity: '1 plate · 380 g',
  calories: 540,
  protein: 41,
  carbs: 58,
  fat: 16,
};
