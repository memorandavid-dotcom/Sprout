import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BURNOUT_THRESHOLD_SECONDS,
  OVERWORKED_THRESHOLD_SECONDS,
  calculateBudgetStatus,
  calculateWellnessInsights,
  filterSmartMeals,
  findDueMealAlarm,
  formatCompactDuration,
  formatCurrency,
  formatStopwatch,
  getMascotState,
  getMealsLoggedTodayCount,
  getTotalFocusSecondsToday,
  sanitizeDietarySelection,
  shouldTriggerBurnoutAlert,
} from './sproutLogic';
import type { ExpenseEntry, FocusSession, MealAlarm, MealCheckIn, SmartMealOption } from '../types/sprout';

test('formatStopwatch and formatCompactDuration format accurately', () => {
  assert.equal(formatStopwatch(0), '00:00:00');
  assert.equal(formatStopwatch(65), '00:01:05');
  assert.equal(formatStopwatch(3661), '01:01:01');
  assert.equal(formatCompactDuration(0), '0m');
  assert.equal(formatCompactDuration(2700), '45m');
  assert.equal(formatCompactDuration(5400), '1h 30m');
});

test('formatCurrency handles positive and negative amounts', () => {
  assert.equal(formatCurrency(12.5, '$'), '$12.50');
  assert.equal(formatCurrency(-3.2, '₱'), '-₱3.20');
});

test('getTotalFocusSecondsToday sums only today sessions plus active seconds', () => {
  const sessions: FocusSession[] = [
    { id: '1', label: 'A', durationSeconds: 1800, endedAt: '2026-11-24T09:00:00', dateKey: '2026-11-24', tookBreak: true },
    { id: '2', label: 'B', durationSeconds: 3600, endedAt: '2026-11-23T10:00:00', dateKey: '2026-11-23', tookBreak: true },
  ];
  assert.equal(getTotalFocusSecondsToday(sessions, '2026-11-24', 300), 2100);
});

test('shouldTriggerBurnoutAlert triggers at 4+ hours with 0 meals logged today', () => {
  assert.equal(shouldTriggerBurnoutAlert(BURNOUT_THRESHOLD_SECONDS - 1, 0), false);
  assert.equal(shouldTriggerBurnoutAlert(BURNOUT_THRESHOLD_SECONDS, 0), true);
  assert.equal(shouldTriggerBurnoutAlert(BURNOUT_THRESHOLD_SECONDS + 500, 1), false);
});

test('getMascotState transitions across idle, active, hydrated, overworked, burnout, and meal alarm', () => {
  const base = {
    timerStatus: 'idle' as const,
    currentSessionSeconds: 0,
    totalFocusSecondsToday: 0,
    mealsLoggedToday: 1,
    hydrationCupsToday: 2,
    justHydrated: false,
    activeMealAlarmLabel: null,
    overrideMood: null,
  };

  assert.equal(getMascotState(base).mood, 'idle');
  assert.equal(getMascotState(base).message, 'Ready to lock in?');

  const active = getMascotState({ ...base, timerStatus: 'running', currentSessionSeconds: 300 });
  assert.equal(active.mood, 'active');

  const hydrated = getMascotState({ ...base, timerStatus: 'running', justHydrated: true });
  assert.equal(hydrated.mood, 'hydrated');

  const overworked = getMascotState({
    ...base,
    timerStatus: 'running',
    currentSessionSeconds: OVERWORKED_THRESHOLD_SECONDS,
  });
  assert.equal(overworked.mood, 'overworked');

  const burnout = getMascotState({
    ...base,
    timerStatus: 'running',
    totalFocusSecondsToday: BURNOUT_THRESHOLD_SECONDS,
    mealsLoggedToday: 0,
  });
  assert.equal(burnout.mood, 'burnout');

  const alarm = getMascotState({
    ...base,
    timerStatus: 'running',
    activeMealAlarmLabel: 'Lunch',
  });
  assert.equal(alarm.mood, 'meal_alarm');
});

test('calculateBudgetStatus identifies under, close, and overspent states', () => {
  const today = '2026-11-24';
  const mkExpense = (cost: number): ExpenseEntry => ({
    id: String(cost),
    mealName: 'Meal',
    cost,
    category: 'Lunch',
    type: 'planned',
    loggedAt: '12:00',
    dateKey: today,
    hadScheduledBreak: true,
  });

  assert.equal(calculateBudgetStatus(20, [mkExpense(10)], today).status, 'under');
  assert.equal(calculateBudgetStatus(20, [mkExpense(16)], today).status, 'close');
  const over = calculateBudgetStatus(20, [mkExpense(24)], today);
  assert.equal(over.status, 'overspent');
  assert.equal(over.remaining, -4);
});

