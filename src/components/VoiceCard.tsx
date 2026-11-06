import React from 'react';
import { Check, Volume2 } from 'lucide-react';
import { VoicePersona } from '../types';

interface VoiceCardProps {
  voice: VoicePersona;
  isSelected: boolean;
  onSelect: (voice: VoicePersona) => void;
  onPreviewSample?: (voice: VoicePersona) => void;
  isPreviewing?: boolean;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected,
  onSelect,
  onPreviewSample,
  isPreviewing = false,
}) => {
  return (
    <div
      onClick={() => onSelect(voice)}
      className={`group relative flex flex-col justify-between rounded-2xl p-4 cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'border-red-600 bg-red-50/50 shadow-sm glow-red-subtle'
          : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
      }`}
    >
      {/* Top Row: Name and Checkmark / Badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900 text-base group-hover:text-red-600 transition-colors">
                {voice.name}
              </h4>
              {isSelected && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>
            <p className="text-xs text-red-600 font-medium mt-0.5">{voice.tagline}</p>
          </div>

          {/* Depth meter badge */}
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-[10px] font-mono text-red-700 font-bold">
              {voice.depthScore}% باريتون
            </span>
            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-700"
                style={{ width: `${voice.depthScore}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 my-2.5">
          {voice.description}
        </p>
      </div>

      {/* Bottom Technical Disclosure & Preview Action */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
          <span>الأساس الصوتي: <strong className="text-gray-700">{voice.baseVoice}</strong></span>
        </div>

        {onPreviewSample && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreviewSample(voice);
            }}
            disabled={isPreviewing}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-700 hover:text-red-900 hover:underline"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>{isPreviewing ? 'جاري الاستماع...' : 'تجربة العينة'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
