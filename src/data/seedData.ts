import type {
  DietaryRestriction,
  HealthGoal,
  ScannedMealPreset,
  SmartMealOption,
  SproutAppState,
} from '../types/sprout';
import { getTodayDateKey } from '../utils/sproutLogic';

export const ALL_DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  'No Restrictions',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
];

export const ALL_HEALTH_GOALS: HealthGoal[] = [
  'Prevent binge eating',
  'Stay energized',
  'Eat on a schedule',
  'Stay within food budget',
];

export const CURRENCY_OPTIONS = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '₱', label: 'PHP (₱)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '¥', label: 'JPY (¥)' },
];

export function createInitialAppState(): SproutAppState {
  const today = new Date();
  const todayKey = getTodayDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = getTodayDateKey(yesterday);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoKey = getTodayDateKey(twoDaysAgo);

  return {
    todayKey,
    hydrationCupsToday: 2,
    hydrationIntervalMinutes: 45,
    focusSessions: [
      {
        id: 'seed-today-1',
        label: 'Morning Lecture Notes',
        durationSeconds: 2700, // 45m
        endedAt: '10:15 AM',
        dateKey: todayKey,
        tookBreak: true,
      },
      {
        id: 'seed-yest-1',
        label: 'Algorithms Problem Set',
        durationSeconds: 7800,
        endedAt: '8:30 PM',
        dateKey: yesterdayKey,
        tookBreak: false,
      },
      {
        id: 'seed-2d-1',
        label: 'Biology Lab Prep',
        durationSeconds: 5400,
        endedAt: '3:15 PM',
        dateKey: twoDaysAgoKey,
        tookBreak: true,
      },
    ],
    dietaryProfile: {
      isConfigured: true,
      restrictions: ['No Restrictions'],
      goals: ['Eat on a schedule', 'Stay energized'],
    },
    mealAlarms: [
      { id: 'alarm-breakfast', label: 'Breakfast', time: '08:00', enabled: true },
      { id: 'alarm-lunch', label: 'Lunch', time: '12:30', enabled: true },
      { id: 'alarm-snack', label: 'Afternoon Snack', time: '16:00', enabled: true },
      { id: 'alarm-dinner', label: 'Dinner', time: '19:30', enabled: true },
    ],
    mealCheckIns: [],
    budgetSettings: {
      currencySymbol: '$',
      dailyBudget: 20,
      perMealCap: 10,
    },
    expenses: [
      {
        id: 'exp-yest-1',
        mealName: 'Late Night Ramen Delivery',
        cost: 19.5,
        category: 'Dinner',
        type: 'impulse',
        loggedAt: '10:40 PM',
        dateKey: yesterdayKey,
        hadScheduledBreak: false,
      },
      {
        id: 'exp-yest-2',
        mealName: 'Campus Coffee & Pastry',
        cost: 7.25,
        category: 'Breakfast',
        type: 'impulse',
        loggedAt: '1:15 PM',
        dateKey: yesterdayKey,
        hadScheduledBreak: false,
      },
      {
        id: 'exp-2d-1',
        mealName: 'Homemade Grain Bowl',
        cost: 6.5,
        category: 'Lunch',
        type: 'planned',
        loggedAt: '12:35 PM',
        dateKey: twoDaysAgoKey,
        hadScheduledBreak: true,
      },
      {
        id: 'exp-2d-2',
        mealName: 'Chicken Rice Plate',
        cost: 8.75,
        category: 'Dinner',
        type: 'planned',
        loggedAt: '7:35 PM',
        dateKey: twoDaysAgoKey,
        hadScheduledBreak: true,
      },
    ],
  };
}

