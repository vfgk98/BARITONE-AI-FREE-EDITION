import React, { useState } from 'react';
import {
  Mic,
  Users,
  Library,
  History,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export type StudioTab = 'solo' | 'interview' | 'library' | 'history';

interface NavbarProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  historyCount: number;
  apiStatus: { ok: boolean; hasApiKey: boolean };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: StudioTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'solo', label: 'مولد الصوت الفخم', icon: Mic },
    { id: 'interview', label: 'وضع اللقاء الإعلامي', icon: Users },
    { id: 'library', label: 'مكتبة الأصوات (10)', icon: Library },
    { id: 'history', label: 'سجل الاستوديو', icon: History, badge: historyCount },
  ];

  const handleTabClick = (tabId: StudioTab) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 p-0.5 shadow-md shadow-red-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-red-600 text-white">
              <Mic className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Cinzel'] text-xl font-black tracking-wider text-gray-900">
                BARITONE<span className="text-red-600">.AI</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                FREE EDITION
              </span>
            </div>
            <p className="text-[10px] text-gray-500">استوديو الأصوات البشرية الفخمة</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 glow-red-subtle'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-xs'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-white text-red-600' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Free Tier Status & Mobile Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>مجاني 100% بدون بطاقة</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-600 hover:text-gray-900"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 lg:hidden space-y-1.5 shadow-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 text-center text-xs text-emerald-700 font-medium border-t border-gray-100">
            ✓ Gemini TTS Free Tier نشط ومؤمّن
          </div>
        </div>
      )}
    </header>
  );
};
