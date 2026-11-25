import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Wallet,
} from 'lucide-react';
import { AlertBanners } from './components/AlertBanners';
import { BudgetView } from './components/BudgetView';
import { DemoModePanel } from './components/DemoModePanel';
import { DietaryOnboardingModal } from './components/DietaryOnboardingModal';
import { HomeView } from './components/HomeView';
import { MealsView } from './components/MealsView';
import { PremiumView } from './components/PremiumView';
import { createInitialAppState } from './data/seedData';
import type {
  BudgetSettings,
  DietaryProfile,
  MascotMood,
  MealAlarm,
  MealCategory,
  SmartMealOption,
  SproutAppState,
  TabId,
  TimerStatus,
} from './types/sprout';
import { playGentleChime } from './utils/sound';
import {
  calculateBudgetStatus,
  calculateWellnessInsights,
  findDueMealAlarm,
  getMascotState,
  getMealsLoggedTodayCount,
  getTodayDateKey,
  getTotalFocusSecondsToday,
  shouldTriggerBurnoutAlert,
} from './utils/sproutLogic';

const STORAGE_KEY = 'sprout_app_state_v1';

function loadStoredState(): SproutAppState {
  const initial = createInitialAppState();
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<SproutAppState>;
    const currentToday = getTodayDateKey();
    if (!parsed || !Array.isArray(parsed.focusSessions)) {
      return initial;
    }
    return {
      ...initial,
      ...parsed,
      todayKey: currentToday,
      hydrationCupsToday:
        parsed.todayKey === currentToday && typeof parsed.hydrationCupsToday === 'number'
          ? parsed.hydrationCupsToday
          : 0,
    };
  } catch {
    return initial;
  }
}

