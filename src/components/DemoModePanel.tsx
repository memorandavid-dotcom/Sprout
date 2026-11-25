import { FastForward, RotateCcw, Bell, Droplets, X } from 'lucide-react';
import type { MascotMood } from '../types/sprout';

interface DemoModePanelProps {
  open: boolean;
  onClose: () => void;
  onFastForwardMinutes: (minutes: number) => void;
  onTriggerHydrationAlert: () => void;
  onTriggerMealAlarm: () => void;
  overrideMood: MascotMood | null;
  onChangeOverrideMood: (mood: MascotMood | null) => void;
  onResetDemoData: () => void;
}

const MOOD_OPTIONS: { value: MascotMood | null; label: string }[] = [
  { value: null, label: 'Auto (Live)' },
  { value: 'idle', label: 'Idle' },
  { value: 'active', label: 'Locked In' },
  { value: 'hydrated', label: 'Hydrated' },
  { value: 'overworked', label: 'Overworked (2h+)' },
  { value: 'burnout', label: 'Burnout (4h+)' },
];

export function DemoModePanel({
  open,
  onClose,
  onFastForwardMinutes,
  onTriggerHydrationAlert,
  onTriggerMealAlarm,
  overrideMood,
  onChangeOverrideMood,
  onResetDemoData,
}: DemoModePanelProps) {
  if (!open) return null;

  return (
    <section
      aria-label="Live presentation demo controls"
      data-testid="demo-mode-panel"
      className="mb-6 rounded-2xl border border-[#C7D8E8] bg-[#F2F7FB] p-4"
    >
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D9E6F2]">
        <div>
          <h2 className="text-sm font-semibold text-[#183959]">
            Presentation Demo Controls
          </h2>
          <p className="text-xs text-[#436485]">
            Simulate alarms, fast-forward focus time, or preview Sprout mascot reactions live.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Demo Mode panel"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#436485] hover:bg-[#E1EEF9] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onFastForwardMinutes(30)}
          className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#C7D8E8] text-[#1C2420] hover:bg-[#E8F1FA] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5 text-[#2B6CB0]" aria-hidden="true" />
          Fast-Forward +30m
        </button>

        <button
          type="button"
          onClick={() => onFastForwardMinutes(120)}
          className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#C7D8E8] text-[#1C2420] hover:bg-[#E8F1FA] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5 text-[#2B6CB0]" aria-hidden="true" />
          Fast-Forward +2h
        </button>

        <button
          type="button"
          onClick={onTriggerHydrationAlert}
          className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#C7D8E8] text-[#1C2420] hover:bg-emerald-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-[#2E7D5B]" aria-hidden="true" />
          Trigger Water Alert
        </button>

        <button
          type="button"
          onClick={onTriggerMealAlarm}
          className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#C7D8E8] text-[#1C2420] hover:bg-sky-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-[#2B6CB0]" aria-hidden="true" />
          Trigger Meal Alarm
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="demo-mascot-select" className="text-xs font-medium text-[#436485]">
            Mascot:
          </label>
          <select
            id="demo-mascot-select"
            value={overrideMood ?? 'auto'}
            onChange={(e) => {
              const val = e.target.value;
              onChangeOverrideMood(val === 'auto' ? null : (val as MascotMood));
            }}
            className="min-h-[40px] rounded-lg border border-[#C7D8E8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1C2420]"
          >
            {MOOD_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? 'auto'}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onResetDemoData}
            className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-medium text-[#436485] hover:bg-[#E1EEF9] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Demo
          </button>
        </div>
      </div>
    </section>
  );
}
