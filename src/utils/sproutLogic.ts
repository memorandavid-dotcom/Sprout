import type {
  DietaryRestriction,
  ExpenseEntry,
  FocusSession,
  MascotMood,
  MealAlarm,
  MealCheckIn,
  SmartMealOption,
  TimerStatus,
} from '../types/sprout';

export const OVERWORKED_THRESHOLD_SECONDS = 2 * 60 * 60; // 2 hours
export const BURNOUT_THRESHOLD_SECONDS = 4 * 60 * 60; // 4 hours

export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatStopwatch(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((val) => String(val).padStart(2, '0'))
    .join(':');
}

export function formatCompactDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours === 0) {
    if (minutes === 0 && safe > 0) {
      return `${safe}s`;
    }
    return `${minutes}m`;
  }
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatTime12h(time24: string): string {
  const [hourStr, minStr] = time24.split(':');
  const hourNum = Number(hourStr);
  if (Number.isNaN(hourNum) || !minStr) {
    return time24;
  }
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  return `${hour12}:${minStr} ${period}`;
}

export function formatCurrency(amount: number, symbol: string): string {
  const isNegative = amount < 0;
  const absFormatted = Math.abs(amount).toFixed(2);
  return `${isNegative ? '-' : ''}${symbol}${absFormatted}`;
}

export function getTotalFocusSecondsToday(
  sessions: FocusSession[],
  todayKey: string,
  activeSessionSeconds: number
): number {
  const completed = sessions
    .filter((s) => s.dateKey === todayKey)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return completed + Math.max(0, activeSessionSeconds);
}

export function getMealsLoggedTodayCount(
  checkIns: MealCheckIn[],
  expenses: ExpenseEntry[],
  todayKey: string
): number {
  const todayCheckIns = checkIns.filter((m) => m.dateKey === todayKey).length;
  // Expenses logged directly without creating a duplicate check-in also count
  const standaloneExpenses = expenses.filter(
    (e) =>
      e.dateKey === todayKey &&
      !checkIns.some((m) => m.dateKey === todayKey && m.name === e.mealName && m.source === 'budget')
  ).length;
  return todayCheckIns + standaloneExpenses;
}

export function shouldTriggerBurnoutAlert(
  totalFocusSecondsToday: number,
  mealsLoggedToday: number
): boolean {
  return totalFocusSecondsToday >= BURNOUT_THRESHOLD_SECONDS && mealsLoggedToday === 0;
}

export interface MascotPresentation {
  mood: MascotMood;
  statusLabel: string;
  message: string;
  hint: string;
}

export function getMascotState(params: {
  timerStatus: TimerStatus;
  currentSessionSeconds: number;
  totalFocusSecondsToday: number;
  mealsLoggedToday: number;
  hydrationCupsToday: number;
  justHydrated: boolean;
  activeMealAlarmLabel: string | null;
  overrideMood: MascotMood | null;
}): MascotPresentation {
  const effectiveMood: MascotMood =
    params.overrideMood ??
    resolveAutoMood({
      timerStatus: params.timerStatus,
      currentSessionSeconds: params.currentSessionSeconds,
      totalFocusSecondsToday: params.totalFocusSecondsToday,
      mealsLoggedToday: params.mealsLoggedToday,
      justHydrated: params.justHydrated,
      activeMealAlarmLabel: params.activeMealAlarmLabel,
    });

  switch (effectiveMood) {
    case 'meal_alarm':
      return {
        mood: 'meal_alarm',
        statusLabel: 'Meal Check-In',
        message: params.activeMealAlarmLabel
          ? `It's time for ${params.activeMealAlarmLabel}! Pause your timer and nourish yourself.`
          : 'Meal alarm! Pause your work and grab a planned bite.',
        hint: 'Eating on schedule keeps energy steady and avoids late-night overspending.',
      };
    case 'burnout':
      return {
        mood: 'burnout',
        statusLabel: 'Fuel Needed',
        message:
          "You've been locked in for 4+ hours without logging a meal. Eat a planned meal soon before extreme hunger kicks in.",
        hint: 'Skipping meals often leads to binge eating and impulse delivery spending.',
      };
    case 'overworked':
      return {
        mood: 'overworked',
        statusLabel: 'Break Recommended',
        message:
          "Whoa, you've been locked in a while! Time for a quick stretch and water break.",
        hint: 'A 5-minute stand-up and sip of water resets focus.',
      };
    case 'hydrated':
      return {
        mood: 'hydrated',
        statusLabel: 'Hydrated & Steady',
        message: `Nice sip! ${params.hydrationCupsToday} cup${
          params.hydrationCupsToday === 1 ? '' : 's'
        } logged today—your focus is looking sharp.`,
        hint: 'Keep a glass nearby while you finish this block.',
      };
    case 'active':
      return {
        mood: 'active',
        statusLabel: 'Locked In',
        message: "You're doing great! Remember to sip water.",
        hint: 'I will gently chirp when it is time for water or a meal.',
      };
    case 'idle':
    default:
      return {
        mood: 'idle',
        statusLabel: 'Ready',
        message: 'Ready to lock in?',
        hint: 'Start your timer when you begin studying—I will watch the clock for water and meals.',
      };
  }
}

