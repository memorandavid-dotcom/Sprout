import type { MascotMood } from '../types/sprout';
import type { MascotPresentation } from '../utils/sproutLogic';

interface SproutMascotProps {
  presentation: MascotPresentation;
  compact?: boolean;
  onQuickWater?: () => void;
  onQuickBreak?: () => void;
}

export function ScrubJayIllustration({
  mood,
  size = 152,
}: {
  mood: MascotMood;
  size?: number;
}) {
  const isSleepy = mood === 'overworked' || mood === 'burnout';
  const isHappy = mood === 'hydrated' || mood === 'meal_alarm';
  const isFocused = mood === 'active';

  // Soft contextual backdrop tint inside the bird's perch
  const perchColor =
    mood === 'burnout'
      ? '#FEE2E2'
      : mood === 'overworked'
      ? '#FEF3C7'
      : mood === 'hydrated'
      ? '#DCFCE7'
      : mood === 'meal_alarm'
      ? '#E0F2FE'
      : '#E8F0EB';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Sprout the Western Scrub-Jay looking ${mood.replace('_', ' ')}`}
      className="select-none shrink-0"
    >
      {/* Ground / Perch Shadow */}
      <ellipse cx="90" cy="154" rx="54" ry="12" fill={perchColor} />

      {/* Small botanical twig perch */}
      <path
        d="M44 146C68 142 112 142 138 147"
        stroke="#7C6A58"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M126 145C130 138 138 136 142 139C138 144 132 146 126 145Z"
        fill="#3B8258"
      />

      {/* Tail feathers (Western Scrub-Jay long slate-blue tail) */}
      <path
        d="M124 118L162 136L154 144L118 128Z"
        fill="#275B94"
      />
      <path
        d="M126 114L164 126L160 135L120 124Z"
        fill="#326FB0"
      />

      {/* Little feet */}
      <path
        d="M78 138V146M74 146H82M102 138V146M98 146H106"
        stroke="#4A4E54"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Chibi Round Body - Warm slate-blue back + soft warm-gray/cream belly */}
      <ellipse cx="90" cy="108" rx="42" ry="35" fill="#326FB0" />
      <ellipse cx="86" cy="113" rx="31" ry="27" fill="#F4F5F0" />

      {/* Scrub-Jay slate-blue chest necklace framing the pale throat */}
      <path
        d="M58 96C65 107 76 112 86 112C96 112 107 107 114 96"
        stroke="#275B94"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Left & Right Wings */}
      <path
        d={
          isHappy
            ? 'M49 95C34 86 30 98 44 114C50 119 56 114 55 105Z'
            : 'M49 94C40 103 42 122 54 126C60 124 61 108 56 97Z'
        }
        fill="#245388"
        className="transition-transform duration-200"
      />
      <path
        d={
          isHappy
            ? 'M129 95C144 86 148 98 134 114C128 119 122 114 123 105Z'
            : 'M129 94C138 103 136 122 124 126C118 124 117 108 122 97Z'
        }
        fill="#245388"
        className="transition-transform duration-200"
      />

      {/* Chibi Head */}
      <circle cx="88" cy="68" r="34" fill="#3676BA" />

      {/* Crest feathers */}
      <path
        d="M78 36C74 24 85 22 90 34C95 23 104 26 99 38Z"
        fill="#2B629D"
      />

      {/* Little Sprout Leaf tucked behind the crest */}
      <path
        d="M92 34C92 22 104 16 112 20C108 30 99 34 92 34Z"
        fill="#348B5A"
      />
      <path
        d="M93 33C97 27 102 23 108 21"
        stroke="#86EFAC"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Scrub-Jay Pale Throat & Cheek Markings */}
      <ellipse cx="86" cy="83" rx="22" ry="15" fill="#F6F7F2" />

      {/* Characteristic dark slate ear/cheek patch */}
      <ellipse cx="64" cy="69" rx="10" ry="7.5" fill="#1F344D" opacity="0.88" />
      <ellipse cx="110" cy="69" rx="10" ry="7.5" fill="#1F344D" opacity="0.88" />

      {/* White eyebrow supercilium lines */}
      <path
        d="M58 55C63 50 72 50 76 53"
        stroke="#F6F7F2"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M100 53C104 50 113 50 118 55"
        stroke="#F6F7F2"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Eyes based on Mood */}
      {isSleepy ? (
        <>
          <path
            d="M65 65C68 69 75 69 78 65"
            stroke="#152233"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M98 65C101 69 108 69 111 65"
            stroke="#152233"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : isHappy ? (
        <>
          <path
            d="M65 66C68 60 75 60 78 66"
            stroke="#152233"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M98 66C101 60 108 60 111 66"
            stroke="#152233"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="71.5" cy="64" r="5.2" fill="#152233" />
          <circle cx="73" cy="62" r="1.8" fill="#FFFFFF" />
          <circle cx="104.5" cy="64" r="5.2" fill="#152233" />
          <circle cx="106" cy="62" r="1.8" fill="#FFFFFF" />
        </>
      )}

      {/* Subtle Rosy Cheeks */}
      <ellipse cx="62" cy="76" rx="4.5" ry="2.6" fill="#F29C9C" opacity="0.55" />
      <ellipse cx="112" cy="76" rx="4.5" ry="2.6" fill="#F29C9C" opacity="0.55" />

      {/* Cute Scrub-Jay Beak */}
      <path
        d="M82 69L88 64L94 69L88 76Z"
        fill="#2E3742"
      />
      <path
        d="M84 69H92"
        stroke="#4D5968"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Contextual Prop: Water drop when hydrated, tiny book/spark when focused, sweat drop when overworked */}
      {mood === 'hydrated' && (
        <path
          d="M140 52C140 52 148 61 148 66C148 70.4 144.4 74 140 74C135.6 74 132 70.4 132 66C132 61 140 52 140 52Z"
          fill="#38BDF8"
        />
      )}
      {mood === 'overworked' && (
        <path
          d="M134 48C134 48 139 54 139 57.5C139 60.2 136.8 62.5 134 62.5C131.2 62.5 129 60.2 129 57.5C129 54 134 48 134 48Z"
          fill="#93C5FD"
        />
      )}
      {mood === 'burnout' && (
        <g>
          <circle cx="136" cy="52" r="9" fill="#DC2626" />
          <path d="M136 47V53M136 56.5V57" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      {isFocused && (
        <rect x="66" y="114" width="44" height="20" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      )}
      {isFocused && (
        <path d="M88 114V134" stroke="#94A3B8" strokeWidth="1.5" />
      )}
    </svg>
  );
}

export function SproutMascot({
  presentation,
  compact = false,
  onQuickWater,
  onQuickBreak,
}: SproutMascotProps) {
  const toneStyles =
    presentation.mood === 'burnout'
      ? 'bg-red-50/70 border-red-200'
      : presentation.mood === 'overworked'
      ? 'bg-amber-50/70 border-amber-200'
      : presentation.mood === 'meal_alarm'
      ? 'bg-sky-50/70 border-sky-200'
      : presentation.mood === 'hydrated'
      ? 'bg-emerald-50/60 border-emerald-200'
      : 'bg-white border-[#E4E7DF]';

  const statusTextColor =
    presentation.mood === 'burnout'
      ? 'text-red-700'
      : presentation.mood === 'overworked'
      ? 'text-amber-800'
      : presentation.mood === 'meal_alarm'
      ? 'text-sky-800'
      : presentation.mood === 'hydrated'
      ? 'text-emerald-800'
      : 'text-[#2B6CB0]';

  return (
    <section
      aria-label="Sprout companion status"
      data-testid="sprout-mascot-card"
      data-mood={presentation.mood}
      className={`rounded-2xl border p-5 transition-colors duration-200 ${toneStyles}`}
    >
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-black/5">
        <div className="flex items-center gap-2 text-xs font-medium text-[#526058]">
          <span className="font-semibold text-[#1C2420]">Sprout</span>
          <span aria-hidden="true">·</span>
          <span>Western Scrub-Jay</span>
        </div>
        <span className={`text-xs font-semibold ${statusTextColor}`}>
          {presentation.statusLabel}
        </span>
      </div>

      <div className={`mt-4 flex ${compact ? 'flex-row items-center gap-4' : 'flex-col sm:flex-row items-center gap-5'}`}>
        <div className="shrink-0">
          <ScrubJayIllustration mood={presentation.mood} size={compact ? 110 : 148} />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="rounded-xl bg-[#F7F8F5] p-4">
            <p
              data-testid="sprout-speech-text"
              className="text-base font-semibold leading-snug text-[#1C2420]"
            >
              “{presentation.message}”
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#526058]">
              {presentation.hint}
            </p>
          </div>

          {(onQuickWater || onQuickBreak) && (
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {onQuickWater && (
                <button
                  type="button"
                  onClick={onQuickWater}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#EBF5F0] text-[#1F5E41] hover:bg-[#DCF0E6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sip Water (+1 Cup)
                </button>
              )}
              {onQuickBreak && presentation.mood === 'overworked' && (
                <button
                  type="button"
                  onClick={onQuickBreak}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#E8F1FA] text-[#22558C] hover:bg-[#D8E8F7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Take 5m Stretch
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
