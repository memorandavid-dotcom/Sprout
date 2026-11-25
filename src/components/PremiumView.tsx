import { useState, useRef } from 'react';
import {
  Camera,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Sparkles,
  Upload,
  Utensils,
} from 'lucide-react';
import { SCANNER_SAMPLE_MEALS, SMART_MEAL_CATALOG } from '../data/seedData';
import type {
  DietaryRestriction,
  MealCategory,
  ScannedMealPreset,
  SmartMealOption,
} from '../types/sprout';
import {
  filterSmartMeals,
  formatCurrency,
  getCurrencyMultiplier,
} from '../utils/sproutLogic';

interface PremiumViewProps {
  remainingBudget: number;
  currencySymbol: string;
  dietaryRestrictions: DietaryRestriction[];
  onLogScannedIntake: (meal: {
    name: string;
    category: MealCategory;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    deductCost?: number;
  }) => void;
  onSelectSmartMeal: (meal: SmartMealOption, localPrice: number) => void;
  onGoToDietSettings: () => void;
}

export function PremiumView({
  remainingBudget,
  currencySymbol,
  dietaryRestrictions,
  onLogScannedIntake,
  onSelectSmartMeal,
  onGoToDietSettings,
}: PremiumViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScannedMealPreset>(SCANNER_SAMPLE_MEALS[0]);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [deductEstimatedCost, setDeductEstimatedCost] = useState(false);
  const [scanLoggedMessage, setScanLoggedMessage] = useState<string | null>(null);
  const [orderedMealId, setOrderedMealId] = useState<string | null>(null);

  const multiplier = getCurrencyMultiplier(currencySymbol);
  const matchingMeals = filterSmartMeals(
    SMART_MEAL_CATALOG,
    remainingBudget,
    dietaryRestrictions,
    multiplier
  );

  const triggerSampleScan = (preset: ScannedMealPreset) => {
    setUploadedPreviewUrl(null);
    setScanLoggedMessage(null);
    setIsScanning(true);
    setSelectedScan(preset);
    window.setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPreviewUrl(reader.result);
        setScanLoggedMessage(null);
        setIsScanning(true);
        // Match a realistic breakdown based on filename or default sample
        const lower = file.name.toLowerCase();
        const matched =
          SCANNER_SAMPLE_MEALS.find((m) =>
            lower.includes('salmon')
              ? m.id === 'scan-salmon-bento'
              : lower.includes('wrap')
              ? m.id === 'scan-med-wrap'
              : lower.includes('parfait') || lower.includes('oat')
              ? m.id === 'scan-berry-parfait'
              : false
          ) ?? SCANNER_SAMPLE_MEALS[0];
        setSelectedScan({
          ...matched,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || matched.name,
        });
        window.setTimeout(() => setIsScanning(false), 500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogIntake = () => {
    const localCost = Number((selectedScan.estimatedCostUsd * multiplier).toFixed(2));
    onLogScannedIntake({
      name: selectedScan.name,
      category: selectedScan.category,
      calories: selectedScan.calories,
      proteinGrams: selectedScan.proteinGrams,
      carbsGrams: selectedScan.carbsGrams,
      fatsGrams: selectedScan.fatsGrams,
      deductCost: deductEstimatedCost ? localCost : undefined,
    });
    setScanLoggedMessage(`Logged "${selectedScan.name}" to your daily intake.`);
  };

  const handleChooseSmartMeal = (meal: SmartMealOption, localPrice: number) => {
    onSelectSmartMeal(meal, localPrice);
    setOrderedMealId(meal.id);
    window.setTimeout(() => setOrderedMealId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#2B6CB0]">
            Interactive Preview · Coming Soon
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2420] mt-1">
            Sprout Plus Nutrition &amp; Meal Discovery
          </h1>
          <p className="text-sm text-[#526058] mt-1 max-w-2xl">
            Preview upcoming AI meal scanning and budget-aware food discovery tuned to your live Sprout profile.
          </p>
        </div>
      </div>

      {/* Feature 1: AI Meal & Calorie Scanner */}
      <section
        aria-label="AI meal and calorie scanner preview"
        className="rounded-2xl border border-[#E4E7DF] bg-white p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#ECEFE8]">
          <div>
            <h2 className="text-xl font-bold text-[#1C2420]">
              01. AI Meal &amp; Calorie Scanner
            </h2>
            <p className="text-xs text-[#526058] mt-0.5">
              Snap or pick a meal photo to inspect estimated calories, macros, and log it in one tap.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload meal photo to scan"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2B6CB0] text-white text-xs font-semibold hover:bg-[#235891] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              Scan Your Food
            </button>
          </div>
        </div>

        {/* Sample photo selector */}
        <div className="mt-5">
          <p className="text-xs font-medium text-[#526058] mb-2.5">
            Or click a sample meal photo to preview scanning:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SCANNER_SAMPLE_MEALS.map((sample) => {
              const active = selectedScan.id === sample.id && !uploadedPreviewUrl;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => triggerSampleScan(sample)}
                  className={`group text-left rounded-xl border p-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#2B6CB0] bg-[#F2F7FB]'
                      : 'border-[#E4E7DF] bg-[#FAFBF8] hover:bg-white'
                  }`}
                >
                  <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#ECEFE8]">
                    <img
                      src={sample.image}
                      alt={sample.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#1C2420] truncate">
                    {sample.name}
                  </p>
                  <p className="text-[11px] text-[#526058] tabular-nums">
                    {sample.calories} kcal · {formatCurrency(sample.estimatedCostUsd * multiplier, currencySymbol)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scanned Result Panel */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-[#ECEFE8] items-stretch">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] lg:h-full lg:aspect-auto min-h-[220px] rounded-xl overflow-hidden bg-[#ECEFE8] border border-[#E4E7DF]">
              <img
                src={uploadedPreviewUrl ?? selectedScan.image}
                alt={selectedScan.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-[#1C2420]/55 flex flex-col items-center justify-center text-white gap-2">
                  <Sparkles className="w-6 h-6" aria-hidden="true" />
                  <span className="text-xs font-semibold">Analyzing meal nutrition...</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 data-testid="scanned-meal-title" className="text-xl font-bold text-[#1C2420]">
                  {selectedScan.name}
                </h3>
                <span className="text-xs font-medium text-[#2E7D5B]">
                  {selectedScan.dietaryNotes}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#ECEFE8] border-y border-[#ECEFE8] py-3">
                <div className="pr-3 py-1">
                  <p className="text-xs text-[#526058]">Calories</p>
                  <p data-testid="scanned-calories" className="font-mono text-xl font-semibold text-[#1C2420] tabular-nums mt-0.5">
                    {selectedScan.calories}
                  </p>
                  <p className="text-[11px] text-[#738079]">kcal est.</p>
                </div>
                <div className="sm:px-4 py-1">
                  <p className="text-xs text-[#526058]">Protein</p>
                  <p className="font-mono text-xl font-semibold text-[#2B6CB0] tabular-nums mt-0.5">
                    {selectedScan.proteinGrams}g
                  </p>
                  <p className="text-[11px] text-[#738079]">macros</p>
                </div>
                <div className="pr-3 sm:px-4 py-1">
                  <p className="text-xs text-[#526058]">Carbs</p>
                  <p className="font-mono text-xl font-semibold text-[#1C2420] tabular-nums mt-0.5">
                    {selectedScan.carbsGrams}g
                  </p>
                  <p className="text-[11px] text-[#738079]">{selectedScan.fiberGrams}g fiber</p>
                </div>
                <div className="sm:pl-4 py-1">
                  <p className="text-xs text-[#526058]">Fats</p>
                  <p className="font-mono text-xl font-semibold text-[#1C2420] tabular-nums mt-0.5">
                    {selectedScan.fatsGrams}g
                  </p>
                  <p className="text-[11px] text-[#738079]">balanced</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#ECEFE8]">
              <label className="flex items-center gap-2.5 text-xs text-[#3F4A44] cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductEstimatedCost}
                  onChange={(e) => setDeductEstimatedCost(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2E7D5B]"
                />
                <span>
                  Also deduct estimated cost (
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrency(selectedScan.estimatedCostUsd * multiplier, currencySymbol)}
                  </span>
                  ) from today&apos;s food budget
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogIntake}
                  data-testid="log-scanned-intake-btn"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#2E7D5B] text-white text-sm font-semibold hover:bg-[#246348] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Utensils className="w-4 h-4" aria-hidden="true" />
                  Log to Daily Intake
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DCE0D6] bg-white text-xs font-medium text-[#1C2420] hover:bg-[#F3F5F0] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  Upload Another Photo
                </button>
              </div>

              {scanLoggedMessage && (
                <p
                  data-testid="scan-logged-confirmation"
                  className="text-xs font-semibold text-[#2E7D5B] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  {scanLoggedMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Budget-Aware Food & Delivery Finder */}
      <section
        aria-label="Budget-aware smart meal finder preview"
        className="rounded-2xl border border-[#E4E7DF] bg-white p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#ECEFE8]">
          <div>
            <h2 className="text-xl font-bold text-[#1C2420]">
              02. Smart Meal Finder
            </h2>
            <p className="text-xs text-[#526058] mt-0.5">
              Automatically filtered to fit your remaining budget of{' '}
              <span className="font-mono font-semibold text-[#1C2420] tabular-nums">
                {formatCurrency(remainingBudget, currencySymbol)}
              </span>{' '}
              and dietary rules:{' '}
              <span className="font-semibold text-[#2E7D5B]">
                {dietaryRestrictions.join(' · ')}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToDietSettings}
            className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#DCE0D6] text-xs font-medium text-[#1C2420] hover:bg-[#F3F5F0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Adjust Diet Rules
          </button>
        </div>

        {matchingMeals.length === 0 ? (
          <div className="py-10 text-center" data-testid="smart-finder-empty">
            <p className="text-sm font-semibold text-[#1C2420]">
              No local or delivery options fit under{' '}
              {formatCurrency(remainingBudget, currencySymbol)} for {dietaryRestrictions.join(', ')}.
            </p>
            <p className="text-xs text-[#526058] mt-1">
              Consider raising your daily food cap in the Budget tab or preparing a quick pantry snack.
            </p>
          </div>
        ) : (
          <div
            data-testid="smart-finder-grid"
            className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {matchingMeals.slice(0, 4).map((meal) => {
              const localPrice = Number((meal.priceUsd * multiplier).toFixed(2));
              const wasOrdered = orderedMealId === meal.id;
              return (
                <article
                  key={meal.id}
                  className="rounded-xl border border-[#E4E7DF] bg-[#FAFBF8] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] w-full bg-[#ECEFE8] overflow-hidden">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#526058]">
                        <span className="font-medium text-[#2B6CB0] flex items-center gap-1">
                          {meal.channel === 'Nearby Spot' ? (
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          {meal.channel}
                        </span>
                        <span className="tabular-nums">{meal.prepOrEta}</span>
                      </div>

                      <h3 className="mt-1.5 text-base font-bold text-[#1C2420]">
                        {meal.name}
                      </h3>
                      <p className="text-xs text-[#526058] mt-0.5">
                        {meal.vendor} · {meal.calories} kcal · {meal.proteinGrams}g protein
                      </p>
                      <p className="text-xs text-[#526058] mt-2 leading-relaxed">
                        {meal.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3 border-t border-[#ECEFE8] flex items-center justify-between gap-3">
                    <span className="font-mono text-base font-semibold text-[#1C2420] tabular-nums">
                      {formatCurrency(localPrice, currencySymbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChooseSmartMeal(meal, localPrice)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        wasOrdered
                          ? 'bg-[#EBF5F0] text-[#174632] border border-[#C6E2D3]'
                          : 'bg-[#2B6CB0] text-white hover:bg-[#235891]'
                      }`}
                    >
                      {wasOrdered ? 'Logged to Budget' : meal.channel}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