function resolveAutoMood(params: {
  timerStatus: TimerStatus;
  currentSessionSeconds: number;
  totalFocusSecondsToday: number;
  mealsLoggedToday: number;
  justHydrated: boolean;
  activeMealAlarmLabel: string | null;
}): MascotMood {
  if (params.activeMealAlarmLabel) {
    return 'meal_alarm';
  }
  if (shouldTriggerBurnoutAlert(params.totalFocusSecondsToday, params.mealsLoggedToday)) {
    return 'burnout';
  }
  if (params.currentSessionSeconds >= OVERWORKED_THRESHOLD_SECONDS) {
    return 'overworked';
  }
  if (params.justHydrated) {
    return 'hydrated';
  }
  if (params.timerStatus === 'running') {
    return 'active';
  }
  return 'idle';
}

export interface BudgetStatusSummary {
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  status: 'under' | 'close' | 'overspent';
  statusLabel: string;
}

export function calculateBudgetStatus(
  dailyBudget: number,
  expenses: ExpenseEntry[],
  todayKey: string
): BudgetStatusSummary {
  const safeBudget = Math.max(0, dailyBudget);
  const totalSpent = expenses
    .filter((e) => e.dateKey === todayKey)
    .reduce((sum, e) => sum + e.cost, 0);
  const remaining = safeBudget - totalSpent;
  const percentUsed = safeBudget > 0 ? Math.min(150, (totalSpent / safeBudget) * 100) : totalSpent > 0 ? 150 : 0;

  let status: 'under' | 'close' | 'overspent' = 'under';
  let statusLabel = 'Under budget';

  if (totalSpent > safeBudget) {
    status = 'overspent';
    statusLabel = 'Over daily cap';
  } else if (safeBudget > 0 && totalSpent / safeBudget >= 0.75) {
    status = 'close';
    statusLabel = 'Approaching cap';
  }

  return {
    totalSpent,
    remaining,
    percentUsed,
    status,
    statusLabel,
  };
}

export interface WellnessSpendingInsights {
  plannedTotal: number;
  impulseTotal: number;
  plannedCount: number;
  impulseCount: number;
  breakDayAvgSpend: number;
  nonBreakDayAvgSpend: number;
  impulseOnBreakSessionsPercent: number;
  summaryText: string;
}

