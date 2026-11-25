import { useState } from 'react';
import { Bell, Plus, Trash2, Utensils, Settings2, PlayCircle } from 'lucide-react';
import type {
  DietaryProfile,
  MealAlarm,
  MealCategory,
  MealCheckIn,
} from '../types/sprout';
import {
  BURNOUT_THRESHOLD_SECONDS,
  formatCompactDuration,
  formatTime12h,
} from '../utils/sproutLogic';

interface MealsViewProps {
  dietaryProfile: DietaryProfile;
  onOpenDietModal: () => void;
  mealAlarms: MealAlarm[];
  onToggleAlarm: (id: string) => void;
  onUpdateAlarmTime: (id: string, time: string) => void;
  onAddAlarm: (label: string, time: string) => void;
  onDeleteAlarm: (id: string) => void;
  onTestAlarm: (alarm: MealAlarm) => void;
  mealCheckIns: MealCheckIn[];
  todayKey: string;
  mealsLoggedTodayCount: number;
  totalFocusSecondsToday: number;
  onLogQuickMeal: (name: string, category: MealCategory) => void;
}

const CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function MealsView({
  dietaryProfile,
  onOpenDietModal,
  mealAlarms,
  onToggleAlarm,
  onUpdateAlarmTime,
  onAddAlarm,
  onDeleteAlarm,
  onTestAlarm,
  mealCheckIns,
  todayKey,
  mealsLoggedTodayCount,
  totalFocusSecondsToday,
  onLogQuickMeal,
}: MealsViewProps) {
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [newAlarmTime, setNewAlarmTime] = useState('15:00');
  const [alarmError, setAlarmError] = useState('');

  const [mealName, setMealName] = useState('');
  const [mealCategory, setMealCategory] = useState<MealCategory>('Lunch');
  const [mealError, setMealError] = useState('');

  const todayCheckIns = mealCheckIns.filter((m) => m.dateKey === todayKey);

  const handleAddAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAlarmLabel.trim();
    if (!trimmed) {
      setAlarmError('Enter a meal or snack label.');
      return;
    }
    setAlarmError('');
    onAddAlarm(trimmed, newAlarmTime);
    setNewAlarmLabel('');
  };

  const handleLogMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mealName.trim();
    if (!trimmed) {
      setMealError('Enter what you ate so Sprout can log it.');
      return;
    }
    setMealError('');
    onLogQuickMeal(trimmed, mealCategory);
    setMealName('');
  };

  const burnoutRisk =
    totalFocusSecondsToday >= BURNOUT_THRESHOLD_SECONDS && mealsLoggedTodayCount === 0;

  return (
    <div className="space-y-6">
      {/* Top 2-column grid: Dietary Profile + Burnout Protection Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Dietary profile"
          className="lg:col-span-6 rounded-2xl border border-[#E4E7DF] bg-white p-6"
        >
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECEFE8]">
            <div>
              <h1 className="text-2xl font-bold text-[#1C2420]">
                Meals &amp; Dietary Profile
              </h1>
              <p className="text-xs text-[#526058] mt-0.5">
                Active tags guide meal suggestions and prevent skipped-meal burnout.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDietModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] text-xs font-semibold text-[#1C2420] hover:bg-[#EFF2EC] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#2E7D5B]" aria-hidden="true" />
              Edit Diet Profile
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-[#526058]">
                Active Dietary Restrictions
              </p>
              <p
                data-testid="active-dietary-tags"
                className="mt-1.5 text-sm font-semibold text-[#1C2420]"
              >
                {dietaryProfile.restrictions.join(' · ')}
              </p>
            </div>

            <div className="pt-3 border-t border-[#ECEFE8]">
              <p className="text-xs font-medium text-[#526058]">
                Health &amp; Routine Goals
              </p>
              <p
                data-testid="active-health-goals"
                className="mt-1.5 text-sm font-medium text-[#2E7D5B]"
              >
                {dietaryProfile.goals.join(' · ')}
              </p>
            </div>
          </div>
        </section>

        {/* Meal Check-In & Burnout Status */}
        <section
          aria-label="Today meal check-in"
          className="lg:col-span-6 rounded-2xl border border-[#E4E7DF] bg-white p-6"
        >
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ECEFE8]">
            <div>
              <h2 className="text-lg font-bold text-[#1C2420]">
                Log a Planned Meal
              </h2>
              <p className="text-xs text-[#526058] mt-0.5">
                {formatCompactDuration(totalFocusSecondsToday)} locked in · {mealsLoggedTodayCount}{' '}
                {mealsLoggedTodayCount === 1 ? 'meal' : 'meals'} logged today
              </p>
            </div>
            <span
              className={`text-xs font-semibold ${
                burnoutRisk ? 'text-red-700' : 'text-[#2E7D5B]'
              }`}
            >
              {burnoutRisk ? 'Meal overdue' : 'Schedule steady'}
            </span>
          </div>

          <form onSubmit={handleLogMealSubmit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="quick-meal-name" className="block text-xs font-medium text-[#526058] mb-1">
                What did you eat?
              </label>
              <input
                id="quick-meal-name"
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Campus Stir-Fry Bowl"
                className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3.5 py-2 text-sm text-[#1C2420] focus:outline-none focus:border-[#2E7D5B]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F3F5F0]" role="group" aria-label="Meal category">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMealCategory(cat)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      mealCategory === cat
                        ? 'bg-white text-[#1C2420] shadow-xs'
                        : 'text-[#526058] hover:text-[#1C2420]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2E7D5B] text-white text-xs font-semibold hover:bg-[#246348] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
                Log Meal
              </button>
            </div>
            {mealError && <p className="text-xs text-red-700">{mealError}</p>}
          </form>

          {todayCheckIns.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#ECEFE8]">
              <p className="text-xs font-medium text-[#526058] mb-2">Logged Today</p>
              <ul className="space-y-1.5">
                {todayCheckIns.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-xs text-[#1C2420]"
                  >
                    <span className="font-medium truncate">
                      {item.name}{' '}
                      <span className="text-[#526058] font-normal">· {item.category}</span>
                    </span>
                    <span className="text-[#526058] tabular-nums shrink-0">{item.loggedAt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Customizable Meal Alarm System */}
      <section
        aria-label="Customizable meal alarm schedule"
        className="rounded-2xl border border-[#E4E7DF] bg-white p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#ECEFE8]">
          <div>
            <h2 className="text-lg font-bold text-[#1C2420]">
              Customizable Meal Alarms
            </h2>
            <p className="text-xs text-[#526058] mt-0.5">
              Alarms trigger a gentle Sprout reminder banner even while your Lock-In timer is running.
            </p>
          </div>
          <span className="text-xs font-medium text-[#526058] tabular-nums">
            {mealAlarms.filter((a) => a.enabled).length} of {mealAlarms.length} active
          </span>
        </div>

        <ul className="divide-y divide-[#ECEFE8] mt-2" data-testid="meal-alarms-list">
          {mealAlarms.map((alarm) => (
            <li
              key={alarm.id}
              className="py-3.5 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bell
                  className={`w-4 h-4 shrink-0 ${
                    alarm.enabled ? 'text-[#2B6CB0]' : 'text-[#9BA59F]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1C2420]">{alarm.label}</p>
                  <p className="text-xs text-[#526058] tabular-nums">
                    Scheduled for {formatTime12h(alarm.time)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`alarm-time-${alarm.id}`}>
                  Time for {alarm.label}
                </label>
                <input
                  id={`alarm-time-${alarm.id}`}
                  type="time"
                  value={alarm.time}
                  onChange={(e) => onUpdateAlarmTime(alarm.id, e.target.value)}
                  className="min-h-[38px] rounded-lg border border-[#DCE0D6] bg-[#FAFBF8] px-2.5 py-1 text-xs font-mono text-[#1C2420]"
                />

                <button
                  type="button"
                  onClick={() => onTestAlarm(alarm)}
                  aria-label={`Test ${alarm.label} alarm`}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#DCE0D6] bg-white text-xs font-medium text-[#2B6CB0] hover:bg-[#EBF3FA] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Test
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={alarm.enabled}
                  aria-label={`Toggle ${alarm.label} alarm`}
                  onClick={() => onToggleAlarm(alarm.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    alarm.enabled
                      ? 'bg-[#EBF5F0] text-[#174632] border border-[#C6E2D3]'
                      : 'bg-[#F3F5F0] text-[#526058] border border-[#E4E7DF]'
                  }`}
                >
                  {alarm.enabled ? 'On' : 'Off'}
                </button>

                {alarm.isCustom && (
                  <button
                    type="button"
                    onClick={() => onDeleteAlarm(alarm.id)}
                    aria-label={`Delete ${alarm.label} alarm`}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#738079] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Add Custom Meal Alarm */}
        <form
          onSubmit={handleAddAlarmSubmit}
          className="mt-4 pt-4 border-t border-[#ECEFE8] flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1">
            <label
              htmlFor="new-alarm-label"
              className="block text-xs font-medium text-[#526058] mb-1"
            >
              Add Custom Meal or Study Snack Alarm
            </label>
            <input
              id="new-alarm-label"
              type="text"
              value={newAlarmLabel}
              onChange={(e) => setNewAlarmLabel(e.target.value)}
              placeholder="e.g., Post-Lab Protein Snack"
              className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3.5 py-2 text-sm text-[#1C2420] focus:outline-none focus:border-[#2B6CB0]"
            />
          </div>
          <div>
            <label
              htmlFor="new-alarm-time"
              className="block text-xs font-medium text-[#526058] mb-1"
            >
              Time
            </label>
            <input
              id="new-alarm-time"
              type="time"
              value={newAlarmTime}
              onChange={(e) => setNewAlarmTime(e.target.value)}
              className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3 py-2 text-sm font-mono text-[#1C2420]"
            />
          </div>
          <button
            type="submit"
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2B6CB0] text-white text-xs font-semibold hover:bg-[#235891] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Alarm
          </button>
        </form>
        {alarmError && <p className="text-xs text-red-700 mt-2">{alarmError}</p>}
      </section>
    </div>
  );
}
