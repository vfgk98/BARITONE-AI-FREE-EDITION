import React, { useState } from 'react';
import {
  Wand2,
  Tv,
  Film,
  Users,
  Wind,
  Languages,
  RotateCcw,
  Sparkles,
  Check,
  Globe,
} from 'lucide-react';

interface ScriptEnhancerProps {
  currentText: string;
  onUpdateText: (newText: string) => void;
  disabled?: boolean;
}

export const ScriptEnhancer: React.FC<ScriptEnhancerProps> = ({
  currentText,
  onUpdateText,
  disabled = false,
}) => {
  const [loadingMode, setLoadingMode] = useState<string | null>(null);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleEnhance = async (mode: string, label: string) => {
    if (!currentText.trim() || disabled || loadingMode) return;

    setLoadingMode(mode);
    setPreviousText(currentText);

    try {
      const res = await fetch('/api/script/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, mode }),
      });

      let data: any = {};
      try {
        const raw = await res.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: 'استجابة غير متوقعة' };
      }

      if (res.ok && data.enhancedText) {
        onUpdateText(data.enhancedText);
        setSuccessToast(`تم تطبيق ${label} بنجاح`);
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        alert(data.error || 'تعذر تحسين النص حالياً');
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      alert('حدث خطأ أثناء التواصل مع محرك الصياغة');
    } finally {
      setLoadingMode(null);
    }
  };

  const handleUndo = () => {
    if (previousText) {
      onUpdateText(previousText);
      setPreviousText(null);
    }
  };

  const actions = [
    { id: 'media', label: 'أسلوب إعلامي', icon: Tv, desc: 'صياغة إذاعية رصينة' },
    { id: 'documentary', label: 'أسلوب وثائقي', icon: Film, desc: 'سرد عميق ومهيب' },
    { id: 'interview', label: 'أسلوب لقاء', icon: Users, desc: 'حواري راقٍ وطبيعي' },
    { id: 'iraqi_media', label: 'أسلوب عراقي إعلامي', icon: Globe, desc: 'لهجة إعلامية بغدادية فخمة' },
    { id: 'pauses', label: 'إضافة علامات الوقف', icon: Wind, desc: 'توزيع فواصل الأنفاس' },
    { id: 'natural_breath', label: 'إلقاء أكثر طبيعية (<breath>)', icon: Sparkles, desc: 'تضمين أنفاس بشرية' },
    { id: 'tashkeel', label: 'تحسين النطق والتشكيل', icon: Languages, desc: 'تشكيل لغوي فصيح' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-red-600" />
          <span className="font-bold text-gray-900 text-xs">
            مساعد تحسين النص للإلقاء الفخم
          </span>
          <span className="text-[10px] text-gray-500">
            (يحافظ على المعنى بدقة ويضبط الإيقاع الصوتي)
          </span>
        </div>

        {previousText && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] text-gray-700 hover:text-red-700 hover:border-red-300 shadow-2xs"
            title="التراجع عن آخر تحسين للنص"
          >
            <RotateCcw className="h-3 w-3" />
            <span>تراجع عن التحسين</span>
          </button>
        )}
      </div>

      {/* Buttons row */}
      <div className="flex flex-wrap gap-1.5">
        {actions.map((act) => {
          const Icon = act.icon;
          const isLoading = loadingMode === act.id;
          return (
            <button
              key={act.id}
              onClick={() => handleEnhance(act.id, act.label)}
              disabled={disabled || !currentText.trim() || !!loadingMode}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                isLoading
                  ? 'border-red-600 bg-red-100 text-red-700 animate-pulse'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50/40 hover:text-red-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs'
              }`}
              title={act.desc}
            >
              <Icon className="h-3.5 w-3.5 text-red-600" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>

      {successToast && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
          <Check className="h-3.5 w-3.5" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
};
