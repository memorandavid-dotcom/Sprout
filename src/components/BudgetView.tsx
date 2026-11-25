import { useState } from 'react';
import { Trash2, TrendingDown, Wallet, PlusCircle } from 'lucide-react';
import { CURRENCY_OPTIONS } from '../data/seedData';
import type { BudgetSettings, ExpenseEntry, MealCategory } from '../types/sprout';
import type { BudgetStatusSummary, WellnessSpendingInsights } from '../utils/sproutLogic';
import { formatCurrency } from '../utils/sproutLogic';

interface BudgetViewProps {
  settings: BudgetSettings;
  onUpdateSettings: (next: BudgetSettings) => void;
  expenses: ExpenseEntry[];
  todayKey: string;
  budgetSummary: BudgetStatusSummary;
  insights: WellnessSpendingInsights;
  onAddExpense: (entry: {
    mealName: string;
    cost: number;
    category: MealCategory;
    type: 'planned' | 'impulse';
  }) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function BudgetView({
  settings,
  onUpdateSettings,
  expenses,
  todayKey,
  budgetSummary,
  insights,
  onAddExpense,
  onDeleteExpense,
}: BudgetViewProps) {
  const [mealName, setMealName] = useState('');
  const [costInput, setCostInput] = useState('');
  const [category, setCategory] = useState<MealCategory>('Lunch');
  const [purchaseType, setPurchaseType] = useState<'planned' | 'impulse'>('planned');
  const [formError, setFormError] = useState('');

  const todayExpenses = expenses.filter((e) => e.dateKey === todayKey);

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = mealName.trim();
    const parsedCost = Number(costInput);

    if (!trimmedName) {
      setFormError('Enter a meal name.');
      return;
    }
    if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
      setFormError('Enter a valid cost greater than 0.');
      return;
    }

