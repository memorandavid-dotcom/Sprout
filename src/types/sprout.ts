export type TabId = 'home' | 'meals' | 'budget' | 'premium';

export type TimerStatus = 'idle' | 'running' | 'paused';

export type MascotMood =
  | 'idle'
  | 'active'
  | 'hydrated'
  | 'overworked'
  | 'burnout'
  | 'meal_alarm';

export type DietaryRestriction =
  | 'Vegetarian'
  | 'Vegan'
  | 'Halal'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Nut Allergy'
  | 'No Restrictions';

export type HealthGoal =
  | 'Prevent binge eating'
  | 'Stay energized'
  | 'Eat on a schedule'
  | 'Stay within food budget';

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FocusSession {
  id: string;
  label: string;
  durationSeconds: number;
  endedAt: string; // ISO string or readable timestamp
  dateKey: string; // YYYY-MM-DD
  tookBreak: boolean;
}

export interface DietaryProfile {
  isConfigured: boolean;
  restrictions: DietaryRestriction[];
  goals: HealthGoal[];
}

export interface MealAlarm {
  id: string;
  label: string;
  time: string; // HH:MM (24-hour)
  enabled: boolean;
  isCustom?: boolean;
}

export interface MealCheckIn {
  id: string;
  name: string;
  category: MealCategory;
  loggedAt: string;
  dateKey: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
  source: 'manual' | 'alarm' | 'scanner' | 'budget';
}

export interface BudgetSettings {
  currencySymbol: string;
  dailyBudget: number;
  perMealCap: number | null;
}

export interface ExpenseEntry {
  id: string;
  mealName: string;
  cost: number;
  category: MealCategory;
  type: 'planned' | 'impulse';
  loggedAt: string;
  dateKey: string;
  hadScheduledBreak: boolean;
}

export interface SmartMealOption {
  id: string;
  name: string;
  vendor: string;
  priceUsd: number;
  calories: number;
  proteinGrams: number;
  prepOrEta: string;
  channel: 'Nearby Spot' | 'Order via Delivery App';
  image: string;
  compatibleWith: Exclude<DietaryRestriction, 'No Restrictions'>[];
  description: string;
}

export interface ScannedMealPreset {
  id: string;
  name: string;
  image: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  fiberGrams: number;
  estimatedCostUsd: number;
  category: MealCategory;
  dietaryNotes: string;
}

export interface SproutAppState {
  todayKey: string;
  hydrationCupsToday: number;
  hydrationIntervalMinutes: number;
  focusSessions: FocusSession[];
  dietaryProfile: DietaryProfile;
  mealAlarms: MealAlarm[];
  mealCheckIns: MealCheckIn[];
  budgetSettings: BudgetSettings;
  expenses: ExpenseEntry[];
}
