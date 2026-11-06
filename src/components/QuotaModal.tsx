import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage: string;
  errorCode?: string;
  initialCountdown?: number;
}

export const QuotaModal: React.FC<QuotaModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  errorMessage,
  errorCode = 'RATE_LIMIT_EXCEEDED',
  initialCountdown = 30,
}) => {
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(initialCountdown);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, initialCountdown]);

  if (!isOpen) return null;

  const isRateLimit = errorCode === 'RATE_LIMIT_EXCEEDED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-2xl glow-red">
        {/* Header Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
          {isRateLimit ? (
            <Clock className="h-7 w-7 animate-spin" style={{ animationDuration: '6s' }} />
          ) : (
            <ShieldAlert className="h-7 w-7 text-red-600" />
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-center text-lg font-bold text-gray-900">
          {isRateLimit ? 'تنبيه الحصة المجانية المؤقتة' : 'تعذر إتمام التوليد الصوتي'}
        </h3>

        {/* Message description */}
        <p className="mb-4 text-center text-xs leading-relaxed text-gray-600">
          {errorMessage}
        </p>

        {/* Free Tier Guarantee Banner */}
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">ضمان المجانية 100%:</p>
              <p className="text-[11px] text-emerald-700">
                BARITONE AI يعمل حصراً ضمن الفئة المجانية المتاحة من Google Gemini API دون أي ترقية مدفوعة أو طلب بطاقة بنكية إطلاقاً.
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Indicator if Rate Limit */}
        {isRateLimit && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50/50 p-4 text-center">
            <p className="text-xs text-gray-600 mb-1">وقت تبريد الحصة المجانية التلقائي:</p>
            <div className="text-2xl font-mono font-bold text-red-600">
              {countdown > 0 ? `${countdown} ثانية` : 'جاهز للمحاولة الآن'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            disabled={countdown > 0 && isRateLimit}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              countdown > 0 && isRateLimit
                ? 'cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
                : 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md shadow-red-600/20'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${countdown === 0 ? 'animate-spin' : ''}`} />
            <span>إعادة المحاولة مجاناً</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