test('filterSmartMeals enforces both remaining budget and dietary restrictions', () => {
  const catalog: SmartMealOption[] = [
    {
      id: 'bowl',
      name: 'Quinoa Avocado Bowl',
      vendor: 'Green Leaf',
      priceUsd: 9.5,
      calories: 520,
      proteinGrams: 19,
      prepOrEta: '15m',
      channel: 'Nearby Spot',
      image: '/a.jpg',
      compatibleWith: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy'],
      description: 'Fresh bowl',
    },
    {
      id: 'bento',
      name: 'Salmon Bento',
      vendor: 'Kibo',
      priceUsd: 13.5,
      calories: 610,
      proteinGrams: 34,
      prepOrEta: '20m',
      channel: 'Order via Delivery App',
      image: '/b.jpg',
      compatibleWith: ['Dairy-Free', 'Nut Allergy'],
      description: 'Salmon',
    },
  ];

  assert.equal(filterSmartMeals(catalog, 10, ['No Restrictions']).length, 1);
  assert.equal(filterSmartMeals(catalog, 15, ['Vegan', 'Nut Allergy']).length, 1);
  assert.equal(filterSmartMeals(catalog, 8, ['Vegan']).length, 0);
});

test('sanitizeDietarySelection removes No Restrictions when specific restriction added and falls back cleanly', () => {
  assert.deepEqual(sanitizeDietarySelection(['No Restrictions'], 'Vegetarian'), ['Vegetarian']);
  assert.deepEqual(sanitizeDietarySelection(['Vegetarian'], 'Vegetarian'), ['No Restrictions']);
  assert.deepEqual(sanitizeDietarySelection(['Vegetarian', 'Halal'], 'No Restrictions'), ['No Restrictions']);
});

test('getMealsLoggedTodayCount counts check-ins and non-duplicate budget meal expenses', () => {
  const checkIns: MealCheckIn[] = [
    { id: '1', name: 'Oats', category: 'Breakfast', loggedAt: '08:15', dateKey: '2026-11-24', source: 'manual' },
  ];
  const expenses: ExpenseEntry[] = [
    { id: 'e1', mealName: 'Wrap', cost: 8, category: 'Lunch', type: 'planned', loggedAt: '12:30', dateKey: '2026-11-24', hadScheduledBreak: true },
  ];
  assert.equal(getMealsLoggedTodayCount(checkIns, expenses, '2026-11-24'), 2);
});

test('findDueMealAlarm matches enabled non-dismissed alarms', () => {
  const alarms: MealAlarm[] = [
    { id: 'a1', label: 'Lunch', time: '12:30', enabled: true },
    { id: 'a2', label: 'Dinner', time: '19:30', enabled: false },
  ];
  assert.equal(findDueMealAlarm(alarms, '12:30', [])?.id, 'a1');
  assert.equal(findDueMealAlarm(alarms, '12:30', ['a1']), null);
  assert.equal(findDueMealAlarm(alarms, '19:30', []), null);
});

test('calculateWellnessInsights compares break days vs non-break days', () => {
  const sessions: FocusSession[] = [
    { id: 's1', label: 'Study', durationSeconds: 3600, endedAt: '11:00', dateKey: '2026-11-22', tookBreak: true },
    { id: 's2', label: 'Cram', durationSeconds: 16000, endedAt: '22:00', dateKey: '2026-11-23', tookBreak: false },
  ];
  const expenses: ExpenseEntry[] = [
    { id: 'e1', mealName: 'Bowl', cost: 10, category: 'Lunch', type: 'planned', loggedAt: '12:00', dateKey: '2026-11-22', hadScheduledBreak: true },
    { id: 'e2', mealName: 'Late Delivery', cost: 25, category: 'Dinner', type: 'impulse', loggedAt: '22:15', dateKey: '2026-11-23', hadScheduledBreak: false },
  ];
  const insights = calculateWellnessInsights(sessions, expenses);
  assert.equal(insights.plannedTotal, 10);
  assert.equal(insights.impulseTotal, 25);
  assert.equal(insights.breakDayAvgSpend, 10);
  assert.equal(insights.nonBreakDayAvgSpend, 25);
});
