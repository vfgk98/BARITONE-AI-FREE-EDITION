import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  MessageSquare,
  Wand2,
  AlertCircle,
  X,
} from 'lucide-react';
import { VOICES_DATA } from '../data/voices';
import { INTERVIEW_TEMPLATES, InterviewTemplate } from '../data/styles';
import { DialogueLine, GeneratedAudioItem, VoicePersona } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { QuotaModal } from './QuotaModal';

interface InterviewModeProps {
  onAudioGenerated: (item: GeneratedAudioItem) => void;
}

export const InterviewMode: React.FC<InterviewModeProps> = ({ onAudioGenerated }) => {
  // Speaker 1 (Host)
  const [hostName, setHostName] = useState('المقدم');
  const [hostVoice, setHostVoice] = useState<VoicePersona>(
    VOICES_DATA.find((v) => v.baseVoice === 'Fenrir') || VOICES_DATA[0]
  );
  const [hostStyleNote, setHostStyleNote] = useState('مذيع تلفزيوني وقور ومحاور متمرس');

  // Speaker 2 (Guest)
  const [guestName, setGuestName] = useState('الضيف');
  const [guestVoice, setGuestVoice] = useState<VoicePersona>(
    VOICES_DATA.find((v) => v.baseVoice === 'Puck') || VOICES_DATA[2]
  );
  const [guestStyleNote, setGuestStyleNote] = useState('ضيف مفكر ورصين ذو إلقاء طبيعي');

  // Interview Atmosphere
  const [interviewStyle] = useState('لقاء تلفزيوني رسمي وفخم');
  const [formality] = useState<'formal' | 'semi-formal' | 'warm'>('formal');
  const [dialogueSpeed] = useState<'measured' | 'natural' | 'brisk'>('natural');

  // Dialogue lines
  const [dialogue, setDialogue] = useState<DialogueLine[]>(INTERVIEW_TEMPLATES[0].dialogue);

  // AI Topic Generator
  const [topicInput, setTopicInput] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // TTS Execution State
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);

  // Inline error banner
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Quota & Error modal (ONLY for real 429)
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('RATE_LIMIT_EXCEEDED');

  const addLine = (speaker: 'host' | 'guest') => {
    const newLine: DialogueLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      speaker,
      text: '',
    };
    setDialogue((prev) => [...prev, newLine]);
  };

  const updateLineText = (id: string, text: string) => {
    setDialogue((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));
  };

  const removeLine = (id: string) => {
    if (dialogue.length <= 1) return;
    setDialogue((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleSpeaker = (id: string) => {
    setDialogue((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, speaker: l.speaker === 'host' ? 'guest' : 'host' } : l
      )
    );
  };

  const loadTemplate = (tmpl: InterviewTemplate) => {
    setDialogue(tmpl.dialogue);
    const h = VOICES_DATA.find((v) => v.baseVoice === tmpl.hostVoice);
    if (h) setHostVoice(h);
    const g = VOICES_DATA.find((v) => v.baseVoice === tmpl.guestVoice);
    if (g) setGuestVoice(g);
  };

  const handleGenerateScriptWithAI = async () => {
    if (!topicInput.trim() || isGeneratingScript) return;
    setIsGeneratingScript(true);
    setInlineError(null);
    try {
      const res = await fetch('/api/script/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput.trim(),
          hostName,
          guestName,
        }),
      });

      let data: any = {};
      try {
        const raw = await res.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: 'استجابة غير صالحة' };
      }

      if (res.ok && Array.isArray(data.dialogue) && data.dialogue.length > 0) {
        const formatted: DialogueLine[] = data.dialogue.map((d: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          speaker: d.speaker === 'guest' ? 'guest' : 'host',
          text: d.text,
        }));
        setDialogue(formatted);
      } else {
        setInlineError(data.error || 'تعذر كتابة الحوار آلياً');
      }
    } catch (err) {
      console.error(err);
      setInlineError('خطأ أثناء كتابة الحوار');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateInterviewAudio = async () => {
    if (dialogue.length === 0 || isGeneratingAudio) return;
    const hasEmpty = dialogue.some((l) => !l.text.trim());
    if (hasEmpty) {
      setInlineError('يرجى التأكد من ملء جميع أسطر الحوار قبل التوليد.');
      return;
    }

    setIsGeneratingAudio(true);
    setInlineError(null);

    const styleDirective = `${interviewStyle}. Formality: ${formality}, Speed: ${dialogueSpeed}`;

    try {
      const res = await fetch('/api/tts/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialogue: dialogue.map((line) => ({
            speaker: line.speaker === 'host' ? 'speaker1' : 'speaker2',
            text: line.text,
            style: line.speaker === 'host' ? hostStyleNote : guestStyleNote,
          })),
          speaker1: {
            name: hostName,
            voice: hostVoice.baseVoice,
            style: hostStyleNote,
          },
          speaker2: {
            name: guestName,
            voice: guestVoice.baseVoice,
            style: guestStyleNote,
          },
          interviewStyle: styleDirective,
        }),
      });

      let data: any = {};
      try {
        const raw = await res.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: 'استجابة غير متوقعة من الخادم.' };
      }

      if (res.ok && data.audioBase64) {
        setGeneratedAudioBase64(data.audioBase64);

        const newItem: GeneratedAudioItem = {
          id: `interview-${Date.now()}`,
          title: `لقاء إعلامي: ${hostName} مع ${guestName}`,
          text: dialogue.map((l) => `${l.speaker === 'host' ? hostName : guestName}: ${l.text}`).join('\n'),
          voiceName: `${hostVoice.name} & ${guestVoice.name}`,
          styleName: interviewStyle,
          audioBase64: data.audioBase64,
          createdAt: Date.now(),
          isInterview: true,
          speakers: [hostName, guestName],
        };
        onAudioGenerated(newItem);
      } else if (res.status === 429 || data.code === 'RATE_LIMIT_EXCEEDED') {
        setErrorMessage(
          data.error ||
            'تم استهلاك الحصة اللحظية لموديل المقابلات الصوتية. انتظر قليلاً ثم جرب مجاناً.'
        );
        setErrorCode(data.code || 'RATE_LIMIT_EXCEEDED');
        setQuotaModalOpen(true);
      } else {
        setInlineError(data.error || 'تعذر إتمام التوليد الصوتي للمقابلة.');
      }
    } catch (err: any) {
      setInlineError('تعذر الاتصال بمحرك المقابلات الصوتية.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (White & Red Theme) */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50/40 p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                وضع اللقاء الإعلامي (Interview Mode)
                <span className="text-xs font-normal text-red-700 bg-red-100/70 border border-red-200 rounded-full px-2.5 py-0.5">
                  Dual-Speaker Engine
                </span>
              </h2>
              <p className="text-xs text-gray-600">
                توليد حوارات ومقابلات تلفزيونية وإذاعية واقعية بصوتين مستقلين تماماً (مقدم + ضيف).
              </p>
            </div>
          </div>

          {/* Preset Templates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-500">قوالب حوارية جاهزة:</span>
            {INTERVIEW_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:border-red-400 hover:text-red-600 transition-colors shadow-2xs"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Non-Intrusive Error Alert Banner */}
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

      {/* Speakers Setup Cards (Dual Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Speaker 1: Host */}
        <div className="rounded-2xl border border-red-300 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-600" />
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                المتحدث الأول (المقدم)
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">محرك: {hostVoice.baseVoice}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-700 mb-1 block font-medium">لقب أو اسم المقدم:</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-1 block font-medium">اختيار صوت المقدم:</label>
              <select
                value={hostVoice.id}
                onChange={(e) => {
                  const v = VOICES_DATA.find((x) => x.id === e.target.value);
                  if (v) setHostVoice(v);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              >
                {VOICES_DATA.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.baseVoice}) — {v.depthScore}% باريتون
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-700 mb-1 block font-medium">توجيه الأداء الخاص بالمقدم:</label>
              <input
                type="text"
                value={hostStyleNote}
                onChange={(e) => setHostStyleNote(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:border-red-500 focus:bg-white focus:outline-none"
                placeholder="مثال: مذيع وقور، نبرة استقصائية هادئة"
              />
            </div>
          </div>
        </div>

        {/* Speaker 2: Guest */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-gray-400" />
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                المتحدث الثاني (الضيف)
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">محرك: {guestVoice.baseVoice}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-700 mb-1 block font-medium">اسم أو صفة الضيف:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-700 mb-1 block font-medium">اختيار صوت الضيف:</label>
              <select
                value={guestVoice.id}
                onChange={(e) => {
                  const v = VOICES_DATA.find((x) => x.id === e.target.value);
                  if (v) setGuestVoice(v);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 font-medium focus:border-red-500 focus:bg-white focus:outline-none"
              >
                {VOICES_DATA.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.baseVoice}) — {v.tagline}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-700 mb-1 block font-medium">توجيه الأداء الخاص بالضيف:</label>
              <input
                type="text"
                value={guestStyleNote}
                onChange={(e) => setGuestStyleNote(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:border-red-500 focus:bg-white focus:outline-none"
                placeholder="مثال: ضيف ذكي وعفوي، إلقاء دافئ ومريح"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Interview Script Drafter */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-red-600" />
            <span className="text-xs font-bold text-gray-900">توليد نص المقابلة تلقائياً بالذكاء الاصطناعي</span>
          </div>
          <span className="text-[10px] text-gray-500">اكتب أي فكرة وسيقوم الذكاء الاصطناعي بكتابة حوار كامل</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="مثال: الاستثمار في الفضاء، كواليس صناعة السينما، أثر القهوة على الدماغ..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:outline-none"
          />
          <button
            onClick={handleGenerateScriptWithAI}
            disabled={isGeneratingScript || !topicInput.trim()}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs"
          >
            {isGeneratingScript ? 'جاري الكتابة...' : 'صياغة الحوار'}
          </button>
        </div>
      </div>

      {/* Dialogue Script Builder */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold text-gray-900">سرد الحوار التلفزيوني ({dialogue.length} مقطع)</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addLine('host')}
              className="flex items-center gap-1 rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة كلام للمقدم</span>
            </button>
            <button
              onClick={() => addLine('guest')}
              className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة كلام للضيف</span>
            </button>
          </div>
        </div>

        {/* Dialogue Lines List */}
        <div className="space-y-3">
          {dialogue.map((line, idx) => {
            const isHost = line.speaker === 'host';
            return (
              <div
                key={line.id}
                className={`flex gap-3 rounded-2xl border p-3.5 transition-all ${
                  isHost
                    ? 'border-red-200 bg-red-50/40'
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                {/* Speaker indicator & switch toggle */}
                <div className="shrink-0 flex flex-col items-center justify-start gap-1">
                  <button
                    onClick={() => toggleSpeaker(line.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      isHost
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-2xs'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    title="انقر للتبديل بين المقدم والضيف"
                  >
                    {isHost ? hostName : guestName}
                  </button>
                  <span className="text-[9px] text-gray-400">#{idx + 1}</span>
                </div>

                {/* Textarea */}
                <div className="flex-1">
                  <textarea
                    value={line.text}
                    onChange={(e) => updateLineText(line.id, e.target.value)}
                    rows={2}
                    placeholder={`اكتب ما يقوله ${isHost ? hostName : guestName}...`}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-2 text-xs md:text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Delete button */}
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() => removeLine(line.id)}
                    disabled={dialogue.length <= 1}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-20"
                    title="حذف هذا المقطع"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interview Generation Action */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleGenerateInterviewAudio}
            disabled={isGeneratingAudio || dialogue.length === 0}
            className={`w-full relative overflow-hidden rounded-2xl py-4 px-6 text-sm md:text-base font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md ${
              isGeneratingAudio
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:scale-[0.99] glow-red shadow-red-600/30'
            }`}
          >
            {isGeneratingAudio ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>جاري معالجة ودمج الصوتين في مسار إذاعي موحد...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 fill-current" />
                <span>توليد المقابلة الصوتية الكاملة بصوتين (مجاناً 100%)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Audio Player for Interview */}
      {generatedAudioBase64 && (
        <div className="mt-4">
          <AudioPlayer
            base64Audio={generatedAudioBase64}
            title={`لقاء إعلامي: ${hostName} و ${guestName}`}
            voiceName={`${hostVoice.name} & ${guestVoice.name}`}
            isInterview={true}
          />
        </div>
      )}

      {/* Quota Modal (ONLY triggered on genuine 429) */}
      <QuotaModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onRetry={handleGenerateInterviewAudio}
        errorMessage={errorMessage}
        errorCode={errorCode}
      />
    </div>
  );
};