export const SCANNER_SAMPLE_MEALS: ScannedMealPreset[] = [
  {
    id: 'scan-avocado-bowl',
    name: 'Quinoa & Avocado Harvest Bowl',
    image: '/src/assets/images/meal_avocado_bowl_1795583388657.jpg',
    calories: 540,
    proteinGrams: 21,
    carbsGrams: 58,
    fatsGrams: 24,
    fiberGrams: 12,
    estimatedCostUsd: 9.5,
    category: 'Lunch',
    dietaryNotes: 'Plant-based · High fiber · Gluten-free',
  },
  {
    id: 'scan-salmon-bento',
    name: 'Salmon Teriyaki Bento',
    image: '/src/assets/images/meal_salmon_bento_1795583389162.jpg',
    calories: 620,
    proteinGrams: 36,
    carbsGrams: 64,
    fatsGrams: 20,
    fiberGrams: 5,
    estimatedCostUsd: 13.5,
    category: 'Dinner',
    dietaryNotes: 'Omega-3 rich · Dairy-free · Nut-free',
  },
  {
    id: 'scan-berry-parfait',
    name: 'Berry Chia Oat Parfait',
    image: '/src/assets/images/meal_matcha_parfait_1795583390563.jpg',
    calories: 380,
    proteinGrams: 16,
    carbsGrams: 49,
    fatsGrams: 11,
    fiberGrams: 9,
    estimatedCostUsd: 6.25,
    category: 'Breakfast',
    dietaryNotes: 'Vegetarian · Nut-free · Steady energy',
  },
  {
    id: 'scan-med-wrap',
    name: 'Mediterranean Hummus & Veg Wrap',
    image: '/src/assets/images/meal_mediterranean_wrap_1795583389735.jpg',
    calories: 470,
    proteinGrams: 18,
    carbsGrams: 52,
    fatsGrams: 19,
    fiberGrams: 8,
    estimatedCostUsd: 8.5,
    category: 'Lunch',
    dietaryNotes: 'Vegetarian · Halal · Nut-free',
  },
];

export const SMART_MEAL_CATALOG: SmartMealOption[] = [
  {
    id: 'smart-parfait',
    name: 'Berry Chia Oat Parfait',
    vendor: 'Campus Grounds Cafe',
    priceUsd: 6.25,
    calories: 380,
    proteinGrams: 16,
    prepOrEta: '5 min pickup',
    channel: 'Nearby Spot',
    image: '/src/assets/images/meal_matcha_parfait_1795583390563.jpg',
    compatibleWith: ['Vegetarian', 'Halal', 'Nut Allergy'],
    description: 'Rolled oats, Greek yogurt, blueberries, and chia seeds for slow-release focus.',
  },
  {
    id: 'smart-med-wrap',
    name: 'Mediterranean Hummus & Veg Wrap',
    vendor: 'Olive & Grain Kitchen',
    priceUsd: 8.5,
    calories: 470,
    proteinGrams: 18,
    prepOrEta: '10 min walk',
    channel: 'Nearby Spot',
    image: '/src/assets/images/meal_mediterranean_wrap_1795583389735.jpg',
    compatibleWith: ['Vegetarian', 'Vegan', 'Halal', 'Dairy-Free', 'Nut Allergy'],
    description: 'Warm flatbread filled with roasted peppers, crisp cucumber, herbs, and garlic hummus.',
  },
  {
    id: 'smart-avocado-bowl',
    name: 'Quinoa & Avocado Harvest Bowl',
    vendor: 'Sprout & Root Bowls',
    priceUsd: 9.75,
    calories: 540,
    proteinGrams: 21,
    prepOrEta: '18 min delivery',
    channel: 'Order via Delivery App',
    image: '/src/assets/images/meal_avocado_bowl_1795583388657.jpg',
    compatibleWith: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy'],
    description: 'Steamed quinoa, shelled edamame, roasted sweet potato, avocado, and toasted sesame.',
  },
  {
    id: 'smart-salmon-bento',
    name: 'Salmon Teriyaki Bento',
    vendor: 'Kibo Bento House',
    priceUsd: 13.5,
    calories: 620,
    proteinGrams: 36,
    prepOrEta: '22 min delivery',
    channel: 'Order via Delivery App',
    image: '/src/assets/images/meal_salmon_bento_1795583389162.jpg',
    compatibleWith: ['Halal', 'Dairy-Free', 'Nut Allergy'],
    description: 'Seared teriyaki salmon over steamed jasmine rice with broccoli and pickled ginger.',
  },
  {
    id: 'smart-edamame-cup',
    name: 'Warm Quinoa & Edamame Study Cup',
    vendor: 'Union Market Express',
    priceUsd: 5.5,
    calories: 320,
    proteinGrams: 15,
    prepOrEta: '4 min pickup',
    channel: 'Nearby Spot',
    image: '/src/assets/images/meal_avocado_bowl_1795583388657.jpg',
    compatibleWith: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy'],
    description: 'Compact protein-packed snack cup ideal between afternoon study blocks.',
  },
  {
    id: 'smart-gf-berry-jar',
    name: 'Dairy-Free Chia Berry Jar',
    vendor: 'Library Bistro',
    priceUsd: 6.95,
    calories: 340,
    proteinGrams: 12,
    prepOrEta: '12 min delivery',
    channel: 'Order via Delivery App',
    image: '/src/assets/images/meal_matcha_parfait_1795583390563.jpg',
    compatibleWith: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy'],
    description: 'Coconut-oat chia pudding layered with fresh blueberries and banana slices.',
  },
];
