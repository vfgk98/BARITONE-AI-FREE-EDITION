import React, { useState } from 'react';
import {
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Settings2,
  Globe2,
  FileText,
  Volume2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
} from 'lucide-react';
import { VOICES_DATA } from '../data/voices';
import { PERFORMANCE_STYLES } from '../data/styles';
import { VoicePersona, PerformanceStyle, VoiceSettings, GeneratedAudioItem } from '../types';
import { estimateDurationSeconds, formatTime } from '../utils/audio';
import { ScriptEnhancer } from './ScriptEnhancer';
import { VoiceSettingsPanel } from './VoiceSettingsPanel';
import { WaveVisualizer } from './WaveVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { QuotaModal } from './QuotaModal';

interface SoloGeneratorProps {
  onAudioGenerated: (item: GeneratedAudioItem) => void;
  selectedVoiceFromLibrary?: VoicePersona | null;
}

export const SoloGenerator: React.FC<SoloGeneratorProps> = ({
  onAudioGenerated,
  selectedVoiceFromLibrary,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(
    selectedVoiceFromLibrary || VOICES_DATA[0]
  );
  const [selectedStyle, setSelectedStyle] = useState<PerformanceStyle>(PERFORMANCE_STYLES[0]);
  const [language, setLanguage] = useState<'ar' | 'ar-iq' | 'en'>('ar');
  const [text, setText] = useState<string>(
    'سيداتي وسادتي، أهلاً بكم في هذا البث الاستثنائي. نلتقي اليوم لنروي لكم فصلاً جديداً من فصول الريادة، حيث تجتمع الرؤية بالعمل لتحقيق المستحيل.'
  );

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    pacing: 1.0,
    depth: 95,
    energy: 'balanced',
    formality: 'formal',
    articulation: 'crisp',
    emotion: 'solemn',
    includeBreaths: true,
    pauseLength: 'standard',
  });

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);

  // Inline non-intrusive error banner
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Quota & Rate Limit Modal (ONLY for genuine 429 rate limits)
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCooldown, setRetryCooldown] = useState(30);

  // Update selected voice if passed from Library tab
  React.useEffect(() => {
    if (selectedVoiceFromLibrary) {
      setSelectedVoice(selectedVoiceFromLibrary);
    }
  }, [selectedVoiceFromLibrary]);

  const handleUpdateSettings = (updated: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => ({ ...prev, ...updated }));
  };

  const resetSettings = () => {
    setVoiceSettings({
      pacing: 1.0,
      depth: selectedVoice.depthScore || 90,
      energy: 'balanced',
      formality: 'formal',
      articulation: 'crisp',
      emotion: 'solemn',
      includeBreaths: true,
      pauseLength: 'standard',
    });
  };

  const samplePresets = [
    {
      title: 'إعلامي رسمي',
      text: 'سيداتي وسادتي، أهلاً بكم في هذا البث الاستثنائي. نلتقي اليوم لنروي لكم فصلاً جديداً من فصول الريادة، حيث تجتمع الرؤية بالعمل لتحقيق المستحيل.',
      voiceId: 'voice-1',
      styleId: 'style-1',
      lang: 'ar' as const,
    },
    {
      title: 'وثائقي سينمائي',
      text: 'في أعماق هذا الكون الفسيح، تقف الأرض كشاهد أزلي على معجزة الحياة. هدوء مهيب.. وأسرار لم تبح بها النجوم بعد.',
      voiceId: 'voice-5',
      styleId: 'style-2',
      lang: 'ar' as const,
    },
    {
      title: 'عراقي إعلامي فخم',
      text: 'مساء الخير عليكم أحبتنا المشاهدين وين ما تكونون. حياكم الله ويانا في هذه التغطية الخاصة لأبرز الأحداث والمشاريع في عراقنا الحبيب.',
      voiceId: 'voice-1',
      styleId: 'style-12',
      lang: 'ar-iq' as const,
    },
    {
      title: 'إعلان فاخر',
      text: 'حين تجتمع الدقة المطلقة بالفخامة المتناهية.. لا خيار سوى التميز. اختبر معنى الكمال في كل لحظة.',
      voiceId: 'voice-10',
      styleId: 'style-9',
      lang: 'ar' as const,
    },
    {
      title: 'English Baritone',
      text: 'Welcome to this exclusive presentation. In a world of endless noise, true elegance speaks with quiet confidence and timeless resonance.',
      voiceId: 'voice-1',
      styleId: 'style-8',
      lang: 'en' as const,
    },
  ];

  const applyPreset = (preset: typeof samplePresets[0]) => {
    setText(preset.text);
    const v = VOICES_DATA.find((x) => x.id === preset.voiceId);
    if (v) setSelectedVoice(v);
    const s = PERFORMANCE_STYLES.find((x) => x.id === preset.styleId);
    if (s) setSelectedStyle(s);
    setLanguage(preset.lang);
  };

  // Preview quick sample
  const handlePreviewSample = async (voice: VoicePersona) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setInlineError(null);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voice.sampleText,
          voiceName: voice.baseVoice,
          stylePrompt: voice.defaultStyle,
          language: 'ar',
        }),
      });

      let data: any = {};
      try {
        const raw = await res.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: 'استجابة غير صالحة من الخادم' };
      }

      if (res.ok && data.audioBase64) {
        setGeneratedAudioBase64(data.audioBase64);
      } else if (res.status === 429 || data.code === 'RATE_LIMIT_EXCEEDED') {
        setErrorMessage(data.error || 'تم استهلاك الحصة اللحظية المؤقتة. يرجى الانتظار قليلاً.');
        setRetryCooldown(data.retryAfterSeconds || 30);
        setQuotaModalOpen(true);
      } else {
        setInlineError(data.error || 'تعذر تشغيل العينة الصوتية حالياً.');
      }
    } catch (err: any) {
      setInlineError('تعذر الاتصال بخادم الصوت. يرجى التحقق من اتصال الشبكة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setInlineError(null);

    // Build composed style prompt incorporating voice settings & style directive
    const composedStyle = `${selectedVoice.defaultStyle}. Style: ${selectedStyle.promptDirective}. Resonant depth: ${voiceSettings.depth}%, pacing: ${voiceSettings.pacing}x, formality: ${voiceSettings.formality}, emotion: ${voiceSettings.emotion}.`;

    // Process text if breaths are requested
    let finalText = text.trim();
    if (voiceSettings.includeBreaths && !finalText.includes('<breath>')) {
      finalText = finalText.replace(/([،,\.؛])\s+/, '$1 <breath> ');
    }

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: finalText,
          voiceName: selectedVoice.baseVoice,
          model: 'gemini-3.8-flash-tts',
          stylePrompt: composedStyle,
          emotion: voiceSettings.emotion,
          language,
        }),
      });

      // Safe JSON parsing to prevent "JSON.parse: unexpected end of data" error
      let data: any = {};
      try {
        const rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        data = { error: 'استجابة غير متوقعة من الخادم. يرجى إعادة المحاولة.' };
      }

      if (res.ok && data.audioBase64) {
        setGeneratedAudioBase64(data.audioBase64);

        // Save into audio history
        const newItem: GeneratedAudioItem = {
          id: `solo-${Date.now()}`,
          title: `${selectedVoice.name} — ${selectedStyle.name}`,
          text: finalText,
          voiceName: selectedVoice.name,
          styleName: selectedStyle.name,
          audioBase64: data.audioBase64,
          createdAt: Date.now(),
          duration: estimateDurationSeconds(finalText, voiceSettings.pacing),
          isInterview: false,
        };
        onAudioGenerated(newItem);
      } else if (res.status === 429 || data.code === 'RATE_LIMIT_EXCEEDED') {
        // Genuine 429 rate limit
        setErrorMessage(data.error || 'تم الوصول إلى الحد الأقصى للحصة المجانية اللحظية.');
        setRetryCooldown(data.retryAfterSeconds || 30);
        setQuotaModalOpen(true);
      } else {
        // Show clean inline error banner without false quota countdown
        setInlineError(data.error || 'حدث خطأ أثناء معالجة التوليد الصوتي.');
      }
    } catch (err: any) {
      setInlineError('تعذر الاتصال بخادم الصوت. يرجى التحقق من الاتصال بالشبكة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedSeconds = estimateDurationSeconds(text, voiceSettings.pacing);

  return (
    <div className="space-y-6">
      {/* Top Banner / Studio Status (White & Red Theme) */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50/40 p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/20">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                مولد الأصوات الرجالية الفخمة
                <span className="text-xs font-normal text-red-700 bg-red-100/70 border border-red-200 rounded-full px-2.5 py-0.5">
                  100% Free Gemini TTS
                </span>
              </h2>
              <p className="text-xs text-gray-600">
                تحويل النصوص المكتوبة إلى نبرات صوتية واقعية، جهورية، وفخمة تحاكي كبار مذيعي العالم.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-500 ml-1">نماذج سريعة:</span>
            {samplePresets.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:border-red-400 hover:text-red-600 transition-colors shadow-xs"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Non-Intrusive Error Alert Banner (Replaces false quota popup) */}
      {inlineError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{inlineError}</span>
          </div>
          <button
            onClick={() => setInlineError(null)}
            className="text-red-500 hover:text-red-800 p-1"
            title="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Studio Grid: Voice Selector + Text Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice & Style Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Voice Selection Box */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">اختيار النبرة الصوتية ({VOICES_DATA.length})</h3>
              </div>
              <span className="text-[10px] text-gray-500">مبني على Gemini Core</span>
            </div>

            {/* Voices Grid */}
            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {VOICES_DATA.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/60 text-gray-900 shadow-xs'
                        : 'border-gray-100 bg-gray-50/60 text-gray-700 hover:border-red-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {voice.depthScore}%
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                          {voice.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{voice.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewSample(voice);
                        }}
                        className="text-[10px] text-red-700 hover:underline px-2 py-1 bg-white rounded-md border border-red-200 font-medium"
                        title="استماع سريع للعينة"
                      >
                        عينة
                      </button>
                      {isSelected && (
                        <Check className="h-4 w-4 text-red-600 stroke-[3]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Voice Acoustic Details */}
            <div className="mt-3 p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs">
              <div className="flex justify-between items-center text-red-800 font-semibold text-[11px]">
                <span>الصوت النشط: {selectedVoice.name}</span>
                <span className="font-mono text-gray-500">محرك: {selectedVoice.baseVoice}</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1">{selectedVoice.description}</p>
            </div>
          </div>

          {/* Performance Style Selection Box */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">نمط الأداء والإلقاء</h3>
              </div>
              <span className="text-[10px] text-gray-500">{PERFORMANCE_STYLES.length} أنماط</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {PERFORMANCE_STYLES.map((style) => {
                const isSelected = selectedStyle.id === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-gray-900 font-bold'
                        : 'border-gray-100 bg-gray-50/70 text-gray-700 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <span className="font-bold text-[11px] text-gray-900">{style.name}</span>
                    <span className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">
                      {style.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language / Dialect Selection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900">
              <Globe2 className="h-4 w-4 text-red-600" />
              <span>اللغة واللهجة الإلقائية</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'ar', label: 'العربية الفصحى', note: 'فصاحة تامة' },
                { id: 'ar-iq', label: 'عراقي إعلامي', note: 'نبرة بغدادية فخمة' },
                { id: 'en', label: 'English Baritone', note: 'Global Narration' },
              ].map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-red-900 font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <div className="text-xs">{lang.label}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{lang.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Text Editor & Generation Desk (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Main Script Editor */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-bold text-gray-900">محرر النصوص الإذاعية</h3>
                </div>

                {/* Counters */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
                  <span>{charCount} حرف</span>
                  <span>•</span>
                  <span>{wordCount} كلمة</span>
                  <span>•</span>
                  <span className="text-red-700 font-semibold">المدة المقدرة: ~{formatTime(estimatedSeconds)}</span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب أو الصق النص هنا ليتم إلقاؤه بأفخم صوت بشري..."
                rows={7}
                dir={language === 'en' ? 'ltr' : 'rtl'}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm md:text-base leading-relaxed text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/15 font-sans"
              />

              {/* Text Enhancement Assistant Toolbar */}
              <div className="mt-3">
                <ScriptEnhancer
                  currentText={text}
                  onUpdateText={(newText) => setText(newText)}
                  disabled={isGenerating}
                />
              </div>

              {/* Detailed Voice Settings Accordion Toggle */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:border-red-400 hover:bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-3.5 w-3.5 text-red-600" />
                    <span>تخصيص النبرة المتقدم (السرعة، الجهورية، العاطفة، الأنفاس)</span>
                  </div>
                  {showSettingsDrawer ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showSettingsDrawer && (
                  <div className="mt-3">
                    <VoiceSettingsPanel
                      settings={voiceSettings}
                      onChange={handleUpdateSettings}
                      onReset={resetSettings}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Audio Visualizer & Decibel Meter */}
            <WaveVisualizer isGenerating={isGenerating} activeVoiceName={selectedVoice.name} />

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className={`w-full relative overflow-hidden rounded-2xl py-4 px-6 text-sm md:text-base font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md ${
                isGenerating || !text.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:scale-[0.99] glow-red shadow-red-600/30'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>جاري هندسة وتوليد الصوت عبر Gemini TTS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 fill-current" />
                  <span>توليد الصوت الفخم الآن (مجاناً 100%)</span>
                </>
              )}
            </button>
          </div>

          {/* Real Audio Player (Shown once generated) */}
          {generatedAudioBase64 && (
            <div className="mt-4">
              <AudioPlayer
                base64Audio={generatedAudioBase64}
                title={`${selectedVoice.name} — ${selectedStyle.name}`}
                voiceName={selectedVoice.name}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quota Modal (Triggered ONLY when status === 429) */}
      <QuotaModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onRetry={handleGenerate}
        errorMessage={errorMessage}
        initialCountdown={retryCooldown}
      />
    </div>
  );
};
