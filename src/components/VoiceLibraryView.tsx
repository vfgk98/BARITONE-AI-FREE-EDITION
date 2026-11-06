import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { VOICES_DATA } from '../data/voices';
import { VoicePersona } from '../types';
import { VoiceCard } from './VoiceCard';

interface VoiceLibraryViewProps {
  onSelectVoiceToStudio: (voice: VoicePersona) => void;
  onPreviewSample: (voice: VoicePersona) => void;
  previewingVoiceId?: string | null;
}

export const VoiceLibraryView: React.FC<VoiceLibraryViewProps> = ({
  onSelectVoiceToStudio,
  onPreviewSample,
  previewingVoiceId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'جميع الأصوات (10)' },
    { id: 'broadcast', label: 'مذيعين ونشرات رسمية' },
    { id: 'documentary', label: 'وثائقيات وطبيعة' },
    { id: 'cinematic', label: 'سينمائي وملاحم' },
    { id: 'interview', label: 'لقاءات ومحاورين' },
    { id: 'podcast', label: 'بودكاست ومحتوى رقمي' },
  ];

  const filteredVoices = VOICES_DATA.filter((v) => {
    const matchesSearch =
      v.name.includes(searchQuery) ||
      v.tagline.includes(searchQuery) ||
      v.description.includes(searchQuery);
    const matchesCategory =
      selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner (White & Red) */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50/40 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                خزينة الأصوات الرجالية الفخمة
              </h2>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
                10 أصوات معتمدة
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-2xl">
              مكتبة متكاملة من الأصوات الإذاعية والسينمائية المدربة على أرقى معايير الإلقاء البشري الرصين، مع شفافية كاملة حول محركات الأساس الصوتية.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-red-600" />
            <span>محركات حقيقية مجانية 100%</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في أسماء الأصوات..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-9 pl-3 text-xs text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of Voice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVoices.map((voice) => (
          <div key={voice.id} className="flex flex-col justify-between">
            <VoiceCard
              voice={voice}
              isSelected={false}
              onSelect={() => onSelectVoiceToStudio(voice)}
              onPreviewSample={onPreviewSample}
              isPreviewing={previewingVoiceId === voice.id}
            />
            <button
              onClick={() => onSelectVoiceToStudio(voice)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 py-2 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-2xs"
            >
              <span>استخدام في محرر الصوت</span>
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        ))}
      </div>

      {/* Acoustic Transparency Notice */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 text-xs text-gray-700 leading-relaxed">
        <h4 className="font-bold text-red-900 text-xs mb-1">
          💡 الشفافية الهندسية لاستوديو BARITONE AI:
        </h4>
        <p>
          وفقاً للمعايير الصارمة لمنع تضليل المستخدم، نوضح أن جميع الشخصيات الصوتية الـ 10 مبنية هندسياً على النماذج الصوتية الحقيقية المتاحة مجاناً في Google Gemini TTS (وهي: Fenrir، Charon، Puck، Zephyr، Kore)، ويتم تشكيل الفروق في النبرة، العمق، الوقفات، والجهورية عبر توجيهات أداء صوتية متقدمة (Speech Direction Styling) مخصصة لكل شخصية.
        </p>
      </div>
    </div>
  );
};