function formatCurrentTimeShort(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getCurrentHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function App() {
  const [appState, setAppState] = useState<SproutAppState>(() => loadStoredState());
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Active Lock-In stopwatch state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [sessionLabel, setSessionLabel] = useState<string>('Deep Study Session');
  const [secondsSinceHydration, setSecondsSinceHydration] = useState<number>(0);

  // Reactive alerts & UI states
  const [justHydrated, setJustHydrated] = useState<boolean>(false);
  const [hydrationAlertActive, setHydrationAlertActive] = useState<boolean>(false);
  const [activeMealAlarm, setActiveMealAlarm] = useState<MealAlarm | null>(null);
  const [dismissedAlarmIds, setDismissedAlarmIds] = useState<string[]>([]);
  const [dietModalOpen, setDietModalOpen] = useState<boolean>(false);

  // Presentation Demo Mode state
  const [demoModeOpen, setDemoModeOpen] = useState<boolean>(false);
  const [overrideMood, setOverrideMood] = useState<MascotMood | null>(null);

  // Persist core app state
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Ignore storage quota errors
    }
  }, [appState]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab]);

  // 1-second stopwatch tick while running
  useEffect(() => {
    if (timerStatus !== 'running') return;
    const interval = window.setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
      setSecondsSinceHydration((prev) => {
        const next = prev + 1;
        if (next >= appState.hydrationIntervalMinutes * 60) {
          setHydrationAlertActive(true);
          playGentleChime('water');
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerStatus, appState.hydrationIntervalMinutes]);

  // Meal alarm clock check every 15 seconds
  useEffect(() => {
    const checkAlarms = () => {
      const due = findDueMealAlarm(
        appState.mealAlarms,
        getCurrentHHMM(),
        dismissedAlarmIds
      );
      if (due && activeMealAlarm?.id !== due.id) {
        setActiveMealAlarm(due);
        playGentleChime('meal');
      }
    };
    const interval = window.setInterval(checkAlarms, 15000);
    return () => window.clearInterval(interval);
  }, [appState.mealAlarms, dismissedAlarmIds, activeMealAlarm]);

  const totalFocusSecondsToday = useMemo(
    () =>
      getTotalFocusSecondsToday(
        appState.focusSessions,
        appState.todayKey,
        sessionSeconds
      ),
    [appState.focusSessions, appState.todayKey, sessionSeconds]
  );

  const mealsLoggedTodayCount = useMemo(
    () =>
      getMealsLoggedTodayCount(
        appState.mealCheckIns,
        appState.expenses,
        appState.todayKey
      ),
    [appState.mealCheckIns, appState.expenses, appState.todayKey]
  );

  const burnoutAlertActive = shouldTriggerBurnoutAlert(
    totalFocusSecondsToday,
    mealsLoggedTodayCount
  );

  const mascotPresentation = useMemo(
    () =>
      getMascotState({
        timerStatus,
        currentSessionSeconds: sessionSeconds,
        totalFocusSecondsToday,
        mealsLoggedToday: mealsLoggedTodayCount,
        hydrationCupsToday: appState.hydrationCupsToday,
        justHydrated,
        activeMealAlarmLabel: activeMealAlarm ? activeMealAlarm.label : null,
        overrideMood,
      }),
    [
      timerStatus,
      sessionSeconds,
      totalFocusSecondsToday,
      mealsLoggedTodayCount,
      appState.hydrationCupsToday,
      justHydrated,
      activeMealAlarm,
      overrideMood,
    ]
  );

  const budgetSummary = useMemo(
    () =>
      calculateBudgetStatus(
        appState.budgetSettings.dailyBudget,
        appState.expenses,
        appState.todayKey
      ),
    [appState.budgetSettings.dailyBudget, appState.expenses, appState.todayKey]
  );

  const wellnessInsights = useMemo(
    () => calculateWellnessInsights(appState.focusSessions, appState.expenses),
    [appState.focusSessions, appState.expenses]
  );

  const secondsUntilNextHydration = Math.max(
    0,
    appState.hydrationIntervalMinutes * 60 - secondsSinceHydration
  );

  // Handlers: Focus Timer & Hydration
  const handleStartTimer = () => setTimerStatus('running');
  const handlePauseTimer = () => setTimerStatus('paused');

  const handleEndSession = () => {
    const duration = sessionSeconds > 0 ? sessionSeconds : 60;
    const newSession = {
      id: `session-${Date.now()}`,
      label: sessionLabel.trim() || 'Study Session',
      durationSeconds: duration,
      endedAt: formatCurrentTimeShort(),
      dateKey: appState.todayKey,
      tookBreak: appState.hydrationCupsToday > 0 || duration < 7200,
    };
    setAppState((prev) => ({
      ...prev,
      focusSessions: [newSession, ...prev.focusSessions],
    }));
    setTimerStatus('idle');
    setSessionSeconds(0);
    setSecondsSinceHydration(0);
  };

  const handleAddWaterCup = () => {
    setAppState((prev) => ({
      ...prev,
      hydrationCupsToday: prev.hydrationCupsToday + 1,
    }));
    setSecondsSinceHydration(0);
    setHydrationAlertActive(false);
    setJustHydrated(true);
    window.setTimeout(() => setJustHydrated(false), 4500);
  };

  const handleQuickStretchBreak = () => {
    setTimerStatus('paused');
    handleAddWaterCup();
  };

  // Handlers: Meals & Dietary Profile
  const handleSaveDietaryProfile = (nextProfile: DietaryProfile) => {
    setAppState((prev) => ({ ...prev, dietaryProfile: nextProfile }));
  };

  const handleToggleAlarm = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      mealAlarms: prev.mealAlarms.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      ),
    }));
  };

  const handleUpdateAlarmTime = (id: string, time: string) => {
    setAppState((prev) => ({
      ...prev,
      mealAlarms: prev.mealAlarms.map((a) => (a.id === id ? { ...a, time } : a)),
    }));
  };

  const handleAddAlarm = (label: string, time: string) => {
    const newAlarm: MealAlarm = {
      id: `alarm-${Date.now()}`,
      label,
      time,
      enabled: true,
      isCustom: true,
    };
    setAppState((prev) => ({
      ...prev,
      mealAlarms: [...prev.mealAlarms, newAlarm],
    }));
  };

  const handleDeleteAlarm = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      mealAlarms: prev.mealAlarms.filter((a) => a.id !== id),
    }));
  };

  const handleTestAlarm = (alarm: MealAlarm) => {
    setActiveMealAlarm(alarm);
    playGentleChime('meal');
  };

  const handleLogQuickMeal = (name: string, category: MealCategory) => {
    setAppState((prev) => ({
      ...prev,
      mealCheckIns: [
        {
          id: `meal-${Date.now()}`,
          name,
          category,
          loggedAt: formatCurrentTimeShort(),
          dateKey: prev.todayKey,
          source: 'manual',
        },
        ...prev.mealCheckIns,
      ],
    }));
  };

  // Handlers: Budget
  const handleUpdateBudgetSettings = (next: BudgetSettings) => {
    setAppState((prev) => ({ ...prev, budgetSettings: next }));
  };

  const handleAddExpense = (entry: {
    mealName: string;
    cost: number;
    category: MealCategory;
    type: 'planned' | 'impulse';
  }) => {
    const hadBreak =
      timerStatus !== 'running' || sessionSeconds < 7200 || appState.hydrationCupsToday > 0;
    const nowTime = formatCurrentTimeShort();
    setAppState((prev) => ({
      ...prev,
      expenses: [
        {
          id: `exp-${Date.now()}`,
          mealName: entry.mealName,
          cost: entry.cost,
          category: entry.category,
          type: entry.type,
          loggedAt: nowTime,
          dateKey: prev.todayKey,
          hadScheduledBreak: hadBreak,
        },
        ...prev.expenses,
      ],
      mealCheckIns: [
        {
          id: `meal-budget-${Date.now()}`,
          name: entry.mealName,
          category: entry.category,
          loggedAt: nowTime,
          dateKey: prev.todayKey,
          source: 'budget',
        },
        ...prev.mealCheckIns,
      ],
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Handlers: Premium Previews
  const handleLogScannedIntake = (meal: {
    name: string;
    category: MealCategory;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    deductCost?: number;
  }) => {
    const nowTime = formatCurrentTimeShort();
    setAppState((prev) => ({
      ...prev,
      mealCheckIns: [
        {
          id: `scan-${Date.now()}`,
          name: meal.name,
          category: meal.category,
          calories: meal.calories,
          proteinGrams: meal.proteinGrams,
          carbsGrams: meal.carbsGrams,
          fatsGrams: meal.fatsGrams,
          loggedAt: nowTime,
          dateKey: prev.todayKey,
          source: 'scanner',
        },
        ...prev.mealCheckIns,
      ],
      expenses:
        meal.deductCost && meal.deductCost > 0
          ? [
              {
                id: `exp-scan-${Date.now()}`,
                mealName: meal.name,
                cost: meal.deductCost,
                category: meal.category,
                type: 'planned',
                loggedAt: nowTime,
                dateKey: prev.todayKey,
                hadScheduledBreak: true,
              },
              ...prev.expenses,
            ]
          : prev.expenses,
    }));
  };

  const handleSelectSmartMeal = (meal: SmartMealOption, localPrice: number) => {
    handleAddExpense({
      mealName: meal.name,
      cost: localPrice,
      category: 'Lunch',
      type: 'planned',
    });
  };

  // Handlers: Alert Banners & Demo Mode
  const handlePauseAndLogMealFromAlarm = () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
    }
    if (activeMealAlarm) {
      setDismissedAlarmIds((prev) => [...prev, activeMealAlarm.id]);
    }
    setActiveMealAlarm(null);
    setActiveTab('meals');
  };

  const handleDismissMealAlarm = () => {
    if (activeMealAlarm) {
      setDismissedAlarmIds((prev) => [...prev, activeMealAlarm.id]);
    }
    setActiveMealAlarm(null);
  };

  const handleDemoFastForward = (minutes: number) => {
    setSessionSeconds((prev) => prev + minutes * 60);
    if (timerStatus === 'idle') {
      setTimerStatus('paused');
    }
  };

  const handleDemoReset = () => {
    const fresh = createInitialAppState();
    setAppState(fresh);
    setTimerStatus('idle');
    setSessionSeconds(0);
    setSecondsSinceHydration(0);
    setHydrationAlertActive(false);
    setActiveMealAlarm(null);
    setDismissedAlarmIds([]);
    setOverrideMood(null);
  };

  const navItems: { id: TabId; label: string; mobileLabel: string; icon: typeof Clock }[] = [
    { id: 'home', label: 'Home (Focus)', mobileLabel: 'Home', icon: Clock },
    { id: 'meals', label: 'Meals & Diet', mobileLabel: 'Meals', icon: Utensils },
    { id: 'budget', label: 'Budget', mobileLabel: 'Budget', icon: Wallet },
    { id: 'premium', label: 'Premium (Coming Soon)', mobileLabel: 'Premium', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F3] text-[#1C2420] flex flex-col">
      {/* Top Bar: 3-zone contract (Wordmark | Nav Links | Demo Mode toggle) */}
      <header className="sticky top-0 z-30 h-[56px] md:h-16 bg-white/95 backdrop-blur-sm border-b border-[#E4E7DF]">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="font-display text-xl font-bold tracking-tight text-[#1C2420] whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="13" fill="#EBF3FA" />
              <path d="M9 17C9 12 13 9 18 10C18 15 15 19 9 17Z" fill="#326FB0" />
              <path d="M14 11C15 7 19 5 22 7C20 10 17 12 14 11Z" fill="#2E7D5B" />
            </svg>
            <span>Sprout</span>
          </button>

          {/* Zone 2: Desktop Single-Line Navigation */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#2B6CB0] text-[#1C2420] font-semibold'
                      : 'border-transparent text-[#526058] hover:text-[#1C2420]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Presenter Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setDemoModeOpen((prev) => !prev)}
              aria-expanded={demoModeOpen}
              data-testid="demo-mode-toggle"
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                demoModeOpen
                  ? 'bg-[#2B6CB0] text-white'
                  : 'border border-[#DCE0D6] bg-[#FAFBF8] text-[#1C2420] hover:bg-[#EFF2EC]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Demo Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        <DemoModePanel
          open={demoModeOpen}
          onClose={() => setDemoModeOpen(false)}
          onFastForwardMinutes={handleDemoFastForward}
          onTriggerHydrationAlert={() => {
            setHydrationAlertActive(true);
            playGentleChime('water');
          }}
          onTriggerMealAlarm={() => {
            const target =
              appState.mealAlarms.find((a) => a.enabled) ?? appState.mealAlarms[0];
            if (target) {
              setActiveMealAlarm(target);
              playGentleChime('meal');
            }
          }}
          overrideMood={overrideMood}
          onChangeOverrideMood={setOverrideMood}
          onResetDemoData={handleDemoReset}
        />

        <AlertBanners
          hydrationAlertActive={hydrationAlertActive}
          onLogHydrationFromAlert={handleAddWaterCup}
          onDismissHydrationAlert={() => setHydrationAlertActive(false)}
          activeMealAlarm={activeMealAlarm}
          onPauseAndLogMealFromAlarm={handlePauseAndLogMealFromAlarm}
          onDismissMealAlarm={handleDismissMealAlarm}
          burnoutAlertActive={burnoutAlertActive}
          onGoToLogMealFromBurnout={() => setActiveTab('meals')}
        />

        {activeTab === 'home' && (
          <HomeView
            timerStatus={timerStatus}
            sessionSeconds={sessionSeconds}
            sessionLabel={sessionLabel}
            onSessionLabelChange={setSessionLabel}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onEndSession={handleEndSession}
            hydrationCupsToday={appState.hydrationCupsToday}
            hydrationIntervalMinutes={appState.hydrationIntervalMinutes}
            secondsUntilNextHydration={secondsUntilNextHydration}
            onHydrationIntervalChange={(mins) =>
              setAppState((prev) => ({ ...prev, hydrationIntervalMinutes: mins }))
            }
            onAddWaterCup={handleAddWaterCup}
            totalFocusSecondsToday={totalFocusSecondsToday}
            focusSessions={appState.focusSessions}
            todayKey={appState.todayKey}
            mascotPresentation={mascotPresentation}
            budgetSummary={budgetSummary}
            dailyBudget={appState.budgetSettings.dailyBudget}
            currencySymbol={appState.budgetSettings.currencySymbol}
            onNavigateToBudget={() => setActiveTab('budget')}
            onQuickStretchBreak={handleQuickStretchBreak}
          />
        )}

        {activeTab === 'meals' && (
          <MealsView
            dietaryProfile={appState.dietaryProfile}
            onOpenDietModal={() => setDietModalOpen(true)}
            mealAlarms={appState.mealAlarms}
            onToggleAlarm={handleToggleAlarm}
            onUpdateAlarmTime={handleUpdateAlarmTime}
            onAddAlarm={handleAddAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onTestAlarm={handleTestAlarm}
            mealCheckIns={appState.mealCheckIns}
            todayKey={appState.todayKey}
            mealsLoggedTodayCount={mealsLoggedTodayCount}
            totalFocusSecondsToday={totalFocusSecondsToday}
            onLogQuickMeal={handleLogQuickMeal}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            settings={appState.budgetSettings}
            onUpdateSettings={handleUpdateBudgetSettings}
            expenses={appState.expenses}
            todayKey={appState.todayKey}
            budgetSummary={budgetSummary}
            insights={wellnessInsights}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'premium' && (
          <PremiumView
            remainingBudget={budgetSummary.remaining}
            currencySymbol={appState.budgetSettings.currencySymbol}
            dietaryRestrictions={appState.dietaryProfile.restrictions}
            onLogScannedIntake={handleLogScannedIntake}
            onSelectSmartMeal={handleSelectSmartMeal}
            onGoToDietSettings={() => setDietModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (height 64px, keeping total sticky <= 15% of 844px) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#E4E7DF] grid grid-cols-4 items-center"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                active ? 'text-[#2B6CB0] font-semibold' : 'text-[#526058]'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      <DietaryOnboardingModal
        open={dietModalOpen}
        profile={appState.dietaryProfile}
        onSave={handleSaveDietaryProfile}
        onClose={() => setDietModalOpen(false)}
      />
    </div>
  );
}
