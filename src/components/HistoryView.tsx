import React from 'react';
import {
  History,
  Trash2,
  Download,
  Copy,
  Check,
  Play,
  Calendar,
  Users,
  Mic,
} from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { downloadAudio } from '../utils/audio';

interface HistoryViewProps {
  items: GeneratedAudioItem[];
  onPlayItem: (item: GeneratedAudioItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onPlayItem,
  onDeleteItem,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: GeneratedAudioItem) => {
    const filename = `baritone_${item.isInterview ? 'interview' : 'solo'}_${item.id}.wav`;
    downloadAudio(item.audioBase64, filename, 'audio/wav');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
          <History className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">سجل الاستوديو فارغ حالياً</h3>
        <p className="text-xs text-gray-500 max-w-sm mb-6">
          لم تقم بتوليد أي تسجيلات صوتية بعد في هذه الجلسة. ابدأ بكتابة نص في مولد الصوت الفخم أو في وضع اللقاء الإعلامي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-red-600" />
          <div>
            <h2 className="text-base font-bold text-gray-900">سجل التسجيلات الصوتية المحفوظة ({items.length})</h2>
            <p className="text-xs text-gray-500">محفوظة محلياً في متصفحك مجاناً وبأعلى نقاوة WAV</p>
          </div>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100 transition-colors font-medium"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>مسح السجل</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          const dateStr = new Date(item.createdAt).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:border-red-300 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    item.isInterview
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {item.isInterview ? <Users className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-red-700 font-semibold">
                      {item.voiceName}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-600 line-clamp-2 font-sans">
                    {item.text}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => onPlayItem(item)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700 active:scale-95 shadow-xs"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>استماع</span>
                </button>

                <button
                  onClick={() => handleDownload(item)}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-700 hover:text-red-700 hover:border-red-300 shadow-2xs"
                  title="تحميل ملف WAV"
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleCopyText(item.id, item.text)}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-700 hover:text-gray-900 shadow-2xs"
                  title="نسخ النص"
                >
                  {copiedId === item.id ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 hover:text-red-600 hover:border-red-200 shadow-2xs"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
