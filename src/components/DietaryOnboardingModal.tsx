import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { ALL_DIETARY_RESTRICTIONS, ALL_HEALTH_GOALS } from '../data/seedData';
import type { DietaryProfile, DietaryRestriction, HealthGoal } from '../types/sprout';
import { sanitizeDietarySelection } from '../utils/sproutLogic';

interface DietaryOnboardingModalProps {
  open: boolean;
  profile: DietaryProfile;
  onSave: (nextProfile: DietaryProfile) => void;
  onClose: () => void;
}

export function DietaryOnboardingModal({
  open,
  profile,
  onSave,
  onClose,
}: DietaryOnboardingModalProps) {
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>(profile.restrictions);
  const [goals, setGoals] = useState<HealthGoal[]>(profile.goals);

  useEffect(() => {
    if (open) {
      setRestrictions(profile.restrictions);
      setGoals(profile.goals);
    }
  }, [open, profile]);

  if (!open) return null;

  const toggleRestriction = (item: DietaryRestriction) => {
    setRestrictions((prev) => sanitizeDietarySelection(prev, item));
  };

  const toggleGoal = (goal: HealthGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      isConfigured: true,
      restrictions,
      goals: goals.length > 0 ? goals : ['Eat on a schedule'],
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diet-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#E4E7DF] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECEFE8]">
          <div>
            <h2 id="diet-modal-title" className="text-xl font-bold text-[#1C2420]">
              Dietary Profile &amp; Wellness Goals
            </h2>
            <p className="text-xs text-[#526058] mt-1">
              Sprout filters meal recommendations and reminds you around your preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dietary profile dialog"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#526058] hover:bg-[#F3F5F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#1C2420] mb-2.5">
              Dietary Restrictions &amp; Preferences
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ALL_DIETARY_RESTRICTIONS.map((item) => {
                const selected = restrictions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleRestriction(item)}
                    aria-pressed={selected}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#2E7D5B] bg-[#EBF5F0] text-[#174632]'
                        : 'border-[#E4E7DF] bg-white text-[#3F4A44] hover:bg-[#F7F8F5]'
                    }`}
                  >
                    <span>{item}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#1C2420] mb-2.5">
              Personal Health Goals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_HEALTH_GOALS.map((goal) => {
                const selected = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    aria-pressed={selected}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#2B6CB0] bg-[#EBF3FA] text-[#183959]'
                        : 'border-[#E4E7DF] bg-white text-[#3F4A44] hover:bg-[#F7F8F5]'
                    }`}
                  >
                    <span>{goal}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-[#2B6CB0] shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECEFE8]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-[#526058] hover:bg-[#F3F5F0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-[#2E7D5B] text-white hover:bg-[#246348] transition-colors cursor-pointer"
            >
              Save Dietary Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
