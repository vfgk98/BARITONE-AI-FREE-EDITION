import React from 'react';
import { Radio } from 'lucide-react';

interface WaveVisualizerProps {
  isGenerating: boolean;
  activeVoiceName?: string;
}

export const WaveVisualizer: React.FC<WaveVisualizerProps> = ({
  isGenerating,
  activeVoiceName = 'المذيع الفخم',
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-xs font-mono shadow-xs">
      {/* Top Console Meter */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${isGenerating ? 'bg-red-600 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-gray-800 font-sans font-semibold">
            {isGenerating ? 'جاري معالجة النبرة الصوتية والبث...' : 'محرك الصوت جاهز للبث'}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-red-600 font-bold">BARITONE CORE</span>
          <span className="text-gray-300">|</span>
          <span>48kHz MASTERING</span>
        </div>
      </div>

      {/* Frequency & VU Bars */}
      <div className="mt-3 flex items-end justify-between gap-1 h-12">
        {Array.from({ length: 36 }).map((_, i) => {
          // Dynamic height simulation
          const heightPercent = isGenerating
            ? Math.floor(20 + Math.sin(i * 0.4) * 40 + Math.random() * 40)
            : 15 + ((i * 7) % 25);

          const isPeak = heightPercent > 70;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
              <div
                className={`w-full rounded-xs transition-all duration-150 ${
                  isGenerating
                    ? isPeak
                      ? 'bg-gradient-to-t from-red-700 via-red-500 to-red-400'
                      : 'bg-red-600/80'
                    : 'bg-gray-100'
                }`}
                style={{
                  height: `${heightPercent}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Meter decibel scale */}
      <div className="mt-1 flex justify-between text-[9px] text-gray-400 font-mono px-1">
        <span>-36dB</span>
        <span>-24dB</span>
        <span>-12dB</span>
        <span>-6dB</span>
        <span className="text-red-600 font-bold">0dB</span>
        <span className="text-red-700 font-bold">+3dB CLIP</span>
      </div>

      {isGenerating && (
        <div className="mt-2 flex items-center justify-center gap-2 rounded bg-red-50 py-1.5 text-xs text-red-700 border border-red-200">
          <Radio className="h-3.5 w-3.5 animate-pulse text-red-600" />
          <span>يتم الآن استدعاء النموذج الصوتي {activeVoiceName} عبر الحصة المجانية لـ Gemini...</span>
        </div>
      )}
    </div>
  );
};
