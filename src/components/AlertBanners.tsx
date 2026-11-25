import { AlertTriangle, BellRing, Droplets, Utensils } from 'lucide-react';
import type { MealAlarm } from '../types/sprout';
import { formatTime12h } from '../utils/sproutLogic';

interface AlertBannersProps {
  hydrationAlertActive: boolean;
  onLogHydrationFromAlert: () => void;
  onDismissHydrationAlert: () => void;
  activeMealAlarm: MealAlarm | null;
  onPauseAndLogMealFromAlarm: () => void;
  onDismissMealAlarm: () => void;
  burnoutAlertActive: boolean;
  onGoToLogMealFromBurnout: () => void;
}

export function AlertBanners({
  hydrationAlertActive,
  onLogHydrationFromAlert,
  onDismissHydrationAlert,
  activeMealAlarm,
  onPauseAndLogMealFromAlarm,
  onDismissMealAlarm,
  burnoutAlertActive,
  onGoToLogMealFromBurnout,
}: AlertBannersProps) {
  if (!hydrationAlertActive && !activeMealAlarm && !burnoutAlertActive) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6" aria-live="polite">
      {activeMealAlarm && (
        <div
          role="alert"
          data-testid="meal-alarm-banner"
          className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <BellRing className="w-5 h-5 text-[#2B6CB0] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#153A60]">
                Meal Alarm: {activeMealAlarm.label} · {formatTime12h(activeMealAlarm.time)}
              </p>
              <p className="text-xs text-[#2E5073] mt-0.5">
                Sprout says: Pause your Lock-In session and eat a planned meal so you do not burn out later.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPauseAndLogMealFromAlarm}
              className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2B6CB0] text-white hover:bg-[#235891] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pause &amp; Log Meal
            </button>
            <button
              type="button"
              onClick={onDismissMealAlarm}
              className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-medium text-[#2E5073] hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {hydrationAlertActive && (
        <div
          role="alert"
          data-testid="hydration-alert-banner"
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <Droplets className="w-5 h-5 text-[#2E7D5B] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#174632]">
                Hydration Reminder
              </p>
              <p className="text-xs text-[#2B5F47] mt-0.5">
                Time for a quick sip of water! Staying hydrated keeps your focus steady without fatigue.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLogHydrationFromAlert}
              className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2E7D5B] text-white hover:bg-[#246348] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              +1 Cup &amp; Dismiss
            </button>
            <button
              type="button"
              onClick={onDismissHydrationAlert}
              className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-medium text-[#2B5F47] hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Snooze
            </button>
          </div>
        </div>
      )}

      {burnoutAlertActive && (
        <div
          role="alert"
          data-testid="burnout-prevention-banner"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                Burnout &amp; Binge Prevention Warning
              </p>
              <p className="text-xs text-red-800 mt-0.5">
                You have logged 4+ hours of Lock-In time with zero meals today. Eat a planned meal soon before extreme hunger triggers overeating or impulse delivery spending.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onGoToLogMealFromBurnout}
              className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-700 text-white hover:bg-red-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
              Log a Meal Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