    setFormError('');
    onAddExpense({
      mealName: trimmedName,
      cost: parsedCost,
      category,
      type: purchaseType,
    });
    setMealName('');
    setCostInput('');
  };

  const barColor =
    budgetSummary.status === 'overspent'
      ? 'bg-red-600'
      : budgetSummary.status === 'close'
      ? 'bg-amber-500'
      : 'bg-[#2E7D5B]';

  const statusTextClass =
    budgetSummary.status === 'overspent'
      ? 'text-red-700'
      : budgetSummary.status === 'close'
      ? 'text-amber-700'
      : 'text-[#2E7D5B]';

  return (
    <div className="space-y-6">
      {/* Top 2-column grid: Budget Status & Setup + Quick Expense Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Budget Status & Cap Setup */}
        <section
          aria-label="Daily food budget setup and status"
          className="lg:col-span-6 rounded-2xl border border-[#E4E7DF] bg-white p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECEFE8]">
            <div>
              <h1 className="text-2xl font-bold text-[#1C2420]">
                Daily Food Budget
              </h1>
              <p className="text-xs text-[#526058] mt-0.5">
                Track planned meals vs impulse buys against your daily cap.
              </p>
            </div>
            <Wallet className="w-5 h-5 text-[#2E7D5B] shrink-0" aria-hidden="true" />
          </div>

          {/* Remaining visual readout + progress bar */}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#526058]">Remaining Today</p>
                <p
                  data-testid="budget-remaining-amount"
                  className="font-mono text-3xl font-semibold text-[#1C2420] tabular-nums mt-0.5"
                >
                  {formatCurrency(budgetSummary.remaining, settings.currencySymbol)}
                </p>
              </div>
              <span data-testid="budget-status-label" className={`text-xs font-semibold ${statusTextClass}`}>
                {budgetSummary.statusLabel}
              </span>
            </div>

            <div className="mt-3 h-3 w-full rounded-full bg-[#ECEFE8] overflow-hidden">
              <div
                data-testid="budget-progress-bar"
                className={`h-full transition-all duration-300 ${barColor}`}
                style={{ width: `${Math.min(100, budgetSummary.percentUsed)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-[#526058] tabular-nums">
              <span>Spent: {formatCurrency(budgetSummary.totalSpent, settings.currencySymbol)}</span>
              <span>Daily Cap: {formatCurrency(settings.dailyBudget, settings.currencySymbol)}</span>
            </div>
          </div>

          {/* Budget Cap & Currency Inputs */}
          <div className="pt-4 border-t border-[#ECEFE8] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="budget-currency" className="block text-xs font-medium text-[#526058] mb-1">
                Currency
              </label>
              <select
                id="budget-currency"
                value={settings.currencySymbol}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, currencySymbol: e.target.value })
                }
                className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3 py-2 text-sm text-[#1C2420]"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.symbol} value={opt.symbol}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="daily-budget-input" className="block text-xs font-medium text-[#526058] mb-1">
                Daily Cap ({settings.currencySymbol})
              </label>
              <input
                id="daily-budget-input"
                type="number"
                min="1"
                step="0.5"
                value={settings.dailyBudget}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  onUpdateSettings({ ...settings, dailyBudget: val });
                }}
                className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3 py-2 text-sm font-mono text-[#1C2420]"
              />
            </div>

            <div>
              <label htmlFor="per-meal-cap-input" className="block text-xs font-medium text-[#526058] mb-1">
                Per-Meal Target
              </label>
              <input
                id="per-meal-cap-input"
                type="number"
                min="0"
                step="0.5"
                value={settings.perMealCap ?? ''}
                placeholder="Optional"
                onChange={(e) => {
                  const raw = e.target.value;
                  onUpdateSettings({
                    ...settings,
                    perMealCap: raw === '' ? null : Math.max(0, Number(raw)),
                  });
                }}
                className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3 py-2 text-sm font-mono text-[#1C2420]"
              />
            </div>
          </div>
        </section>

        {/* Right: Quick Expense Logger */}
        <section
          aria-label="Quick meal expense logger"
          className="lg:col-span-6 rounded-2xl border border-[#E4E7DF] bg-white p-6"
        >
          <div className="pb-4 border-b border-[#ECEFE8]">
            <h2 className="text-lg font-bold text-[#1C2420]">
              Log Meal Cost
            </h2>
            <p className="text-xs text-[#526058] mt-0.5">
              Deducts automatically from your remaining budget and updates today&apos;s meal count.
            </p>
          </div>

          <form onSubmit={handleLogExpense} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="expense-meal-name" className="block text-xs font-medium text-[#526058] mb-1">
                  Meal Name
                </label>
                <input
                  id="expense-meal-name"
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Turkey Avocado Sandwich"
                  className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3.5 py-2 text-sm text-[#1C2420] focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>

              <div>
                <label htmlFor="expense-cost" className="block text-xs font-medium text-[#526058] mb-1">
                  Cost ({settings.currencySymbol})
                </label>
                <input
                  id="expense-cost"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  placeholder="8.50"
                  className="w-full min-h-[42px] rounded-xl border border-[#DCE0D6] bg-[#FAFBF8] px-3.5 py-2 text-sm font-mono text-[#1C2420] focus:outline-none focus:border-[#2E7D5B]"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#526058] mb-1.5">Category</p>
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F3F5F0]" role="group" aria-label="Expense category">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      category === cat
                        ? 'bg-white text-[#1C2420] shadow-xs'
                        : 'text-[#526058] hover:text-[#1C2420]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#526058] mb-1.5">Purchase Type</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Purchase type">
                <button
                  type="button"
                  onClick={() => setPurchaseType('planned')}
                  aria-pressed={purchaseType === 'planned'}
                  className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    purchaseType === 'planned'
                      ? 'border-[#2E7D5B] bg-[#EBF5F0] text-[#174632]'
                      : 'border-[#DCE0D6] bg-white text-[#526058] hover:bg-[#F7F8F5]'
                  }`}
                >
                  Planned Meal
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseType('impulse')}
                  aria-pressed={purchaseType === 'impulse'}
                  className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    purchaseType === 'impulse'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-[#DCE0D6] bg-white text-[#526058] hover:bg-[#F7F8F5]'
                  }`}
                >
                  Impulse Buy
                </button>
              </div>
            </div>

            {formError && <p className="text-xs text-red-700">{formError}</p>}

            <button
              type="submit"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2E7D5B] text-white text-sm font-semibold hover:bg-[#246348] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              Add Expense
            </button>
          </form>
        </section>
      </div>

      {/* Bottom 2-column grid: Today's Expense Ledger + Wellness & Spending Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Today meal expenses"
          className="lg:col-span-7 rounded-2xl border border-[#E4E7DF] bg-white p-6"
        >
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#ECEFE8]">
            <h2 className="text-lg font-bold text-[#1C2420]">
              Today&apos;s Meal Ledger
            </h2>
            <span className="text-xs text-[#526058] tabular-nums">
              {todayExpenses.length} {todayExpenses.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {todayExpenses.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-[#526058]">
                No meal expenses logged yet today.
              </p>
              <p className="text-xs text-[#738079] mt-1">
                Use the Quick Expense Logger above to track what you spend.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#ECEFE8] mt-1" data-testid="expense-ledger-list">
              {todayExpenses.map((entry) => {
                const overPerMeal =
                  settings.perMealCap !== null && entry.cost > settings.perMealCap;
                return (
                  <li
                    key={entry.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1C2420] truncate">
                        {entry.mealName}
                      </p>
                      <p className="text-xs text-[#526058] mt-0.5">
                        {entry.category} ·{' '}
                        <span
                          className={
                            entry.type === 'impulse'
                              ? 'text-amber-700 font-medium'
                              : 'text-[#2E7D5B] font-medium'
                          }
                        >
                          {entry.type === 'impulse' ? 'Impulse buy' : 'Planned'}
                        </span>{' '}
                        · {entry.loggedAt}
                        {overPerMeal && (
                          <span className="text-red-700 font-medium"> · Above per-meal target</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-semibold text-[#1C2420] tabular-nums">
                        {formatCurrency(entry.cost, settings.currencySymbol)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(entry.id)}
                        aria-label={`Delete ${entry.mealName}`}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#738079] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Wellness & Spending Insights */}
        <section
          aria-label="Wellness and spending insights"
          data-testid="wellness-insights-card"
          className="lg:col-span-5 rounded-2xl border border-[#E4E7DF] bg-white p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#ECEFE8]">
            <div>
              <h2 className="text-lg font-bold text-[#1C2420]">
                Wellness &amp; Spending Insights
              </h2>
              <p className="text-xs text-[#526058] mt-0.5">
                Weekly recap linking focus breaks to food spending.
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-[#2B6CB0] shrink-0" aria-hidden="true" />
          </div>

          <p className="text-sm leading-relaxed text-[#1C2420] font-medium">
            {insights.summaryText}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#ECEFE8]">
            <div>
              <p className="text-xs text-[#526058]">Planned Meals</p>
              <p className="font-mono text-lg font-semibold text-[#2E7D5B] tabular-nums mt-0.5">
                {formatCurrency(insights.plannedTotal, settings.currencySymbol)}
              </p>
              <p className="text-xs text-[#738079] tabular-nums">
                {insights.plannedCount} {insights.plannedCount === 1 ? 'meal' : 'meals'}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#526058]">Impulse Buys</p>
              <p className="font-mono text-lg font-semibold text-amber-700 tabular-nums mt-0.5">
                {formatCurrency(insights.impulseTotal, settings.currencySymbol)}
              </p>
              <p className="text-xs text-[#738079] tabular-nums">
                {insights.impulseCount} {insights.impulseCount === 1 ? 'meal' : 'meals'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#ECEFE8] grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[#526058]">Avg Spend (With Breaks)</p>
              <p className="font-mono text-sm font-semibold text-[#1C2420] tabular-nums mt-0.5">
                {formatCurrency(insights.breakDayAvgSpend, settings.currencySymbol)} / day
              </p>
            </div>
            <div>
              <p className="text-[#526058]">Avg Spend (No Breaks)</p>
              <p className="font-mono text-sm font-semibold text-red-700 tabular-nums mt-0.5">
                {formatCurrency(insights.nonBreakDayAvgSpend, settings.currencySymbol)} / day
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
