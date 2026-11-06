import React, { useState, useEffect } from 'react';
import { Navbar, StudioTab } from './components/Navbar';
import { SoloGenerator } from './components/SoloGenerator';
import { InterviewMode } from './components/InterviewMode';
import { VoiceLibraryView } from './components/VoiceLibraryView';
import { HistoryView } from './components/HistoryView';
import { AudioPlayer } from './components/AudioPlayer';
import { GeneratedAudioItem, VoicePersona } from './types';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'baritone_ai_audio_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('solo');
  const [historyItems, setHistoryItems] = useState<GeneratedAudioItem[]>([]);
  const [selectedVoiceForStudio, setSelectedVoiceForStudio] = useState<VoicePersona | null>(null);
  const [floatingAudio, setFloatingAudio] = useState<GeneratedAudioItem | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; hasApiKey: boolean }>({
    ok: true,
    hasApiKey: true,
  });

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistoryItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load history from localStorage', e);
    }

    // Check status safely without JSON parse crash
    fetch('/api/status')
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return { ok: res.ok, hasApiKey: true };
        }
      })
      .then((data) => {
        setApiStatus({ ok: Boolean(data?.ok), hasApiKey: Boolean(data?.hasApiKey) });
      })
      .catch((err) => {
        console.error('Failed to fetch api status:', err);
      });
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: GeneratedAudioItem) => {
    setHistoryItems((prev) => {
      // Keep most recent 25 items
      const updated = [item, ...prev.filter((x) => x.id !== item.id)].slice(0, 25);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage limit reached', e);
      }
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح سجل التسجيلات بالكامل؟')) {
      setHistoryItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSelectVoiceToStudio = (voice: VoicePersona) => {
    setSelectedVoiceForStudio(voice);
    setActiveTab('solo');
  };

  // Preview sample from Library safely
  const handlePreviewSampleFromLibrary = async (voice: VoicePersona) => {
    if (previewingVoiceId) return;
    setPreviewingVoiceId(voice.id);

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

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText || 'فشل توليد العينة الصوتية' };
      }

      if (res.ok && data.audioBase64) {
        setFloatingAudio({
          id: `sample-${voice.id}`,
          title: `عينة صوت: ${voice.name}`,
          text: voice.sampleText,
          voiceName: voice.name,
          styleName: 'عينة استعراضية',
          audioBase64: data.audioBase64,
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewingVoiceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans selection:bg-red-500/20 selection:text-red-700">
      {/* Top Studio Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        historyCount={historyItems.length}
        apiStatus={apiStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {activeTab === 'solo' && (
          <SoloGenerator
            onAudioGenerated={saveToHistory}
            selectedVoiceFromLibrary={selectedVoiceForStudio}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewMode onAudioGenerated={saveToHistory} />
        )}

        {activeTab === 'library' && (
          <VoiceLibraryView
            onSelectVoiceToStudio={handleSelectVoiceToStudio}
            onPreviewSample={handlePreviewSampleFromLibrary}
            previewingVoiceId={previewingVoiceId}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            items={historyItems}
            onPlayItem={(item) => setFloatingAudio(item)}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
          />
        )}
      </main>

      {/* Floating Audio Player Modal (if active) */}
      {floatingAudio && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl">
          <div className="relative shadow-2xl rounded-2xl bg-white border border-gray-200">
            <button
              onClick={() => setFloatingAudio(null)}
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 hover:text-red-600 hover:bg-red-50 shadow-md transition-colors"
              title="إغلاق المشغل"
            >
              <X className="h-4 w-4" />
            </button>
            <AudioPlayer
              base64Audio={floatingAudio.audioBase64}
              title={floatingAudio.title}
              voiceName={floatingAudio.voiceName}
              isInterview={floatingAudio.isInterview}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-['Cinzel'] font-black text-sm tracking-wider text-gray-900">
              BARITONE<span className="text-red-600">.AI</span>
            </span>
            <span className="text-[11px] text-gray-300">|</span>
            <span className="font-medium text-gray-600">استوديو التوليد الصوتي البشري الفخم — النسخة المجانية</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>مجاني 100% بالكامل بدون أي رسوم أو اشتراكات</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">مدعوم بواسطة Google Gemini TTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
