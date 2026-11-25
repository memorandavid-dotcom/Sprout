import { useState } from 'react';
import {
  Clock,
  Droplets,
  Pause,
  Play,
  Square,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { FocusSession, TimerStatus } from '../types/sprout';
import type { BudgetStatusSummary, MascotPresentation } from '../utils/sproutLogic';
import {
  formatCompactDuration,
  formatCurrency,
  formatStopwatch,
} from '../utils/sproutLogic';
import { SproutMascot } from './SproutMascot';

interface HomeViewProps {
  timerStatus: TimerStatus;
  sessionSeconds: number;
  sessionLabel: string;
  onSessionLabelChange: (label: string) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onEndSession: () => void;
  hydrationCupsToday: number;
  hydrationIntervalMinutes: number;
  secondsUntilNextHydration: number;
  onHydrationIntervalChange: (minutes: number) => void;
  onAddWaterCup: () => void;
  totalFocusSecondsToday: number;
  focusSessions: FocusSession[];
  todayKey: string;
  mascotPresentation: MascotPresentation;
  budgetSummary: BudgetStatusSummary;
  dailyBudget: number;
  currencySymbol: string;
  onNavigateToBudget: () => void;
  onQuickStretchBreak: () => void;
}

const INTERVAL_OPTIONS = [15, 30, 45, 60];

export function HomeView({
  timerStatus,
  sessionSeconds,
  sessionLabel,
  onSessionLabelChange,
  onStartTimer,
  onPauseTimer,
  onEndSession,
  hydrationCupsToday,
  hydrationIntervalMinutes,
  secondsUntilNextHydration,
  onHydrationIntervalChange,
  onAddWaterCup,
  totalFocusSecondsToday,
  focusSessions,
  todayKey,
  mascotPresentation,
  budgetSummary,
  dailyBudget,
  currencySymbol,
  onNavigateToBudget,
  onQuickStretchBreak,
}: HomeViewProps) {
  const [waterFeedback, setWaterFeedback] = useState(false);

  const handleTapWater = () => {
    onAddWaterCup();
    setWaterFeedback(true);
    window.setTimeout(() => setWaterFeedback(false), 1200);
  };

  const todaySessions = focusSessions.filter((s) => s.dateKey === todayKey);

  const budgetBarColor =
    budgetSummary.status === 'overspent'
      ? 'bg-red-600'
      : budgetSummary.status === 'close'
      ? 'bg-amber-500'
      : 'bg-[#2E7D5B]';

  const budgetStatusTextColor =
    budgetSummary.status === 'overspent'
      ? 'text-red-700'
      : budgetSummary.status === 'close'
      ? 'text-amber-700'
      : 'text-[#2E7D5B]';

  return (
    <div className="space-y-6">
      {/* Main 2-column desktop workspace: Focus Timer + Sprout Mascot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column (7 cols): Lock-In Timer & Hydration */}
        <div className="lg:col-span-7 space-y-6">
          <section
            aria-label="Lock-In focus timer"
            className="rounded-2xl border border-[#E4E7DF] bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#ECEFE8]">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1C2420]">
                  Lock-In Focus Timer
                </h1>
                <p className="text-xs text-[#526058] mt-0.5">
                  Stay focused with gentle water and meal check-ins.
                </p>
              </div>
              <div className="text-xs font-medium text-[#526058]">
                {timerStatus === 'running'
                  ? 'Session active'
                  : timerStatus === 'paused'
                  ? 'Session paused'
                  : 'Ready to start'}
              </div>
            </div>

            {/* Session task label */}
            <div className="mt-5">
              <label
                htmlFor="focus-session-label"
                className="block text-xs font-medium text-[#526058] mb-1.5"
              >
                Current Study Block
              </label>
              <input
                id="focus-session-label"
                type="text"
                value={sessionLabel}
                onChange={(e) => onSessionLabelChange(e.target.value)}
                placeholder="e.g., Organic Chemistry Review"
                className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3.5 py-2 text-sm text-[#1C2420] placeholder:text-[#88948D] focus:outline-none focus:border-[#2B6CB0]"
              />
            </div>

            {/* Large Tabular Stopwatch Readout + 1-Tap Water Button */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 py-5 border-y border-[#ECEFE8]">
              <div>
                <p className="text-xs font-medium text-[#526058] mb-1">
                  Elapsed Session Time
                </p>
                <div
                  data-testid="lock-in-stopwatch"
                  className="font-mono text-4xl sm:text-5xl font-semibold tracking-tight text-[#1C2420] tabular-nums"
                >
                  {formatStopwatch(sessionSeconds)}
                </div>
                {timerStatus === 'running' && (
                  <p className="mt-2 text-xs text-[#2B6CB0] font-medium tabular-nums">
                    Next water sip reminder in {formatCompactDuration(secondsUntilNextHydration)}
                  </p>
                )}
              </div>

              {/* 1-tap +1 Cup of Water right next to the timer */}
              <div className="flex flex-col items-stretch sm:items-end gap-2">
                <button
                  type="button"
                  onClick={handleTapWater}
                  data-testid="add-water-cup-btn"
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#EBF5F0] border border-[#C6E2D3] text-[#174632] hover:bg-[#DCF0E6] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-[#2E7D5B]" aria-hidden="true" />
                  <span>+1 Cup of Water</span>
                </button>
                <div className="flex items-center justify-center sm:justify-end gap-2 text-xs text-[#526058] tabular-nums">
                  <span data-testid="hydration-cups-count" className="font-semibold text-[#1C2420]">
                    {hydrationCupsToday} {hydrationCupsToday === 1 ? 'cup' : 'cups'} today
                  </span>
                  {waterFeedback && (
                    <span className="text-[#2E7D5B] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Logged
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Controls & Hydration Interval */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {timerStatus === 'running' ? (
                  <button
                    type="button"
                    onClick={onPauseTimer}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#2B6CB0] text-white hover:bg-[#235891] transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Pause className="w-4 h-4" aria-hidden="true" />
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStartTimer}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#2B6CB0] text-white hover:bg-[#235891] transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="w-4 h-4" aria-hidden="true" />
                    {timerStatus === 'paused' ? 'Resume Lock-In' : 'Start Lock-In'}
                  </button>
                )}

                {(timerStatus === 'running' || timerStatus === 'paused' || sessionSeconds > 0) && (
                  <button
                    type="button"
                    onClick={onEndSession}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCE0D6] bg-white text-[#1C2420] hover:bg-[#F3F5F0] transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-[#526058]" aria-hidden="true" />
                    End Session
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="hydration-interval-select"
                  className="text-xs font-medium text-[#526058] whitespace-nowrap"
                >
                  Water reminder:
                </label>
                <select
                  id="hydration-interval-select"
                  value={hydrationIntervalMinutes}
                  onChange={(e) => onHydrationIntervalChange(Number(e.target.value))}
                  className="min-h-[40px] rounded-lg border border-[#DCE0D6] bg-[#FAFBF8] px-2.5 py-1.5 text-xs font-medium text-[#1C2420]"
                >
                  {INTERVAL_OPTIONS.map((mins) => (
                    <option key={mins} value={mins}>
                      Every {mins} mins
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Focus Session History Log */}
          <section
            aria-label="Focus session history"
            className="rounded-2xl border border-[#E4E7DF] bg-white p-6"
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#ECEFE8]">
              <h2 className="text-base font-bold text-[#1C2420]">
                Today&apos;s Focus History
              </h2>
              <span className="text-xs text-[#526058] tabular-nums">
                {todaySessions.length} {todaySessions.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-[#526058]">
                  No completed Lock-In sessions logged yet today.
                </p>
                <p className="text-xs text-[#738079] mt-1">
                  Start the timer above and hit End Session when you wrap up a block.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#ECEFE8] mt-1" data-testid="focus-history-list">
                {todaySessions.map((session) => (
                  <li
                    key={session.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1C2420] truncate">
                        {session.label}
                      </p>
                      <p className="text-xs text-[#526058] mt-0.5">
                        Ended {session.endedAt} · {session.tookBreak ? 'Included break' : 'No break logged'}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#2B6CB0] tabular-nums shrink-0">
                      {formatCompactDuration(session.durationSeconds)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column (5 cols): Sprout Mascot + Today Summary Cards */}
        <div className="lg:col-span-5 space-y-6">
          <SproutMascot
            presentation={mascotPresentation}
            onQuickWater={handleTapWater}
            onQuickBreak={onQuickStretchBreak}
          />

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Total Locked-In Time Today */}
            <section
              aria-label="Total locked-in time today"
              className="rounded-2xl border border-[#E4E7DF] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#526058]">
                  Total Locked-In Time Today
                </span>
                <Clock className="w-4 h-4 text-[#2B6CB0]" aria-hidden="true" />
              </div>
              <p
                data-testid="total-focus-today"
                className="mt-2 font-mono text-3xl font-semibold text-[#1C2420] tabular-nums"
              >
                {formatCompactDuration(totalFocusSecondsToday)}
              </p>
              <p className="mt-1.5 text-xs text-[#526058] tabular-nums">
                {hydrationCupsToday} {hydrationCupsToday === 1 ? 'cup' : 'cups'} of water logged · {todaySessions.length}{' '}
                {todaySessions.length === 1 ? 'completed block' : 'completed blocks'}
              </p>
            </section>

            {/* Remaining Food Budget Today (Part 3 Home integration) */}
            <section
              aria-label="Remaining food budget today"
              data-testid="home-budget-widget"
              className="rounded-2xl border border-[#E4E7DF] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#526058]">
                  Remaining Food Budget Today
                </span>
                <Wallet className="w-4 h-4 text-[#2E7D5B]" aria-hidden="true" />
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-3">
                <p
                  data-testid="home-remaining-budget"
                  className="font-mono text-3xl font-semibold text-[#1C2420] tabular-nums"
                >
                  {formatCurrency(budgetSummary.remaining, currencySymbol)}
                </p>
                <span className={`text-xs font-semibold ${budgetStatusTextColor}`}>
                  {budgetSummary.statusLabel}
                </span>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-[#ECEFE8] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${budgetBarColor}`}
                  style={{ width: `${Math.min(100, budgetSummary.percentUsed)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#526058] tabular-nums">
                <span>
                  Spent {formatCurrency(budgetSummary.totalSpent, currencySymbol)} of{' '}
                  {formatCurrency(dailyBudget, currencySymbol)}
                </span>
                <button
                  type="button"
                  onClick={onNavigateToBudget}
                  className="font-semibold text-[#2B6CB0] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Log meal cost
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