export function calculateWellnessInsights(
  sessions: FocusSession[],
  expenses: ExpenseEntry[]
): WellnessSpendingInsights {
  const planned = expenses.filter((e) => e.type === 'planned');
  const impulse = expenses.filter((e) => e.type === 'impulse');

  const plannedTotal = planned.reduce((sum, e) => sum + e.cost, 0);
  const impulseTotal = impulse.reduce((sum, e) => sum + e.cost, 0);

  // Group expenses by dateKey and compare days where user took breaks vs skipped breaks
  const dateBreakMap = new Map<string, boolean>();
  for (const s of sessions) {
    const prev = dateBreakMap.get(s.dateKey);
    if (prev === undefined) {
      dateBreakMap.set(s.dateKey, s.tookBreak);
    } else {
      dateBreakMap.set(s.dateKey, prev && s.tookBreak);
    }
  }

  const spendByDate = new Map<string, number>();
  for (const e of expenses) {
    spendByDate.set(e.dateKey, (spendByDate.get(e.dateKey) ?? 0) + e.cost);
  }

  let breakSpendSum = 0;
  let breakDayCount = 0;
  let nonBreakSpendSum = 0;
  let nonBreakDayCount = 0;

  for (const [dateKey, total] of spendByDate.entries()) {
    const tookBreak = dateBreakMap.get(dateKey);
    if (tookBreak === false) {
      nonBreakSpendSum += total;
      nonBreakDayCount += 1;
    } else {
      breakSpendSum += total;
      breakDayCount += 1;
    }
  }

  const breakDayAvgSpend = breakDayCount > 0 ? breakSpendSum / breakDayCount : 0;
  const nonBreakDayAvgSpend = nonBreakDayCount > 0 ? nonBreakSpendSum / nonBreakDayCount : 0;

  const totalImpulseCount = impulse.length;
  const impulseWithoutBreak = impulse.filter((e) => !e.hadScheduledBreak).length;
  const impulseOnBreakSessionsPercent =
    totalImpulseCount > 0 ? Math.round((impulseWithoutBreak / totalImpulseCount) * 100) : 0;

  let summaryText =
    'Log planned meals alongside scheduled focus breaks to see your break-to-spending pattern.';
  if (nonBreakDayCount > 0 && breakDayCount > 0 && nonBreakDayAvgSpend > breakDayAvgSpend) {
    const diffPct = Math.round(((nonBreakDayAvgSpend - breakDayAvgSpend) / nonBreakDayAvgSpend) * 100);
    summaryText = `Days with scheduled focus breaks averaged ${diffPct}% lower food spending than marathon days without breaks.`;
  } else if (impulse.length > 0) {
    summaryText = `${impulseOnBreakSessionsPercent}% of impulse purchases happened after skipped breaks or late meal check-ins.`;
  } else if (planned.length > 0) {
    summaryText = 'All logged meals so far are planned—scheduled meal alarms are keeping impulse spending at zero.';
  }

  return {
    plannedTotal,
    impulseTotal,
    plannedCount: planned.length,
    impulseCount: impulse.length,
    breakDayAvgSpend,
    nonBreakDayAvgSpend,
    impulseOnBreakSessionsPercent,
    summaryText,
  };
}

export function filterSmartMeals(
  catalog: SmartMealOption[],
  remainingBudget: number,
  restrictions: DietaryRestriction[],
  currencyMultiplier: number = 1
): SmartMealOption[] {
  const activeRestrictions = restrictions.filter((r) => r !== 'No Restrictions');

  return catalog.filter((meal) => {
    const convertedPrice = meal.priceUsd * currencyMultiplier;
    if (convertedPrice > remainingBudget + 0.001) {
      return false;
    }
    return activeRestrictions.every((restriction) =>
      meal.compatibleWith.includes(restriction)
    );
  });
}

export function getCurrencyMultiplier(symbol: string): number {
  switch (symbol) {
    case '₱':
      return 56;
    case '¥':
      return 150;
    case '€':
      return 0.92;
    case '£':
      return 0.79;
    case '$':
    default:
      return 1;
  }
}

export function findDueMealAlarm(
  alarms: MealAlarm[],
  currentHHMM: string,
  dismissedTodayIds: string[]
): MealAlarm | null {
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    if (dismissedTodayIds.includes(alarm.id)) continue;
    if (alarm.time === currentHHMM) {
      return alarm;
    }
  }
  return null;
}

export function sanitizeDietarySelection(
  current: DietaryRestriction[],
  toggled: DietaryRestriction
): DietaryRestriction[] {
  if (toggled === 'No Restrictions') {
    return ['No Restrictions'];
  }
  const withoutNone = current.filter((item) => item !== 'No Restrictions');
  const exists = withoutNone.includes(toggled);
  const next = exists
    ? withoutNone.filter((item) => item !== toggled)
    : [...withoutNone, toggled];

  return next.length === 0 ? ['No Restrictions'] : next;
}
