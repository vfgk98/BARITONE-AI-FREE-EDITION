import React from 'react';
import { Sliders, Gauge, Activity, Heart, Wind, MessageSquare } from 'lucide-react';
import { VoiceSettings } from '../types';

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  onChange: (updated: Partial<VoiceSettings>) => void;
  onReset: () => void;
}

export const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  settings,
  onChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-red-600" />
          <h4 className="text-sm font-bold text-gray-900">إعدادات الصوت والأداء الصوتي الدقيق</h4>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-gray-500 hover:text-red-600 underline decoration-dotted"
        >
          استعادة الافتراضي
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        {/* 1. سرعة الإلقاء (Pacing) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-red-600" />
              <span>سرعة الكلام (Pacing)</span>
            </span>
            <span className="font-mono text-red-700 font-bold">{settings.pacing}x</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={1.25}
            step={0.05}
            value={settings.pacing}
            onChange={(e) => onChange({ pacing: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>رزين وهادئ (0.8x)</span>
            <span>متوازن (1.0x)</span>
            <span>سريع إخباري (1.25x)</span>
          </div>
        </div>

        {/* 2. عمق الصوت والباريتون (Resonant Depth) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-red-600" />
              <span>عمق الصوت والجهورية (Baritone Depth)</span>
            </span>
            <span className="font-mono text-red-700 font-bold">{settings.depth}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={settings.depth}
            onChange={(e) => onChange({ depth: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>طبيعي</span>
            <span>رخيم وثقيل</span>
            <span>أقصى جهورية سينمائية</span>
          </div>
        </div>

        {/* 3. العاطفة والشعور (Emotion) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-red-600" />
              <span>العاطفة والنبرة (Emotion)</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'solemn', label: 'وقور ورزين' },
              { id: 'enthusiastic', label: 'حماسي وقوي' },
              { id: 'warm', label: 'ودود وهادئ' },
              { id: 'dramatic', label: 'درامي مهيب' },
              { id: 'neutral', label: 'محايد إخباري' },
            ].map((emo) => (
              <button
                key={emo.id}
                onClick={() => onChange({ emotion: emo.id as any })}
                className={`py-1 px-2 rounded-lg text-[11px] font-medium transition-all ${
                  settings.emotion === emo.id
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {emo.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. درجة الرسمية (Formality) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-red-600" />
              <span>درجة الرسمية (Formality)</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'formal', label: 'رسمي رفيع' },
              { id: 'semi-formal', label: 'شبه رسمي' },
              { id: 'casual', label: 'حواري عفوي' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onChange({ formality: f.id as any })}
                className={`py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  settings.formality === f.id
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. الوقفات والأنفاس الطبيعية */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-red-600" />
              <span>الوقفات بين الجمل (Cadence)</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'brief', label: 'وقفات سريعة' },
              { id: 'standard', label: 'وقفات قياسية' },
              { id: 'cinematic', label: 'وقفات درامية' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onChange({ pauseLength: p.id as any })}
                className={`py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  settings.pauseLength === p.id
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. طبيعية الأداء وأنماط التنفس */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <span className="text-gray-700">طبيعية الأداء والتنفس</span>
          <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-2.5 cursor-pointer hover:border-red-300">
            <div>
              <p className="text-gray-900 font-medium text-[11px]">تضمين أنفاس واقعية (&lt;breath&gt;)</p>
              <p className="text-[10px] text-gray-500">محاكاة حركة التنفس البشري الطبيعي</p>
            </div>
            <input
              type="checkbox"
              checked={settings.includeBreaths}
              onChange={(e) => onChange({ includeBreaths: e.target.checked })}
              className="h-4 w-4 rounded accent-red-600"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
        <span>💡 يتم ترجمة هذه المعايير كتعليمات صوتية متخصصة ومقاييس نطق موجهة لمحرك Gemini 3.8 TTS.</span>
      </div>
    </div>
  );
};
